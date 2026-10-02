## 1. Estilos y Componente Base Select

- [x] 1.1 Definir estilos neumórficos para menús desplegables (`.neumorphic-select-container`, `.neumorphic-dropdown-menu`, `.dropdown-item`) en `src/app.css` para temas claro y oscuro.
- [x] 1.2 Implementar el componente `src/modules/shared/components/Select.svelte` con soporte para selección simple, autocompletado editable (`allowCustom`), accesibilidad por teclado y cierre por clic externo.
- [x] 1.3 Crear pruebas unitarias para `Select.svelte` en `src/test/select.test.js`.

## 2. Integración en Formularios y Vistas

- [x] 2.1 Reemplazar el campo de autocompletado nativo de categoría por `Select.svelte` en `src/modules/transacciones/components/TransactionForm.svelte`.
- [x] 2.2 Reemplazar el `<select>` nativo de categoría por `Select.svelte` en `src/modules/transacciones/components/TransactionFilters.svelte`.
- [x] 2.3 Reemplazar el `<select>` nativo de período por `Select.svelte` en `src/modules/estadisticas/components/StatisticsView.svelte`.

## 3. Pruebas y Validación Visual

- [x] 3.1 Ejecutar suite completa de pruebas unitarias con `npm test` verificando que pasen al 100%.
- [x] 3.2 Verificar visualmente con Puppeteer el despliegue del menú de categorías y filtros en modo claro y oscuro, confirmando la estética neumórfica y la selección interactiva.
