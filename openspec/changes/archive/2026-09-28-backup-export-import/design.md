## Context

Ver `proposal.md` para la motivación general. La aplicación almacena sus datos en IndexedDB mediante Dexie en una base de datos denominada `FinanzasDB`, compuesta por 6 almacenes de objetos (stores):
- `transacciones`
- `deudas`
- `abonos`
- `gastosFijos`
- `instanciasGastoFijo`
- `pagosGastoFijo`

Para garantizar portabilidad y seguridad sin servidores, este diseño establece el protocolo de exportación, cifrado/descifrado y restauración atómica utilizando APIs nativas del navegador.

## Goals / Non-Goals

**Goals:**
- Definir el esquema JSON estandarizado para snapshots completos de datos con metadatos de versión.
- Implementar cifrado/descifrado autenticado de conocimiento cero utilizando la Web Crypto API (`AES-GCM` + `PBKDF2`).
- Proveer restauración atómica sobre IndexedDB para evitar bases de datos en estados inconsistentes ante fallos.
- Incorporar una vista accesible de gestión de respaldos con validación y confirmación de sobreescritura.

**Non-Goals:**
- Sincronización en la nube (Google Drive) o P2P WebRTC (explícitamente planificados para la Fase 2).
- Sincronización diferencial automática en segundo plano (este diseño cubre backups completos/snapshots manuales).
- Soporte para formatos propietarios ajenos a JSON.

## Decisions

### 1. Formato de datos y encapsulado de respaldo
Se define un contenedor JSON estructurado:

- **Respaldo sin cifrar (Plain):**
  ```json
  {
    "app": "finapp",
    "version": 1,
    "timestamp": "2026-09-28T15:00:00.000Z",
    "encrypted": false,
    "data": {
      "transacciones": [ ... ],
      "deudas": [ ... ],
      "abonos": [ ... ],
      "gastosFijos": [ ... ],
      "instanciasGastoFijo": [ ... ],
      "pagosGastoFijo": [ ... ]
    }
  }
  ```

- **Respaldo cifrado (Encrypted):**
  ```json
  {
    "app": "finapp",
    "version": 1,
    "timestamp": "2026-09-28T15:00:00.000Z",
    "encrypted": true,
    "crypto": {
      "algorithm": "AES-GCM",
      "kdf": "PBKDF2",
      "iterations": 100000,
      "salt": "<base64-salt>",
      "iv": "<base64-iv>"
    },
    "ciphertext": "<base64-ciphertext>"
  }
  ```

*Razón:* Incluir `app` y `version` permite validar de inmediato que el archivo corresponde a FinApp antes de intentar descifrar o importar registros.

### 2. Cifrado nativo con Web Crypto API (AES-GCM + PBKDF2)
- Derivación de clave: `PBKDF2` con hash `SHA-256`, 100,000 iteraciones y salt criptográfico de 16 bytes (`crypto.getRandomValues`).
- Cifrado simétrico: `AES-GCM` con clave de 256 bits y vector de inicialización (IV) de 12 bytes.
- *Por qué AES-GCM:* Proporciona cifrado autenticado (AEAD). Si el archivo fue alterado o la contraseña es errónea, la operación de descifrado rechaza inmediatamente la promesa por fallo de autenticación de tag, sin necesidad de checksums adicionales.
- *Alternativas consideradas:* Librerías como `crypto-js`. Descartadas para no aumentar el peso del bundle PWA, aprovechando la API estándar `window.crypto.subtle`.

### 3. Restauración atómica en Dexie
La restauración de los datos se ejecuta dentro de una transacción Dexie de lectura/escritura (`rw`) que abarca todas las tablas:
```javascript
await db.transaction('rw', db.tables, async () => {
  for (const table of db.tables) {
    await table.clear()
    const records = data[table.name] || []
    if (records.length > 0) {
      await table.bulkAdd(records)
    }
  }
})
```
*Razón:* Si algún registro falla o la transacción se cancela, la base de datos se revierte a su estado previo sin dejar tablas vacías a medias.

### 4. Integración en la interfaz de usuario
Se añade una nueva opción de navegación "Respaldo" en el menú principal (`App.svelte`), renderizando el componente `BackupView.svelte`.
- Sección "Exportar": Campo opcional para definir contraseña (con confirmación de contraseña) y botón de descarga directa.
- Sección "Importar": Selector de archivos `.json`, campo de contraseña si el archivo está cifrado, botón de restauración y diálogo de confirmación para evitar pérdidas accidentales.

## Risks / Trade-offs

- **[Riesgo] Pérdida de contraseña por parte del usuario:** Al ser cifrado de conocimiento cero, no hay mecanismo de recuperación si el usuario olvida su contraseña.
  - *Mitigación:* Mostrar advertencia explícita en la UI indicando que la contraseña no puede recuperarse.
- **[Riesgo] Confusión si el usuario no recuerda si cifró el archivo:**
  - *Mitigación:* La estructura JSON incluye `"encrypted": true/false`, por lo que la UI detecta automáticamente si el archivo requiere contraseña al seleccionarlo.
