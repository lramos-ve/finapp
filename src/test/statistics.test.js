import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../lib/db.js'
import { registrarTransaccion } from '../lib/transactions.js'
import {
  periodoDeFecha,
  formatearEtiquetaPeriodo,
  rangoDePeriodo,
  calcularResumenPeriodo,
  calcularDistribucionCategorias,
  calcularComparativaMensual,
  obtenerPeriodosDisponibles,
} from '../lib/statistics.js'

beforeEach(async () => {
  await db.transacciones.clear()
})

describe('statistics utility functions', () => {
  it('formatea etiquetas de período correctamente', () => {
    expect(formatearEtiquetaPeriodo('2026-01')).toBe('Ene 26')
    expect(formatearEtiquetaPeriodo('2026-08')).toBe('Ago 26')
    expect(formatearEtiquetaPeriodo('2026-12')).toBe('Dic 26')
  })

  it('calcula rangos de fechas de inicio a fin de mes', () => {
    const rangoEne = rangoDePeriodo('2026-01')
    expect(rangoEne.desde).toBe('2026-01-01')
    expect(rangoEne.hasta).toBe('2026-01-31')

    const rangoFeb = rangoDePeriodo('2026-02')
    expect(rangoFeb.desde).toBe('2026-02-01')
    expect(rangoFeb.hasta).toBe('2026-02-28')
  })
})

describe('statistics calculations', () => {
  it('calcula resumen con ahorro positivo y tasa de ahorro', async () => {
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 1000,
      moneda: 'USD',
      fecha: '2026-03-01',
    })
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 600,
      moneda: 'USD',
      fecha: '2026-03-05',
    })

    const { desde, hasta } = rangoDePeriodo('2026-03')
    const resumen = await calcularResumenPeriodo({ desde, hasta })

    expect(resumen.totalIngresos).toBe(1000)
    expect(resumen.totalGastos).toBe(600)
    expect(resumen.ahorroNeto).toBe(400)
    expect(resumen.tasaAhorro).toBe(40) // 400 / 1000 = 40%
  })

  it('calcula resumen con déficit (gastos > ingresos) fijando tasa en 0%', async () => {
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 200,
      moneda: 'USD',
      fecha: '2026-03-01',
    })
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 350,
      moneda: 'USD',
      fecha: '2026-03-05',
    })

    const { desde, hasta } = rangoDePeriodo('2026-03')
    const resumen = await calcularResumenPeriodo({ desde, hasta })

    expect(resumen.totalIngresos).toBe(200)
    expect(resumen.totalGastos).toBe(350)
    expect(resumen.ahorroNeto).toBe(-150)
    expect(resumen.tasaAhorro).toBe(0)
  })

  it('calcula distribución de gastos por categoría con porcentajes correctos', async () => {
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 50,
      moneda: 'USD',
      categoria: 'Alimentación',
      fecha: '2026-03-02',
    })
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 30,
      moneda: 'USD',
      categoria: 'Servicios',
      fecha: '2026-03-03',
    })
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 20,
      moneda: 'USD',
      categoria: 'Transporte',
      fecha: '2026-03-04',
    })

    const { desde, hasta } = rangoDePeriodo('2026-03')
    const dist = await calcularDistribucionCategorias({ desde, hasta })

    expect(dist).toHaveLength(3)
    // El mayor debe estar primero
    expect(dist[0].categoria).toBe('Alimentación')
    expect(dist[0].montoUSD).toBe(50)
    expect(dist[0].porcentaje).toBe(50)
    expect(dist[0].color).toBeDefined()

    expect(dist[1].categoria).toBe('Servicios')
    expect(dist[1].montoUSD).toBe(30)
    expect(dist[1].porcentaje).toBe(30)

    expect(dist[2].categoria).toBe('Transporte')
    expect(dist[2].montoUSD).toBe(20)
    expect(dist[2].porcentaje).toBe(20)
  })

  it('agrupa gastos sin categoría bajo "Otros"', async () => {
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 40,
      moneda: 'USD',
      fecha: '2026-03-01',
    })

    const { desde, hasta } = rangoDePeriodo('2026-03')
    const dist = await calcularDistribucionCategorias({ desde, hasta })

    expect(dist).toHaveLength(1)
    expect(dist[0].categoria).toBe('Otros')
    expect(dist[0].montoUSD).toBe(40)
    expect(dist[0].porcentaje).toBe(100)
  })

  it('retorna array vacío si no hay gastos en el período', async () => {
    const dist = await calcularDistribucionCategorias({ desde: '2026-01-01', hasta: '2026-01-31' })
    expect(dist).toEqual([])
  })

  it('calcula comparativa mensual histórica de ingresos y gastos', async () => {
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 500,
      moneda: 'USD',
      fecha: '2026-01-15',
    })
    await registrarTransaccion({
      tipo: 'gasto',
      monto: 200,
      moneda: 'USD',
      fecha: '2026-01-20',
    })
    await registrarTransaccion({
      tipo: 'ingreso',
      monto: 600,
      moneda: 'USD',
      fecha: '2026-02-10',
    })

    const comparativa = await calcularComparativaMensual({
      meses: 3,
      hastaPeriodo: '2026-02',
    })

    expect(comparativa).toHaveLength(3)
    // El orden es cronológico ascendente (Diciembre 2025, Enero 2026, Febrero 2026)
    expect(comparativa[0].periodo).toBe('2025-12')
    expect(comparativa[0].ingresos).toBe(0)
    expect(comparativa[0].gastos).toBe(0)

    expect(comparativa[1].periodo).toBe('2026-01')
    expect(comparativa[1].ingresos).toBe(500)
    expect(comparativa[1].gastos).toBe(200)
    expect(comparativa[1].balance).toBe(300)

    expect(comparativa[2].periodo).toBe('2026-02')
    expect(comparativa[2].ingresos).toBe(600)
    expect(comparativa[2].gastos).toBe(0)
  })

  it('obtiene lista de períodos disponibles ordenada', () => {
    const txs = [
      { fecha: '2026-01-10' },
      { fecha: '2025-11-20' },
      { fecha: '2026-03-05' },
    ]
    const periodos = obtenerPeriodosDisponibles(txs)
    expect(periodos).toContain('2026-01')
    expect(periodos).toContain('2025-11')
    expect(periodos).toContain('2026-03')
    expect(periodos[0] >= periodos[1]).toBe(true) // descendente
  })
})
