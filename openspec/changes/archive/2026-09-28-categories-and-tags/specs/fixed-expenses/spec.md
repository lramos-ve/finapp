## ADDED Requirements

### Requirement: Categorizar gastos fijos
El sistema SHALL permitir asignar una categoría (predefinida o personalizada) a un gasto fijo al momento de su definición. La categoría asignada SHALL ser visible en el listado de gastos fijos y en sus instancias generadas.

#### Scenario: Definir gasto fijo con categoría
- **WHEN** el usuario define un gasto fijo "Internet Fibra" asignándole la categoría "Servicios"
- **THEN** el gasto fijo se guarda con la categoría "Servicios" y se muestra la etiqueta correspondiente en la lista de compromisos recurrentes.
