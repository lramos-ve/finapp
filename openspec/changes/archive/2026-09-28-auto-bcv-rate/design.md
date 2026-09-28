## Context

En FinApp, todas las conversiones de bolívares (VES) a dólares (USD) dependen del parámetro `tasaBCV` (definido en `src/lib/money.js`). Véase `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Implementar un módulo desacoplado `src/lib/bcv.js` encargado de la consulta y caché de la tasa oficial.
- Utilizar el endpoint CORS público `https://ve.dolarapi.com/v1/dolares/oficial`.
- Implementar timeout seguro de red (5s vía `AbortController`) y fallback automático a la caché en `localStorage`.
- Proveer función `obtenerUltimaTasaEnCache()` para autorellenar el campo de forma instantánea y síncrona sin parpadeos.
- Añadir el icono `refresh-cw` en `src/lib/components/Icon.svelte`.
- Integrar en `TransactionsView.svelte` y `DebtsView.svelte` un control de tasa con botón de consulta/recarga con animación de giro (`girando`).
- Cobertura de pruebas unitarias al 100% con tests para el servicio `bcv.js`.

**Non-Goals:**
- Consultar cotizaciones no oficiales o paralelas.
- Manejo de divisas distintas al par USD/VES.

## Decisions

### 1. Proveedor de datos: DolarApi Venezuela
- **Decisión:** Usar `https://ve.dolarapi.com/v1/dolares/oficial`.
- **Razón:** Es un servicio libre, sin autenticación, de alta disponibilidad y con cabeceras `Access-Control-Allow-Origin: *` activas, lo que permite su invocación directa desde el navegador cliente sin un servidor proxy.

### 2. Política de Caché y Offline-First
- **Decisión:** Almacenar en `localStorage` con la clave `finapp_bcv_rate` un objeto JSON `{ tasa, fecha, fechaActualizacion }`.
- **Comportamiento:** Si el usuario no tiene internet o la petición externa falla por cualquier motivo, el sistema no bloquea el formulario: utiliza la última tasa en caché y muestra un aviso tenue indicando que se está usando el valor guardado previamente.

### 3. Autorelleno y control en UI
- **Decisión:** Al seleccionar `VES`, el input de tasa se inicializa con la tasa en caché si está disponible. Además, se añade un botón adyacente con icono de recarga para forzar la actualización en tiempo real desde la API.
- **Alternativa descartada:** Petición HTTP obligatoria en cada render o cambio de pestaña, lo que causaría latencia innecesaria y fallos en modo avión.

## Risks / Trade-offs

- **[Caída o cambio de esquema en la API externa]** → Mitigación: Timeout estricto de 5 segundos, validación robusta del campo `promedio` en la respuesta JSON y fallback transparente a la caché local.
