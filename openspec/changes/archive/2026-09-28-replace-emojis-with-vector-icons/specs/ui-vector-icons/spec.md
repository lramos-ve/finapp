## Purpose

Define el estándar de iconografía vectorial SVG para toda la interfaz gráfica de usuario, eliminando la dependencia de glifos de emojis del sistema operativo y garantizando adaptabilidad cromática y visual según el tema activo.

## ADDED Requirements

### Requirement: Sustitución completa de emojis por iconos vectoriales SVG
El sistema SHALL presentar todos los elementos visuales de identidad, estados informativos, niveles de cifrado, alertas de confirmación y controles de acción mediante iconos vectoriales SVG limpios, eliminando el uso de caracteres emoji del sistema operativo.

#### Scenario: Visualización del logotipo en el encabezado
- **WHEN** el usuario visualiza el encabezado principal de la aplicación
- **THEN** junto al título "FinApp" se muestra un icono vectorial SVG representativo en lugar del emoji de dinero.

#### Scenario: Indicadores de estado y cifrado en la vista de respaldo
- **WHEN** el usuario examina las secciones de exportación, importación o advertencias de sobreescritura
- **THEN** los elementos gráficos de archivo cifrado, archivo plano, notas informativas y advertencias se renderizan como iconos vectoriales SVG consistentes.

#### Scenario: Controles y estados en el modal de sincronización P2P
- **WHEN** el usuario abre e interactúa con el modal de sincronización directa
- **THEN** los botones de acción (enviar, recibir, cerrar), indicadores de progreso, confirmaciones y advertencias se visualizan mediante iconos vectoriales SVG.

### Requirement: Adaptabilidad cromática de la iconografía
El sistema SHALL asegurar que todos los iconos vectoriales respondan de manera coherente a la paleta de colores del tema activo (claro u oscuro), heredando el color del texto o aplicando los colores de énfasis semántico correspondientes (acento, éxito, advertencia o peligro).

#### Scenario: Iconos en modo claro
- **WHEN** la aplicación está configurada en modo claro
- **THEN** los iconos vectoriales adoptan los contrastes y tonalidades correspondientes a la superficie clara.

#### Scenario: Iconos en modo oscuro
- **WHEN** la aplicación está configurada en modo oscuro
- **THEN** los iconos vectoriales adoptan los contrastes y tonalidades correspondientes a la superficie oscura.
