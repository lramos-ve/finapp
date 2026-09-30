import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  obtenerUltimaTasaEnCache,
  obtenerUltimaTasaEuroEnCache,
  guardarTasaEnCache,
  guardarTasaEuroEnCache,
  obtenerDetalleCacheBCV,
  obtenerTasaBCV,
  obtenerTasaEuroBCV,
  obtenerTasasOficialesBCV,
} from '../modules/shared/services/bcv.js'

describe('bcv service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('guarda y recupera la tasa en localStorage', () => {
    expect(obtenerUltimaTasaEnCache()).toBeNull()

    guardarTasaEnCache(850.5, '2026-09-28T00:00:00Z')
    expect(obtenerUltimaTasaEnCache()).toBe(850.5)

    const detalle = obtenerDetalleCacheBCV()
    expect(detalle.tasa).toBe(850.5)
    expect(detalle.tasaUSD).toBe(850.5)
    expect(detalle.fechaActualizacion).toBe('2026-09-28T00:00:00Z')
  })

  it('guarda y recupera la tasa del euro en localStorage', () => {
    expect(obtenerUltimaTasaEuroEnCache()).toBeNull()

    guardarTasaEuroEnCache(976.9, '2026-09-28T00:00:00Z')
    expect(obtenerUltimaTasaEuroEnCache()).toBe(976.9)

    const detalle = obtenerDetalleCacheBCV()
    expect(detalle.tasaEUR).toBe(976.9)
    expect(detalle.fechaActualizacionEUR).toBe('2026-09-28T00:00:00Z')
  })

  it('ignora valores inválidos al guardar en caché', () => {
    guardarTasaEnCache(-50)
    expect(obtenerUltimaTasaEnCache()).toBeNull()

    guardarTasaEnCache('invalido')
    expect(obtenerUltimaTasaEnCache()).toBeNull()

    guardarTasaEuroEnCache(-10)
    expect(obtenerUltimaTasaEuroEnCache()).toBeNull()
  })

  it('obtiene la tasa desde la API remota y la almacena en caché', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          moneda: 'USD',
          fuente: 'oficial',
          promedio: 857.0058,
          fechaActualizacion: '2026-09-28T00:00:00-04:00',
        }),
      })
    )

    const resultado = await obtenerTasaBCV({ forzar: true })
    expect(resultado.tasa).toBe(857.01)
    expect(resultado.desdeCache).toBe(false)
    expect(resultado.fechaActualizacion).toBe('2026-09-28T00:00:00-04:00')

    // Se guardó en caché
    expect(obtenerUltimaTasaEnCache()).toBe(857.01)
  })

  it('obtiene la tasa del euro desde la API remota y la almacena en caché', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          moneda: 'EUR',
          fuente: 'oficial',
          promedio: 976.904,
          fechaActualizacion: '2026-09-28T00:00:00-04:00',
        }),
      })
    )

    const resultado = await obtenerTasaEuroBCV({ forzar: true })
    expect(resultado.tasa).toBe(976.9)
    expect(resultado.desdeCache).toBe(false)
    expect(resultado.fechaActualizacion).toBe('2026-09-28T00:00:00-04:00')

    expect(obtenerUltimaTasaEuroEnCache()).toBe(976.9)
  })

  it('retorna el valor en caché directamente cuando forzar es false', async () => {
    guardarTasaEnCache(800.0, '2026-09-27T00:00:00Z')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await obtenerTasaBCV({ forzar: false })
    expect(resultado.tasa).toBe(800.0)
    expect(resultado.desdeCache).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('usa la caché como fallback ante error de red cuando se fuerza la consulta', async () => {
    guardarTasaEnCache(820.0, '2026-09-27T00:00:00Z')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error / Offline'))
    )

    const resultado = await obtenerTasaBCV({ forzar: true })
    expect(resultado.tasa).toBe(820.0)
    expect(resultado.desdeCache).toBe(true)
    expect(resultado.error).toContain('Network error')
  })

  it('lanza error si la API falla y no existe ningún valor en caché previa', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Servidor caído'))
    )

    await expect(obtenerTasaBCV({ forzar: true })).rejects.toThrow('Servidor caído')
  })

  it('consulta ambas tasas oficiales (USD y EUR) simultáneamente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url) => {
        if (url.includes('dolares')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ promedio: 857.0, fechaActualizacion: '2026-09-28' }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ promedio: 976.9, fechaActualizacion: '2026-09-28' }),
        })
      })
    )

    const tasas = await obtenerTasasOficialesBCV({ forzar: true })
    expect(tasas.usd.tasa).toBe(857.0)
    expect(tasas.eur.tasa).toBe(976.9)
  })
})
