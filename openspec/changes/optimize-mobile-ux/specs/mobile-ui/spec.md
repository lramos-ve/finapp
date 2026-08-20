## Purpose

Define cómo se presenta e interactúa la app en pantallas de teléfono: navegación alcanzable con el pulgar, controles con área táctil suficiente y formularios/listas que se adaptan a viewports estrechos sin perder usabilidad ni generar zoom o scroll horizontal no deseados.

## ADDED Requirements

### Requirement: Navegación entre vistas alcanzable con el pulgar
En viewports de ancho igual o menor a 480px, el sistema SHALL ubicar la navegación principal entre "Transacciones", "Deudas" y "Gastos fijos" fija en la parte inferior de la pantalla, de forma que sea alcanzable con el pulgar sin requerir que el usuario cambie el agarre del teléfono. En viewports de ancho mayor a 480px, la navegación SHALL mantenerse en la parte superior.

#### Scenario: Navegación en viewport de teléfono
- **WHEN** el usuario abre la app en un viewport de 375px de ancho
- **THEN** la navegación entre "Transacciones", "Deudas" y "Gastos fijos" se muestra fija en la parte inferior de la pantalla

#### Scenario: Navegación en viewport de escritorio
- **WHEN** el usuario abre la app en un viewport de 1024px de ancho
- **THEN** la navegación entre vistas se muestra en la parte superior de la pantalla

### Requirement: Tamaño mínimo de controles táctiles
El sistema SHALL asegurar que todo control interactivo (botones de navegación entre vistas, botones de envío de formulario, y cualquier elemento de lista o tarjeta que responda a un toque) tenga un área táctil de al menos 44x44px CSS.

#### Scenario: Botón de navegación
- **WHEN** se mide el área táctil de un botón de navegación entre vistas
- **THEN** su alto y ancho son de al menos 44px cada uno

#### Scenario: Botón de envío de formulario
- **WHEN** se mide el área táctil del botón de envío de un formulario de registrar transacción, agregar deuda, registrar abono, crear gasto fijo o registrar pago
- **THEN** su alto es de al menos 44px

### Requirement: Formularios de una sola columna en pantallas estrechas
En viewports de ancho igual o menor a 480px, el sistema SHALL presentar los formularios de las tres vistas (transacciones, deudas, gastos fijos) en una sola columna, con cada campo y el botón de envío ocupando el ancho completo disponible del formulario.

#### Scenario: Formulario de registrar transacción en teléfono
- **WHEN** el usuario abre el formulario de registrar transacción en un viewport de 375px de ancho
- **THEN** los campos del formulario y el botón de envío se apilan verticalmente, cada uno ocupando el ancho completo del formulario

### Requirement: Campos de formulario sin zoom automático al enfocar
El sistema SHALL definir los campos de entrada de texto y numéricos con un tamaño de fuente de al menos 16px, de forma que los navegadores móviles no apliquen zoom automático al viewport al enfocarlos.

#### Scenario: Enfocar el campo de monto en un teléfono
- **WHEN** el usuario toca el campo de monto de un formulario en un navegador móvil
- **THEN** el nivel de zoom del viewport no cambia al enfocar el campo

### Requirement: Sin desbordamiento horizontal en anchos de teléfono comunes
El sistema SHALL renderizar cada una de las tres vistas (transacciones, deudas, gastos fijos) sin generar scroll horizontal en viewports de ancho entre 320px y 480px.

#### Scenario: Vista de deudas en un viewport angosto
- **WHEN** el usuario abre la vista de deudas en un viewport de 320px de ancho
- **THEN** no aparece scroll horizontal y todo el contenido es accesible desplazando solo verticalmente
