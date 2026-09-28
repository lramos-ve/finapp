## Context

Proyecto nuevo (greenfield), sin código ni backend existente. Ver `proposal.md` - Why para la motivación. Es una app de uso estrictamente personal (un solo usuario, un solo dispositivo por ahora), que debe operar en dos monedas (USD y VES) con una tasa de cambio (BCV) que el usuario ingresa manualmente. `openspec/specs/` no tiene capacidades previas: este design cubre la base técnica completa del proyecto.

## Goals / Non-Goals

**Goals:**
- Definir la arquitectura local-first (sin backend) y el stack técnico.
- Definir el modelo de datos compartido entre `transactions`, `debts` y `fixed-expenses`, en particular el patrón de conversión de moneda congelada.
- Definir la estrategia de generación de instancias de gastos fijos y su arrastre de saldo vencido.

**Non-Goals:**
- Sincronización entre dispositivos o backend remoto (explícitamente diferido; ver proposal.md).
- Categorías de gasto, reportes/gráficas avanzadas y notificaciones push (fuera de alcance de este change).
- Soporte de pagos mixtos (parte en USD y parte en VES en un mismo movimiento).
- Fuente automática de tasa BCV (API externa); por ahora es entrada manual del usuario.

## Decisions

### Stack: Svelte + Vite + Dexie.js + vite-plugin-pwa
- **Svelte** compila a JS casi vanilla (sin virtual DOM), lo que da un runtime mínimo (~2KB) y arranque rápido, prioridad explícita del usuario.
- **Vite** como bundler/dev server por su velocidad y su integración directa con `vite-plugin-pwa`.
- **Dexie.js** como capa sobre IndexedDB para el almacenamiento local-first, evitando escribir IndexedDB a mano.
- **vite-plugin-pwa** (basado en Workbox) genera el service worker para instalabilidad y funcionamiento offline.
- Alternativas consideradas: Preact (más cercano a React si se buscara ese ecosistema) y vanilla + Lit (máximo control, más código manual). Se descartan por preferir menor código de framework y mejor soporte de PWA "out of the box" con Svelte.

### Local-first sin backend
Toda la data vive en IndexedDB del dispositivo del usuario. No hay autenticación ni servidor. Elegido por simplicidad, privacidad (la data no sale del dispositivo) y porque el uso es de un solo usuario en un solo dispositivo. Alternativa considerada: backend con sync (ej. Supabase); descartada para esta versión por la complejidad adicional (auth, hosting, sync) que no se justifica todavía.

### Patrón "movimiento de dinero" (conversión de moneda congelada)
Se define un objeto de valor compartido, reutilizado por transacciones, abonos de deudas y pagos de gastos fijos:

```
MovimientoDeDinero {
  monto: number
  moneda: 'USD' | 'VES'
  tasaBCV?: number       // requerida solo si moneda = 'VES'
  montoUSD: number       // calculado y congelado al momento del registro
}
```

Cuando `moneda = 'VES'`, `montoUSD = monto / tasaBCV`, calculado una sola vez al guardar. Este valor no se recalcula después aunque la tasa BCV cambie - es una decisión deliberada (ver proposal.md, sección "Opción A - valor congelado") para que el histórico refleje lo que realmente ocurrió en su momento, dado que el bolívar tiene una tasa altamente volátil.

Alternativa considerada: recalcular con la tasa actual en cada consulta (valor "flotante"). Descartada porque distorsiona el histórico y porque las deudas están denominadas en USD - se necesita saber, en el momento del pago, si el equivalente en USD entregado efectivamente salda el monto adeudado.

### Deudas siempre en USD
`DEUDA.montoOriginal` y `DEUDA.saldoPendiente` se expresan siempre en USD, confirmado por el usuario ("siempre presto o me prestan en base a dólares"). Los abonos individuales sí pueden hacerse en VES, usando el patrón de movimiento de dinero para calcular su equivalente en USD antes de aplicarlo al saldo.

### Deudas unificadas con dirección
Una sola entidad `DEUDA` con campo `direccion: 'debo' | 'me_deben'`, en vez de dos módulos separados, porque estructuralmente son el mismo objeto (persona, monto, fecha, estado, abonos) con el signo invertido.

### Gastos fijos: generación look-ahead + arrastre encadenado
- Al crear o mantener activo un gasto fijo, el sistema genera la instancia del período actual y, al menos, la del siguiente, para que la sección sirva como vista anticipada de lo que hay que pagar (no solo un registro retroactivo).
- Cada instancia guarda `montoPeriodo` (lo correspondiente a ese período) y `montoArrastrado` (heredado de la instancia anterior si quedó vencida), de forma que `montoEsperado total = montoPeriodo + montoArrastrado`.
- Los pagos de una instancia (totales o parciales) usan el mismo patrón de movimiento de dinero que las transacciones y los abonos de deudas, por consistencia y porque en la práctica también se paga en efectivo en dólares o en bolívares indistintamente.

## Risks / Trade-offs

- **[Riesgo] Un solo dispositivo → si se pierde o se reinstala el navegador sin respaldo, se pierde toda la data.** → Mitigación: fuera de alcance de este change, pero el modelo local-first no impide agregar exportación/respaldo manual (ej. exportar a JSON) en una iteración futura sin romper el diseño actual.
- **[Riesgo] Tasa BCV manual → error humano al transcribirla puede generar un `montoUSD` incorrecto y congelado permanentemente.** → Mitigación: el registro es responsabilidad del usuario por diseño (no hay fuente automática en esta versión); se puede permitir editar una transacción reciente si se detecta el error a tiempo.
- **[Riesgo] Arrastre encadenado de gastos fijos no pagados por varios períodos consecutivos puede acumular montos grandes sin límite.** → Mitigación: es el comportamiento deseado (refleja la realidad de la deuda acumulada); la UI debe hacerlo visible con claridad para que no pase desapercibido.

## Migration Plan

No aplica: proyecto greenfield, no hay datos ni usuarios existentes que migrar. El primer despliegue es simplemente la primera versión utilizable de la app.

## Open Questions

- Ventana exacta de look-ahead para generación de instancias de gastos fijos (¿1 período adelante es suficiente, o conviene más para dar mejor visibilidad)? No cambia el modelo ni las specs, se puede ajustar como parámetro de implementación.
