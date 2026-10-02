## ADDED Requirements

### Requirement: Historial detallado de transacciones en tarjeta desplegable

El sistema SHALL presentar en el módulo de estadísticas una tarjeta interactiva colapsable con diseño neumórfico que contenga el historial de transacciones correspondientes al período analizado, permitiendo expandir o contraer su visualización mediante un botón con relieve y flecha indicadora.

#### Scenario: Visualización colapsada por defecto con contador
- **WHEN** el usuario ingresa al módulo de estadísticas
- **THEN** la tarjeta de historial se muestra con su cabecera visible indicando la cantidad de transacciones registradas en el período seleccionado y el estado contraído.

#### Scenario: Despliegue de la tarjeta del historial
- **WHEN** el usuario pulsa sobre la cabecera o botón de la tarjeta colapsable
- **THEN** la tarjeta se expande con una transición suave mostrando el listado de transacciones con sus respectivos filtros (tipo, moneda, categoría).

#### Scenario: Edición o eliminación desde la tarjeta del historial
- **WHEN** el usuario modifica o elimina una transacción desde el listado dentro de la tarjeta desplegable
- **THEN** el sistema procesa la acción y actualiza inmediatamente las métricas analíticas, los gráficos y el contador del período en la vista de estadísticas.
