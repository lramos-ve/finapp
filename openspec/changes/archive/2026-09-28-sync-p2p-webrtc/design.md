## Context

Ver `proposal.md` para la motivación. FinApp almacena sus datos localmente en IndexedDB (`FinanzasDB`). La Fase 1 resolvió el resguardo manual mediante archivos JSON cifrados. La Fase 2 introduce la sincronización directa entre dos dispositivos (ej. móvil y laptop) sin que la base de datos toque servidores externos.

## Goals / Non-Goals

**Goals:**
- Implementar un túnel de datos directo mediante WebRTC (`RTCDataChannel`) cifrado punto a punto (DTLS/SCTP).
- Proveer un método de emparejamiento sencillo mediante código QR y código corto de sesión.
- Transferir el snapshot estructurado de `FinanzasDB` con validación de esquema y restauración atómica.
- Retroalimentación clara de los estados de conexión: Esperando, Conectando, Transfiriendo y Completado.

**Non-Goals:**
- Sincronización continua en tiempo real en segundo plano (requiere ambos navegadores abiertos e interactuando en la sesión).
- Sincronización con Google Drive (será abordada en la siguiente etapa de la Fase 2).
- Resolución de conflictos registro por registro (CRDT complejo); la sincronización transfiere el snapshot actualizado del dispositivo emisor al receptor con confirmación.

## Decisions

### 1. Mecanismo de Señalización y Conexión P2P
Para conectar dos navegadores WebRTC sin tener que levantar un servidor propio de señalización:
- Se utiliza un identificador de sesión efímero generado por el emisor (ej. código alfanumérico legible y enlace codificado en código QR).
- Señalización mediante servidor de señalización abierto (servidor público PeerJS o STUN público de Google):
  - Solo transporta los metadatos de negociación SDP (unos pocos bytes).
  - Nunca almacena ni lee el contenido financiero.
  - El canal de datos WebRTC (`DataChannel`) opera de forma directa entre los dos dispositivos con cifrado E2EE por hardware nativo del navegador.

### 2. Formato del Payload de Transferencia
Se reutiliza la infraestructura de empaquetado de `src/lib/backup.js`:
- El emisor extrae los datos mediante `extraerDatosCompletos()`.
- Se empaqueta un mensaje tipado `{ tipo: 'FINAPP_SYNC_PAYLOAD', timestamp, data, app: 'finapp', version: 1 }`.
- El receptor valida el mensaje mediante `validarEstructuraRespaldo(payload)` y lo aplica con `restaurarDatos()`.

### 3. Generación y Lectura de Código QR
- **Generación:** Se utiliza una librería ligera o utilidad generadora de QR (como `qrcode` o SVG renderer) para mostrar el QR en el dispositivo emisor.
- **Lectura:** El dispositivo receptor puede escanear con la cámara del navegador o, si la cámara no está disponible/permitida, ingresar el código de sesión manualmente.

### 4. Flujo UX
1. Dispositivo A (Emisor): Clic en "Sincronizar P2P" -> "Enviar datos" -> Muestra QR y código.
2. Dispositivo B (Receptor): Clic en "Sincronizar P2P" -> "Recibir datos" -> Escanea QR o escribe código.
3. Se establece la conexión WebRTC: ambos dispositivos muestran "¡Conectados!".
4. Dispositivo A envía los datos.
5. Dispositivo B recibe los datos, muestra vista previa del número de registros recibidos y solicita confirmación: "Restaurar registros recibidos".
6. Dispositivo B aplica la transacción atómica y confirma éxito.

## Risks / Trade-offs

- **[Riesgo] Restricciones NAT/Firewall agresivas:** Algunos routers corporativos bloquean conexiones directas UDP.
  - *Mitigación:* Se configuran servidores STUN públicos estándar para facilitar NAT traversal.
- **[Riesgo] Permisos de cámara denegados en el receptor:**
  - *Mitigación:* El sistema siempre ofrece como alternativa un código de emparejamiento manual de 6 caracteres.
