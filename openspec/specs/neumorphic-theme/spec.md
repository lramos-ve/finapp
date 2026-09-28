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
