## 1. Configuración del proyecto

- [x] 1.1 Inicializar proyecto Svelte + Vite
- [x] 1.2 Instalar y configurar Dexie.js como dependencia
- [x] 1.3 Instalar y configurar `vite-plugin-pwa` (manifest base, íconos, estrategia de cache offline)
- [x] 1.4 Definir estructura de carpetas del proyecto (capa de datos, componentes, vistas)

## 2. Capa de datos compartida

- [x] 2.1 Definir el esquema de Dexie con las tablas: transacciones, deudas, abonos, gastosFijos, instanciasGastoFijo
- [x] 2.2 Implementar la utilidad compartida de "movimiento de dinero": dado `{monto, moneda, tasaBCV?}`, calcula y devuelve `montoUSD` congelado (ver design.md - Patrón "movimiento de dinero")

## 3. Capacidad: transactions

- [x] 3.1 Implementar registro de una transacción (ingreso/gasto) en USD o VES, aplicando la conversión congelada
- [x] 3.2 Implementar consulta de balance (total ingresos, total gastos, balance neto) en USD para un rango de fechas
- [x] 3.3 Implementar listado de transacciones con filtros por tipo, moneda y rango de fechas
- [x] 3.4 Construir formulario de registro de transacción (UI), mostrando el campo de tasa BCV solo cuando la moneda es VES
- [x] 3.5 Construir vista de listado y balance de transacciones (UI)

## 4. Capacidad: debts

- [x] 4.1 Implementar registro de una deuda (persona, dirección `debo`/`me_deben`, monto original en USD, fecha), con saldo pendiente inicial igual al monto original
- [x] 4.2 Implementar registro de un abono (USD o VES con conversión) que reduce el saldo pendiente de la deuda
- [x] 4.3 Implementar validación que rechaza un abono cuyo equivalente en USD exceda el saldo pendiente actual
- [x] 4.4 Implementar marcado automático de la deuda como `pagada` cuando el saldo pendiente llega a $0
- [x] 4.5 Implementar consulta de totales pendientes agrupados por dirección (`debo` y `me_deben`), mostrados por separado
- [x] 4.6 Construir formulario de registro de deuda y de registro de abono (UI)
- [x] 4.7 Construir vista de listado de deudas con saldo pendiente, estado y totales por dirección (UI)

## 5. Capacidad: fixed-expenses

- [x] 5.1 Implementar definición de un gasto fijo (nombre, monto esperado, día de vencimiento, frecuencia, activo/inactivo)
- [x] 5.2 Implementar generación de instancias: para cada gasto fijo activo, crear la instancia del período actual y la del siguiente si no existen, con estado `pendiente`
- [x] 5.3 Implementar arrastre: al generar la instancia de un nuevo período, si la instancia anterior quedó `vencida` con saldo pendiente > $0, sumar ese saldo al `montoEsperado` de la nueva instancia
- [x] 5.4 Implementar marcado de una instancia como `vencida` cuando se cumple su fecha de vencimiento y su saldo pendiente sigue siendo mayor a $0
- [x] 5.5 Implementar registro de pago (total o parcial) sobre una instancia (USD o VES con conversión), reduciendo su saldo pendiente y marcándola `pagado` si llega a $0
- [x] 5.6 Implementar desactivación de un gasto fijo: detiene la generación de nuevas instancias sin borrar el historial existente
- [x] 5.7 Construir formulario de definición de gasto fijo (UI)
- [x] 5.8 Construir vista de instancias del período con estado (pendiente/pagado/vencido), monto del período y monto arrastrado visibles por separado
- [x] 5.9 Construir flujo de pago (total/parcial) de una instancia (UI)

## 6. Integración PWA

- [x] 6.1 Configurar `manifest.json` (nombre, íconos, colores, `display: standalone`)
- [x] 6.2 Verificar que la app cargue y funcione sin conexión a internet (service worker cacheando assets y datos servidos desde IndexedDB)
- [x] 6.3 Construir navegación/layout principal que integre las tres secciones: transacciones, deudas y gastos fijos, con el balance general visible

## 7. Verificación

- [x] 7.1 Escribir pruebas para los escenarios de `specs/transactions/spec.md`
- [x] 7.2 Escribir pruebas para los escenarios de `specs/debts/spec.md`
- [x] 7.3 Escribir pruebas para los escenarios de `specs/fixed-expenses/spec.md`
- [x] 7.4 Verificación manual: recorrer de punta a punta el registro de una transacción, una deuda con abonos parciales, y un gasto fijo que se vence y arrastra saldo al siguiente período
