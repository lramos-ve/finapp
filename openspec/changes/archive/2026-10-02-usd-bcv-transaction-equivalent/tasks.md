## 1. Lógica de cálculo y modelos de datos

- [x] 1.1 Modificar `src/modules/shared/services/money.js` para admitir y preservar `tasaBCV` opcional en transacciones `USD` retornando `{ monto, moneda, montoUSD: monto, tasaBCV }`.
- [x] 1.2 Actualizar `src/modules/transacciones/logic/transactions.js` para persistir `tasaBCV` opcional en registros y actualizaciones de transacciones en `USD`.
- [x] 1.3 Agregar pruebas unitarias en `src/test/transactions.test.js` para validar el registro y actualización de transacciones en USD con y sin tasa BCV.

## 2. Formulario y visualización reactiva

- [x] 2.1 Actualizar `src/modules/transacciones/components/TransactionForm.svelte` para cargar automáticamente la tasa BCV oficial al seleccionar `USD` o al montar el componente.
- [x] 2.2 Incorporar campo de tasa BCV y vista previa interactiva en tiempo real del contravalor en bolívares (`≈ Bs. X.XX a tasa Y`) en el formulario de transacciones.
- [x] 2.3 Actualizar `src/modules/transacciones/components/TransactionList.svelte` para desplegar el contravalor aproximado en bolívares en transacciones en USD que contengan tasa BCV.

## 3. Verificación

- [x] 3.1 Ejecutar suite completa de pruebas unitarias con `npm test` y verificar que el 100% de los casos pasen sin errores.
- [x] 3.2 Verificar visualmente con Puppeteer la interacción en el formulario, el cálculo reactivo del equivalente en bolívares y el despliegue en la lista de transacciones.
