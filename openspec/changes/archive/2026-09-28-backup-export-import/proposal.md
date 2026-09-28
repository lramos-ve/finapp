## Why

Al ser una aplicación 100% Local-First sin servidor central, todos los datos residen exclusivamente en el almacenamiento IndexedDB del navegador. Si el usuario limpia los datos del navegador, cambia de teléfono/computadora o sufre un fallo en su dispositivo, corre el riesgo de perder todo su historial financiero. Se requiere una forma segura, privada e inmediata (Fase 1) para exportar e importar los datos de la aplicación sin depender de infraestructura externa, sentando la base de resguardo previa a la sincronización multidispositivo.

## What Changes

- Funcionalidad de **exportación de datos** que genera un archivo descargable con todas las tablas de `FinanzasDB` (transacciones, deudas, abonos, plantillas de gastos fijos, instancias y pagos).
- Opción de **cifrado con contraseña** usando la Web Crypto API estándar del navegador (`AES-GCM` y derivación `PBKDF2`), asegurando que los archivos de respaldo compartidos o almacenados externamente no expongan información financiera sensible. Soporta también exportación directa sin contraseña (JSON legible).
- Funcionalidad de **importación y restauración de datos**: lee el archivo de respaldo, solicita la contraseña si está cifrado, valida la integridad y versión del esquema, y restaura la base de datos de IndexedDB.
- Nueva interfaz de usuario para **Gestión de Respaldo / Ajustes** integrada en la aplicación, permitiendo exportar e importar con un solo toque y con retroalimentación clara de éxito o error.

## Capabilities

### New Capabilities
- `backup-restore`: Exportar la totalidad de los datos locales a un archivo JSON (opcionalmente cifrado con AES-GCM/PBKDF2) e importar dicho archivo validando su estructura para restaurar el estado completo de la base de datos en cualquier momento o dispositivo.

### Modified Capabilities
<!-- Ninguna especificación existente cambia sus requerimientos de negocio actuales. -->

## Impact

- **Código afectado:**
  - Creación de un nuevo módulo de servicio `src/lib/backup.js` para la serialización, cifrado/descifrado y validación de esquemas.
  - Creación de una vista o componente de UI `src/lib/components/BackupView.svelte` o modal de configuración.
  - Actualización de `src/App.svelte` para proveer acceso a la nueva sección de respaldo/configuración.
- **Dependencias:**
  - No requiere librerías pesadas externas; se aprovechan las APIs nativas del navegador (`crypto.subtle` de la Web Crypto API, `FileReader`, `Blob`) y la instancia existente de `Dexie`.
- **Riesgos y mitigaciones:**
  - Riesgo de corrupción si se importa un archivo malformado o incompatible: se valida el formato y la versión del payload antes de tocar la base de datos.
  - Riesgo de olvidar la contraseña: el cifrado es de conocimiento cero (zero-knowledge); se le advierte al usuario en la UI que la contraseña no se puede recuperar si la olvida.
