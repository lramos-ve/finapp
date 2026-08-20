## Purpose

Permite registrar y consultar movimientos puntuales de dinero (ingresos y gastos), en USD o en VES, dejando siempre un equivalente en USD estable en el tiempo para poder totalizar y comparar transacciones sin importar en qué moneda ocurrieron.

## ADDED Requirements

### Requirement: Registrar una transacción
El sistema SHALL permitir registrar una transacción con tipo (`ingreso` o `gasto`), monto, moneda (`USD` o `VES`), fecha y descripción opcional.

#### Scenario: Registro de un ingreso en USD
- **WHEN** el usuario registra un ingreso de $100 en USD
- **THEN** el sistema guarda la transacción con monto 100, moneda USD y equivalente en USD de 100

#### Scenario: Registro de un gasto en VES
- **WHEN** el usuario registra un gasto de Bs. 2,000 en VES
- **THEN** el sistema requiere una tasa BCV para completar el registro

### Requirement: Conversión a USD congelada al registrar
Cuando una transacción se registra en VES, el sistema SHALL solicitar la tasa BCV vigente (ingresada manualmente por el usuario) y calcular el monto equivalente en USD en el momento del registro. Ese equivalente SHALL quedar congelado y no SHALL recalcularse automáticamente aunque la tasa BCV cambie después.

#### Scenario: Cálculo del equivalente en USD
- **WHEN** el usuario registra un gasto de Bs. 2,000 con tasa BCV de 200 Bs/$
- **THEN** el sistema calcula y guarda un equivalente de $10.00 en USD para esa transacción

#### Scenario: El equivalente no cambia con tasas futuras
- **WHEN** ha pasado el tiempo y la tasa BCV actual es distinta a la tasa usada al registrar una transacción pasada
- **THEN** el equivalente en USD guardado en esa transacción permanece igual al calculado en el momento del registro

### Requirement: Transacción en USD no requiere tasa
Cuando una transacción se registra en USD, el sistema SHALL usar el monto ingresado directamente como equivalente en USD, sin solicitar tasa BCV.

#### Scenario: Transacción en dólares
- **WHEN** el usuario registra un gasto de $25 en USD
- **THEN** el equivalente en USD de la transacción es 25, sin campo de tasa

### Requirement: Consultar balance de transacciones
El sistema SHALL permitir consultar el total de ingresos, el total de gastos y el balance resultante (ingresos menos gastos), expresados en USD, para un rango de fechas.

#### Scenario: Balance de un mes
- **WHEN** el usuario consulta el balance de un mes con ingresos por $500 equivalentes y gastos por $300 equivalentes
- **THEN** el sistema muestra un balance de $200 para ese mes

### Requirement: Listar y filtrar transacciones
El sistema SHALL permitir listar las transacciones registradas y filtrarlas por tipo (ingreso/gasto), moneda y rango de fechas.

#### Scenario: Filtrar gastos en bolívares
- **WHEN** el usuario filtra por tipo `gasto` y moneda `VES`
- **THEN** el sistema muestra solo las transacciones de gasto registradas en VES
