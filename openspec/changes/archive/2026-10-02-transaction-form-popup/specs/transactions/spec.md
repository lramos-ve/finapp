## MODIFIED Requirements

### Requirement: Registrar una transacción
El sistema SHALL permitir registrar una transacción con tipo (`ingreso` o `gasto`), monto, moneda (`USD` o `VES`), fecha y descripción opcional a través de una tarjeta emergente (pop-up modal) con estética neumórfica disparada por un botón de acción en la vista principal.

#### Scenario: Registro de un ingreso en USD
- **WHEN** el usuario registra un ingreso de $100 en USD
- **THEN** el sistema guarda la transacción con monto 100, moneda USD y equivalente en USD de 100

#### Scenario: Registro de un gasto en VES
- **WHEN** el usuario registra un gasto de Bs. 2,000 en VES
- **THEN** el sistema requiere una tasa BCV para completar el registro

#### Scenario: Apertura del formulario de registro como pop-up
- **WHEN** el usuario pulsa el botón de registro de movimiento en la vista de transacciones
- **THEN** se despliega una tarjeta emergente centrada con sombra dual neumórfica y fondo difuminado conteniendo los campos de captura.

#### Scenario: Cierre del pop-up de transacción
- **WHEN** el usuario pulsa el botón de cerrar (x), presiona Escape o pulsa fuera de la tarjeta emergente
- **THEN** el pop-up se cierra inmediatamente sin guardar datos no confirmados y regresa a la vista de balance.
