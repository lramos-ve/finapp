## ADDED Requirements

### Requirement: Eliminar una deuda
El sistema SHALL permitir al usuario eliminar una deuda existente, solicitando una confirmación previa y removiendo en cascada tanto el registro de la deuda como todos los abonos asociados a ella en la base de datos local.

#### Scenario: Eliminación de una deuda sin abonos
- **WHEN** el usuario solicita eliminar una deuda pendiente y confirma la acción en el diálogo de confirmación
- **THEN** el sistema elimina la deuda de la base de datos local y actualiza la lista y los totales acumulados.

#### Scenario: Eliminación de una deuda con abonos asociados
- **WHEN** el usuario solicita eliminar una deuda que cuenta con uno o más abonos registrados y confirma la acción
- **THEN** el sistema elimina en cascada tanto la deuda como todos los registros de abonos correspondientes a esa deuda.

#### Scenario: Cancelación de la eliminación
- **WHEN** el usuario hace clic en el botón de eliminar pero rechaza el diálogo de confirmación
- **THEN** el sistema conserva la deuda y sus abonos asociados sin alterar los saldos ni la interfaz.
