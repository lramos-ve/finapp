## 1. Módulo Core de Respaldo y Criptografía

- [x] 1.1 Implementar extracción y empaquetado de todas las tablas de `FinanzasDB` en `src/lib/backup.js`
- [x] 1.2 Implementar utilidades de cifrado y descifrado `AES-GCM` con derivación `PBKDF2` vía Web Crypto API
- [x] 1.3 Implementar validación de estructura y restauración atómica en `FinanzasDB` usando transacciones Dexie
- [x] 1.4 Crear pruebas unitarias en `src/test/backup.test.js` para validar exportación, cifrado con contraseña válida, fallo por contraseña errónea e importación/restauración de datos

## 2. Interfaz de Usuario y Navegación

- [x] 2.1 Crear componente `src/lib/components/BackupView.svelte` con secciones de Exportar e Importar
- [x] 2.2 Implementar selección de archivo, detección de respaldo cifrado, campo de contraseña y advertencia de confirmación antes de sobreescribir
- [x] 2.3 Integrar la navegación hacia la vista de Respaldo en `src/App.svelte`

## 3. Verificación Integral

- [x] 3.1 Ejecutar la suite completa de pruebas con Vitest (`npm test`) y corregir cualquier discrepancia
- [x] 3.2 Verificar compilación en desarrollo y empaquetado de producción (`npm run build`)
