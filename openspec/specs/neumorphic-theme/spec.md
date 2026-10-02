# Neumorphic Theme

## Purpose

Define el sistema visual neumórfico (Soft UI) y la alternancia de temas claro y oscuro, asegurando consistencia táctil, contraste visual accesible y persistencia de preferencias de usuario.

## Requirements

### Requirement: Soporte para temas Claro y Oscuro con persistencia

El sistema DEBE (SHALL) proveer un tema Claro y un tema Oscuro aplicando estética neumórfica consistente, permitiendo al usuario alternar entre ambos y recordando su elección en visitas posteriores.

#### Scenario: Selección y alternancia de tema
- **WHEN** el usuario presiona el botón de cambio de tema en la interfaz
- **THEN** la aplicación conmuta inmediatamente todos los colores y sombras entre el tema Claro y el tema Oscuro, guardando la preferencia en el almacenamiento local.

#### Scenario: Detección automática inicial
- **WHEN** un usuario ingresa por primera vez sin una preferencia guardada
- **THEN** el sistema detecta la configuración del sistema operativo (`prefers-color-scheme`) y aplica el tema correspondiente.

### Requirement: Estilos neumórficos en componentes de interfaz

El sistema DEBE (SHALL) aplicar efectos de sombra dual neumórfica diferenciados para elementos elevados (convexa) y elementos hendidos o activos (cóncava).

#### Scenario: Elementos elevados en reposo
- **WHEN** se visualizan paneles, tarjetas de balance o botones en estado normal
- **THEN** se renderiza una sombra dual exterior (luz superior/izquierda y sombra inferior/derecha) que crea la sensación de relieve sobre la superficie base.

#### Scenario: Elementos cóncavos y estados activos
- **WHEN** se interactúa con un campo de texto o se selecciona una opción en un control segmentado
- **THEN** el elemento adopta sombras interiores (*inset shadow*) simulando una hendidura física en la superficie.

#### Scenario: Respuesta táctil en botones
- **WHEN** el usuario presiona un botón de acción
- **THEN** el estilo visual transiciona suavemente de una sombra elevada exterior a una sombra interior hundida.

### Requirement: Selector de fecha interactivo con estética neumórfica

El sistema DEBE (SHALL) proveer un componente de calendario interactivo para la selección de fechas en sustitución del selector nativo del sistema operativo, presentando una interfaz emergente con sombras duales neumórficas, navegación entre meses/años y selección táctil de días en concordancia con el tema activo (Claro u Oscuro).

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

El sistema DEBE (SHALL) presentar los controles de selección desplegable (`<select>`) y las listas de opciones con sombras hendidas interiores (*inset*) en su campo base y paneles de opciones con sombras exteriores suaves y relieve táctil coherente con el tema activo.

#### Scenario: Despliegue de opciones en selectores
- **WHEN** el usuario interactúa con un elemento de selección desplegable
- **THEN** el control mantiene su apariencia neumórfica con bordes suaves, flecha indicadora estilizada y contraste tipográfico adecuado tanto en tema Claro como en tema Oscuro.

