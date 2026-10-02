## Why

Actualmente, al registrar una transacción en VES, el sistema consulta o permite ingresar la tasa BCV oficial y calcula de inmediato el equivalente en USD para mantener consistencia contable. Sin embargo, al seleccionar USD no se presenta la tasa BCV ni se calcula o almacena el equivalente en bolívares (VES), lo cual obliga a los usuarios en economías bimonetarias como la venezolana a recurrir a cálculos externos para conocer el valor local exacto que representaba esa transacción en divisas en la fecha del registro.

## What Changes

- En el formulario de transacciones (`TransactionForm`), al seleccionar la moneda USD, se cargará automáticamente la tasa oficial del dólar BCV desde la caché o servicio en línea, mostrando un campo editable con botón de refresco y una vista previa en tiempo real del equivalente en bolívares (VES).
- Se registrará la `tasaBCV` en los movimientos en USD cuando esté presente, congelando el equivalente en bolívares en el momento de la transacción.
- En el listado de transacciones (`TransactionList`), las transacciones en USD que posean tasa BCV mostrarán su contraparte y equivalente en bolívares (VES) al igual que ocurre con las transacciones en VES.
- Se mantendrá total compatibilidad con transacciones históricas en USD previamente registradas sin tasa.

## Capabilities

### New Capabilities
<!-- Ninguna nueva capacidad; se modifica el comportamiento existente de transacciones -->

### Modified Capabilities
- `transactions`: Permite asociar la tasa oficial BCV a transacciones en USD, calculando y presentando su equivalente en bolívares (VES) tanto de forma reactiva en el formulario como de forma persistente en el listado.

## Impact

- **Módulos afectados:**
  - `src/modules/transacciones/components/TransactionForm.svelte` (carga automática de tasa BCV en USD, campo de tasa editable y preview reactivo en Bs).
  - `src/modules/transacciones/components/TransactionList.svelte` (despliegue del equivalente en VES para transacciones USD).
  - `src/modules/transacciones/logic/transactions.js` y `src/modules/shared/services/money.js` (soporte opcional de persistencia de `tasaBCV` y cálculo de equivalente en VES).
  - `src/test/transactions.test.js` (pruebas unitarias de registro en USD con tasa BCV y equivalente).
