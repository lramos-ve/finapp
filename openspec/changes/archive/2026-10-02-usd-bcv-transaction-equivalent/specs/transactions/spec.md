## MODIFIED Requirements

### Requirement: Transacción en USD no requiere tasa
Cuando una transacción se registra en USD, el sistema SHALL usar el monto ingresado directamente como equivalente en USD para propósitos de balance contable, pero SHALL cargar automáticamente la tasa oficial del dólar BCV y calcular reactivamente su monto equivalente en bolívares (VES), permitiendo al usuario ajustar la tasa y guardarla en el registro.

#### Scenario: Transacción en dólares
- **WHEN** el usuario registra un gasto de $25 en USD
- **THEN** el equivalente en USD de la transacción es 25 directamente para el balance, permitiendo además asociar la tasa BCV disponible.

#### Scenario: Transacción en dólares con tasa oficial
- **WHEN** el usuario selecciona la moneda USD e ingresa un monto de $50 teniendo una tasa BCV de 850 Bs/$
- **THEN** el sistema presenta de forma reactiva el equivalente aproximado de Bs. 42.500,00, permite refrescar o modificar la tasa BCV y guarda la tasa junto al registro manteniendo su equivalente base en USD de $50.00.

#### Scenario: Transacción en dólares sin tasa BCV disponible
- **WHEN** el usuario registra una transacción en USD sin conexión ni tasa en caché
- **THEN** el sistema permite registrar la transacción en USD con su equivalente en USD directamente sin bloquear el guardado.

## ADDED Requirements

### Requirement: Visualización del contravalor en bolívares en el listado
El sistema SHALL mostrar en el listado de transacciones el valor original en dólares ($) y su contraparte equivalente calculada en bolívares (VES) a la tasa BCV registrada en cada transacción en USD que cuente con dicha tasa.

#### Scenario: Transacción en USD con equivalente en bolívares en la lista
- **WHEN** una transacción en USD registrada con monto de $20 y tasa BCV de 850 Bs/$ se despliega en el listado
- **THEN** el elemento de la lista muestra "$20.00 (≈ Bs. 17.000,00 a tasa 850)" junto con el impacto contable en USD (+$20.00 o -$20.00).

#### Scenario: Transacción histórica en USD sin tasa BCV
- **WHEN** una transacción histórica en USD sin tasa BCV asociada se despliega en el listado
- **THEN** el elemento de la lista muestra "$20.00" sin información de tasa ni error, preservando la compatibilidad retroactiva.
