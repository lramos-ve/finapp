import { Peer } from 'peerjs'
import { extraerDatosCompletos, validarEstructuraRespaldo, restaurarDatos } from './backup.js'

export const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
}

/**
 * Genera un código de sesión legible y único de 6 caracteres.
 * @returns {string}
 */
export function generarCodigoSesion() {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `finapp-${code}`
}

/**
 * Construye el mensaje de sincronización a partir de los datos.
 * @param {Record<string, Array<any>>} data
 * @returns {object}
 */
export function crearMensajeSync(data) {
  return {
    tipo: 'FINAPP_SYNC',
    app: 'finapp',
    version: 1,
    timestamp: new Date().toISOString(),
    data,
  }
}

/**
 * Valida un mensaje de sincronización recibido vía DataChannel.
 * @param {any} msg
 */
export function validarMensajeSync(msg) {
  if (!msg || typeof msg !== 'object') {
    throw new Error('Mensaje de sincronización no válido')
  }
  if (msg.tipo !== 'FINAPP_SYNC') {
    throw new Error('Tipo de mensaje no reconocido')
  }
  validarEstructuraRespaldo(msg)
  return true
}

/**
 * Controlador de sesión P2P para emisor y receptor.
 */
export class P2PSession {
  constructor() {
    this.peer = null
    this.conn = null
    this.sessionId = null
  }

  /**
   * Inicia el modo Emisor: abre un Peer con un sessionId generado y espera conexiones.
   *
   * @param {{
   *   onReady: (sessionId: string) => void,
   *   onConnected: () => void,
   *   onError: (err: Error) => void,
   *   onClose: () => void
   * }} callbacks
   */
  iniciarEmisor({ onReady, onConnected, onError, onClose }) {
    this.cerrar()
    this.sessionId = generarCodigoSesion()

    try {
      this.peer = new Peer(this.sessionId, PEER_CONFIG)

      this.peer.on('open', (id) => {
        this.sessionId = id
        onReady?.(id)
      })

      this.peer.on('connection', (conn) => {
        this.conn = conn

        conn.on('open', () => {
          onConnected?.()
        })

        conn.on('close', () => {
          onClose?.()
        })

        conn.on('error', (err) => {
          onError?.(err)
        })
      })

      this.peer.on('error', (err) => {
        onError?.(err)
      })

      this.peer.on('close', () => {
        onClose?.()
      })
    } catch (err) {
      onError?.(err)
    }
  }

  /**
   * Envía los datos actuales de la base de datos al receptor conectado.
   * @returns {Promise<object>} Mensaje enviado
   */
  async enviarDatos() {
    if (!this.conn || !this.conn.open) {
      throw new Error('No hay una conexión P2P activa con otro dispositivo')
    }

    const data = await extraerDatosCompletos()
    const mensaje = crearMensajeSync(data)
    this.conn.send(mensaje)
    return mensaje
  }

  /**
   * Inicia el modo Receptor: conecta al peer emisor usando su sessionId.
   *
   * @param {string} targetSessionId
   * @param {{
   *   onConnected: () => void,
   *   onDataReceived: (data: any, msg: any) => void,
   *   onError: (err: Error) => void,
   *   onClose: () => void
   * }} callbacks
   */
  conectarReceptor(targetSessionId, { onConnected, onDataReceived, onError, onClose }) {
    this.cerrar()
    const cleanId = targetSessionId.trim()

    try {
      this.peer = new Peer(null, PEER_CONFIG)

      this.peer.on('open', () => {
        const conn = this.peer.connect(cleanId, { reliable: true })
        this.conn = conn

        conn.on('open', () => {
          onConnected?.()
        })

        conn.on('data', (rawMsg) => {
          try {
            validarMensajeSync(rawMsg)
            onDataReceived?.(rawMsg.data, rawMsg)
          } catch (err) {
            onError?.(err)
          }
        })

        conn.on('close', () => {
          onClose?.()
        })

        conn.on('error', (err) => {
          onError?.(err)
        })
      })

      this.peer.on('error', (err) => {
        onError?.(err)
      })

      this.peer.on('close', () => {
        onClose?.()
      })
    } catch (err) {
      onError?.(err)
    }
  }

  /**
   * Cierra activamente la conexión y destruye el Peer.
   */
  cerrar() {
    if (this.conn) {
      try {
        this.conn.close()
      } catch (_) {}
      this.conn = null
    }
    if (this.peer) {
      try {
        this.peer.destroy()
      } catch (_) {}
      this.peer = null
    }
    this.sessionId = null
  }
}
