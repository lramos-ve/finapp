export const THEME_STORAGE_KEY = 'finapp_theme'

function getStorage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch (_) {}
  return null
}

/**
 * Obtiene el tema inicial guardado o la preferencia del sistema.
 * @returns {'light' | 'dark'}
 */
export function obtenerTemaInicial() {
  const storage = getStorage()
  if (storage) {
    try {
      const guardado = storage.getItem(THEME_STORAGE_KEY)
      if (guardado === 'light' || guardado === 'dark') {
        return guardado
      }
    } catch (_) {}
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light'
      }
    } catch (_) {}
  }

  return 'dark'
}

/**
 * Aplica el tema al documento DOM y lo persiste en localStorage.
 * @param {'light' | 'dark'} tema
 */
export function aplicarTema(tema) {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', tema)
  }
  const storage = getStorage()
  if (storage) {
    try {
      storage.setItem(THEME_STORAGE_KEY, tema)
    } catch (_) {}
  }
}

/**
 * Gestor reactivo de tema compatible con Svelte 5 usando .svelte.js.
 */
class ThemeStore {
  tema = $state(obtenerTemaInicial())

  constructor() {
    aplicarTema(this.tema)
  }

  get actual() {
    return this.tema
  }

  set(nuevoTema) {
    this.tema = nuevoTema === 'light' ? 'light' : 'dark'
    aplicarTema(this.tema)
  }

  alternar() {
    this.set(this.tema === 'dark' ? 'light' : 'dark')
  }
}

export const theme = new ThemeStore()
