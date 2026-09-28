# Backup Restore

## Purpose

Permite a los usuarios exportar de forma segura la totalidad de sus datos financieros a un archivo descargable (con o sin cifrado por contraseña) e importarlos posteriormente para restaurar su información en cualquier momento o dispositivo.

## Requirements

### Requirement: Exportar base de datos a archivo JSON

El sistema DEBE (SHALL) permitir exportar todos los datos almacenados en IndexedDB (`transacciones`, `deudas`, `abonos`, `gastosFijos`, `instanciasGastoFijo` y `pagosGastoFijo`) en un archivo JSON descargable con metadatos de versión y fecha de creación.

#### Scenario: Exportación exitosa sin contraseña
- **WHEN** el usuario solicita exportar los datos sin ingresar contraseña
- **THEN** el sistema genera y descarga un archivo `.json` legible con la estructura completa de las tablas y metadatos de la aplicación.

#### Scenario: Exportación exitosa con contraseña cifrada
- **WHEN** el usuario proporciona una contraseña para la exportación
- **THEN** el sistema cifra los datos serializados usando AES-GCM (derivación PBKDF2) y descarga un archivo `.json` que contiene únicamente el payload cifrado, la sal (salt), el vector de inicialización (IV) y los metadatos de cifrado.

### Requirement: Importar y restaurar base de datos desde archivo

El sistema DEBE (SHALL) permitir cargar un archivo de respaldo previamente exportado, validar su estructura/integridad y restaurar los datos en IndexedDB.

#### Scenario: Restauración exitosa de respaldo no cifrado
- **WHEN** el usuario selecciona un archivo de respaldo JSON válido sin cifrado
- **THEN** el sistema reemplaza los datos actuales de la base de datos con los registros del respaldo y actualiza la vista activa.

#### Scenario: Restauración exitosa de respaldo cifrado con contraseña correcta
- **WHEN** el usuario carga un archivo de respaldo cifrado e ingresa la contraseña correcta
- **THEN** el sistema descifra el contenido, valida el formato y restaura todas las tablas en IndexedDB.

#### Scenario: Error al descifrar por contraseña incorrecta
- **WHEN** el usuario ingresa una contraseña incorrecta para un archivo cifrado
- **THEN** el sistema falla de forma segura sin modificar la base de datos actual y notifica un mensaje de error legible al usuario.

#### Scenario: Error por archivo de respaldo corrupto o incompatible
- **WHEN** el usuario intenta importar un archivo que no cumple con el esquema esperado o no es un JSON válido
- **THEN** el sistema rechaza la importación sin alterar los datos existentes y muestra un mensaje de advertencia.

### Requirement: Interfaz de usuario para gestión de respaldos

El sistema DEBE (SHALL) proveer una sección accesible en la interfaz gráfica para realizar las acciones de exportación e importación con retroalimentación visual inmediata.

#### Scenario: Acceso a la vista de respaldo
- **WHEN** el usuario navega a la sección de Respaldo / Ajustes
- **THEN** la interfaz muestra los controles claros para exportar (con campo opcional de contraseña) e importar archivos de respaldo.

#### Scenario: Confirmación previa a la sobreescritura
- **WHEN** el usuario procede a importar un respaldo sobre una base de datos existente
- **THEN** la interfaz solicita confirmación explícita advirtiendo que los datos actuales serán reemplazados por los del respaldo.
