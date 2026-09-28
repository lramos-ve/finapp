## Purpose

Permite definir compromisos de pago recurrentes (gastos fijos) y da visibilidad anticipada de lo que hay que pagar cada período, acumulando el saldo no pagado sobre el período siguiente cuando un vencimiento se pasa sin pagar.

## ADDED Requirements

### Requirement: Definir un gasto fijo
El sistema SHALL permitir definir un gasto fijo con nombre, monto esperado, día de vencimiento, frecuencia (mensual como mínimo) y estado activo/inactivo.

#### Scenario: Crear un gasto fijo mensual
- **WHEN** el usuario define un gasto fijo "Arriendo" de $500 con vencimiento el día 5 de cada mes
- **THEN** el sistema guarda el gasto fijo como activo con frecuencia mensual

### Requirement: Generar instancia del período
Para cada gasto fijo activo, el sistema SHALL generar una instancia correspondiente al período actual (y al menos al siguiente) con estado `pendiente`, de modo que el usuario pueda ver con anticipación lo que debe pagar antes de que se cumpla el vencimiento.

#### Scenario: Instancia visible antes del vencimiento
- **WHEN** el gasto fijo "Arriendo" está activo y aún no ha llegado su día de vencimiento del mes
- **THEN** el sistema muestra una instancia `pendiente` para el período actual con el monto esperado

### Requirement: Registrar pago de una instancia
El sistema SHALL permitir registrar un pago (total o parcial) sobre una instancia de gasto fijo, con monto, moneda (`USD` o `VES`) y, si es en VES, tasa BCV para calcular su equivalente en USD. El pago SHALL reducir el saldo pendiente de esa instancia.

#### Scenario: Pago total en USD
- **WHEN** el usuario paga $500 en USD sobre una instancia con monto esperado de $500
- **THEN** el saldo pendiente de la instancia queda en $0 y su estado cambia a `pagado`

#### Scenario: Pago parcial en bolívares
- **WHEN** el usuario paga Bs. 20,000 con tasa BCV de 200 Bs/$ sobre una instancia con saldo pendiente de $500
- **THEN** el sistema calcula un equivalente de $100 y el saldo pendiente de la instancia queda en $400, con estado `pendiente`

### Requirement: Marcar instancia vencida
Cuando llega la fecha de vencimiento de una instancia y su saldo pendiente es mayor a $0, el sistema SHALL marcar esa instancia como `vencida`.

#### Scenario: Vencimiento sin pago
- **WHEN** llega el día 5 y la instancia "Arriendo" del período sigue con saldo pendiente de $500
- **THEN** el sistema marca esa instancia como `vencida`

### Requirement: Arrastrar saldo vencido al siguiente período
Al generar la instancia de un nuevo período para un gasto fijo, si la instancia del período anterior quedó `vencida` con saldo pendiente mayor a $0, el sistema SHALL sumar ese saldo pendiente al monto esperado de la nueva instancia.

#### Scenario: Arrastre de un mes no pagado
- **WHEN** la instancia de "Arriendo" de enero quedó vencida con saldo pendiente de $500 y se genera la instancia de febrero (monto esperado $500)
- **THEN** la instancia de febrero se genera con un monto esperado total de $1000 ($500 del período más $500 arrastrado)

#### Scenario: Sin arrastre cuando el período anterior fue pagado
- **WHEN** la instancia de "Arriendo" de enero fue pagada completamente y se genera la instancia de febrero
- **THEN** la instancia de febrero se genera únicamente con el monto esperado normal de $500, sin monto arrastrado

### Requirement: Desactivar un gasto fijo
El sistema SHALL permitir desactivar un gasto fijo, deteniendo la generación de nuevas instancias sin eliminar las instancias e historial ya generados.

#### Scenario: Desactivar un gasto fijo
- **WHEN** el usuario desactiva el gasto fijo "Streaming"
- **THEN** el sistema deja de generar nuevas instancias de ese gasto fijo a partir del siguiente período, conservando las instancias anteriores
