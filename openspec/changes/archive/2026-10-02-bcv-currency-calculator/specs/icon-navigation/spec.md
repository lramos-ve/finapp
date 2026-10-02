## ADDED Requirements

### Requirement: Botón de calculadora de divisas en la barra de navegación
El sistema SHALL incluir una opción de navegación para la sección "Calculadora" con su correspondiente icono vectorial SVG (`calculator`), accesible para lectores de pantalla mediante `aria-label` y con tooltip flotante de estética neumórfica.

#### Scenario: Acceso a la vista de la calculadora
- **WHEN** el usuario presiona el botón con icono de calculadora en la barra de navegación
- **THEN** la aplicación conmuta la vista activa a la pantalla de la calculadora de divisas oficial del BCV.
