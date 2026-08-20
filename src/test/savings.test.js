import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../lib/db.js'
import {
  createSavingFund,
  recordSavingMovement,
  updateSavingFund,
  togglePauseSavingFund,
  deleteSavingFund,
  cargarAhorrosLocales
} from '../lib/savings.js'

describe('Módulo de Ahorros (Saca La Cuenta)', () => {
  beforeEach(async () => {
    await db.ahorros.clear()
  })

  it('debe crear un fondo de ahorro físico con saldo inicial', async () => {
    const fondo = await createSavingFund(null, {
      nombre: 'Efectivo en Caja',
      tipoAhorro: 'fisico',
      saldoInicial: 100,
      metaUSD: 500,
      descripcion: 'Dólares en billetes'
    })

    expect(fondo.id).toBeDefined()
    expect(fondo.nombre).toBe('Efectivo en Caja')
    expect(fondo.tipoAhorro).toBe('fisico')
    expect(fondo.saldoActual).toBe(100)
    expect(fondo.metaUSD).toBe(500)
    expect(fondo.movimientos).toHaveLength(1)
    expect(fondo.movimientos[0].tipo).toBe('abono')
    expect(fondo.movimientos[0].montoUSD).toBe(100)
  })

  it('debe registrar un abono en USD', async () => {
    const fondo = await createSavingFund(null, {
      nombre: 'Zelle',
      tipoAhorro: 'electronico',
      saldoInicial: 50
    })

    const res = await recordSavingMovement(null, fondo, {
      tipo: 'abono',
      monto: 30,
      moneda: 'USD',
      fecha: '2026-08-20',
      nota: 'Pago quincena'
    })

    expect(res.nuevoSaldo).toBe(80)
    expect(res.nuevoMovimiento.montoUSD).toBe(30)
    expect(res.nuevoMovimiento.tipo).toBe('abono')

    const cargados = await cargarAhorrosLocales()
    expect(cargados[0].saldoActual).toBe(80)
    expect(cargados[0].movimientos).toHaveLength(2)
  })

  it('debe registrar un abono en VES con tasa BCV y convertir a USD', async () => {
    const fondo = await createSavingFund(null, {
      nombre: 'Fondo Emergencia',
      tipoAhorro: 'fisico',
      saldoInicial: 0
    })

    const res = await recordSavingMovement(null, fondo, {
      tipo: 'abono',
      monto: 7000,
      moneda: 'VES',
      tasaBCV: 700,
      fecha: '2026-08-20'
    })

    expect(res.nuevoSaldo).toBe(10)
    expect(res.nuevoMovimiento.montoUSD).toBe(10)
  })

  it('debe registrar un retiro y restar del saldo', async () => {
    const fondo = await createSavingFund(null, {
      nombre: 'Caja Fuerte',
      tipoAhorro: 'fisico',
      saldoInicial: 100
    })

    const res = await recordSavingMovement(null, fondo, {
      tipo: 'retiro',
      monto: 40,
      moneda: 'USD',
      fecha: '2026-08-20',
      nota: 'Gasto médico'
    })

    expect(res.nuevoSaldo).toBe(60)
  })

  it('debe lanzar error si se intenta retirar más del saldo disponible', async () => {
    const fondo = await createSavingFund(null, {
      nombre: 'Caja Fuerte',
      tipoAhorro: 'fisico',
      saldoInicial: 20
    })

    await expect(recordSavingMovement(null, fondo, {
      tipo: 'retiro',
      monto: 50,
      moneda: 'USD',
      fecha: '2026-08-20'
    })).rejects.toThrow('Fondos insuficientes')
  })

  it('debe pausar, reanudar y eliminar un fondo de ahorro', async () => {
    const fondo = await createSavingFund(null, {
      nombre: 'Ahorro Meta',
      tipoAhorro: 'fisico',
      saldoInicial: 0
    })

    await togglePauseSavingFund(null, fondo.id, false)
    let lista = await cargarAhorrosLocales()
    expect(lista[0].pausado).toBe(true)

    await togglePauseSavingFund(null, fondo.id, true)
    lista = await cargarAhorrosLocales()
    expect(lista[0].pausado).toBe(false)

    await deleteSavingFund(null, fondo.id)
    lista = await cargarAhorrosLocales()
    expect(lista).toHaveLength(0)
  })
})
