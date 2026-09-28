# Icon Navigation

## Purpose

Proporciona una barra de navegación y controles de encabezado basados exclusivamente en iconos vectoriales SVG minimalistas con tooltips informativos de estética neumórfica y accesibilidad completa.

## Requirements

### Requirement: Navegación principal mediante iconos vectoriales
El sistema SHALL presentar cada una de las opciones de navegación principal ("Transacciones", "Deudas", "Gastos fijos", "Respaldo") utilizando iconos vectoriales SVG representativos sin texto visible por defecto dentro del botón, manteniendo un área de interacción táctil accesible.

#### Scenario: Visualización de botones de navegación
- **WHEN** el usuario carga la aplicación en cualquier dispositivo
- **THEN** la barra de navegación muestra cuatro botones con iconos vectoriales correspondientes a cada sección (flujo/flechas, balanza/deudas, calendario/gastos y disco/respaldo) sin etiquetas de texto fijas.

#### Scenario: Accesibilidad para lectores de pantalla
- **WHEN** un software lector de pantalla inspecciona cualquiera de los botones de navegación
- **THEN** el sistema expone una etiqueta accesible (`aria-label`) con el nombre completo y legible de la sección destino.

### Requirement: Tooltips contextuales de estilo neumórfico
El sistema SHALL mostrar un tooltip flotante con el nombre de la vista al interactuar con el botón mediante puntero de ratón o navegación por teclado.

#### Scenario: Tooltip en estado hover
- **WHEN** el usuario sitúa el cursor sobre un botón de navegación
- **THEN** aparece un tooltip flotante con fondo acorde al tema y sombra suave neumórfica indicando el nombre de la vista.

#### Scenario: Tooltip al enfocar con teclado
- **WHEN** el usuario navega con la tecla Tab y enfoca un botón de navegación
- **THEN** el tooltip correspondiente se hace visible automáticamente mientras el foco permanezca en dicho botón.

### Requirement: Selector de tema con icono vectorial interactivo
El sistema SHALL representar el estado y acción del botón de cambio de tema en el encabezado mediante iconos vectoriales SVG (sol y luna) en sustitución de emojis de texto.

#### Scenario: Icono de sol en modo oscuro
- **WHEN** la aplicación se encuentra en modo oscuro
- **THEN** el botón de cambio de tema renderiza un icono vectorial SVG de sol para indicar el cambio hacia modo claro.

#### Scenario: Icono de luna en modo claro
- **WHEN** la aplicación se encuentra en modo claro
- **THEN** el botón de cambio de tema renderiza un icono vectorial SVG de luna para indicar el cambio hacia modo oscuro.
