## Why

Actualmente no hay ninguna forma centralizada de saber cuánto dinero se ha recibido, gastado, se debe o se ha prestado, ni de anticipar los pagos recurrentes (gastos fijos) que hay que cubrir cada mes. Sin esto, es fácil perder de vista compromisos de pago y el estado real de las finanzas personales, especialmente al operar con dos monedas (USD y VES).

## What Changes

- Nueva PWA local-first (sin backend) para registrar y consultar finanzas personales.
- Registro de transacciones (ingresos y gastos) en USD o en VES, con la tasa BCV capturada manualmente y congelada al momento del registro para obtener un equivalente en USD estable en el tiempo.
- Gestión unificada de deudas: una sola entidad con dirección (`debo` / `me deben`), siempre denominada en USD, que admite abonos parciales (cada abono puede pagarse en USD o en VES a tasa BCV del día).
- Sección de gastos fijos: plantillas recurrentes (nombre, monto, día de vencimiento, frecuencia) que generan automáticamente una instancia por período; si una instancia vence sin pagarse, su saldo se arrastra y se acumula sobre la instancia del siguiente período.
- Stack: Svelte + Vite, Dexie.js (IndexedDB) para almacenamiento local, `vite-plugin-pwa` para instalabilidad y soporte offline.
- Fuera de alcance para esta primera versión: categorías de gasto, reportes/gráficas avanzadas, multiusuario, sincronización entre dispositivos y notificaciones push.

## Capabilities

### New Capabilities
- `transactions`: registrar ingresos y gastos puntuales, en USD o VES, con conversión a USD congelada mediante tasa BCV ingresada manualmente cuando aplica.
- `debts`: registrar y dar seguimiento a deudas bidireccionales (debo / me deben) denominadas en USD, incluyendo abonos parciales en USD o VES.
- `fixed-expenses`: definir gastos fijos recurrentes, generar sus instancias por período, registrar su pago (total o parcial) y arrastrar el saldo pendiente al período siguiente cuando no se paga a tiempo.

### Modified Capabilities
<!-- No existen specs previas en este proyecto; no hay capacidades existentes que modificar. -->

## Impact

- Proyecto nuevo (greenfield): no hay código existente afectado.
- Introduce la base técnica del proyecto: Svelte + Vite, Dexie.js (IndexedDB), `vite-plugin-pwa`.
- No requiere backend, autenticación ni servicios externos; toda la data vive en el dispositivo del usuario.
- Establece el patrón de "movimiento de dinero" (monto + moneda + tasa BCV opcional + monto USD congelado) que reutilizan `transactions`, los abonos de `debts` y los pagos de `fixed-expenses`.
