## 1. Analytics and Aggregation Logic

- [x] 1.1 Crear `src/lib/statistics.js` con funciones para calcular métricas de período, distribución por categorías y comparativa mensual.
- [x] 1.2 Agregar pruebas unitarias exhaustivas en `src/test/statistics.test.js` para validar los cálculos estadísticos.

## 2. Icons and Navigation

- [x] 2.1 Añadir icono SVG `pie-chart` a `src/lib/components/Icon.svelte`.
- [x] 2.2 Actualizar `src/App.svelte` para incluir la pestaña "Estadísticas" en la barra de navegación con tooltip accesible y renderizado condicional.

## 3. UI and Visual Charts

- [x] 3.1 Crear `src/lib/components/DonutChart.svelte` para renderizar el desglose de gastos por categorías en SVG con leyenda de colores y porcentajes.
- [x] 3.2 Crear `src/lib/components/BarChart.svelte` para renderizar la comparativa mensual de ingresos vs. gastos con SVG.
- [x] 3.3 Crear `src/lib/components/StatisticsView.svelte` con selector de mes, tarjetas de resumen métrico e integración de los gráficos.
- [x] 3.4 Añadir estilos complementarios en `src/app.css` para los contenedores y leyendas de estadísticas.

## 4. Verification and Testing

- [x] 4.1 Ejecutar `npm test` y asegurar que el 100% de las pruebas unitarias pasen.
- [x] 4.2 Probar con Puppeteer la navegación a la pestaña de estadísticas, el cambio de período y el renderizado visual de los gráficos.
