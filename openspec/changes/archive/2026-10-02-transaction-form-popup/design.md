## Context

Ver `proposal.md` para la motivación. Con el historial de transacciones trasladado al módulo de estadísticas, la pantalla principal de transacciones (`TransactionsView.svelte`) puede beneficiarse enormemente de un diseño minimalista donde el balance sea el centro de atención y el registro de nuevos movimientos se active mediante un pop-up modal neumórfico interactivo y elegante.

## Goals / Non-Goals

**Goals:**
- Crear un disparador neumórfico destacado en `TransactionsView.svelte` (ej. botón de acción "+ Nueva Transacción") que abra el modal emergente.
- Renderizar `TransactionForm` dentro de un pop-up con backdrop desenfocado (`backdrop-filter: blur(4px)`), tarjeta elevada con sombras neumórficas, animación de entrada `aparecerPop` y botón de cierre en la cabecera.
- Soportar el cierre del pop-up mediante el botón (x), la tecla `Escape`, clic en el fondo difuminado o automáticamente tras un registro exitoso.
- Mantener la compatibilidad en `StatisticsView.svelte` donde el formulario se puede usar para editar transacciones.

**Non-Goals:**
- No se alterarán los campos ni las reglas de validación y cálculo de transacciones (monto, moneda, fecha, tasa BCV, categoría).

## Decisions

### 1. Estructura y Estilos del Modal Pop-up Neumórfico
- **Decisión**: Crear clases utilitarias en `src/app.css` para modales neumórficos:
  - `.modal-backdrop`: Fijo en pantalla (`position: fixed; inset: 0; z-index: 100;`), centrado con flexbox, fondo semitransparente con desenfoque suave.
  - `.modal-neumorphic`: Tarjeta centrada con ancho máximo de 460px (92vw en móviles), `border-radius: 20px`, `background: var(--bg)`, sombras neumórficas de gran elevación y padding adecuado.
  - Botón de cierre superior con icono `x`, estilo táctil neumórfico.
- **Razón**: Mantiene coherencia con el estilo Soft UI neumórfico existente, asegurando que el pop-up se sienta como una superficie física suspendida.

### 2. Disparador en `TransactionsView.svelte`
- **Decisión**: Colocar un botón de acción principal ("+ Registrar Transacción") debajo de las tarjetas de balance con sombra elevada y relieve neumórfico táctil.
- **Razón**: Guía al usuario de manera intuitiva a registrar un gasto o ingreso cuando lo desee, dejando la vista despejada el resto del tiempo.

### 3. Cierre Automático tras Guardar
- **Decisión**: Cuando el usuario confirma el registro de una transacción, se invoca `manejarGuardar(datos)`, se actualiza el balance y se cierra el pop-up inmediatamente.
- **Razón**: Proporciona un ciclo de interacción fluido, retornando al usuario a la vista de balance actualizado.

## Risks / Trade-offs

- **[Riesgo] Interferencia de scroll del fondo cuando el modal está abierto** → **Mitigación**: Cuando el modal está abierto, se previene el scroll del documento o el modal maneja `overflow-y: auto` si la altura de la pantalla es reducida.
