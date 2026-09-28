## Why

La aplicación aún contiene emojis del sistema operativo en el logotipo (`💸`), en la vista de respaldo (`⚡`, `ℹ️`, `🔒`, `📄`, `⚠️`) y en el modal de sincronización P2P (`✕`, `📤`, `📥`, `⏳`, `🟢`, `✅`, `🎉`). Los emojis se renderizan de manera inconsistente entre sistemas operativos (iOS, Android, Windows, Linux) y desentonan con la paleta de colores y el estilo neumórfico refinado de la app.

Sustituir todos los emojis restantes por iconos vectoriales SVG limpios y consistentes garantiza uniformidad visual, nitidez independiente de la resolución y un control cromático preciso acorde al tema activo.

## What Changes

- **Logotipo de la marca:** Sustitución de `💸` en el encabezado por un icono vectorial SVG (`wallet`) estilizado junto al nombre `FinApp`.
- **Iconografía en Vista de Respaldo:** Sustitución de los emojis informativos, de cifrado y de advertencia (`⚡`, `ℹ️`, `🔒`, `📄`, `⚠️`) por iconos vectoriales SVG (`zap`, `info`, `lock`, `file-text`, `alert-triangle`).
- **Iconografía en Modal P2P:** Sustitución de emojis de estado, acciones y cierre (`✕`, `📤`, `📥`, `⏳`, `🟢`, `✅`, `🎉`) por iconos vectoriales SVG coherentes (`x`, `send`, `download`, `loader`, `check-circle`, `sparkles`).
- **Ampliación del catálogo en `Icon.svelte`:** Incorporación de las nuevas rutas SVG optimizadas con trazo de 2px y color contextual `currentColor`.

## Capabilities

### New Capabilities
- `ui-vector-icons`: Estandarización de la iconografía de la aplicación mediante iconos vectoriales SVG integrados con soporte de temas claro y oscuro, eliminando dependencias de glifos de emojis del sistema.

### Modified Capabilities
*(Ninguna especificación funcional altera sus contratos de requerimientos de negocio).*

## Impact

- `src/App.svelte`: Actualización del logotipo en el `<header>`.
- `src/lib/components/BackupView.svelte`: Sustitución de emojis en textos informativos, insignias de cifrado y advertencias.
- `src/lib/components/P2PSyncModal.svelte`: Reemplazo de emojis en botones de acción, selector de rol y estados de conexión/éxito.
- `src/lib/components/Icon.svelte`: Nuevos iconos vectoriales (`wallet`, `zap`, `info`, `lock`, `file-text`, `alert-triangle`, `x`, `send`, `download`, `loader`, `check-circle`, `sparkles`).
