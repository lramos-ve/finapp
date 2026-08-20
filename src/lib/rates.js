/**
 * Servicio para consultar las tasas cambiarias de Venezuela desde DolarApi.com
 * Documentación: https://dolarapi.com/docs/venezuela/
 */

const API_BASE = 'https://ve.dolarapi.com/v1';

let cachedRate = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos de caché local

/**
 * Obtiene la tasa oficial del BCV (Dólar Oficial).
 * @returns {Promise<{ promedio: number, fechaActualizacion: string, fuente: string }>}
 */
export async function getTasaOficialBCV() {
  const now = Date.now();
  if (cachedRate && (now - lastFetchTime) < CACHE_TTL_MS) {
    return cachedRate;
  }

  try {
    const response = await fetch(`${API_BASE}/dolares/oficial`);
    if (!response.ok) {
      throw new Error(`Error en DolarApi: ${response.statusText}`);
    }
    const data = await response.json();
    cachedRate = {
      promedio: Number(data.promedio),
      fechaActualizacion: data.fechaActualizacion,
      fuente: data.fuente || 'oficial',
      nombre: data.nombre || 'Dólar Oficial'
    };
    lastFetchTime = now;
    return cachedRate;
  } catch (error) {
    console.error('Error al obtener tasa BCV de DolarApi:', error);
    // Si falla pero tenemos caché previa, devolver la previa
    if (cachedRate) return cachedRate;
    throw error;
  }
}

/**
 * Obtiene todas las cotizaciones disponibles (Oficial y Paralelo).
 */
export async function getTodasLasTasas() {
  try {
    const response = await fetch(`${API_BASE}/dolares`);
    if (!response.ok) {
      throw new Error(`Error en DolarApi: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    throw error;
  }
}
