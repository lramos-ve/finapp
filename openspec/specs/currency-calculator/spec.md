# Currency Calculator Specification

## Purpose

Permite a los usuarios calcular y convertir de manera interactiva y bidireccional montos monetarios entre Dólar (USD), Euro (EUR) y Bolívar (VES) utilizando exclusivamente las cotizaciones oficiales emitidas por el Banco Central de Venezuela (BCV).

## Requirements

### Requirement: Conversión bidireccional de divisas oficial BCV
El sistema SHALL permitir al usuario ingresar una cantidad en cualquiera de las tres monedas soportadas (USD, EUR o VES) y SHALL calcular instantáneamente los valores equivalentes en las otras dos monedas utilizando las tasas oficiales del BCV.

#### Scenario: Conversión desde USD
- **WHEN** el usuario ingresa un monto en USD teniendo tasas BCV vigentes de 857.00 VES/USD y 976.90 VES/EUR
- **THEN** el sistema calcula y muestra el equivalente en VES multiplicando por la tasa del dólar, y el equivalente en EUR dividiendo el total en VES entre la tasa del euro.

#### Scenario: Conversión desde EUR
- **WHEN** el usuario ingresa un monto en EUR
- **THEN** el sistema calcula y muestra el equivalente en VES multiplicando por la tasa del euro, y el equivalente en USD dividiendo el total en VES entre la tasa del dólar.

#### Scenario: Conversión desde VES
- **WHEN** el usuario ingresa un monto en VES
- **THEN** el sistema calcula y muestra el equivalente en USD dividiendo entre la tasa del dólar, y el equivalente en EUR dividiendo entre la tasa del euro.

### Requirement: Presentación de cotizaciones oficiales del BCV
El sistema SHALL mostrar tarjetas visuales destacadas con las tasas oficiales vigentes del Dólar (USD) y del Euro (EUR) en VES, indicando la fecha/hora de la cotización oficial y un botón para forzar la actualización en tiempo real desde la API del BCV.

#### Scenario: Visualización de tasas en pantalla
- **WHEN** el usuario accede a la vista de la calculadora
- **THEN** se presentan las cotizaciones oficiales de USD y EUR en bolívares, junto con el estado de sincronización (en línea o desde caché local).

### Requirement: Exclusión estricta de mercados no oficiales
El sistema SHALL restringir las fuentes de cálculo exclusivamente a las tasas oficiales del Banco Central de Venezuela, prohibiendo cotizaciones paralelas o criptoactivos (USDT).

#### Scenario: Verificación de fuentes oficiales
- **WHEN** el sistema realiza conversiones o despliega información de tasas
- **THEN** únicamente se procesan las cotizaciones originadas en el Banco Central de Venezuela.
