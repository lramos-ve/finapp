import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../lib/db.js'
import {
  definirGastoFijo,
  desactivarGastoFijo,
  generarInstancias,
  registrarPagoInstancia,
  listarInstancias,
  sincronizarGastosFijos,
} from '../lib/fixedExpenses.js'

beforeEach(async () => {
  await db.gastosFijos.clear()
  await db.instanciasGastoFijo.clear()
  await db.pagosGastoFijo.clear()
})

describe('fixed-expenses', () => {
  it('genera la instancia del período actual visible antes del vencimiento', async () => {
    const gastoFijo = await definirGastoFijo({ nombre: 'Arriendo', monto: 500, diaVencimiento: 5 })
    await generarInstancias(new Date('2026-01-01T12:00:00'))

    const instancias = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-01' })
    expect(instancias).toHaveLength(1)
    expect(instancias[0].estado).toBe('pendiente')
    expect(instancias[0].saldoPendiente).toBe(500)
  })

  it('genera también la instancia del siguiente período (look-ahead)', async () => {
    const gastoFijo = await definirGastoFijo({ nombre: 'Arriendo', monto: 500, diaVencimiento: 5 })
    await generarInstancias(new Date('2026-01-01T12:00:00'))

    const siguiente = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-02' })
    expect(siguiente).toHaveLength(1)
  })

  it('arrastra el saldo vencido de enero a la instancia de febrero', async () => {
    const gastoFijo = await definirGastoFijo({ nombre: 'Arriendo', monto: 500, diaVencimiento: 5 })

    // Se abre la app por primera vez el 10 de enero: enero ya venció sin
    // pagarse, y en la misma sincronización se genera el look-ahead de febrero.
    await generarInstancias(new Date('2026-01-10T12:00:00'))

    const [enero] = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-01' })
    expect(enero.estado).toBe('vencida')
    expect(enero.saldoPendiente).toBe(500)

    const [febrero] = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-02' })
    expect(febrero.montoPeriodo).toBe(500)
    expect(febrero.montoArrastrado).toBe(500)
    expect(febrero.saldoPendiente).toBe(1000)
  })

  it('no arrastra nada si el período anterior fue pagado a tiempo', async () => {
    const gastoFijo = await definirGastoFijo({ nombre: 'Streaming', monto: 10, diaVencimiento: 5 })
    await generarInstancias(new Date('2026-01-01T12:00:00'))

    const [enero] = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-01' })
    await registrarPagoInstancia({ instanciaId: enero.id, monto: 10, moneda: 'USD', fecha: '2026-01-02' })

    // Sincronización de febrero (antes de su propio vencimiento), con marzo
    // generándose como nuevo look-ahead
    await generarInstancias(new Date('2026-02-01T12:00:00'))

    const [marzo] = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-03' })
    expect(marzo.montoArrastrado).toBe(0)
    expect(marzo.saldoPendiente).toBe(10)
  })

  it('arrastra el saldo aunque el período anterior no se haya vuelto a sincronizar antes de generar el siguiente', async () => {
    const gastoFijo = await definirGastoFijo({ nombre: 'Arriendo', monto: 500, diaVencimiento: 5 })

    // Enero se genera puntual (sin vencer todavía)
    await sincronizarGastosFijos(new Date('2026-01-01T12:00:00'))
    // El usuario no vuelve a abrir la app hasta el 10 de febrero, cuando
    // enero ya está vencido y no se pagó
    await sincronizarGastosFijos(new Date('2026-02-10T12:00:00'))

    const [enero] = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-01' })
    expect(enero.estado).toBe('vencida')

    const [marzo] = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-03' })
    expect(marzo.montoArrastrado).toBe(500)
    expect(marzo.saldoPendiente).toBe(1000)
  })

  it('registra un pago parcial sin marcar la instancia como pagada', async () => {
    const gastoFijo = await definirGastoFijo({ nombre: 'Arriendo', monto: 500, diaVencimiento: 5 })
    await generarInstancias(new Date('2026-01-10T12:00:00'))
    const [enero] = await listarInstancias({ gastoFijoId: gastoFijo.id, periodo: '2026-01' })

    await registrarPagoInstancia({
      instanciaId: enero.id,
      monto: 20000,
      moneda: 'VES',
      tasaBCV: 200,
      fecha: '2026-01-15',
    })

    const actualizada = await db.instanciasGastoFijo.get(enero.id)
    expect(actualizada.saldoPendiente).toBe(400)
    expect(actualizada.estado).toBe('vencida')
  })

  it('deja de generar instancias nuevas cuando el gasto fijo se desactiva', async () => {
    const gastoFijo = await definirGastoFijo({ nombre: 'Streaming', monto: 10, diaVencimiento: 5 })
    await generarInstancias(new Date('2026-01-01T12:00:00'))
    await desactivarGastoFijo(gastoFijo.id)

    await generarInstancias(new Date('2026-03-01T12:00:00'))

    const todas = await listarInstancias({ gastoFijoId: gastoFijo.id })
    // Solo las generadas antes de desactivar (enero y el look-ahead de febrero)
    expect(todas.map((i) => i.periodo).sort()).toEqual(['2026-01', '2026-02'])
  })
})
