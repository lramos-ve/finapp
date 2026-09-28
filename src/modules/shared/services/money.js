/**
 * Utilidad compartida de "movimiento de dinero" (ver design.md).
 *
 * Dado un monto en USD o VES, calcula el equivalente en USD y lo deja
 * congelado en el registro: ese equivalente no debe recalcularse después
 * aunque cambie la tasa BCV.
 */

/**
 * @param {{ monto: number, moneda: 'USD'|'VES', tasaBCV?: number }} entrada
 * @returns {{ monto: number, moneda: 'USD'|'VES', tasaBCV?: number, montoUSD: number }}
 */
export function calcularMovimientoDeDinero({ monto, moneda, tasaBCV }) {
  if (monto == null || Number.isNaN(monto) || monto <= 0) {
    throw new Error('El monto debe ser un número mayor a 0')
  }

  if (moneda === 'USD') {
    return { monto, moneda, montoUSD: monto }
  }

  if (moneda === 'VES') {
    if (!tasaBCV || Number.isNaN(tasaBCV) || tasaBCV <= 0) {
      throw new Error('Se requiere una tasa BCV válida para montos en VES')
    }
    const montoUSD = redondear(monto / tasaBCV)
    return { monto, moneda, tasaBCV, montoUSD }
  }

  throw new Error(`Moneda no soportada: ${moneda}`)
}

/** Redondea a 2 decimales evitando errores de punto flotante. */
export function redondear(valor) {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}
