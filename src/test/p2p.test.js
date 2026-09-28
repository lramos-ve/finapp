import { describe, it, expect } from 'vitest'
import {
  generarCodigoSesion,
  crearMensajeSync,
  validarMensajeSync,
  P2PSession,
} from '../lib/p2p.js'

describe('P2P WebRTC Service', () => {
  it('genera un código de sesión válido y con prefijo finapp-', () => {
    const code = generarCodigoSesion()
    expect(code).toMatch(/^finapp-[23456789abcdefghjkmnpqrstuvwxyz]{6}$/)
  })

  it('construye la estructura del mensaje de sincronización con metadatos correctos', () => {
    const data = {
      transacciones: [{ id: 1, monto: 100 }],
      deudas: [],
    }

    const msg = crearMensajeSync(data)

    expect(msg.tipo).toBe('FINAPP_SYNC')
    expect(msg.app).toBe('finapp')
    expect(msg.version).toBe(1)
    expect(msg.timestamp).toBeTypeOf('string')
    expect(msg.data).toEqual(data)
  })

  it('valida exitosamente un mensaje de sincronización correcto', () => {
    const msg = crearMensajeSync({
      transacciones: [],
      deudas: [],
      abonos: [],
    })

    expect(validarMensajeSync(msg)).toBe(true)
  })

  it('rechaza mensajes con tipo desconocido o datos inválidos', () => {
    expect(() => validarMensajeSync(null)).toThrow('Mensaje de sincronización no válido')
    expect(() => validarMensajeSync({})).toThrow('Tipo de mensaje no reconocido')
    expect(() =>
      validarMensajeSync({
        tipo: 'FINAPP_SYNC',
        app: 'otra-app',
        version: 1,
        data: {},
      })
    ).toThrow("falta marca 'finapp'")
  })

  it('permite instanciar y cerrar P2PSession limpiamente', () => {
    const session = new P2PSession()
    expect(session.sessionId).toBeNull()
    expect(session.peer).toBeNull()
    expect(session.conn).toBeNull()

    // Cerrar sesión cuando no está iniciada no debe arrojar error
    expect(() => session.cerrar()).not.toThrow()
  })
})
