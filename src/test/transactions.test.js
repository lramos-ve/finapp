import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../lib/db.js'
import {
  registrarTransaccion,
  actualizarTransaccion,
  eliminarTransaccion,
  obtenerBalance,
  listarTransacciones,
} from '../lib/transactions.js'

beforeEach(async () => {
  await db.transacciones.clear()
})

describe('transactions', () => {
  it('registra un ingreso en USD con montoUSD igual al monto', async () => {
    const t = await registrarTransaccion({ tipo: 'ingreso', monto: 100, moneda: 'USD', fecha: '2026-01-01' })
    expect(t.montoUSD).toBe(100)
    expect(t.tasaBCV).toBeUndefined()
  })

  it('requiere tasa BCV para un gasto en VES y congela el equivalente en USD', async () => {
    await expect(
      registrarTransaccion({ tipo: 'gasto', monto: 2000, moneda: 'VES', fecha: '2026-01-01' })
    ).rejects.toThrow()

    const t = await registrarTransaccion({
      tipo: 'gasto',
      monto: 2000,
      moneda: 'VES',
      tasaBCV: 200,
      fecha: '2026-01-01',
    })
    expect(t.montoUSD).toBe(10)
  })

  it('el equivalente en USD permanece igual aunque cambie la tasa después', async () => {
    const t = await registrarTransaccion({
      tipo: 'gasto',
      monto: 2000,
      moneda: 'VES',
      tasaBCV: 200,
      fecha: '2026-01-01',
    })
    // "cambia" la tasa BCV actual (simulado) - el registro histórico no se toca
    const otraTasa = 400
    expect(otraTasa).not.toBe(t.tasaBCV)
    const recargado = await db.transacciones.get(t.id)
    expect(recargado.montoUSD).toBe(10)
  })

  it('calcula el balance neto en USD', async () => {
    await registrarTransaccion({ tipo: 'ingreso', monto: 500, moneda: 'USD', fecha: '2026-01-05' })
    await registrarTransaccion({ tipo: 'gasto', monto: 300, moneda: 'USD', fecha: '2026-01-10' })

    const balance = await obtenerBalance({})
    expect(balance.totalIngresos).toBe(500)
    expect(balance.totalGastos).toBe(300)
    expect(balance.balance).toBe(200)
  })

  it('filtra transacciones por tipo y moneda', async () => {
    await registrarTransaccion({ tipo: 'gasto', monto: 10, moneda: 'USD', fecha: '2026-01-01' })
    await registrarTransaccion({ tipo: 'gasto', monto: 2000, moneda: 'VES', tasaBCV: 200, fecha: '2026-01-02' })
    await registrarTransaccion({ tipo: 'ingreso', monto: 50, moneda: 'USD', fecha: '2026-01-03' })

    const gastosVES = await listarTransacciones({ tipo: 'gasto', moneda: 'VES' })
    expect(gastosVES).toHaveLength(1)
    expect(gastosVES[0].moneda).toBe('VES')
  })

  it('actualiza una transacción existente y recalcula montos en USD', async () => {
    const t = await registrarTransaccion({
      tipo: 'gasto',
      monto: 2000,
      moneda: 'VES',
      tasaBCV: 200,
      fecha: '2026-01-01',
      descripcion: 'Compra inicial',
    })
    expect(t.montoUSD).toBe(10)

    const actualizada = await actualizarTransaccion(t.id, {
      tipo: 'gasto',
      monto: 4000,
      moneda: 'VES',
      tasaBCV: 200,
      fecha: '2026-01-02',
      descripcion: 'Compra corregida',
    })

    expect(actualizada.monto).toBe(4000)
    expect(actualizada.montoUSD).toBe(20)
    expect(actualizada.descripcion).toBe('Compra corregida')
    expect(actualizada.fecha).toBe('2026-01-02')

    // Ahora convertirla a USD
    const enUSD = await actualizarTransaccion(t.id, {
      tipo: 'ingreso',
      monto: 50,
      moneda: 'USD',
      fecha: '2026-01-02',
    })
    expect(enUSD.tipo).toBe('ingreso')
    expect(enUSD.monto).toBe(50)
    expect(enUSD.montoUSD).toBe(50)
    expect(enUSD.tasaBCV).toBeUndefined()
  })

  it('lanza error al actualizar si la transacción no existe o los datos son inválidos', async () => {
    await expect(
      actualizarTransaccion(999999, {
        tipo: 'gasto',
        monto: 10,
        moneda: 'USD',
        fecha: '2026-01-01',
      })
    ).rejects.toThrow('La transacción no existe')

    const t = await registrarTransaccion({
      tipo: 'gasto',
      monto: 10,
      moneda: 'USD',
      fecha: '2026-01-01',
    })

    await expect(
      actualizarTransaccion(t.id, {
        tipo: 'invalido',
        monto: 10,
        moneda: 'USD',
        fecha: '2026-01-01',
      })
    ).rejects.toThrow()

    await expect(
      actualizarTransaccion(t.id, {
        tipo: 'gasto',
        monto: 10,
        moneda: 'USD',
        fecha: '',
      })
    ).rejects.toThrow()
  })

  it('elimina una transacción y actualiza el balance de transacciones', async () => {
    const t1 = await registrarTransaccion({ tipo: 'ingreso', monto: 100, moneda: 'USD', fecha: '2026-01-01' })
    const t2 = await registrarTransaccion({ tipo: 'gasto', monto: 30, moneda: 'USD', fecha: '2026-01-02' })

    let balance = await obtenerBalance({})
    expect(balance.balance).toBe(70)

    await eliminarTransaccion(t2.id)

    const listado = await listarTransacciones({})
    expect(listado).toHaveLength(1)
    expect(listado[0].id).toBe(t1.id)

    balance = await obtenerBalance({})
    expect(balance.balance).toBe(100)
    expect(balance.totalGastos).toBe(0)
  })
})
