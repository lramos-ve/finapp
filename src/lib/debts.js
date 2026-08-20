import { db } from './db.js'
import { calcularMovimientoDeDinero, redondear } from './money.js'

/**
 * Registra una deuda (siempre denominada en USD).
 * Ver specs/debts/spec.md - Requirement: Registrar una deuda.
 *
 * @param {{ persona: string, direccion: 'debo'|'me_deben', monto: number,
 *           fecha: string, notas?: string }} datos
 */
export async function registrarDeuda({ persona, direccion, monto, fecha, notas }) {
  if (direccion !== 'debo' && direccion !== 'me_deben') {
    throw new Error("La dirección debe ser 'debo' o 'me_deben'")
  }
  if (!persona) {
    throw new Error('La persona es requerida')
  }
  if (!monto || monto <= 0) {
    throw new Error('El monto original debe ser mayor a 0')
  }

  const id = await db.deudas.add({
    persona,
    direccion,
    montoOriginal: monto,
    saldoPendiente: monto,
    fecha,
    estado: 'pendiente',
    notas: notas ?? '',
  })

  return db.deudas.get(id)
}

/**
 * Registra un abono a una deuda pendiente, en USD o VES.
 * Rechaza abonos cuyo equivalente en USD exceda el saldo pendiente.
 * Marca la deuda como 'pagada' cuando el saldo llega a $0.
 * Ver specs/debts/spec.md - Requirement: Registrar un abono a una deuda,
 * No permitir abonos que excedan el saldo pendiente, Marcar una deuda como pagada.
 *
 * @param {{ deudaId: number, monto: number, moneda: 'USD'|'VES', tasaBCV?: number, fecha: string }} datos
 */
export async function registrarAbono({ deudaId, monto, moneda, tasaBCV, fecha }) {
  const deuda = await db.deudas.get(deudaId)
  if (!deuda) {
    throw new Error('Deuda no encontrada')
  }

  const movimiento = calcularMovimientoDeDinero({ monto, moneda, tasaBCV })

  if (movimiento.montoUSD > deuda.saldoPendiente) {
    throw new Error(
      `El abono ($${movimiento.montoUSD}) excede el saldo pendiente de la deuda ($${deuda.saldoPendiente})`
    )
  }

  const id = await db.abonos.add({
    deudaId,
    ...movimiento,
    fecha,
  })

  const saldoPendiente = redondear(deuda.saldoPendiente - movimiento.montoUSD)
  const estado = saldoPendiente === 0 ? 'pagada' : 'pendiente'

  await db.deudas.update(deudaId, { saldoPendiente, estado })

  return db.abonos.get(id)
}

/**
 * Totales pendientes agrupados por dirección, mostrados por separado.
 * Ver specs/debts/spec.md - Requirement: Consultar deudas por dirección.
 */
export async function obtenerTotalesPorDireccion() {
  const deudas = await db.deudas.where('estado').equals('pendiente').toArray()

  let totalDebo = 0
  let totalMeDeben = 0

  for (const d of deudas) {
    if (d.direccion === 'debo') totalDebo += d.saldoPendiente
    else totalMeDeben += d.saldoPendiente
  }

  return { debo: redondear(totalDebo), meDeben: redondear(totalMeDeben) }
}

/** Lista todas las deudas, opcionalmente filtradas por dirección. */
export async function listarDeudas({ direccion } = {}) {
  let coleccion = await db.deudas.toArray()
  if (direccion) coleccion = coleccion.filter((d) => d.direccion === direccion)
  return coleccion.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

/** Lista los abonos registrados para una deuda. */
export async function listarAbonos(deudaId) {
  return db.abonos.where('deudaId').equals(deudaId).sortBy('fecha')
}
