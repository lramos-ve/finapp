## Purpose

Permite a los usuarios conectar dos dispositivos de forma directa mediante WebRTC para transferir y sincronizar sus registros financieros locales en tiempo real sin requerir servidores ni almacenamiento en la nube.

## ADDED Requirements

### Requirement: Establecimiento de canal P2P seguro

El sistema DEBE (SHALL) permitir establecer una conexión de datos directa entre dos dispositivos utilizando WebRTC DataChannel sin intermediarios de almacenamiento de datos.

#### Scenario: Generación de oferta y código QR
- **WHEN** el usuario inicia la sincronización en el dispositivo emisor seleccionando "Enviar a otro dispositivo"
- **THEN** el sistema crea una sesión de conexión WebRTC y presenta un código visual (QR o código de emparejamiento) para que el segundo dispositivo se conecte.

#### Scenario: Conexión exitosa entre ambos dispositivos
- **WHEN** el dispositivo receptor escanea el código presentado por el emisor
- **THEN** ambos dispositivos establecen un canal WebRTC DataChannel bidireccional y muestran el estado de "Conectado".

### Requirement: Transferencia y sincronización de datos

El sistema DEBE (SHALL) transmitir de manera segura el snapshot de registros de FinanzasDB a través del canal de datos establecido.

#### Scenario: Transmisión y recepción exitosa
- **WHEN** la conexión P2P está activa y se confirma la transferencia
- **THEN** el emisor envía el payload de datos completo y el receptor lo valida antes de presentarlo al usuario para su aplicación.

#### Scenario: Aplicación con confirmación en el receptor
- **WHEN** el receptor recibe el paquete de datos del emisor
- **THEN** solicita confirmación al usuario antes de reemplazar o fusionar los registros locales en IndexedDB.

### Requirement: Manejo de errores y desconexiones

El sistema DEBE (SHALL) informar de forma clara al usuario ante cualquier pérdida de conexión o fallo en la transferencia de datos.

#### Scenario: Interrupción de conexión durante la sincronización
- **WHEN** la conexión de red entre los dos dispositivos se interrumpe antes de completar la transferencia
- **THEN** el sistema aborta la sincronización de forma segura sin alterar la base de datos receptora y muestra una alerta informativa.
