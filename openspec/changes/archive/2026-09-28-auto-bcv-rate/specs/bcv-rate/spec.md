## Purpose

Proporciona la consulta y gestión de la tasa de cambio oficial del Banco Central de Venezuela (BCV), almacenando en caché local la última tasa conocida para agilizar el registro bimonetario (VES / USD) incluso sin conexión a internet.

## ADDED Requirements

### Requirement: Consulta y actualización de la tasa oficial del BCV
El sistema SHALL consultar la tasa oficial del BCV a través de un punto de enlace público con soporte CORS, obteniendo el valor numérico en bolívares por dólar estadounidense y la marca de tiempo de actualización.

#### Scenario: Consulta en línea exitosa
- **WHEN** el usuario solicita actualizar la tasa o el sistema realiza una consulta automática con conexión a internet
- **THEN** el sistema obtiene el valor actual del dólar oficial, actualiza el campo de tasa en la interfaz y renueva la caché local.

#### Scenario: Falla de conexión o servicio no disponible
- **WHEN** el sistema intenta consultar la tasa externa pero la red no responde o el servicio falla
- **THEN** el sistema no interrumpe el flujo del usuario, mantiene el último valor de tasa disponible en la caché local e informa sutilmente sobre el estado offline.

### Requirement: Persistencia local y funcionamiento offline-first
El sistema SHALL persistir localmente en el almacenamiento del navegador la última tasa conocida junto con su fecha de captura, asegurando que los formularios de transacciones y deudas siempre cuenten con una tasa disponible para cálculos de moneda.

#### Scenario: Recuperación de tasa desde la caché local
- **WHEN** el usuario ingresa a un formulario que requiere bolívares (VES) y no se ha realizado una consulta remota
- **THEN** el sistema carga y presenta la última tasa guardada en la caché local.

#### Scenario: Actualización de la caché tras una consulta exitosa
- **WHEN** se recibe una tasa válida desde el servicio remoto
- **THEN** el sistema almacena el valor numérico y la fecha en la caché local para usos futuros.

### Requirement: Autorelleno y sobreescritura manual
El sistema SHALL rellenar de forma automática el campo numérico de la tasa BCV cuando el usuario seleccione la moneda `VES`, y SHALL permitir al usuario editar o sobreescribir el valor manualmente en cualquier momento.

#### Scenario: Autorelleno al cambiar a VES
- **WHEN** el usuario selecciona `VES` en el control de moneda de una transacción o abono
- **THEN** el campo de tasa BCV se rellena automáticamente con la tasa disponible en caché o la recién obtenida.

#### Scenario: Sobreescritura manual de la tasa
- **WHEN** el usuario ingresa manualmente un valor de tasa distinto en el campo numérico
- **THEN** el sistema utiliza el valor introducido por el usuario para calcular los montos y conversiones a USD.
