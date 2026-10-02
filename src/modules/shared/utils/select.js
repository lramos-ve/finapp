/**
 * Utilidades para normalización, filtrado y búsqueda de opciones en componentes Select / Dropdown
 */

export function normalizarOpciones(options = []) {
  if (!Array.isArray(options)) return []
  return options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? String(opt.value) : '',
        label: opt.label !== undefined ? String(opt.label) : String(opt.value || ''),
        icon: opt.icon || null,
      }
    }
    return {
      value: String(opt),
      label: String(opt),
      icon: null,
    }
  })
}

export function filtrarOpciones(opcionesNormalizadas = [], query = '') {
  const q = String(query).toLowerCase().trim()
  if (!q) return opcionesNormalizadas
  return opcionesNormalizadas.filter(
    (opt) =>
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q)
  )
}

export function buscarOpcionPorValor(opcionesNormalizadas = [], value = '') {
  const valStr = String(value)
  return opcionesNormalizadas.find((opt) => opt.value === valStr) || null
}
