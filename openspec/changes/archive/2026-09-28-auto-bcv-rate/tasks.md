## 1. Icon and UI Helper

- [x] 1.1 Añadir el icono vectorial SVG `refresh-cw` en `src/lib/components/Icon.svelte`.
- [x] 1.2 Añadir estilos en `src/app.css` para el grupo de entrada de tasa con botón de consulta integrado (`.campo-tasa-bcv`, animación de giro).

## 2. BCV Service Module and Tests

- [x] 2.1 Crear el módulo `src/lib/bcv.js` con las funciones de consulta a DolarApi, timeout con `AbortController`, almacenamiento en caché `localStorage` y recuperación síncrona.
- [x] 2.2 Crear pruebas unitarias en `src/test/bcv.test.js` probando llamada exitosa, fallback ante error de red y lectura/escritura en caché.

## 3. UI Integration

- [x] 3.1 Integrar autorelleno y botón de consulta de tasa BCV en `src/lib/components/TransactionsView.svelte`.
- [x] 3.2 Integrar autorelleno y botón de consulta de tasa BCV en el formulario de abonos de `src/lib/components/DebtsView.svelte`.

## 4. Verification and Testing

- [x] 4.1 Ejecutar `npm test` para asegurar que todas las pruebas pasen al 100%.
- [x] 4.2 Probar en el navegador con Puppeteer la consulta de la tasa BCV real y el autorelleno en los formularios.
