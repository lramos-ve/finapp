import { describe, it, expect } from 'vitest'
import {
  convertirDivisasBCV,
  formatearMoneda,
  MONEDAS_CALCULADORA,
} from '../modules/calculadora/logic/calculator.js'

describe('calculator logic (divisas BCV)', () => {
  const tasaUSD = 850.0 // 1 USD = 850 VES
  const tasaEUR = 1000.0 // 1 EUR = 1000 VES

  it('exporta las monedas soportadas USD, EUR y VES', () => {
    expect(MONEDAS_CALCULADORA).toEqual(['USD', 'EUR', 'VES'])
  })

  it('convierte correctamente desde USD a VES y EUR', () => {
    // 100 USD -> 85,000 VES -> 85 EUR (85,000 / 1000)
    const res = convertirDivisasBCV({
      monto: 100,
      monedaOrigen: 'USD',
      tasaUSD,
      tasaEUR,
    })

    expect(res.USD).toBe(100)
    expect(res.VES).toBe(85000)
    expect(res.EUR).toBe(85)
  })

  it('convierte correctamente desde EUR a VES y USD', () => {
    // 50 EUR -> 50,000 VES -> 58.82 USD (50,000 / 850)
    const res = convertirDivisasBCV({
      monto: 50,
      monedaOrigen: 'EUR',
      tasaUSD,
      tasaEUR,
    })

    expect(res.EUR).toBe(50)
    expect(res.VES).toBe(50000)
    expect(res.USD).toBe(58.82)
  })

  it('convierte correctamente desde VES a USD y EUR', () => {
    // 8,500 VES -> 10 USD (8500 / 850), 8.5 EUR (8500 / 1000)
    const res = convertirDivisasBCV({
      monto: 8500,
      monedaOrigen: 'VES',
      tasaUSD,
      tasaEUR,
    })

    expect(res.VES).toBe(8500)
    expect(res.USD).toBe(10)
    expect(res.EUR).toBe(8.5)
  })

  it('retorna ceros si el monto es 0 o negativo o inválido', () => {
    expect(
      convertirDivisasBCV({ monto: 0, monedaOrigen: 'USD', tasaUSD, tasaEUR })
    ).toEqual({ USD: 0, EUR: 0, VES: 0 })

    expect(
      convertirDivisasBCV({ monto: -10, monedaOrigen: 'USD', tasaUSD, tasaEUR })
    ).toEqual({ USD: 0, EUR: 0, VES: 0 })

    expect(
      convertirDivisasBCV({ monto: 'abc', monedaOrigen: 'USD', tasaUSD, tasaEUR })
    ).toEqual({ USD: 0, EUR: 0, VES: 0 })
  })

  it('maneja con seguridad tasas faltantes o iguales a cero', () => {
    const res = convertirDivisasBCV({
      monto: 100,
      monedaOrigen: 'USD',
      tasaUSD: 0,
      tasaEUR: 0,
    })

    expect(res.USD).toBe(100)
    expect(res.VES).toBe(0)
    expect(res.EUR).toBe(0)
  })

  it('retorna ceros si la moneda origen no es válida', () => {
    const res = convertirDivisasBCV({
      monto: 100,
      monedaOrigen: 'GBP',
      tasaUSD,
      tasaEUR,
    })

    expect(res).toEqual({ USD: 0, EUR: 0, VES: 0 })
  })

  it('formatea las divisas con sus símbolos oficiales', () => {
    expect(formatearMoneda(100.5, 'USD')).toContain('$')
    expect(formatearMoneda(100.5, 'EUR')).toContain('€')
    expect(formatearMoneda(100.5, 'VES')).toContain('Bs.')
  })
})
