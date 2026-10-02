## Why

En el contexto económico de Venezuela, los usuarios manejan con frecuencia transacciones y cotizaciones en Dólares (USD), Euros (EUR) y Bolívares (VES) bajo las referencias oficiales del Banco Central de Venezuela (BCV). Actualmente la aplicación sólo consulta el Dólar BCV en formularios de registro. Disponer de una calculadora de divisas dedicada, exclusiva a tasas oficiales del BCV (sin tasas paralelas ni USDT), con soporte bidireccional instantáneo entre USD, EUR y VES, facilitará conversiones rápidas y confiables dentro de la misma aplicación.

## What Changes

- **Soporte multimoneda oficial en el servicio BCV (`bcv.js`)**:
  - Consulta y almacenamiento en caché independiente de las tasas oficiales del BCV para **Dólar (USD)** y **Euro (EUR)** desde `https://ve.dolarapi.com/v1/dolares/oficial` y `https://ve.dolarapi.com/v1/euros/oficial`.
  - Mecanismo de fallback a caché local y actualización bajo demanda.
- **Nuevo módulo de calculadora (`src/modules/calculadora/`)**:
  - Vista principal `CalculatorView.svelte` con estética neumórfica.
  - Tarjetas de cotización oficial en vivo para USD/VES y EUR/VES con fecha de actualización y botón de refresco.
  - Conversor interactivo bidireccional: ingresar un monto en USD, EUR o VES calcula automáticamente las equivalencias en las otras dos monedas.
  - Botón de copia rápida al portapapeles de los resultados calculados.
- **Navegación e icono vectorial**:
  - Nuevo icono SVG `calculator` en `Icon.svelte`.
  - Nuevo botón en la barra de navegación principal con tooltip accesible.

## Capabilities

### New Capabilities
- `currency-calculator`: Calculadora de divisas con conversiones instantáneas bidireccionales entre USD, EUR y VES exclusivamente basadas en las tasas oficiales publicadas por el Banco Central de Venezuela (BCV).

### Modified Capabilities
- `bcv-rate`: Se añade el soporte para la consulta y persistencia en caché de la tasa oficial del Euro (EUR) junto a la existente del Dólar (USD).
- `icon-navigation`: Se añade el botón de la calculadora de divisas en la barra de navegación.

## Impact

- **Código afectado**:
  - `src/modules/shared/services/bcv.js`: Nuevas funciones para obtener tasas de Euro y Dólar BCV y gestión de caché unificada.
  - `src/modules/shared/components/Icon.svelte`: Icono SVG `calculator`.
  - `src/modules/calculadora/`: Nuevo módulo que contiene `components/CalculatorView.svelte`, `logic/calculator.js` y `index.js`.
  - `src/App.svelte`: Inclusión de la nueva pestaña en `<nav>` y renderizado de `<CalculatorView />`.
  - Pruebas unitarias en `src/test/bcv.test.js` y nueva suite `src/test/calculator.test.js`.
