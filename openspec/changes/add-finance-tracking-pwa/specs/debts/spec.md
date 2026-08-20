## Purpose

Da seguimiento al dinero que el usuario debe a otras personas y al dinero que otras personas le deben a él, siempre denominado en USD, permitiendo saldarlas mediante uno o varios pagos parciales (abonos) en USD o en VES.

## ADDED Requirements

### Requirement: Registrar una deuda
El sistema SHALL permitir registrar una deuda con persona, dirección (`debo` o `me_deben`), monto original en USD y fecha. El saldo pendiente inicial SHALL ser igual al monto original.

#### Scenario: Registrar que se debe dinero
- **WHEN** el usuario registra una deuda con dirección `debo`, persona "Juan" y monto $50
- **THEN** el sistema guarda la deuda con saldo pendiente de $50 y estado `pendiente`

#### Scenario: Registrar dinero prestado
- **WHEN** el usuario registra una deuda con dirección `me_deben`, persona "Ana" y monto $30
- **THEN** el sistema guarda la deuda con saldo pendiente de $30 y estado `pendiente`

### Requirement: Registrar un abono a una deuda
El sistema SHALL permitir registrar un abono a una deuda pendiente, con monto, moneda (`USD` o `VES`) y, si es en VES, tasa BCV para calcular su equivalente en USD. El abono SHALL reducir el saldo pendiente de la deuda en el monto de su equivalente en USD.

#### Scenario: Abono parcial en dólares
- **WHEN** el usuario abona $20 en USD a una deuda con saldo pendiente de $50
- **THEN** el saldo pendiente de la deuda queda en $30

#### Scenario: Abono en bolívares
- **WHEN** el usuario abona Bs. 2,000 con tasa BCV de 200 Bs/$ a una deuda con saldo pendiente de $50
- **THEN** el sistema calcula un equivalente de $10 y el saldo pendiente de la deuda queda en $40

### Requirement: No permitir abonos que excedan el saldo pendiente
El sistema SHALL rechazar un abono cuyo equivalente en USD sea mayor al saldo pendiente actual de la deuda.

#### Scenario: Abono mayor al saldo pendiente
- **WHEN** el usuario intenta abonar $60 a una deuda con saldo pendiente de $50
- **THEN** el sistema rechaza el abono e indica que excede el saldo pendiente

### Requirement: Marcar una deuda como pagada
Cuando el saldo pendiente de una deuda llega a $0 tras un abono, el sistema SHALL marcar automáticamente esa deuda con estado `pagada`.

#### Scenario: Último abono salda la deuda
- **WHEN** el usuario abona $30 a una deuda con saldo pendiente de $30
- **THEN** el saldo pendiente queda en $0 y el estado de la deuda cambia a `pagada`

### Requirement: Consultar deudas por dirección
El sistema SHALL permitir consultar el total pendiente de deudas agrupado por dirección (`debo` y `me_deben`) de forma separada.

#### Scenario: Totales separados
- **WHEN** el usuario tiene deudas pendientes por $50 en dirección `debo` y $30 en dirección `me_deben`
- **THEN** el sistema muestra ambos totales por separado, sin combinarlos en una sola cifra
