import { describe, it, expect } from 'vitest'
import {
  parsearFechaISO,
  formatearFechaISO,
  formatearFechaLegible,
  generarCuadriculaCalendario,
  obtenerFechaHoyISO,
} from '../modules/shared/utils/date.js'

describe('Date Utilities for DatePicker', () => {
  it('obtiene la fecha de hoy en formato ISO YYYY-MM-DD', () => {
    const hoy = obtenerFechaHoyISO()
    expect(hoy).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('parsea correctamente fechas ISO válidas', () => {
    expect(parsearFechaISO('2026-10-02')).toEqual({ ano: 2026, mes: 9, dia: 2 })
    expect(parsearFechaISO('2025-01-15')).toEqual({ ano: 2025, mes: 0, dia: 15 })
  })

  it('devuelve null al parsear fechas inválidas o vacías', () => {
    expect(parsearFechaISO('')).toBeNull()
    expect(parsearFechaISO(null)).toBeNull()
    expect(parsearFechaISO('fecha-invalida')).toBeNull()
  })

  it('formatea año, mes y día a ISO string con ceros a la izquierda', () => {
    expect(formatearFechaISO(2026, 9, 2)).toBe('2026-10-02')
    expect(formatearFechaISO(2026, 0, 5)).toBe('2026-01-05')
  })

  it('formatea fechas a string legible en español', () => {
    const legible = formatearFechaLegible('2026-10-02')
    expect(legible).toContain('2026')
    expect(legible).toContain('2')
    expect(formatearFechaLegible('')).toBe('')
  })

  it('genera la cuadrícula de días para un mes correctamente', () => {
    // Octubre 2026: 31 días. 1 de octubre de 2026 es Jueves (índice 3 en Lu=0..Do=6)
    const cuadricula = generarCuadriculaCalendario({
      viewYear: 2026,
      viewMonth: 9,
      value: '2026-10-15',
      hoyISO: '2026-10-02',
    })

    // Debe ser múltiplo de 7
    expect(cuadricula.length % 7).toBe(0)
    expect(cuadricula.length).toBeGreaterThanOrEqual(28)

    // Los días del mes actual deben tener otherMonth: false
    const diasMesActual = cuadricula.filter((d) => !d.otherMonth)
    expect(diasMesActual).toHaveLength(31)

    // El día seleccionado debe estar marcado
    const seleccionado = cuadricula.find((d) => d.iso === '2026-10-15')
    expect(seleccionado).toBeDefined()
    expect(seleccionado.selected).toBe(true)

    // El día de hoy debe estar marcado
    const hoy = cuadricula.find((d) => d.iso === '2026-10-02')
    expect(hoy).toBeDefined()
    expect(hoy.isToday).toBe(true)
  })

  it('respeta límites mínimos y máximos deshabilitando días fuera de rango', () => {
    const cuadricula = generarCuadriculaCalendario({
      viewYear: 2026,
      viewMonth: 9,
      min: '2026-10-10',
      max: '2026-10-20',
    })

    const antesMin = cuadricula.find((d) => d.iso === '2026-10-05')
    expect(antesMin.disabled).toBe(true)

    const enRango = cuadricula.find((d) => d.iso === '2026-10-15')
    expect(enRango.disabled).toBe(false)

    const despuesMax = cuadricula.find((d) => d.iso === '2026-10-25')
    expect(despuesMax.disabled).toBe(true)
  })
})
