## ADDED Requirements

### Requirement: Consulta y persistencia de la tasa oficial del Euro BCV
El sistema SHALL consultar la cotización oficial del Euro (EUR) emitida por el Banco Central de Venezuela desde el servicio oficial y persistirla en caché local de manera análoga al dólar estadounidense, permitiendo cálculos y conversiones en euros sin conexión a internet.

#### Scenario: Consulta en línea de la tasa del euro
- **WHEN** el usuario o la calculadora solicita la cotización del euro con conexión a internet
- **THEN** el sistema obtiene el valor en bolívares por euro oficial del BCV, actualiza la interfaz y renueva la caché local de euros.

#### Scenario: Recuperación offline de la tasa del euro
- **WHEN** se solicita la cotización del euro y la red no responde o no hay conexión
- **THEN** el sistema recupera la última tasa de euro almacenada en la caché local sin interrumpir la experiencia del usuario.
