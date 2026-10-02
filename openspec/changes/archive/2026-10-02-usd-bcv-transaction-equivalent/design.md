## Context

Actualmente `src/modules/shared/services/money.js` y `TransactionForm.svelte` manejan la tasa BCV únicamente cuando `moneda === 'VES'`. Para `moneda === 'USD'`, el formulario oculta el campo de tasa y la función `calcularMovimientoDeDinero` omite cualquier propiedad `tasaBCV`.
El usuario ha seleccionado explícitamente:
1. Ver el equivalente en tiempo real en el formulario y persistir la tasa BCV en el registro para ver también el contravalor en la lista de transacciones.
2. Cargar automáticamente la tasa oficial del BCV en segundo plano tanto para USD como para VES, manteniendo el campo editable y con botón de actualización.

## Goals / Non-Goals

**Goals:**
- Cargar automáticamente la tasa oficial del dólar BCV al seleccionar la moneda USD.
- Permitir editar manualmente o refrescar en línea la tasa BCV también para USD.
- Mostrar una vista previa reactiva clara del contravalor en bolívares en el formulario (`≈ Bs. X.XX a tasa Y`).
- Almacenar opcionalmente `tasaBCV` en registros de transacción en USD dentro de IndexedDB.
- Mostrar el contravalor en bolívares en `TransactionList` para transacciones en USD que contengan tasa BCV.
- Mantener 100% intacta la base del balance contable general expresada en USD (`montoUSD`).
- Conservar retrocompatibilidad con registros existentes que no tengan `tasaBCV`.

**Non-Goals:**
- Hacer obligatoria la tasa BCV en USD si el usuario no tiene conexión ni caché (debe permitir guardar en USD directamente).
- Modificar el comportamiento de deudas o gastos fijos en este cambio específico.

## Decisions

### 1. Extensión de `calcularMovimientoDeDinero` en `money.js`
- **Decisión:** Si `moneda === 'USD'` y se suministra una `tasaBCV` numérica válida (> 0), retornar `{ monto, moneda, montoUSD: monto, tasaBCV: Number(tasaBCV) }`. Si no se suministra tasa, retornar `{ monto, moneda, montoUSD: monto }`.
- **Alternativa considerada:** Almacenar un campo separado `montoVES` en el registro. **Descartada** porque almacenar la tasa mantiene la consistencia con el modelo existente en VES (donde se guarda `monto`, `moneda`, `tasaBCV` y `montoUSD`).

### 2. Campo de tasa y cálculo reactivo en `TransactionForm`
- **Decisión:** Mostrar el bloque de "Tasa BCV" tanto para `VES` como para `USD`. Al seleccionar cualquiera de las dos, si no hay tasa en el estado local, se lee de la caché `obtenerUltimaTasaEnCache()` o se invoca `actualizarTasaBCV()`.
- **Vista previa reactiva:** Se renderiza una insignia o texto neumórfico con el equivalente dinámico:
  - En USD: `≈ Bs. (monto * tasaBCV)`
  - En VES: `≈ $ (monto / tasaBCV)`
- **Validación flexible:** Para USD, el campo de tasa no será estrictamente `required` en HTML para evitar bloqueos si no hay internet ni caché, aunque por defecto estará poblado con la tasa BCV del día.

### 3. Presentación enriquecida en `TransactionList`
- **Decisión:** En el elemento `<span class="monto-original">`:
  - Si es `VES`: `Bs. ${t.monto.toFixed(2)} (tasa ${t.tasaBCV})`
  - Si es `USD` con `t.tasaBCV`: `${t.monto.toFixed(2)} (≈ Bs. ${(t.monto * t.tasaBCV).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
  - Si es `USD` sin tasa: `${t.monto.toFixed(2)}`

## Risks / Trade-offs

- **[Riesgo]** Confusión en usuarios que ingresan en USD y no desean asociar tasa:
  - **Mitigación:** La tasa se precarga sutilmente y no bloquea el guardado; el balance sigue rigiéndose por el monto neto en USD.
- **[Riesgo]** Registros previos en IndexedDB sin `tasaBCV`:
  - **Mitigación:** Manejo condicional defensivo en la lista y lógica de edición.
