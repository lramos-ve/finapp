## MODIFIED Requirements

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
