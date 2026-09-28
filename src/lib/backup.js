import { db } from './db.js'

export const TABLAS_RESPALDO = [
  'transacciones',
  'deudas',
  'abonos',
  'gastosFijos',
  'instanciasGastoFijo',
  'pagosGastoFijo',
]

/**
 * Convierte un Uint8Array a cadena Base64 compatible con navegadores y Node.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function uint8ArrayToBase64(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convierte una cadena Base64 a Uint8Array.
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function base64ToUint8Array(base64) {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'))
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Deriva una clave AES-GCM a partir de una contraseña y salt usando PBKDF2.
 * @param {string} password
 * @param {Uint8Array} salt
 * @returns {Promise<CryptoKey>}
 */
async function derivarClave(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Extrae los registros de todas las tablas de FinanzasDB.
 * @returns {Promise<Record<string, Array<any>>>}
 */
export async function extraerDatosCompletos() {
  const data = {}
  for (const tabla of TABLAS_RESPALDO) {
    if (db[tabla]) {
      data[tabla] = await db[tabla].toArray()
    } else {
      data[tabla] = []
    }
  }
  return data
}

/**
 * Exporta la base de datos completa.
 * Si se especifica password, el payload es cifrado con AES-GCM + PBKDF2.
 *
 * @param {{ password?: string }} [opciones]
 * @returns {Promise<object>} Objeto de respaldo listo para serializar
 */
export async function exportarDatos({ password } = {}) {
  const data = await extraerDatosCompletos()
  const timestamp = new Date().toISOString()
  const pwd = password?.trim()

  if (!pwd) {
    return {
      app: 'finapp',
      version: 1,
      timestamp,
      encrypted: false,
      data,
    }
  }

  // Cifrado con Web Crypto API
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await derivarClave(pwd, salt)

  const enc = new TextEncoder()
  const plaintextBytes = enc.encode(JSON.stringify(data))
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBytes
  )

  return {
    app: 'finapp',
    version: 1,
    timestamp,
    encrypted: true,
    crypto: {
      algorithm: 'AES-GCM',
      kdf: 'PBKDF2',
      iterations: 100000,
      salt: uint8ArrayToBase64(salt),
      iv: uint8ArrayToBase64(iv),
    },
    ciphertext: uint8ArrayToBase64(new Uint8Array(cipherBuffer)),
  }
}

/**
 * Descifra el contenido de un respaldo cifrado.
 *
 * @param {object} payload
 * @param {string} password
 * @returns {Promise<Record<string, Array<any>>>}
 */
export async function descifrarDatos(payload, password) {
  if (!password || !password.trim()) {
    throw new Error('Se requiere contraseña para descifrar este archivo de respaldo')
  }

  if (!payload.crypto?.salt || !payload.crypto?.iv || !payload.ciphertext) {
    throw new Error('El archivo de respaldo no contiene los metadatos de cifrado necesarios')
  }

  try {
    const salt = base64ToUint8Array(payload.crypto.salt)
    const iv = base64ToUint8Array(payload.crypto.iv)
    const ciphertext = base64ToUint8Array(payload.ciphertext)
    const key = await derivarClave(password.trim(), salt)

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )

    const jsonText = new TextDecoder().decode(decryptedBuffer)
    return JSON.parse(jsonText)
  } catch (err) {
    throw new Error('Contraseña incorrecta o archivo de respaldo corrupto')
  }
}

/**
 * Valida los metadatos y estructura mínima de un respaldo.
 * @param {any} payload
 */
export function validarEstructuraRespaldo(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('El archivo no tiene un formato JSON válido')
  }

  if (payload.app !== 'finapp') {
    throw new Error("El archivo no corresponde a un respaldo de FinApp (falta marca 'finapp')")
  }

  if (typeof payload.version !== 'number' || payload.version < 1) {
    throw new Error('Versión de respaldo no compatible o inválida')
  }

  if (payload.encrypted) {
    if (!payload.crypto || !payload.ciphertext) {
      throw new Error('Estructura de respaldo cifrado corrupta')
    }
  } else {
    if (!payload.data || typeof payload.data !== 'object') {
      throw new Error('El archivo de respaldo no contiene datos válidos')
    }
  }

  return true
}

/**
 * Restaura la base de datos de IndexedDB a partir de un payload de respaldo.
 *
 * @param {object} payload
 * @param {{ password?: string }} [opciones]
 * @returns {Promise<{ restaurados: Record<string, number> }>}
 */
export async function restaurarDatos(payload, { password } = {}) {
  validarEstructuraRespaldo(payload)

  let data
  if (payload.encrypted) {
    data = await descifrarDatos(payload, password)
  } else {
    data = payload.data
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Los datos a restaurar son inválidos')
  }

  const tablasDisponibles = TABLAS_RESPALDO.filter((tabla) => db[tabla])
  const resumen = {}

  // Transacción atómica en Dexie para vaciar y sobreescribir todas las tablas
  await db.transaction('rw', tablasDisponibles.map((t) => db[t]), async () => {
    for (const nombre of tablasDisponibles) {
      await db[nombre].clear()
      const registros = data[nombre]
      if (Array.isArray(registros) && registros.length > 0) {
        await db[nombre].bulkAdd(registros)
        resumen[nombre] = registros.length
      } else {
        resumen[nombre] = 0
      }
    }
  })

  return { restaurados: resumen }
}

/**
 * Genera la descarga de un archivo de respaldo en el navegador.
 *
 * @param {object} payload
 * @param {string} [nombreArchivo]
 */
export function descargarArchivoRespaldo(payload, nombreArchivo) {
  const jsonStr = JSON.stringify(payload, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const fecha = new Date().toISOString().slice(0, 10)
  const sufijo = payload.encrypted ? 'cifrado' : 'plano'
  const nombre = nombreArchivo || `finapp-backup-${fecha}-${sufijo}.json`

  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
