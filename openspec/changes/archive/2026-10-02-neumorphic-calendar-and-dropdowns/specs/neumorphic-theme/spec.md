## ADDED Requirements

### Requirement: Selector de fecha interactivo con estética neumórfica
El sistema SHALL proveer un componente de calendario interactivo para la selección de fechas en sustitución del selector nativo del sistema operativo, presentando una interfaz emergente con sombras duales neumórficas, navegación entre meses/años y selección táctil de días en concordancia con el tema activo (Claro u Oscuro).

#### Scenario: Apertura del calendario emergente
- **WHEN** el usuario hace clic o enfoca el campo de entrada de fecha
- **THEN** se despliega un panel emergente con superficie neumórfica elevada, cabecera de mes/año con botones de navegación anterior/siguiente y cuadrícula mensual de días.

#### Scenario: Selección de fecha y actualización de valor
- **WHEN** el usuario pulsa un día disponible en la cuadrícula mensual
- **THEN** el sistema asigna la fecha seleccionada en formato ISO (YYYY-MM-DD), actualiza el campo de texto visible y cierra el panel emergente.

#### Scenario: Cierre del panel por interacción exterior
- **WHEN** el panel de calendario se encuentra abierto y el usuario hace clic fuera de su contenedor o presiona la tecla Escape
- **THEN** el panel se cierra automáticamente sin alterar la fecha previamente establecida.

### Requirement: Menús y listas desplegables con acabado neumórfico
El sistema SHALL presentar los controles de selección desplegable (`<select>`) y las listas de opciones con sombras hendidas interiores (*inset*) en su campo base y paneles de opciones con sombras exteriores suaves y relieve táctil coherente con el tema activo.

#### Scenario: Despliegue de opciones en selectores
- **WHEN** el usuario interactúa con un elemento de selección desplegable
- **THEN** el control mantiene su apariencia neumórfica con bordes suaves, flecha indicadora estilizada y contraste tipográfico adecuado tanto en tema Claro como en tema Oscuro.
