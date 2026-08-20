import { db } from './db.js'
import { calcularMovimientoDeDinero, redondear } from './money.js'

/**
 * Registra una transacción (ingreso o gasto), en USD o VES.
 * Ver specs/transactions/spec.md - Requirement: Registrar una transacción.
 *
 * @param {{ tipo: 'ingreso'|'gasto', monto: number, moneda: 'USD'|'VES',
 *           tasaBCV?: number, fecha: string, descripcion?: string }} datos
 */
export async function registrarTransaccion({ tipo, monto, moneda, tasaBCV, fecha, descripcion }) {
  if (tipo !== 'ingreso' && tipo !== 'gasto') {
    throw new Error("El tipo debe ser 'ingreso' o 'gasto'")
  }
  if (!fecha) {
    throw new Error('La fecha es requerida')
  }

  const movimiento = calcularMovimientoDeDinero({ monto, moneda, tasaBCV })

  const id = await db.transacciones.add({
    tipo,
    ...movimiento,
    fecha,
    descripcion: descripcion ?? '',
  })

  return db.transacciones.get(id)
}

/**
 * Calcula el balance (ingresos, gastos, neto) en USD para un rango de fechas.
 * Ver specs/transactions/spec.md - Requirement: Consultar balance de transacciones.
 *
 * @param {{ desde?: string, hasta?: string }} rango
 */
export async function obtenerBalance({ desde, hasta } = {}) {
  const transacciones = await listarTransacciones({ desde, hasta })

  let totalIngresos = 0
  let totalGastos = 0

  for (const t of transacciones) {
    if (t.tipo === 'ingreso') totalIngresos += t.montoUSD
    else totalGastos += t.montoUSD
  }

  return {
    totalIngresos: redondear(totalIngresos),
    totalGastos: redondear(totalGastos),
    balance: redondear(totalIngresos - totalGastos),
  }
}

/**
 * Lista transacciones filtradas por tipo, moneda y/o rango de fechas.
 * Ver specs/transactions/spec.md - Requirement: Listar y filtrar transacciones.
 *
 * @param {{ tipo?: 'ingreso'|'gasto', moneda?: 'USD'|'VES', desde?: string, hasta?: string }} filtros
 */
export async function listarTransacciones({ tipo, moneda, desde, hasta } = {}) {
  let coleccion = await db.transacciones.toArray()

  if (tipo) coleccion = coleccion.filter((t) => t.tipo === tipo)
  if (moneda) coleccion = coleccion.filter((t) => t.moneda === moneda)
  if (desde) coleccion = coleccion.filter((t) => t.fecha >= desde)
  if (hasta) coleccion = coleccion.filter((t) => t.fecha <= hasta)

  return coleccion.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}
