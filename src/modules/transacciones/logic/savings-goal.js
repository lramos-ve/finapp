import { db } from '../../shared/services/db.js'

/** Obtiene la meta de ahorro actual (o null si no hay). */
export async function obtenerMetaAhorro() {
  return (await db.metas.toCollection().first()) ?? null
}

/** Crea o reemplaza la meta de ahorro única. */
export async function guardarMetaAhorro({ nombre, montoObjetivo, ahorrado }) {
  const monto = Number(montoObjetivo)
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new Error('El monto objetivo debe ser mayor a 0')
  }
  const actual = await obtenerMetaAhorro()
  const ahorro = ahorrado === undefined || ahorrado === '' ? (actual?.ahorrado ?? 0) : Number(ahorrado)
  if (!Number.isFinite(ahorro) || ahorro < 0) {
    throw new Error('Lo ahorrado no puede ser negativo')
  }
  const meta = {
    nombre: (nombre ?? '').trim() || 'Mi meta de ahorro',
    montoObjetivo: monto,
    ahorrado: ahorro,
  }
  await db.metas.clear()
  const id = await db.metas.add(meta)
  return { id, ...meta }
}

/** Suma (o resta, si es negativo) un monto a lo ahorrado; nunca baja de 0. */
export async function agregarAhorro(monto) {
  const delta = Number(monto)
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error('Ingresa un monto válido')
  }
  const meta = await obtenerMetaAhorro()
  if (!meta) throw new Error('Primero define una meta')
  const ahorrado = Math.max(0, Math.round(((meta.ahorrado ?? 0) + delta) * 100) / 100)
  await db.metas.update(meta.id, { ahorrado })
  return { ...meta, ahorrado }
}

export async function eliminarMetaAhorro() {
  await db.metas.clear()
}

/** Calcula el avance de la meta a partir de lo ahorrado manualmente (USD). */
export function calcularProgresoMeta(meta) {
  if (!meta) return { ahorrado: 0, porcentaje: 0, restante: 0, lograda: false }
  const ahorrado = Math.max(0, meta.ahorrado ?? 0)
  const porcentaje = Math.min(100, Math.round((ahorrado / meta.montoObjetivo) * 100))
  const restante = Math.max(0, meta.montoObjetivo - ahorrado)
  return { ahorrado, porcentaje, restante, lograda: ahorrado >= meta.montoObjetivo }
}
