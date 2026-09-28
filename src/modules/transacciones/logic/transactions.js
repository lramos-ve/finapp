import { db } from '../../shared/services/db.js'
import { calcularMovimientoDeDinero, redondear } from '../../shared/services/money.js'


/**
 * Registra una transacción (ingreso o gasto), en USD o VES.
 * Ver specs/transactions/spec.md - Requirement: Registrar una transacción, Categorizar transacciones.
 *
 * @param {{ tipo: 'ingreso'|'gasto', monto: number, moneda: 'USD'|'VES',
 *           tasaBCV?: number, fecha: string, descripcion?: string, categoria?: string }} datos
 */
export async function registrarTransaccion({ tipo, monto, moneda, tasaBCV, fecha, descripcion, categoria }) {
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
    categoria: categoria ? categoria.trim() : '',
  })

  return db.transacciones.get(id)
}

/**
 * Actualiza los datos de una transacción existente y recalcula montos en USD.
 * Ver specs/transactions/spec.md - Requirement: Actualizar una transacción existente, Categorizar transacciones.
 *
 * @param {number} id
 * @param {{ tipo: 'ingreso'|'gasto', monto: number, moneda: 'USD'|'VES',
 *           tasaBCV?: number, fecha: string, descripcion?: string, categoria?: string }} datos
 */
export async function actualizarTransaccion(id, { tipo, monto, moneda, tasaBCV, fecha, descripcion, categoria }) {
  const existente = await db.transacciones.get(id)
  if (!existente) {
    throw new Error('La transacción no existe')
  }
  if (tipo !== 'ingreso' && tipo !== 'gasto') {
    throw new Error("El tipo debe ser 'ingreso' o 'gasto'")
  }
  if (!fecha) {
    throw new Error('La fecha es requerida')
  }

  const movimiento = calcularMovimientoDeDinero({ monto, moneda, tasaBCV })

  await db.transacciones.put({
    id,
    tipo,
    ...movimiento,
    fecha,
    descripcion: descripcion ?? '',
    categoria: categoria !== undefined ? (categoria ? categoria.trim() : '') : (existente.categoria ?? ''),
  })

  return db.transacciones.get(id)
}

/**
 * Elimina una transacción de la base de datos por su ID.
 * Ver specs/transactions/spec.md - Requirement: Eliminar una transacción.
 *
 * @param {number} id
 */
export async function eliminarTransaccion(id) {
  await db.transacciones.delete(id)
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
 * Lista transacciones filtradas por tipo, moneda, categoría y/o rango de fechas.
 * Ver specs/transactions/spec.md - Requirement: Listar y filtrar transacciones, Filtrar transacciones por categoría.
 *
 * @param {{ tipo?: 'ingreso'|'gasto', moneda?: 'USD'|'VES', categoria?: string, desde?: string, hasta?: string }} filtros
 */
export async function listarTransacciones({ tipo, moneda, categoria, desde, hasta } = {}) {
  let coleccion = await db.transacciones.toArray()

  if (tipo) coleccion = coleccion.filter((t) => t.tipo === tipo)
  if (moneda) coleccion = coleccion.filter((t) => t.moneda === moneda)
  if (categoria) coleccion = coleccion.filter((t) => t.categoria === categoria)
  if (desde) coleccion = coleccion.filter((t) => t.fecha >= desde)
  if (hasta) coleccion = coleccion.filter((t) => t.fecha <= hasta)

  return coleccion.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}
