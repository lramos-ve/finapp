import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../lib/db.js'
import { registrarDeuda, registrarAbono, obtenerTotalesPorDireccion, eliminarDeuda } from '../lib/debts.js'

beforeEach(async () => {
  await db.deudas.clear()
  await db.abonos.clear()
})

describe('debts', () => {
  it('registra una deuda con saldo pendiente igual al monto original', async () => {
    const d = await registrarDeuda({ persona: 'Juan', direccion: 'debo', monto: 50, fecha: '2026-01-01' })
    expect(d.saldoPendiente).toBe(50)
    expect(d.estado).toBe('pendiente')
  })

  it('reduce el saldo pendiente con un abono parcial en USD', async () => {
    const d = await registrarDeuda({ persona: 'Juan', direccion: 'debo', monto: 50, fecha: '2026-01-01' })
    await registrarAbono({ deudaId: d.id, monto: 20, moneda: 'USD', fecha: '2026-01-05' })

    const actualizada = await db.deudas.get(d.id)
    expect(actualizada.saldoPendiente).toBe(30)
    expect(actualizada.estado).toBe('pendiente')
  })

  it('calcula el equivalente en USD de un abono en VES', async () => {
    const d = await registrarDeuda({ persona: 'Juan', direccion: 'debo', monto: 50, fecha: '2026-01-01' })
    await registrarAbono({ deudaId: d.id, monto: 2000, moneda: 'VES', tasaBCV: 200, fecha: '2026-01-05' })

    const actualizada = await db.deudas.get(d.id)
    expect(actualizada.saldoPendiente).toBe(40)
  })

  it('rechaza un abono que excede el saldo pendiente', async () => {
    const d = await registrarDeuda({ persona: 'Juan', direccion: 'debo', monto: 50, fecha: '2026-01-01' })
    await expect(
      registrarAbono({ deudaId: d.id, monto: 60, moneda: 'USD', fecha: '2026-01-05' })
    ).rejects.toThrow()

    const sinCambios = await db.deudas.get(d.id)
    expect(sinCambios.saldoPendiente).toBe(50)
  })

  it('marca la deuda como pagada cuando el saldo llega a $0', async () => {
    const d = await registrarDeuda({ persona: 'Ana', direccion: 'me_deben', monto: 30, fecha: '2026-01-01' })
    await registrarAbono({ deudaId: d.id, monto: 30, moneda: 'USD', fecha: '2026-01-05' })

    const actualizada = await db.deudas.get(d.id)
    expect(actualizada.saldoPendiente).toBe(0)
    expect(actualizada.estado).toBe('pagada')
  })

  it('mantiene los totales por dirección separados', async () => {
    await registrarDeuda({ persona: 'Juan', direccion: 'debo', monto: 50, fecha: '2026-01-01' })
    await registrarDeuda({ persona: 'Ana', direccion: 'me_deben', monto: 30, fecha: '2026-01-01' })

    const totales = await obtenerTotalesPorDireccion()
    expect(totales.debo).toBe(50)
    expect(totales.meDeben).toBe(30)
  })

  it('elimina una deuda sin abonos', async () => {
    const d = await registrarDeuda({ persona: 'Carlos', direccion: 'debo', monto: 80, fecha: '2026-01-01' })
    await eliminarDeuda(d.id)

    const deudaEnDb = await db.deudas.get(d.id)
    expect(deudaEnDb).toBeUndefined()
  })

  it('elimina una deuda y en cascada todos sus abonos asociados', async () => {
    const d = await registrarDeuda({ persona: 'Laura', direccion: 'me_deben', monto: 100, fecha: '2026-01-01' })
    await registrarAbono({ deudaId: d.id, monto: 30, moneda: 'USD', fecha: '2026-01-03' })
    await registrarAbono({ deudaId: d.id, monto: 20, moneda: 'USD', fecha: '2026-01-04' })

    const abonosAntes = await db.abonos.where('deudaId').equals(d.id).toArray()
    expect(abonosAntes).toHaveLength(2)

    await eliminarDeuda(d.id)

    const deudaEnDb = await db.deudas.get(d.id)
    expect(deudaEnDb).toBeUndefined()

    const abonosDespues = await db.abonos.where('deudaId').equals(d.id).toArray()
    expect(abonosDespues).toHaveLength(0)
  })
})
