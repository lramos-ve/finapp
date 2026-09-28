import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  obtenerUltimaTasaEnCache,
  guardarTasaEnCache,
  obtenerDetalleCacheBCV,
  obtenerTasaBCV,
} from '../lib/bcv.js'

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
    expect(detalle.fechaActualizacion).toBe('2026-09-28T00:00:00Z')
  })

  it('ignora valores inválidos al guardar en caché', () => {
    guardarTasaEnCache(-50)
    expect(obtenerUltimaTasaEnCache()).toBeNull()

    guardarTasaEnCache('invalido')
    expect(obtenerUltimaTasaEnCache()).toBeNull()
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
})
