import { describe, it, expect, beforeEach } from 'vitest'
import {
  THEME_STORAGE_KEY,
  obtenerTemaInicial,
  aplicarTema,
  theme,
} from '../lib/theme.svelte.js'

describe('Theme Service', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('devuelve el tema guardado en localStorage si existe', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    expect(obtenerTemaInicial()).toBe('light')

    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(obtenerTemaInicial()).toBe('dark')
  })

  it('aplica el tema en el elemento html y persiste en localStorage', () => {
    aplicarTema('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    aplicarTema('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('alterna correctamente el tema reactivo', () => {
    theme.set('dark')
    expect(theme.actual).toBe('dark')

    theme.alternar()
    expect(theme.actual).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    theme.alternar()
    expect(theme.actual).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
