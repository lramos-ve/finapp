## Why

En el contexto económico bimonetario (USD / VES), registrar transacciones o abonos en bolívares requiere calcular constantemente su contravalor en dólares utilizando la tasa oficial del Banco Central de Venezuela (BCV). Exigir que el usuario busque externamente la tasa e ingrese el número manualmente cada vez que registra un movimiento en bolívares introduce fricción, posibles errores de tipeo y ralentiza el registro diario.

## What Changes

- Se crea el servicio `bcv.js` para consultar la tasa oficial actualizada desde la API pública comunitaria con soporte CORS (`https://ve.dolarapi.com/v1/dolares/oficial`).
- Se implementa almacenamiento local en caché de la última tasa obtenida y su fecha de actualización, garantizando funcionamiento *offline-first* cuando el usuario no disponga de conexión a internet o el servicio externo esté temporalmente inaccesible.
- En los formularios de registro que admiten bolívares (`TransactionsView.svelte` y el formulario de abonos en `DebtsView.svelte`), el campo de tasa BCV se autorellena con la última tasa guardada al seleccionar `VES`, e incluye un botón neumórfico para consultar o actualizar la tasa en tiempo real.
- Se asegura que el campo permanezca totalmente editable para que el usuario pueda sobreescribir la tasa manualmente cuando lo desee.
- Se añade manejo visual de estado de carga e indicadores de última actualización.

## Capabilities

### New Capabilities

- `bcv-rate`: Consulta en línea, almacenamiento en caché local y autorelleno de la tasa de cambio oficial del BCV para operaciones en VES.

### Modified Capabilities

<!-- No existing capability requirements modified directly -->

## Impact

- `src/lib/bcv.js`: Nuevo módulo con funciones `obtenerTasaBCV()` y `guardarTasaEnCache()`.
- `src/lib/components/TransactionsView.svelte`: Integración de autorelleno y botón de consulta en el campo Tasa BCV.
- `src/lib/components/DebtsView.svelte`: Integración de autorelleno y botón de consulta en abonos en VES.
- `src/lib/components/Icon.svelte`: Icono de actualización / recarga si es necesario (`refresh` o reutilización de `loader`/`zap`).
- `src/app.css`: Estilos neumórficos para el control integrado de input + botón de consulta de tasa.
- `src/test/bcv.test.js`: Pruebas unitarias para el servicio de tasa y su fallback de caché offline.
