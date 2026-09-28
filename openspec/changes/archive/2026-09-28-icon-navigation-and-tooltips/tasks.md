## 1. Icon Component

- [x] 1.1 Crear `src/lib/components/Icon.svelte` con los iconos vectoriales SVG trazados (`transactions`, `debts`, `fixedExpenses`, `backup`, `sun`, `moon`), con props `name`, `size` y paso de clases.

## 2. Navigation and Header Update

- [x] 2.1 Actualizar `<header>` en `src/App.svelte` para usar el componente `Icon` con `sun` y `moon` en lugar de emojis en el botón de alternar tema.
- [x] 2.2 Actualizar `<nav>` en `src/App.svelte` para renderizar únicamente los iconos vectoriales en cada pestaña, incorporando `aria-label` y la estructura para el tooltip neumórfico.

## 3. Neumorphic Tooltip and Navigation Styling

- [x] 3.1 Añadir en `src/app.css` los estilos para los tooltips neumórficos flotantes con sombra suave `var(--neu-raised-sm)`, fondo `var(--bg)` y micro-animación en `:hover` y `:focus-visible`.
- [x] 3.2 Configurar el posicionamiento responsive de los tooltips: hacia arriba en móvil (barra fija inferior) y hacia abajo en desktop (barra superior).
- [x] 3.3 Verificar que los botones de navegación mantengan las dimensiones táctiles mínimas (44x44px) y el relieve cóncavo `var(--neu-inset-sm)` al estar activos.

## 4. Verification and Testing

- [x] 4.1 Ejecutar `npm test` para asegurar que las pruebas unitarias continúen pasando al 100%.
- [x] 4.2 Validar la apariencia y comportamiento de los tooltips y la navegación tanto en modo claro como en modo oscuro.
