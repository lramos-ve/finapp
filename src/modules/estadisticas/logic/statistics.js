import { listarTransacciones } from '../../transacciones/logic/transactions.js'

import { redondear } from '../../shared/services/money.js'


export const PALETA_CATEGORIAS = [
  '#38bdf8', // Celeste / Cyan
  '#22c55e', // Esmeralda / Verde
  '#f59e0b', // Ámbar / Dorado
  '#a855f7', // Violeta / Púrpura
  '#ec4899', // Rosa / Fucsia
  '#3b82f6', // Azul real
  '#f97316', // Naranja
  '#14b8a6', // Turquesa
  '#8b5cf6', // Índigo
  '#94a3b8', // Pizarra / Gris
]

const NOMBRES_MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

/**
 * Obtiene el formato YYYY-MM para una fecha dada o la actual.
 * @param {Date|string} [fecha]
 * @returns {string}
 */
export function periodoDeFecha(fecha = new Date()) {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  const anio = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  return `${anio}-${mes}`
}

/**
 * Formatea un período 'YYYY-MM' como 'Mes YY' (ej: 'Mar 26').
 * @param {string} periodo
 * @returns {string}
 */
export function formatearEtiquetaPeriodo(periodo) {
  if (!periodo || !periodo.includes('-')) return periodo
  const [anioStr, mesStr] = periodo.split('-')
  const mesIdx = Number(mesStr) - 1
  const anioCorto = anioStr.slice(2)
  const mesNombre = NOMBRES_MESES[mesIdx] || mesStr
  return `${mesNombre} ${anioCorto}`
}

/**
 * Genera el rango de fechas { desde, hasta } para un mes dado 'YYYY-MM'.
 * @param {string} periodo
 * @returns {{ desde: string, hasta: string }}
 */
export function rangoDePeriodo(periodo) {
  const [anio, mes] = periodo.split('-').map(Number)
  const ultimoDia = new Date(anio, mes, 0).getDate()
  const desde = `${periodo}-01`
  const hasta = `${periodo}-${String(ultimoDia).padStart(2, '0')}`
  return { desde, hasta }
}

/**
 * Calcula el resumen de ingresos, gastos, ahorro neto y porcentaje de ahorro.
 *
 * @param {{ transacciones?: Array<any>, desde?: string, hasta?: string }} opciones
 */
export async function calcularResumenPeriodo({ transacciones, desde, hasta } = {}) {
  const lista = transacciones ?? (await listarTransacciones({ desde, hasta }))

  let totalIngresos = 0
  let totalGastos = 0

  for (const t of lista) {
    if (t.tipo === 'ingreso') totalIngresos += t.montoUSD
    else if (t.tipo === 'gasto') totalGastos += t.montoUSD
  }

  totalIngresos = redondear(totalIngresos)
  totalGastos = redondear(totalGastos)
  const ahorroNeto = redondear(totalIngresos - totalGastos)

  let tasaAhorro = 0
  if (totalIngresos > 0 && ahorroNeto > 0) {
    tasaAhorro = redondear((ahorroNeto / totalIngresos) * 100)
  }

  return {
    totalIngresos,
    totalGastos,
    ahorroNeto,
    tasaAhorro,
  }
}

/**
 * Calcula la distribución porcentual y montos de gastos agrupados por categoría.
 *
 * @param {{ transacciones?: Array<any>, desde?: string, hasta?: string }} opciones
 * @returns {Promise<Array<{ categoria: string, montoUSD: number, porcentaje: number, color: string }>>}
 */
export async function calcularDistribucionCategorias({ transacciones, desde, hasta } = {}) {
  const lista = transacciones ?? (await listarTransacciones({ desde, hasta }))
  const gastos = lista.filter((t) => t.tipo === 'gasto')

  const totalGastos = redondear(gastos.reduce((acc, t) => acc + t.montoUSD, 0))
  if (totalGastos === 0) return []

  const porCategoria = new Map()
  for (const t of gastos) {
    const cat = t.categoria ? t.categoria.trim() : 'Otros'
    const actual = porCategoria.get(cat) || 0
    porCategoria.set(cat, actual + t.montoUSD)
  }

  const items = Array.from(porCategoria.entries()).map(([categoria, acumulado]) => {
    const montoUSD = redondear(acumulado)
    const porcentaje = redondear((montoUSD / totalGastos) * 100)
    return {
      categoria,
      montoUSD,
      porcentaje,
    }
  })

  // Ordenar de mayor a menor gasto
  items.sort((a, b) => b.montoUSD - a.montoUSD)

  // Asignar colores de la paleta
  return items.map((item, index) => ({
    ...item,
    color: PALETA_CATEGORIAS[index % PALETA_CATEGORIAS.length],
  }))
}

/**
 * Genera la comparativa mensual de los últimos N meses (por defecto 6).
 *
 * @param {{ transacciones?: Array<any>, meses?: number, hastaPeriodo?: string }} opciones
 */
export async function calcularComparativaMensual({ transacciones, meses = 6, hastaPeriodo } = {}) {
  const lista = transacciones ?? (await listarTransacciones({}))
  const periodoActual = hastaPeriodo || periodoDeFecha(new Date())

  const [anioFinal, mesFinal] = periodoActual.split('-').map(Number)
  const periodos = []

  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(anioFinal, mesFinal - 1 - i, 1)
    const p = periodoDeFecha(d)
    periodos.push(p)
  }

  return periodos.map((periodo) => {
    let ingresos = 0
    let gastos = 0

    for (const t of lista) {
      if (t.fecha && t.fecha.startsWith(periodo)) {
        if (t.tipo === 'ingreso') ingresos += t.montoUSD
        else if (t.tipo === 'gasto') gastos += t.montoUSD
      }
    }

    ingresos = redondear(ingresos)
    gastos = redondear(gastos)
    const balance = redondear(ingresos - gastos)

    return {
      periodo,
      etiqueta: formatearEtiquetaPeriodo(periodo),
      ingresos,
      gastos,
      balance,
    }
  })
}

/**
 * Obtiene la lista de períodos 'YYYY-MM' únicos disponibles entre las transacciones,
 * garantizando que el mes actual esté siempre disponible.
 *
 * @param {Array<any>} [transacciones]
 * @returns {string[]}
 */
export function obtenerPeriodosDisponibles(transacciones = []) {
  const set = new Set()
  set.add(periodoDeFecha(new Date()))

  for (const t of transacciones) {
    if (t?.fecha && t.fecha.length >= 7) {
      set.add(t.fecha.slice(0, 7))
    }
  }

  return Array.from(set).sort((a, b) => (a < b ? 1 : -1))
}
