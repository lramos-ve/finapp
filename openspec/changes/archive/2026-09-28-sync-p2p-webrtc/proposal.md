## Why

FinApp opera como una aplicación estrictamente Local-First en el navegador sin base de datos en la nube. Los usuarios frecuentemente necesitan registrar transacciones en movilidad desde su teléfono y consultar sus balances o gastos fijos en su computadora. Para mantener la independencia de servidores centrales y el costo cero de infraestructura, se requiere un mecanismo directo de sincronización punto a punto (P2P) entre dispositivos mediante WebRTC y códigos QR.

## What Changes

- Implementación del protocolo de comunicación punto a punto (P2P) entre navegadores utilizando **WebRTC DataChannels**.
- Intercambio de señalización simplificado mediante **código QR** (o código numérico/alfanumérico temporal) para emparejar el dispositivo emisor con el receptor sin servidores propietarios.
- Transferencia directa y cifrada extremo a extremo de los registros de `FinanzasDB` aprovechando la infraestructura de serialización de `src/lib/backup.js`.
- Interfaz gráfica para iniciar sesión de sincronización:
  - Modo **"Enviar a otro dispositivo"**: genera el QR de emparejamiento y transmite los datos al conectarse.
  - Modo **"Recibir desde otro dispositivo"**: escanea el QR con la cámara del dispositivo (o ingresa el código) y aplica la sincronización de datos con confirmación.

## Capabilities

### New Capabilities
- `p2p-sync`: Permite conectar dos instancias de FinApp directamente entre sí mediante WebRTC DataChannel usando códigos QR o códigos de sesión para transferir y sincronizar registros financieros de manera segura y privada.

### Modified Capabilities
<!-- Ninguna capacidad existente cambia sus requerimientos de negocio. -->

## Impact

- **Código afectado:**
  - Creación del servicio de red P2P en `src/lib/p2p.js` para la gestión de `RTCPeerConnection` y canales de datos.
  - Ampliación de la vista de Respaldo/Sincronización (`src/lib/components/BackupView.svelte` o componente dedicado `P2PSyncModal.svelte`).
  - Reutilización de la serialización y restauración atómica en `src/lib/backup.js`.
- **Dependencias:**
  - Librería ligera para renderizar código QR (ej. `qrcode` o generador SVG minimalista) y utilidades de señalización o cámara para lectura.
- **Riesgos y mitigaciones:**
  - Firewalls simétricos o redes corporativas que impiden NAT traversal: se configuran servidores STUN públicos gratuitos (como los de Google) para maximizar la conectividad P2P directa.
