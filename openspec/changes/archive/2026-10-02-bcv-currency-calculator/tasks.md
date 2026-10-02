## 1. Servicio BCV y Soporte Multimoneda Oficial

- [x] 1.1 Extender `src/modules/shared/services/bcv.js` para consultar la tasa oficial de Euro (`https://ve.dolarapi.com/v1/euros/oficial`), manteniendo la de Dólar (`https://ve.dolarapi.com/v1/dolares/oficial`) y unificar la persistencia en caché.
- [x] 1.2 Actualizar pruebas unitarias en `src/test/bcv.test.js` para validar la consulta y almacenamiento en caché de USD y EUR.


## 2. Lógica de Conversión y Pruebas

- [x] 2.1 Crear `src/modules/calculadora/logic/calculator.js` con funciones de conversión bidireccional (`convertirDivisasBCV`), redondeo y formateo numérico.
- [x] 2.2 Crear pruebas unitarias exhaustivas en `src/test/calculator.test.js` para validar conversiones USD ↔ VES ↔ EUR y manejo de valores límite (0, nulos).


## 3. Componentes de UI y Navegación

- [x] 3.1 Añadir icono SVG `calculator` en `src/modules/shared/components/Icon.svelte`.
- [x] 3.2 Crear `src/modules/calculadora/components/CalculatorView.svelte` con tarjetas de cotización en vivo, selector de moneda de origen, inputs reactivos y botones de copiado al portapapeles.
- [x] 3.3 Crear `src/modules/calculadora/index.js` y exportar `CalculatorView` y utilidades de cálculo.
- [x] 3.4 Actualizar `src/App.svelte` para añadir la opción "Calculadora" en `<nav>` y renderizar la vista condicionalmente.

## 4. Verificación y Pruebas

- [x] 4.1 Ejecutar `npm test` y verificar que el 100% de las pruebas unitarias pasen sin errores.
- [x] 4.2 Probar con Puppeteer la navegación a la pestaña Calculadora, cálculo en tiempo real en modo claro y modo oscuro, y captura visual de pantalla.
