const BCV_CACHE_KEY = 'finapp_bcv_cache'
const DOLAR_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial'

/**
 * Obtiene síncronamente la última tasa guardada en caché local si existe.
 * @returns {number | null}
 */
export function obtenerUltimaTasaEnCache() {
  try {
    const raw = localStorage.getItem(BCV_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed?.tasa === 'number' && !isNaN(parsed.tasa) ? parsed.tasa : null
  } catch {
    return null
  }
}

/**
 * Guarda manualmente o por consulta una tasa en la caché local.
 * @param {number} tasa
 * @param {string} [fechaActualizacion]
 */
export function guardarTasaEnCache(tasa, fechaActualizacion = new Date().toISOString()) {
  try {
    const valor = Number(tasa)
    if (!valor || isNaN(valor) || valor <= 0) return
    localStorage.setItem(
      BCV_CACHE_KEY,
      JSON.stringify({
        tasa: valor,
        fechaActualizacion,
        guardadoEn: Date.now(),
      })
    )
  } catch {
    // Si localStorage no está disponible o falla, ignorar silenciosamente
  }
}

/**
 * Obtiene la información completa almacenada en la caché local.
 * @returns {{ tasa: number, fechaActualizacion: string, guardadoEn: number } | null}
 */
export function obtenerDetalleCacheBCV() {
  try {
    const raw = localStorage.getItem(BCV_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Consulta la tasa oficial del BCV desde DolarApi Venezuela con fallback automático a la caché local.
 *
 * @param {{ forzar?: boolean, timeoutMs?: number }} [opciones]
 * @returns {Promise<{ tasa: number, fechaActualizacion?: string, desdeCache: boolean, error?: string }>}
 */
export async function obtenerTasaBCV({ forzar = false, timeoutMs = 5000 } = {}) {
  const cache = obtenerDetalleCacheBCV()

  // Si no se fuerza la recarga y ya tenemos un valor en caché, lo retornamos inmediatamente
  if (!forzar && cache?.tasa) {
    return {
      tasa: cache.tasa,
      fechaActualizacion: cache.fechaActualizacion,
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

    // Redondear a 2 decimales para operaciones financieras estándar
    const tasaFinal = Math.round(promedio * 100) / 100
    const fechaActualizacion = data.fechaActualizacion || new Date().toISOString()

    guardarTasaEnCache(tasaFinal, fechaActualizacion)

    return {
      tasa: tasaFinal,
      fechaActualizacion,
      desdeCache: false,
    }
  } catch (err) {
    // Fallback: si falla la red, timeout o error HTTP, pero hay valor en caché
    if (cache?.tasa) {
      return {
        tasa: cache.tasa,
        fechaActualizacion: cache.fechaActualizacion,
        desdeCache: true,
        error: err.name === 'AbortError' ? 'Tiempo de espera agotado' : err.message,
      }
    }
    // Si no hay nada en caché, relanzar el error
    throw err
  } finally {
    clearTimeout(timer)
  }
}
