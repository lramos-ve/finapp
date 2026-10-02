## Context

El proyecto FinApp cuenta con una arquitectura modular por features (`src/modules/*`). Actualmente, el servicio `src/modules/shared/services/bcv.js` consulta exclusivamente el Dólar Oficial del Banco Central de Venezuela a través de `https://ve.dolarapi.com/v1/dolares/oficial`. La API pública de DolarApi Venezuela también provee el punto de enlace oficial para el Euro (`https://ve.dolarapi.com/v1/euros/oficial`), respaldado directamente por los reportes diarios del BCV.

## Goals / Non-Goals

**Goals:**
- Extender el servicio `bcv.js` para consultar y almacenar en caché tanto la cotización del Dólar (USD) como del Euro (EUR) oficial del BCV.
- Implementar la lógica pura de conversión en `src/modules/calculadora/logic/calculator.js` garantizando cálculos exactos y redondeo bancario estándar a 2 decimales.
- Crear el componente `CalculatorView.svelte` en `src/modules/calculadora/` con:
  - Tarjetas de cotización BCV (Dólar y Euro) con hora de última actualización y botón de refresco en vivo.
  - Selector de moneda de entrada (USD, EUR, VES) y campo de monto interactivo.
  - Resultados inmediatos en las monedas restantes con botón para copiar al portapapeles.
- Integrar icono vectorial SVG `calculator` en `Icon.svelte` y agregar la pestaña correspondiente en `<nav>` de `src/App.svelte`.
- Preservar compatibilidad hacia atrás en las funciones existentes de `bcv.js` utilizadas por transacciones y deudas.

**Non-Goals:**
- Tasas no oficiales: queda expresamente excluida cualquier cotización paralela, promedio no oficial o criptomoneda (USDT).
- Opciones de cambio para monedas adicionales (ej. pesos colombianos, reales, etc.).

## Decisions

### 1. Modelo de Conversión con Pivote en Bolívares (VES)
- **Decisión**: La moneda pivote para la triangulación entre USD y EUR es el Bolívar (VES), ya que las cotizaciones oficiales del BCV expresan siempre el valor en bolívares por unidad de divisa extranjera:
  - De USD a VES/EUR: $VES = monto \times tasaUSD$; $EUR = VES / tasaEUR$.
  - De EUR a VES/USD: $VES = monto \times tasaEUR$; $USD = VES / tasaUSD$.
  - De VES a USD/EUR: $USD = monto / tasaUSD$; $EUR = monto / tasaEUR$.
- **Alternativa descartada**: Tasa cruzada EUR/USD internacional directa. Se descartó porque en el marco cambiario venezolano la relación oficial se rige por las paridades publicadas por el BCV para cada divisa en bolívares.

### 2. Estructura de Caché Unificada y Retrocompatible en `bcv.js`
- **Decisión**: La clave `finapp_bcv_cache` en `localStorage` se enriquecerá para contener:
  ```json
  {
    "tasaUSD": 857.00,
    "tasaEUR": 976.90,
    "tasa": 857.00,
    "fechaActualizacionUSD": "...",
    "fechaActualizacionEUR": "...",
    "guardadoEn": 1727560000000
  }
  ```
  La propiedad `tasa` se mantiene idéntica a `tasaUSD` para garantizar que cualquier código existente siga funcionando sin alteraciones.

### 3. Módulo Dedicado `src/modules/calculadora/`
- Siguiendo la arquitectura por features establecida:
  - `src/modules/calculadora/logic/calculator.js`: funciones puras de cálculo.
  - `src/modules/calculadora/components/CalculatorView.svelte`: interfaz completa con estética neumórfica y feedback háptico/visual.
  - `src/modules/calculadora/index.js`: barril de exportaciones públicas.

## Risks / Trade-offs

- **[Riesgo] Indisponibilidad o lentitud temporal de los endpoints de la API** → **Mitigación**: Timeout de 5000ms con AbortController y fallback inmediato a la última cotización almacenada en caché local, indicando el estado visualmente en la interfaz.
- **[Riesgo] Discrepancia si el usuario copia un valor con decimales excesivos** → **Mitigación**: Redondeo consistente a 2 decimales para importes monetarios y formateo numérico con separadores locales.
