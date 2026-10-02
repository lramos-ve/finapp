## MODIFIED Requirements

### Requirement: Listar y filtrar transacciones
El sistema SHALL permitir listar y filtrar las transacciones registradas por tipo (ingreso/gasto), moneda y rango de fechas o categoría dentro de la vista analítica del historial, mientras que la vista principal de transacciones SHALL mantenerse enfocada en el balance general y en el formulario de registro rápido.

#### Scenario: Filtrar gastos en bolívares
- **WHEN** el usuario filtra por tipo `gasto` y moneda `VES`
- **THEN** el sistema muestra solo las transacciones de gasto registradas en VES

#### Scenario: Vista principal simplificada de transacciones
- **WHEN** el usuario accede a la sección de transacciones
- **THEN** la interfaz muestra el balance consolidado y el formulario de ingreso/gasto sin la lista extensa inferior, facilitando la captura ágil en dispositivos móviles.
