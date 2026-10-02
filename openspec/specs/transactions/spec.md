# Transactions

## Purpose

Permite registrar y consultar movimientos puntuales de dinero (ingresos y gastos), en USD o en VES, dejando siempre un equivalente en USD estable en el tiempo para poder totalizar y comparar transacciones sin importar en qué moneda ocurrieron.

## Requirements

### Requirement: Registrar una transacción
El sistema SHALL permitir registrar una transacción con tipo (`ingreso` o `gasto`), monto, moneda (`USD` o `VES`), fecha y descripción opcional a través de una tarjeta emergente (pop-up modal) con estética neumórfica disparada por un botón de acción en la vista principal.

#### Scenario: Registro de un ingreso en USD
- **WHEN** el usuario registra un ingreso de $100 en USD
- **THEN** el sistema guarda la transacción con monto 100, moneda USD y equivalente en USD de 100

#### Scenario: Registro de un gasto en VES
- **WHEN** el usuario registra un gasto de Bs. 2,000 en VES
- **THEN** el sistema requiere una tasa BCV para completar el registro

#### Scenario: Apertura del formulario de registro como pop-up
- **WHEN** el usuario pulsa el botón de registro de movimiento en la vista de transacciones
- **THEN** se despliega una tarjeta emergente centrada con sombra dual neumórfica y fondo difuminado conteniendo los campos de captura.

#### Scenario: Cierre del pop-up de transacción
- **WHEN** el usuario pulsa el botón de cerrar (x), presiona Escape o pulsa fuera de la tarjeta emergente
- **THEN** el pop-up se cierra inmediatamente sin guardar datos no confirmados y regresa a la vista de balance.

### Requirement: Conversión a USD congelada al registrar
Cuando una transacción se registra en VES, el sistema SHALL solicitar la tasa BCV vigente (ingresada manualmente por el usuario) y calcular el monto equivalente en USD en el momento del registro. Ese equivalente SHALL quedar congelado y no SHALL recalcularse automáticamente aunque la tasa BCV cambie después.

#### Scenario: Cálculo del equivalente en USD
- **WHEN** el usuario registra un gasto de Bs. 2,000 con tasa BCV de 200 Bs/$
- **THEN** el sistema calcula y guarda un equivalente de $10.00 en USD para esa transacción

#### Scenario: El equivalente no cambia con tasas futuras
- **WHEN** ha pasado el tiempo y la tasa BCV actual es distinta a la tasa usada al registrar una transacción pasada
- **THEN** el equivalente en USD guardado en esa transacción permanece igual al calculado en el momento del registro

### Requirement: Transacción en USD no requiere tasa
Cuando una transacción se registra en USD, el sistema SHALL usar el monto ingresado directamente como equivalente en USD para propósitos de balance contable, pero SHALL cargar automáticamente la tasa oficial del dólar BCV y calcular reactivamente su monto equivalente en bolívares (VES), permitiendo al usuario ajustar la tasa y guardarla en el registro.

#### Scenario: Transacción en dólares
- **WHEN** el usuario registra un gasto de $25 en USD
- **THEN** el equivalente en USD de la transacción es 25 directamente para el balance, permitiendo además asociar la tasa BCV disponible.

#### Scenario: Transacción en dólares con tasa oficial
- **WHEN** el usuario selecciona la moneda USD e ingresa un monto de $50 teniendo una tasa BCV de 850 Bs/$
- **THEN** el sistema presenta de forma reactiva el equivalente aproximado de Bs. 42.500,00, permite refrescar o modificar la tasa BCV y guarda la tasa junto al registro manteniendo su equivalente base en USD de $50.00.

#### Scenario: Transacción en dólares sin tasa BCV disponible
- **WHEN** el usuario registra una transacción en USD sin conexión ni tasa en caché
- **THEN** el sistema permite registrar la transacción en USD con su equivalente en USD directamente sin bloquear el guardado.

### Requirement: Consultar balance de transacciones
El sistema SHALL permitir consultar el total de ingresos, el total de gastos y el balance resultante (ingresos menos gastos), expresados en USD, para un rango de fechas.

#### Scenario: Balance de un mes
- **WHEN** el usuario consulta el balance de un mes con ingresos por $500 equivalentes y gastos por $300 equivalentes
- **THEN** el sistema muestra un balance de $200 para ese mes

### Requirement: Listar y filtrar transacciones
El sistema SHALL permitir listar y filtrar las transacciones registradas por tipo (ingreso/gasto), moneda y rango de fechas o categoría dentro de la vista analítica del historial, mientras que la vista principal de transacciones SHALL mantenerse enfocada en el balance general y en el formulario de registro rápido.

#### Scenario: Filtrar gastos en bolívares
- **WHEN** el usuario filtra por tipo `gasto` y moneda `VES`
- **THEN** el sistema muestra solo las transacciones de gasto registradas en VES

#### Scenario: Vista principal simplificada de transacciones
- **WHEN** el usuario accede a la sección de transacciones
- **THEN** la interfaz muestra el balance consolidado y el formulario de ingreso/gasto sin la lista extensa inferior, facilitando la captura ágil en dispositivos móviles.

### Requirement: Actualizar una transacción existente
El sistema SHALL permitir al usuario modificar los datos de una transacción existente (tipo, monto, moneda, tasa BCV, fecha y descripción), recalculando de manera consistente el monto equivalente en USD y actualizando el balance general.

#### Scenario: Edición de monto y descripción de un gasto en USD
- **WHEN** el usuario edita una transacción en USD cambiando el monto de $20 a $25 y actualiza la descripción
- **THEN** el sistema guarda los nuevos valores, actualiza el equivalente en USD a 25 y refleja el cambio en el balance total.

#### Scenario: Edición de una transacción en VES con cambio de tasa
- **WHEN** el usuario modifica una transacción en bolívares ajustando el monto en VES y la tasa BCV aplicada
- **THEN** el sistema recalcula el nuevo equivalente en USD en base a los nuevos valores y lo congela en el registro.

### Requirement: Eliminar una transacción
El sistema SHALL permitir al usuario eliminar una transacción registrada, solicitando una confirmación previa para evitar borrados accidentales y recalculando inmediatamente el balance acumulado.

#### Scenario: Eliminación confirmada de una transacción
- **WHEN** el usuario pulsa eliminar en una transacción y confirma la acción en el diálogo de confirmación
- **THEN** el sistema remueve la transacción de la base de datos local y descuenta su impacto del balance total.

#### Scenario: Cancelación de la eliminación
- **WHEN** el usuario pulsa eliminar pero cancela el diálogo de confirmación
- **THEN** la transacción se conserva sin alteraciones y el balance permanece intacto.

### Requirement: Categorizar transacciones
El sistema SHALL permitir asignar una categoría (seleccionada de una lista común predefinida o escrita de forma personalizada) a cualquier transacción al registrarla o editarla. La categoría es opcional (con valor predeterminado si no se especifica).

#### Scenario: Registrar transacción con categoría predefinida
- **WHEN** el usuario registra un gasto de $15 seleccionando la categoría "Comida"
- **THEN** la transacción se guarda con la propiedad de categoría establecida en "Comida" y se visualiza su etiqueta en la lista.

#### Scenario: Registrar o editar transacción con categoría personalizada
- **WHEN** el usuario registra o edita una transacción indicando una categoría escrita libremente como "Mascotas"
- **THEN** el sistema guarda la transacción con la categoría "Mascotas" y dicha categoría queda disponible para futuras selecciones.

### Requirement: Filtrar transacciones por categoría
El sistema SHALL permitir filtrar el listado de transacciones por una categoría específica además de los filtros existentes de tipo y moneda.

#### Scenario: Filtrar transacciones por categoría
- **WHEN** el usuario selecciona la categoría "Servicios" en los filtros de la lista de transacciones
- **THEN** el sistema muestra únicamente las transacciones pertenecientes a la categoría "Servicios".

### Requirement: Visualización del contravalor en bolívares en el listado
El sistema SHALL mostrar en el listado de transacciones el valor original en dólares ($) y su contraparte equivalente calculada en bolívares (VES) a la tasa BCV registrada en cada transacción en USD que cuente con dicha tasa.

#### Scenario: Transacción en USD con equivalente en bolívares en la lista
- **WHEN** una transacción en USD registrada con monto de $20 y tasa BCV de 850 Bs/$ se despliega en el listado
- **THEN** el elemento de la lista muestra "$20.00 (≈ Bs. 17.000,00 a tasa 850)" junto con el impacto contable en USD (+$20.00 o -$20.00).

#### Scenario: Transacción histórica en USD sin tasa BCV
- **WHEN** una transacción histórica en USD sin tasa BCV asociada se despliega en el listado
- **THEN** el elemento de la lista muestra "$20.00" sin información de tasa ni error, preservando la compatibilidad retroactiva.



