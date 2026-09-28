## ADDED Requirements

### Requirement: Actualizar una transacción existente
El sistema SHALL permitir al usuario modificar los datos de una transacción existente (tipo, monto, moneda, tasa BCV, fecha y descripción), recalculando de manera consistente el monto equivalente en USD y actualizando el balance general.

#### Scenario: Edición de monto y descripción de un gasto en USD
- **WHEN** el usuario edita una transacción en USD cambiando el monto de $20 a $25 y actualiza la descripción
- **THEN** el sistema guarda los nuevos valores, actualiza el equivalente en USD a 25 y refleja el cambio en el balance total.

#### Scenario: Edición de una transacción en VES con cambio de tasa
- **WHEN** el usuario modifica una transacción en bolívares ajustando el monto en VES y la tasa BCV aplicada
- **THEN** el sistema recalcula el nuevo equivalente en USD en base a los nuevos valores y lo congela en el registro.

### Requirement: Eliminar una transacción
El sistema SHALL permitir al usuario eliminar una transacción registrada, solicitando una confirmación previa para evitar borrados accidentales y recalculando inmediatamente el balance acumulado.

#### Scenario: Eliminación confirmada de una transacción
- **WHEN** el usuario pulsa eliminar en una transacción y confirma la acción en el diálogo de confirmación
- **THEN** el sistema remueve la transacción de la base de datos local y descuenta su impacto del balance total.

#### Scenario: Cancelación de la eliminación
- **WHEN** el usuario pulsa eliminar pero cancela el diálogo de confirmación
- **THEN** la transacción se conserva sin alteraciones y el balance permanece intacto.
