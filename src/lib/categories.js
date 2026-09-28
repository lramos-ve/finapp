export const CATEGORIAS_PREDEFINIDAS = [
  'Alimentación',
  'Servicios',
  'Transporte',
  'Vivienda',
  'Salud',
  'Entretenimiento',
  'Educación',
  'Sueldo / Ingreso',
  'Otros',
]

/**
 * Normaliza el nombre de una categoría quitando espacios en blanco en los extremos.
 * @param {string} [categoria]
 * @returns {string}
 */
export function normalizarCategoria(categoria) {
  if (!categoria || typeof categoria !== 'string') return ''
  return categoria.trim()
}

/**
 * Obtiene la lista combinada y ordenada de categorías disponibles:
 * incluye las predeterminadas y cualquier categoría única existente en los elementos provistos.
 *
 * @param {Array<{ categoria?: string }>} [elementos] - Lista de transacciones o gastos fijos
 * @returns {string[]}
 */
export function obtenerCategoriasDisponibles(elementos = []) {
  const set = new Set(CATEGORIAS_PREDEFINIDAS)

  for (const item of elementos) {
    if (item?.categoria) {
      const normalizada = normalizarCategoria(item.categoria)
      if (normalizada) {
        set.add(normalizada)
      }
    }
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
}
