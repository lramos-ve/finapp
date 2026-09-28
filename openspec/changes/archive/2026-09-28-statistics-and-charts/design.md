## Context

Véase `proposal.md` para la motivación. La aplicación cuenta con almacenamiento IndexedDB de transacciones y categorización. Se requiere una solución analítica visual nativa, reactiva, accesible y libre de librerías externas pesadas (como Chart.js o D3), manteniendo la estética neumórfica y el funcionamiento 100% offline.

## Goals / Non-Goals

**Goals:**
- Módulo puro `src/lib/statistics.js` para cálculos de distribución por categoría, comparativas mensuales y tasas de ahorro.
- Gráficos renderizados con SVG puro:
  - Gráfico de dona (Donut Chart) con desglose porcentual y leyenda descriptiva de categorías.
  - Gráfico de barras (Bar Chart) comparativo mensual de ingresos y gastos.
- Selector de período (mes a mes) para filtrar el análisis temporal.
- Pestaña de navegación dedicada "Estadísticas" con icono vectorial SVG y tooltip neumórfico.
- Rendimiento ultra-ligero con 0 dependencias añadidas en `package.json`.

**Non-Goals:**
- Gráficos de dispersión o predicciones de machine learning.
- Exportación en formatos vectoriales PDF desde el gráfico.

## Decisions

### 1. Gráficos vectoriales SVG nativos vs. librerías externas
- **Decisión**: Implementar los componentes gráficos utilizando primitivas SVG estándar (`<circle>`, `<path>`, `<rect>`) calculadas reactivamente en Svelte.
- **Razón**: 
  - 0 KB de dependencias añadidas.
  - Integración perfecta con las variables CSS del tema neumórfico (`--bg`, `--texto`, `--verde`, `--rojo`, `--acento`).
  - Totalmente offline y sin riesgos de ruptura de versiones externas.
  - Excelente nitidez en pantallas de alta densidad (Retina/OLED) y escalabilidad responsive.
- **Alternativas consideradas**: Chart.js / Recharts (agregan 150KB+ al bundle y complican el theming dinámico neumórfico).

### 2. Algoritmo para el gráfico de dona
- **Decisión**: Utilizar círculos SVG concéntricos con radio normalizado $r = 15.9155$ (donde el perímetro $2\pi r = 100$) empleando `stroke-dasharray` y `stroke-dashoffset` acumulativo.
- **Razón**: Permite mapear directamente porcentajes (0 a 100%) a segmentos de arco sin lidiar con trigonometría compleja de paths SVG.

### 3. Paleta de colores para categorías
- **Decisión**: Definir una paleta accesible y armonizada de 9 colores contrastantes (cyan, esmeralda, ámbar, violeta, rosa, azul, naranja, índigo, gris plata) asignados de forma consistente a las categorías.
- **Razón**: Permite distinguir claramente hasta 9 categorías a la vez en la dona y en la leyenda.

### 4. Pestaña de navegación en `App.svelte`
- **Decisión**: Agregar la opción `estadisticas` en el estado `vista` de `App.svelte`, agregando el botón en `<nav>` entre "Transacciones" y "Deudas" o en el orden natural de finanzas cotidianas.
- **Razón**: Brinda un espacio espacioso y dedicado para que los gráficos luzcan limpios tanto en móvil como en escritorio.

## Risks / Trade-offs

- **[Riesgo] Ausencia de transacciones en un mes seleccionado**:
  - *Mitigación*: Mostrar un estado vacío amigable con mensaje neumórfico indicando que aún no hay movimientos en ese mes, evitando errores de división por cero en la tasa de ahorro o gráficos vacíos rotos.
- **[Riesgo] Meses con ingresos = 0 y gastos > 0**:
  - *Mitigación*: Manejar matemáticamente la tasa de ahorro: si ingresos es 0, la tasa es 0% y se reporta déficit en lugar de `NaN` o `-Infinity`.
