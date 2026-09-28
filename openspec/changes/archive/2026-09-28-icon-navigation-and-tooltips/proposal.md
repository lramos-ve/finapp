## Why

La barra de navegación principal actual utiliza etiquetas de texto largas ("Transacciones", "Deudas", "Gastos fijos", "Respaldo") y emojis en el selector de tema (`☀️`/`🌙`), lo que satura la interfaz, limita el espacio horizontal en pantallas pequeñas y resta elegancia a la estética neumórfica.

Reemplazar el texto de la barra por iconos vectoriales SVG limpios con tooltips flotantes neumórficos y soporte de accesibilidad reduce la carga visual, maximiza la limpieza visual y proporciona una experiencia más fluida y profesional.

## What Changes

- **Navegación principal basada en iconos:** Reemplazo del texto en los botones de navegación por iconos vectoriales SVG coherentes (flujo bidireccional para Transacciones, balanza/trato para Deudas, calendario para Gastos fijos, y disco/bóveda para Respaldo).
- **Selector de tema con iconos vectoriales:** Reemplazo de los emojis de sol y luna por SVGs vectoriales integrados.
- **Sistema de Tooltips Neumórficos:** Componente/estilos de tooltips flotantes con sombra suave y fondo contextual (`var(--bg)`) que aparecen en desktop en `:hover` y `:focus-visible`, y con retroalimentación accesible en dispositivos táctiles.
- **Accesibilidad y feedback táctil:** Atributos `aria-label`, `role="tab"` o botones con nombres accesibles para lectores de pantalla, preservando el área táctil mínima de 44x44px.

## Capabilities

### New Capabilities
- `icon-navigation`: Presentación de navegación principal mediante iconos vectoriales SVG con tooltips neumórficos flotantes y etiquetas accesibles.

### Modified Capabilities
*(Ninguna especificación existente cambia sus requerimientos canónicos, se mantiene la posición inferior y áreas táctiles de 44x44px de `mobile-ui`).*

## Impact

- `src/App.svelte`: Actualización de la barra `<nav>` y el botón de tema en `<header>`.
- `src/app.css`: Estilos neumórficos para tooltips flotantes, animaciones y adaptación a tamaños de pantalla.
- `src/lib/components/Icon.svelte`: Nuevo componente reutilizable para renderizar iconos SVG limpios y consistentes.
