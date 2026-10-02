## MODIFIED Requirements

### Requirement: Listar y filtrar transacciones
El sistema SHALL permitir listar y filtrar las transacciones registradas por tipo (ingreso/gasto), moneda y categoría a través de una tarjeta emergente (pop-up modal) interactiva con estética neumórfica disparada por un botón de acción en la vista principal de transacciones, manteniendo la vista inicial limpia y centrada en el balance.

#### Scenario: Filtrar gastos en bolívares
- **WHEN** el usuario filtra por tipo `gasto` y moneda `VES` dentro del modal de historial
- **THEN** el sistema muestra solo las transacciones de gasto registradas en VES en la lista del modal.

#### Scenario: Vista principal simplificada de transacciones
- **WHEN** el usuario accede a la sección de transacciones
- **THEN** la interfaz muestra el balance consolidado y los botones de acción para registrar transacción y abrir el historial, sin la lista extensa desplegada por defecto en la vista principal.

#### Scenario: Apertura del historial como pop-up
- **WHEN** el usuario pulsa el botón de ver historial en la vista principal de transacciones
- **THEN** se despliega una tarjeta emergente centrada con sombra dual neumórfica y fondo difuminado conteniendo los filtros y la lista de transacciones.

#### Scenario: Cierre del pop-up de historial
- **WHEN** el usuario pulsa el botón de cerrar (x), presiona Escape o pulsa fuera de la tarjeta emergente del historial
- **THEN** el pop-up se cierra inmediatamente y regresa a la vista de balance.
