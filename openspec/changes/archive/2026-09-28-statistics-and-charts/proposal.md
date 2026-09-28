## Why

La aplicación permite registrar y categorizar transacciones en USD y VES con tasa BCV, pero actualmente carece de una forma visual y consolidada de entender los hábitos financieros. El usuario no puede visualizar fácilmente en qué categorías se concentra su gasto mensual, cómo ha evolucionado su balance respecto a meses anteriores, ni qué porcentaje de sus ingresos logra ahorrar. Incorporar una vista dedicada de estadísticas con gráficos interactivos y métricas clave potenciará la toma de decisiones financieras.

## What Changes

- Nueva pestaña de navegación "Estadísticas" identificada con un icono vectorial representativo (`pie-chart` / `bar-chart`) y su tooltip correspondiente.
- Módulo de agregación estadística (`src/lib/statistics.js`) para calcular:
  - Distribución de gastos por categoría en un mes o período seleccionado (monto acumulado y porcentaje).
  - Evolución mensual histórica (totales de ingresos vs. gastos mes a mes).
  - Tasa de ahorro mensual (`(ingresos - gastos) / ingresos * 100`) y balance neto del período.
- Componente de visualización `StatisticsView.svelte`:
  - Selector de mes/período para analizar cualquier mes o el año completo.
  - Tarjetas de resumen neumórficas con métricas clave (Total Ingresos, Total Gastos, Ahorro Neto, Tasa de Ahorro %).
  - Gráfico de dona (Donut Chart) SVG interactivo mostrando el desglose de gastos por categoría con leyenda y porcentajes.
  - Gráfico de barras (Bar Chart) SVG comparativo de Ingresos vs. Gastos mensual.
- Icono vectorial `pie-chart` o `chart` añadido a `Icon.svelte`.
- Estilos visuales adaptados a los modos claro y oscuro bajo la estética neumórfica de la aplicación.

## Capabilities

### New Capabilities
- `statistics`: Cálculos analíticos agregados, desglose de gastos por categoría, comparativa mensual histórica e indicadores de ahorro visuales.

### Modified Capabilities
- `icon-navigation`: Incorporación del botón de navegación "Estadísticas" con su icono vectorial SVG, accesibilidad y tooltip flotante neumórfico.

## Impact

- `src/lib/statistics.js`: Nuevo módulo con funciones puras para procesar transacciones y generar agregados analíticos.
- `src/lib/components/StatisticsView.svelte`: Nueva vista principal para estadísticas y gráficos.
- `src/lib/components/Icon.svelte`: Nuevo icono vectorial `chart` / `pie-chart`.
- `src/App.svelte`: Inclusión de la nueva pestaña en el enrutamiento interno (`vista === 'estadisticas'`) y en la barra de navegación `<nav>`.
- `src/test/statistics.test.js`: Pruebas unitarias para las funciones de cálculo estadístico y agregación.
