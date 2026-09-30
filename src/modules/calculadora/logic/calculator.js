import { redondear } from '../../shared/services/money.js'

export const MONEDAS_CALCULADORA = ['USD', 'EUR', 'VES']

/**
 * Realiza la conversión bidireccional de divisas basada exclusivamente
 * en las cotizaciones oficiales del Banco Central de Venezuela (BCV).
 *
 * @param {{
 *   monto: number,
 *   monedaOrigen: 'USD' | 'EUR' | 'VES',
 *   tasaUSD: number,
 *   tasaEUR: number
 * }} params
 * @returns {{ USD: number, EUR: number, VES: number }}
 */
export function convertirDivisasBCV({ monto, monedaOrigen, tasaUSD, tasaEUR }) {
  const num = Number(monto)
  if (!num || isNaN(num) || num <= 0) {
    return { USD: 0, EUR: 0, VES: 0 }
  }

  const tUSD = Number(tasaUSD)
  const tEUR = Number(tasaEUR)

  let montoVES = 0
  let montoUSD = 0
  let montoEUR = 0

  switch (monedaOrigen) {
    case 'USD':
      montoUSD = redondear(num)
      montoVES = tUSD > 0 ? redondear(num * tUSD) : 0
      montoEUR = tEUR > 0 && montoVES > 0 ? redondear(montoVES / tEUR) : 0
      break

    case 'EUR':
      montoEUR = redondear(num)
      montoVES = tEUR > 0 ? redondear(num * tEUR) : 0
      montoUSD = tUSD > 0 && montoVES > 0 ? redondear(montoVES / tUSD) : 0
      break

    case 'VES':
      montoVES = redondear(num)
      montoUSD = tUSD > 0 ? redondear(num / tUSD) : 0
      montoEUR = tEUR > 0 ? redondear(num / tEUR) : 0
      break

    default:
      return { USD: 0, EUR: 0, VES: 0 }
  }

  return {
    USD: montoUSD,
    EUR: montoEUR,
    VES: montoVES,
  }
}

/**
 * Formatea un monto con su respectivo símbolo y separador decimal de moneda.
 * @param {number} valor
 * @param {'USD' | 'EUR' | 'VES'} moneda
 * @returns {string}
 */
export function formatearMoneda(valor, moneda) {
  const n = typeof valor === 'number' && !isNaN(valor) ? valor : 0
  const formatted = n.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  switch (moneda) {
    case 'USD':
      return `$ ${formatted}`
    case 'EUR':
      return `€ ${formatted}`
    case 'VES':
      return `Bs. ${formatted}`
    default:
      return formatted
  }
}
