import { db } from './db.js'
import { calcularMovimientoDeDinero, redondear } from './money.js'

/**
 * Define un nuevo gasto fijo (la plantilla recurrente).
 * Ver specs/fixed-expenses/spec.md - Requirement: Definir un gasto fijo.
 *
 * @param {{ nombre: string, monto: number, diaVencimiento: number, frecuencia?: 'mensual' }} datos
 */
export async function definirGastoFijo({ nombre, monto, diaVencimiento, frecuencia = 'mensual' }) {
  if (!nombre) throw new Error('El nombre es requerido')
  if (!monto || monto <= 0) throw new Error('El monto debe ser mayor a 0')
  if (!diaVencimiento || diaVencimiento < 1 || diaVencimiento > 31) {
    throw new Error('El día de vencimiento debe estar entre 1 y 31')
  }

  const id = await db.gastosFijos.add({
    nombre,
    monto,
    diaVencimiento,
    frecuencia,
    activo: 1, // IndexedDB no admite boolean como clave indexada
  })

  return db.gastosFijos.get(id)
}

/**
 * Desactiva un gasto fijo: detiene la generación de nuevas instancias
 * sin borrar el historial existente.
 * Ver specs/fixed-expenses/spec.md - Requirement: Desactivar un gasto fijo.
 */
export async function desactivarGastoFijo(gastoFijoId) {
  await db.gastosFijos.update(gastoFijoId, { activo: 0 })
}

/**
 * Para cada gasto fijo activo, genera la instancia del período actual y la
 * del siguiente si no existen, arrastrando el saldo pendiente del período
 * anterior cuando quedó vencido.
 *
 * Genera período por período (nunca salta directo al período siguiente)
 * y evalúa el vencimiento de cada instancia apenas se crea. Esto importa:
 * si generáramos el período actual y el siguiente de un tirón sin marcar
 * vencida la del período actual entre medio, el siguiente period nunca
 * heredaría su saldo aunque ya esté vencido - la cadena de arrastre se
 * rompería. Ver specs/fixed-expenses/spec.md - Requirement: Generar
 * instancia del período, Arrastrar saldo vencido al siguiente período.
 *
 * @param {Date} hoy
 */
export async function generarInstancias(hoy = new Date()) {
  const periodoLimite = siguientePeriodo(periodoDe(hoy))
  const gastosFijos = await db.gastosFijos.where('activo').equals(1).toArray()

  for (const gastoFijo of gastosFijos) {
    let periodo = await primerPeriodoFaltante(gastoFijo, hoy)
    while (periodo <= periodoLimite) {
      const instancia = await asegurarInstancia(gastoFijo, periodo)
      await evaluarVencimiento(instancia, hoy)
      periodo = siguientePeriodo(periodo)
    }
  }
}

async function primerPeriodoFaltante(gastoFijo, hoy) {
  const instancias = await db.instanciasGastoFijo.where('gastoFijoId').equals(gastoFijo.id).toArray()
  if (instancias.length === 0) return periodoDe(hoy)

  // La última instancia ya existente puede haber vencido desde la última
  // sincronización sin que nadie la haya evaluado todavía - hay que
  // resolverla antes de decidir si el siguiente período arrastra su saldo.
  const ultima = instancias.reduce((a, b) => (a.periodo > b.periodo ? a : b))
  await evaluarVencimiento(ultima, hoy)

  return siguientePeriodo(ultima.periodo)
}

async function asegurarInstancia(gastoFijo, periodo) {
  const existente = await db.instanciasGastoFijo
    .where('[gastoFijoId+periodo]')
    .equals([gastoFijo.id, periodo])
    .first()

  if (existente) return existente

  const periodoAnterior = periodoAnteriorDe(periodo)
  const instanciaAnterior = await db.instanciasGastoFijo
    .where('[gastoFijoId+periodo]')
    .equals([gastoFijo.id, periodoAnterior])
    .first()

  const montoArrastrado =
    instanciaAnterior && instanciaAnterior.estado === 'vencida' && instanciaAnterior.saldoPendiente > 0
      ? instanciaAnterior.saldoPendiente
      : 0

  const montoPeriodo = gastoFijo.monto
  const saldoPendiente = redondear(montoPeriodo + montoArrastrado)

  const id = await db.instanciasGastoFijo.add({
    gastoFijoId: gastoFijo.id,
    periodo,
    montoPeriodo,
    montoArrastrado,
    saldoPendiente,
    estado: 'pendiente',
    fechaVencimiento: fechaVencimientoDe(periodo, gastoFijo.diaVencimiento),
  })

  return db.instanciasGastoFijo.get(id)
}

async function evaluarVencimiento(instancia, hoy) {
  const hoyISO = fechaISO(hoy)
  if (instancia.estado === 'pendiente' && instancia.fechaVencimiento < hoyISO && instancia.saldoPendiente > 0) {
    await db.instanciasGastoFijo.update(instancia.id, { estado: 'vencida' })
  }
}

/**
 * Marca como 'vencida' toda instancia pendiente cuya fecha de vencimiento
 * ya pasó y que aún tiene saldo pendiente. Barrido general, complementario
 * a la evaluación que ya hace `generarInstancias` sobre lo que va creando.
 * Ver specs/fixed-expenses/spec.md - Requirement: Marcar instancia vencida.
 *
 * @param {Date} hoy
 */
export async function marcarVencidas(hoy = new Date()) {
  const pendientes = await db.instanciasGastoFijo.where('estado').equals('pendiente').toArray()
  for (const instancia of pendientes) {
    await evaluarVencimiento(instancia, hoy)
  }
}

/**
 * Genera las instancias que falten y marca como vencidas las que ya
 * pasaron su fecha límite. Pensado para llamarse al abrir la app.
 */
export async function sincronizarGastosFijos(hoy = new Date()) {
  await generarInstancias(hoy)
  await marcarVencidas(hoy)
}

/**
 * Registra un pago (total o parcial) sobre una instancia de gasto fijo,
 * en USD o VES. Marca la instancia como 'pagado' si el saldo llega a $0.
 * Ver specs/fixed-expenses/spec.md - Requirement: Registrar pago de una instancia.
 *
 * @param {{ instanciaId: number, monto: number, moneda: 'USD'|'VES', tasaBCV?: number, fecha: string }} datos
 */
export async function registrarPagoInstancia({ instanciaId, monto, moneda, tasaBCV, fecha }) {
  const instancia = await db.instanciasGastoFijo.get(instanciaId)
  if (!instancia) throw new Error('Instancia no encontrada')

  const movimiento = calcularMovimientoDeDinero({ monto, moneda, tasaBCV })

  if (movimiento.montoUSD > instancia.saldoPendiente) {
    throw new Error(
      `El pago ($${movimiento.montoUSD}) excede el saldo pendiente de la instancia ($${instancia.saldoPendiente})`
    )
  }

  const id = await db.pagosGastoFijo.add({
    instanciaId,
    ...movimiento,
    fecha,
  })

  const saldoPendiente = redondear(instancia.saldoPendiente - movimiento.montoUSD)
  const estado = saldoPendiente === 0 ? 'pagado' : instancia.estado

  await db.instanciasGastoFijo.update(instanciaId, { saldoPendiente, estado })

  return db.pagosGastoFijo.get(id)
}

/** Lista los gastos fijos, opcionalmente filtrados por activo (boolean). */
export async function listarGastosFijos({ activo } = {}) {
  let coleccion = await db.gastosFijos.toArray()
  if (activo !== undefined) coleccion = coleccion.filter((g) => Boolean(g.activo) === activo)
  return coleccion
}

/** Lista las instancias de un período (todas, o de un gasto fijo específico). */
export async function listarInstancias({ periodo, gastoFijoId } = {}) {
  let coleccion = await db.instanciasGastoFijo.toArray()
  if (periodo) coleccion = coleccion.filter((i) => i.periodo === periodo)
  if (gastoFijoId) coleccion = coleccion.filter((i) => i.gastoFijoId === gastoFijoId)
  return coleccion
}

// --- Utilidades de período ---

export function periodoDe(fecha) {
  const d = new Date(fecha)
  const anio = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  return `${anio}-${mes}`
}

export function siguientePeriodo(periodo) {
  const [anio, mes] = periodo.split('-').map(Number)
  const d = new Date(anio, mes, 1) // mes (0-indexed) + 1 = siguiente mes
  return periodoDe(d)
}

export function periodoAnteriorDe(periodo) {
  const [anio, mes] = periodo.split('-').map(Number)
  const d = new Date(anio, mes - 2, 1) // (mes-1) - 1 = mes anterior (0-indexed)
  return periodoDe(d)
}

export function fechaVencimientoDe(periodo, diaVencimiento) {
  const [anio, mes] = periodo.split('-').map(Number)
  const ultimoDiaDelMes = new Date(anio, mes, 0).getDate()
  const dia = Math.min(diaVencimiento, ultimoDiaDelMes)
  return `${periodo}-${String(dia).padStart(2, '0')}`
}

function fechaISO(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}
