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

El sistema SHALL presentar los controles de selección desplegable y autocompletado mediante componentes emergentes con relieve neumórfico en lugar de utilizar menús emergentes nativos del sistema operativo. Los campos base deben presentar sombras hendidas interiores (*inset*) y los paneles emergentes de opciones deben presentar superficies elevadas con sombra dual exterior suave, relieve táctil, navegación accesible y soporte para temas Claro y Oscuro.

#### Scenario: Despliegue de opciones en selectores
- **WHEN** el usuario interactúa con un elemento de selección desplegable o de categoría
- **THEN** se despliega un panel emergente neumórfico con la lista de opciones disponibles, resaltando la opción enfocada o activa con acabado táctil neumórfico tanto en tema Claro como en tema Oscuro.

#### Scenario: Selección de una opción
- **WHEN** el usuario pulsa una opción dentro del menú desplegable o presiona Enter sobre una opción enfocada
- **THEN** el valor correspondiente se asigna al campo, el panel emergente se cierra de inmediato y se actualiza el estado de la aplicación.

#### Scenario: Autocompletado y valor personalizado en combobox
- **WHEN** el control está configurado en modo editable (ej. categorías en transacciones) y el usuario escribe un texto libre que no coincide exactamente con las sugerencias
- **THEN** el sistema permite escribir el nuevo valor personalizado, filtra dinámicamente las sugerencias en el menú neumórfico desplegado y permite asignar tanto una opción sugerida como el texto escrito libremente.

#### Scenario: Cierre del menú desplegable por interacción externa o teclado
- **WHEN** el menú desplegable se encuentra abierto y el usuario hace clic fuera del contenedor o presiona la tecla Escape
- **THEN** el menú emergente se cierra automáticamente manteniendo el valor actual sin alteraciones no deseadas.


