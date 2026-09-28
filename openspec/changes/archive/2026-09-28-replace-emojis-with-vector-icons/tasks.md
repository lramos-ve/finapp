## 1. Icon Component Expansion

- [x] 1.1 Añadir en `src/lib/components/Icon.svelte` los iconos vectoriales SVG para `wallet`, `zap`, `info`, `lock`, `alert-triangle`, `x`, `send`, `download`, `loader`, `check-circle`, `sparkles`, `plus`, `check`, `power`.

## 2. Header and Branding Update

- [x] 2.1 Reemplazar el emoji `💸` en `src/App.svelte` por el componente `Icon` con `name="wallet"` estilizado junto a `FinApp`.

## 3. Backup View Update

- [x] 3.1 En `src/lib/components/BackupView.svelte`, reemplazar `⚡`, `ℹ️`, `🔒`, `📄` y `⚠️` por sus componentes `Icon` equivalentes (`zap`, `info`, `lock`, `file`, `alert-triangle`).

## 4. P2P Sync Modal Update

- [x] 4.1 En `src/lib/components/P2PSyncModal.svelte`, importar `Icon.svelte` y reemplazar `✕`, `📤`, `📥`, `⏳`, `🟢`, `✅`, `⚠️` y `🎉` por sus respectivos componentes `Icon`.

## 5. List Action Buttons (Abonar, Pagar, Desactivar)

- [x] 5.1 Estilar los botones de acción en filas (`.deuda-fila button`, `.lista li button`) en `src/app.css` como pastillas neumórficas suaves con relieve elevado, efecto hover y feedback al clic.
- [x] 5.2 Actualizar `src/lib/components/DebtsView.svelte` para renderizar el botón "Abonar" con icono `plus` y clase `.boton-accion`.
- [x] 5.3 Actualizar `src/lib/components/FixedExpensesView.svelte` para renderizar los botones "Pagar" (icono `check`) y "Desactivar" (icono `power`) con la clase `.boton-accion`.

## 6. Verification and Testing

- [x] 6.1 Ejecutar `npm test` para asegurar que las pruebas unitarias continúen pasando al 100%.
- [x] 6.2 Realizar un escaneo del código para verificar que no queden emojis residuales en la aplicación.
