## 1. Estilos de Modal Pop-up Neumórfico

- [x] 1.1 Definir estilos para modales emergentes (`.modal-backdrop`, `.modal-neumorphic`, `.modal-header`, `.boton-cerrar-modal`) y botón disparador de transacciones en `src/app.css` para temas claro y oscuro.

## 2. Componentes e Integración de Pop-up

- [x] 2.1 Adaptar `src/modules/transacciones/components/TransactionForm.svelte` para soportar presentación modal con botón de cierre (icono `x`) y emisión de evento `onCerrar`.
- [x] 2.2 Actualizar `src/modules/transacciones/components/TransactionsView.svelte` con botón de acción destacado para abrir el pop-up, gestión de apertura/cierre (tecla Escape, clic fuera, botón cerrar) y cierre automático al registrar.

## 3. Pruebas y Validación Visual

- [x] 3.1 Ejecutar suite completa de pruebas unitarias con `npm test` verificando que pasen al 100%.
- [x] 3.2 Verificar visualmente con Puppeteer la vista principal con botón disparador, la apertura del pop-up modal, el cierre por interacción y el registro de transacciones en modo claro y oscuro.
