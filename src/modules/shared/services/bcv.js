export const BCV_CACHE_KEY = 'finapp_bcv_cache'
export const DOLAR_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial'
export const EURO_API_URL = 'https://ve.dolarapi.com/v1/euros/oficial'

function getStorage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch (_) {}
  return null
}

/**
 * Obtiene síncronamente la última tasa del dólar guardada en caché local si existe.
 * @returns {number | null}
 */
export function obtenerUltimaTasaEnCache() {
  try {
    const raw = getStorage()?.getItem(BCV_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const val = typeof parsed?.tasaUSD === 'number' && !isNaN(parsed.tasaUSD)
      ? parsed.tasaUSD
      : (typeof parsed?.tasa === 'number' && !isNaN(parsed.tasa) ? parsed.tasa : null)
    return val
  } catch {
    return null
  }
}

/**
 * Obtiene síncronamente la última tasa del euro guardada en caché local si existe.
 * @returns {number | null}
 */
export function obtenerUltimaTasaEuroEnCache() {
  try {
    const raw = getStorage()?.getItem(BCV_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.tasaEUR === 'number' && !isNaN(parsed.tasaEUR) ? parsed.tasaEUR : null
  } catch {
    return null
  }
}

/**
 * Obtiene la información completa almacenada en la caché local.
 * @returns {{ tasa: number, tasaUSD: number, tasaEUR?: number, fechaActualizacion: string, fechaActualizacionUSD?: string, fechaActualizacionEUR?: string, guardadoEn: number } | null}
 */
export function obtenerDetalleCacheBCV() {
  try {
    const raw = getStorage()?.getItem(BCV_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Guarda o actualiza manualmente la cotización del dólar en la caché local.
 * @param {number} tasa
 * @param {string} [fechaActualizacion]
 */
export function guardarTasaEnCache(tasa, fechaActualizacion = new Date().toISOString()) {
  try {
    const valor = Number(tasa)
    if (!valor || isNaN(valor) || valor <= 0) return
    const anterior = obtenerDetalleCacheBCV() || {}
    const storage = getStorage()
    storage?.setItem(
      BCV_CACHE_KEY,
      JSON.stringify({
        ...anterior,
        tasa: valor,
        tasaUSD: valor,
        fechaActualizacion,
        fechaActualizacionUSD: fechaActualizacion,
        guardadoEn: Date.now(),
      })
    )
  } catch {
    // Ignorar si el almacenamiento no está disponible
  }
}

/**
 * Guarda o actualiza manualmente la cotización del euro en la caché local.
 * @param {number} tasa
 * @param {string} [fechaActualizacion]
 */
export function guardarTasaEuroEnCache(tasa, fechaActualizacion = new Date().toISOString()) {
  try {
    const valor = Number(tasa)
    if (!valor || isNaN(valor) || valor <= 0) return
    const anterior = obtenerDetalleCacheBCV() || {}
    const storage = getStorage()
    storage?.setItem(
      BCV_CACHE_KEY,
      JSON.stringify({
        ...anterior,
        tasaEUR: valor,
        fechaActualizacionEUR: fechaActualizacion,
        guardadoEn: Date.now(),
      })
    )
  } catch {
    // Ignorar si el almacenamiento no está disponible
  }
}

/**
 * Consulta la tasa oficial del Dólar BCV con fallback a la caché local.
 *
 * @param {{ forzar?: boolean, timeoutMs?: number }} [opciones]
 * @returns {Promise<{ tasa: number, fechaActualizacion?: string, desdeCache: boolean, error?: string }>}
 */
export async function obtenerTasaBCV({ forzar = false, timeoutMs = 5000 } = {}) {
  const cache = obtenerDetalleCacheBCV()
  const tasaCache = cache?.tasaUSD || cache?.tasa
  const fechaCache = cache?.fechaActualizacionUSD || cache?.fechaActualizacion

  if (!forzar && tasaCache) {
    return {
      tasa: tasaCache,
      fechaActualizacion: fechaCache,
      desdeCache: true,
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const respuesta = await fetch(DOLAR_API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!respuesta.ok) {
      throw new Error(`Error en API BCV (código ${respuesta.status})`)
    }

    const data = await respuesta.json()
    const promedio = Number(data?.promedio)

    if (!promedio || isNaN(promedio) || promedio <= 0) {
      throw new Error('Respuesta inválida de la API BCV')
    }

    const tasaFinal = Math.round(promedio * 100) / 100
    const fechaActualizacion = data.fechaActualizacion || new Date().toISOString()

    guardarTasaEnCache(tasaFinal, fechaActualizacion)

    return {
      tasa: tasaFinal,
      fechaActualizacion,
      desdeCache: false,
    }
  } catch (err) {
    if (tasaCache) {
      return {
        tasa: tasaCache,
        fechaActualizacion: fechaCache,
        desdeCache: true,
        error: err.name === 'AbortError' ? 'Tiempo de espera agotado' : err.message,
      }
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Consulta la tasa oficial del Euro BCV con fallback a la caché local.
 *
 * @param {{ forzar?: boolean, timeoutMs?: number }} [opciones]
 * @returns {Promise<{ tasa: number, fechaActualizacion?: string, desdeCache: boolean, error?: string }>}
 */
export async function obtenerTasaEuroBCV({ forzar = false, timeoutMs = 5000 } = {}) {
  const cache = obtenerDetalleCacheBCV()
  const tasaCache = cache?.tasaEUR
  const fechaCache = cache?.fechaActualizacionEUR

  if (!forzar && tasaCache) {
    return {
      tasa: tasaCache,
      fechaActualizacion: fechaCache,
      desdeCache: true,
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const respuesta = await fetch(EURO_API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!respuesta.ok) {
      throw new Error(`Error en API BCV Euro (código ${respuesta.status})`)
    }

    const data = await respuesta.json()
    const promedio = Number(data?.promedio)

    if (!promedio || isNaN(promedio) || promedio <= 0) {
      throw new Error('Respuesta inválida de la API BCV Euro')
    }

    const tasaFinal = Math.round(promedio * 100) / 100
    const fechaActualizacion = data.fechaActualizacion || new Date().toISOString()

    guardarTasaEuroEnCache(tasaFinal, fechaActualizacion)

    return {
      tasa: tasaFinal,
      fechaActualizacion,
      desdeCache: false,
    }
  } catch (err) {
    if (tasaCache) {
      return {
        tasa: tasaCache,
        fechaActualizacion: fechaCache,
        desdeCache: true,
        error: err.name === 'AbortError' ? 'Tiempo de espera agotado' : err.message,
      }
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Obtiene simultáneamente ambas tasas oficiales (USD y EUR) del BCV.
 *
 * @param {{ forzar?: boolean, timeoutMs?: number }} [opciones]
 * @returns {Promise<{ usd: { tasa: number, fechaActualizacion?: string, desdeCache: boolean, error?: string }, eur: { tasa: number, fechaActualizacion?: string, desdeCache: boolean, error?: string } }>}
 */
export async function obtenerTasasOficialesBCV({ forzar = false, timeoutMs = 5000 } = {}) {
  const [usdRes, eurRes] = await Promise.allSettled([
    obtenerTasaBCV({ forzar, timeoutMs }),
    obtenerTasaEuroBCV({ forzar, timeoutMs }),
  ])

  return {
    usd: usdRes.status === 'fulfilled' ? usdRes.value : {
      tasa: obtenerUltimaTasaEnCache() || 0,
      desdeCache: true,
      error: usdRes.reason?.message || 'Error consultando USD',
    },
    eur: eurRes.status === 'fulfilled' ? eurRes.value : {
      tasa: obtenerUltimaTasaEuroEnCache() || 0,
      desdeCache: true,
      error: eurRes.reason?.message || 'Error consultando EUR',
    },
  }
}
