## ADDED Requirements

### Requirement: Categorizar transacciones
El sistema SHALL permitir asignar una categoría (seleccionada de una lista común predefinida o escrita de forma personalizada) a cualquier transacción al registrarla o editarla. La categoría es opcional (con valor predeterminado si no se especifica).

#### Scenario: Registrar transacción con categoría predefinida
- **WHEN** el usuario registra un gasto de $15 seleccionando la categoría "Comida"
- **THEN** la transacción se guarda con la propiedad de categoría establecida en "Comida" y se visualiza su etiqueta en la lista.

#### Scenario: Registrar o editar transacción con categoría personalizada
- **WHEN** el usuario registra o edita una transacción indicando una categoría escrita libremente como "Mascotas"
- **THEN** el sistema guarda la transacción con la categoría "Mascotas" y dicha categoría queda disponible para futuras selecciones.

### Requirement: Filtrar transacciones por categoría
El sistema SHALL permitir filtrar el listado de transacciones por una categoría específica además de los filtros existentes de tipo y moneda.

#### Scenario: Filtrar transacciones por categoría
- **WHEN** el usuario selecciona la categoría "Servicios" en los filtros de la lista de transacciones
- **THEN** el sistema muestra únicamente las transacciones pertenecientes a la categoría "Servicios".
