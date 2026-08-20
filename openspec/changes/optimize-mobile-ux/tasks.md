## 1. Base CSS mobile-first

- [x] 1.1 En `src/app.css`, reorganizar los estilos de `header`/`nav`/`main` para que la base (sin media query) sea el layout de teléfono, y mover el layout actual de desktop bajo `@media (min-width: 480px)`
- [x] 1.2 Definir una regla compartida de tamaño mínimo de toque (`min-height: 44px`, `min-width: 44px` donde aplique) para `nav button`, `form button[type='submit']` y botones de acción dentro de `.lista li` / `.deuda-fila`
- [x] 1.3 Subir el `font-size` de `input` y `select` a al menos 16px (1rem) para evitar zoom automático en iOS Safari

## 2. Navegación inferior en móvil

- [x] 2.1 Mover `nav` fuera de `header` en `src/App.svelte` para que sea un elemento hermano posicionable de forma independiente
- [x] 2.2 En `app.css`, estilar `nav` como barra fija (`position: fixed; bottom: 0; left: 0; right: 0`) a todo el ancho por debajo de 480px, con `padding-bottom: env(safe-area-inset-bottom)`
- [x] 2.3 Bajo `@media (min-width: 480px)`, volver a integrar `nav` en la parte superior (junto a `header`), replicando el layout actual de desktop
- [x] 2.4 Añadir `padding-bottom` a `main` (altura de la barra + `env(safe-area-inset-bottom)`) por debajo de 480px para que el contenido no quede oculto detrás de la barra fija

## 3. Formularios de una sola columna en móvil

- [x] 3.1 En `app.css`, cambiar `.fila` a `flex-direction: column` por defecto (debajo de 480px) y volver a `flex-direction: row; flex-wrap: wrap` en `@media (min-width: 480px)`
- [x] 3.2 Revisar `.abono-form` (que hoy fuerza `flex-direction: row`) y ajustarla para que también se apile en columna por debajo de 480px
- [x] 3.3 Verificar que `label`, `input`, `select` y el botón de envío ocupen el ancho completo del formulario en columna (sin `min-width` que fuerce dos por fila)

## 4. Verificación manual en anchos de referencia

- [x] 4.1 Con devtools en modo de emulación de dispositivo, revisar las tres vistas (`Transacciones`, `Deudas`, `Gastos fijos`) en 320px, 375px y 414px de ancho: sin scroll horizontal, nav inferior visible y alcanzable, formularios en una columna
- [x] 4.2 Revisar las tres vistas en 1024px de ancho: nav vuelve a la parte superior, layout equivalente al actual
- [x] 4.3 Medir con devtools el área táctil de los botones de navegación y de envío de formulario en viewport de teléfono, confirmando al menos 44x44px
- [ ] 4.4 Emular un iPhone con notch/gesto de inicio y confirmar que la barra inferior y el contenido de `main` respetan `safe-area-inset-bottom` sin quedar cortados u ocultos
  - **Nota de limitación del entorno:** no verificable en este entorno. Chrome de escritorio (con o sin el toolbar de emulación de dispositivo) siempre resuelve `env(safe-area-inset-*)` en `0`; no hay forma de simular un valor distinto de cero sin un dispositivo iOS real o un simulador de Xcode, y ninguno de los dos está disponible aquí. El código sí sigue el patrón estándar correcto (`viewport-fit=cover` en `index.html` + `env(safe-area-inset-bottom)` en el padding de `nav` y `main`, ver tareas 2.2/2.4), pero esta verificación queda pendiente de confirmar en un dispositivo real.
