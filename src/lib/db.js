import Dexie from 'dexie'

/**
 * Base de datos local (IndexedDB vía Dexie).
 *
 * Formas de los registros (no forzadas por Dexie, documentadas aquí):
 *
 * transacciones:
 *   { id, tipo: 'ingreso'|'gasto', monto, moneda: 'USD'|'VES',
 *     tasaBCV?, montoUSD, fecha, descripcion }
 *
 * deudas:
 *   { id, persona, direccion: 'debo'|'me_deben', montoOriginal,
 *     saldoPendiente, fecha, estado: 'pendiente'|'pagada', notas }
 *
 * abonos: (pagos parciales/totales a una deuda)
 *   { id, deudaId, monto, moneda: 'USD'|'VES', tasaBCV?, montoUSD, fecha }
 *
 * gastosFijos: (la plantilla)
 *   { id, nombre, monto, diaVencimiento, frecuencia: 'mensual',
 *     activo: 1|0 }  // IndexedDB no admite boolean como clave indexada
 *
 * instanciasGastoFijo: (una ocurrencia por período)
 *   { id, gastoFijoId, periodo (ej. '2026-08'), montoPeriodo,
 *     montoArrastrado, saldoPendiente, estado: 'pendiente'|'pagado'|'vencido',
 *     fechaVencimiento }
 *
 * pagosGastoFijo: (pagos parciales/totales a una instancia de gasto fijo)
 *   { id, instanciaId, monto, moneda: 'USD'|'VES', tasaBCV?, montoUSD, fecha }
 */
export const db = new Dexie('FinanzasDB')

db.version(1).stores({
  transacciones: '++id, tipo, moneda, fecha',
  deudas: '++id, direccion, estado, fecha',
  abonos: '++id, deudaId, fecha',
  gastosFijos: '++id, activo',
  instanciasGastoFijo: '++id, gastoFijoId, periodo, estado, [gastoFijoId+periodo]',
  pagosGastoFijo: '++id, instanciaId, fecha',
})
