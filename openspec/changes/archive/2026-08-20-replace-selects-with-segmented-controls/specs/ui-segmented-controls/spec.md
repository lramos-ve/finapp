## Purpose

Proporciona controles de selección segmentada de un solo toque (Segmented Controls) para opciones fijas en formularios y filtros, eliminando los menús desplegables tradicionales.

## ADDED Requirements

### Requirement: Seleccionar opción con toque único
El sistema SHALL presentar las opciones de valor fijo (como tipo de transacción, moneda, dirección de deuda y filtros) como grupos de botones segmentados donde cada opción está expuesta directamente y se selecciona con un solo toque o clic.

#### Scenario: Selección de tipo de transacción
- **WHEN** el usuario presiona el botón "Ingreso" en el control segmentado de Tipo
- **THEN** el sistema cambia la selección activa a "Ingreso" de forma inmediata sin desplegar menús

#### Scenario: Selección de moneda
- **WHEN** el usuario presiona el botón "VES" en el control segmentado de Moneda
- **THEN** el sistema activa la moneda "VES" e ilustra el campo requerido para la Tasa BCV

#### Scenario: Selección de dirección de deuda
- **WHEN** el usuario presiona el botón "Me deben" en el control segmentado de Dirección
- **THEN** el sistema establece la dirección activa como "me_deben"

### Requirement: Feedback visual de opción activa
El sistema SHALL resaltar de forma clara e inconfundible la opción seleccionada dentro del grupo de control segmentado.

#### Scenario: Estado activo diferenciado
- **WHEN** una opción está seleccionada dentro del grupo segmentado
- **THEN** dicha opción muestra un estado visual destacado frente a las opciones no seleccionadas
