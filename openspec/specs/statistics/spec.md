# Statistics

## Purpose

Proporciona análisis y visualización de la distribución del gasto por categoría, la evolución histórica de ingresos frente a gastos y métricas de ahorro para facilitar la comprensión de las finanzas personales.

## Requirements

### Requirement: Desglose de gastos por categoría
El sistema SHALL calcular el total de gastos agrupados por categoría y su porcentaje representativo respecto al total de gastos para un período de tiempo seleccionado.

#### Scenario: Cálculo de distribución por categorías
- **WHEN** el usuario consulta las estadísticas de un período con gastos en "Alimentación" ($60) y "Servicios" ($40) de un total de $100
- **THEN** el sistema calcula que "Alimentación" representa el 60% ($60.00) y "Servicios" el 40% ($40.00) y los representa en el gráfico de dona.

#### Scenario: Período sin gastos registrados
- **WHEN** el usuario consulta un período en el que no existen gastos
- **THEN** el sistema muestra un estado amigable indicando que no hay gastos para graficar en ese período.

### Requirement: Comparativa mensual histórica de ingresos y gastos
El sistema SHALL totalizar los ingresos y los gastos expresados en USD para cada mes de los últimos meses disponibles y presentarlos en un gráfico comparativo de barras.

#### Scenario: Visualización de ingresos vs gastos en barras
- **WHEN** existen transacciones en múltiples meses
- **THEN** el sistema genera una serie mensual con barras diferenciadas para el total de ingresos y el total de gastos de cada mes.

### Requirement: Indicador de tasa y monto de ahorro
El sistema SHALL calcular el ahorro neto (ingresos menos gastos) y la tasa de ahorro porcentual `(ahorro / ingresos) * 100` para el período seleccionado.

#### Scenario: Cálculo de ahorro positivo
- **WHEN** el usuario tiene $1,000 en ingresos y $700 en gastos en el período
- **THEN** el sistema muestra un ahorro neto de $300.00 y una tasa de ahorro del 30%.

#### Scenario: Período con balance negativo o sin ingresos
- **WHEN** los gastos superan los ingresos o los ingresos son 0
- **THEN** el sistema muestra la tasa de ahorro en 0% indicando déficit o ausencia de ahorro en el período.

### Requirement: Historial detallado de transacciones en tarjeta desplegable

El sistema SHALL presentar en el módulo de estadísticas una tarjeta interactiva colapsable con diseño neumórfico que contenga el historial de transacciones correspondientes al período analizado, permitiendo expandir o contraer su visualización mediante un botón con relieve y flecha indicadora.

#### Scenario: Visualización colapsada por defecto con contador
- **WHEN** el usuario ingresa al módulo de estadísticas
- **THEN** la tarjeta de historial se muestra con su cabecera visible indicando la cantidad de transacciones registradas en el período seleccionado y el estado contraído.

#### Scenario: Despliegue de la tarjeta del historial
- **WHEN** el usuario pulsa sobre la cabecera o botón de la tarjeta colapsable
- **THEN** la tarjeta se expande con una transición suave mostrando el listado de transacciones con sus respectivos filtros (tipo, moneda, categoría).

#### Scenario: Edición o eliminación desde la tarjeta del historial
- **WHEN** el usuario modifica o elimina una transacción desde el listado dentro de la tarjeta desplegable
- **THEN** el sistema procesa la acción y actualiza inmediatamente las métricas analíticas, los gráficos y el contador del período en la vista de estadísticas.

