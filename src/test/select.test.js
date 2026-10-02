import { describe, it, expect } from 'vitest'
import {
  normalizarOpciones,
  filtrarOpciones,
  buscarOpcionPorValor,
} from '../modules/shared/utils/select.js'

describe('Select Utilities', () => {
  it('normaliza un array simple de strings a objetos { value, label, icon }', () => {
    const raw = ['Alimentación', 'Transporte', 'Servicios']
    const res = normalizarOpciones(raw)

    expect(res).toEqual([
      { value: 'Alimentación', label: 'Alimentación', icon: null },
      { value: 'Transporte', label: 'Transporte', icon: null },
      { value: 'Servicios', label: 'Servicios', icon: null },
    ])
  })

  it('normaliza un array de objetos con value y label', () => {
    const raw = [
      { value: 'mes', label: 'Este mes' },
      { value: 'ano', label: 'Este año' },
      { value: 'todo', label: 'Todo el historial' },
    ]
    const res = normalizarOpciones(raw)

    expect(res).toEqual([
      { value: 'mes', label: 'Este mes', icon: null },
      { value: 'ano', label: 'Este año', icon: null },
      { value: 'todo', label: 'Todo el historial', icon: null },
    ])
  })

  it('soporta opciones con números convirtiéndolos a strings', () => {
    const raw = [10, 20, 30]
    const res = normalizarOpciones(raw)

    expect(res[0]).toEqual({ value: '10', label: '10', icon: null })
  })

  it('maneja listas vacías o valores no válidos sin lanzar error', () => {
    expect(normalizarOpciones(null)).toEqual([])
    expect(normalizarOpciones(undefined)).toEqual([])
    expect(normalizarOpciones([])).toEqual([])
  })

  it('filtra opciones por coincidencia en etiqueta o valor (case-insensitive)', () => {
    const opciones = normalizarOpciones(['Comida', 'Transporte', 'Compras', 'Salud'])

    const filtradas = filtrarOpciones(opciones, 'com')
    expect(filtradas).toHaveLength(2)
    expect(filtradas.map((o) => o.value)).toEqual(['Comida', 'Compras'])
  })

  it('devuelve todas las opciones cuando la consulta de filtro está vacía', () => {
    const opciones = normalizarOpciones(['Uno', 'Dos'])
    expect(filtrarOpciones(opciones, '')).toEqual(opciones)
    expect(filtrarOpciones(opciones, '   ')).toEqual(opciones)
  })

  it('busca y encuentra una opción por su valor exacto', () => {
    const opciones = normalizarOpciones([
      { value: 'usd', label: 'Dólares' },
      { value: 'bs', label: 'Bolívares' },
    ])

    const encontrada = buscarOpcionPorValor(opciones, 'usd')
    expect(encontrada).toEqual({ value: 'usd', label: 'Dólares', icon: null })

    const noEncontrada = buscarOpcionPorValor(opciones, 'eur')
    expect(noEncontrada).toBeNull()
  })
})
