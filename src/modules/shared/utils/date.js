export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

export function obtenerFechaHoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export function parsearFechaISO(str) {
  if (!str || typeof str !== 'string') return null
  const partes = str.split('-').map(Number)
  if (partes.length === 3 && !partes.some(isNaN)) {
    return { ano: partes[0], mes: partes[1] - 1, dia: partes[2] }
  }
  return null
}

export function formatearFechaISO(ano, mesIndex, dia) {
  const m = String(mesIndex + 1).padStart(2, '0')
  const d = String(dia).padStart(2, '0')
  return `${ano}-${m}-${d}`
}

export function formatearFechaLegible(iso) {
  if (!iso) return ''
  const p = parsearFechaISO(iso)
  if (!p) return iso
  try {
    const d = new Date(p.ano, p.mes, p.dia)
    return d.toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function generarCuadriculaCalendario({
  viewYear,
  viewMonth,
  value = '',
  min = '',
  max = '',
  hoyISO = obtenerFechaHoyISO(),
}) {
  const primerDiaSemana = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const diasEnMes = new Date(viewYear, viewMonth + 1, 0).getDate()
  const diasEnMesAnterior = new Date(viewYear, viewMonth, 0).getDate()

  const dias = []

  // Días del mes anterior
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    const d = diasEnMesAnterior - i
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const a = viewMonth === 0 ? viewYear - 1 : viewYear
    const iso = formatearFechaISO(a, m, d)
    dias.push({
      dia: d,
      mes: m,
      ano: a,
      iso,
      otherMonth: true,
      disabled: Boolean((min && iso < min) || (max && iso > max)),
    })
  }

  // Días del mes actual
  for (let d = 1; d <= diasEnMes; d++) {
    const iso = formatearFechaISO(viewYear, viewMonth, d)
    dias.push({
      dia: d,
      mes: viewMonth,
      ano: viewYear,
      iso,
      otherMonth: false,
      selected: iso === value,
      isToday: iso === hoyISO,
      disabled: Boolean((min && iso < min) || (max && iso > max)),
    })
  }

  // Días del mes siguiente para completar múltiplo de 7
  const restante = (7 - (dias.length % 7)) % 7
  for (let d = 1; d <= restante; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    const a = viewMonth === 11 ? viewYear + 1 : viewYear
    const iso = formatearFechaISO(a, m, d)
    dias.push({
      dia: d,
      mes: m,
      ano: a,
      iso,
      otherMonth: true,
      disabled: Boolean((min && iso < min) || (max && iso > max)),
    })
  }

  return dias
}
