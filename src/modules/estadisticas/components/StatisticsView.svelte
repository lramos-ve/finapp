<script>
  import {
    listarTransacciones,
    actualizarTransaccion,
    eliminarTransaccion,
  } from '../../transacciones/index.js'
  import { obtenerCategoriasDisponibles } from '../../transacciones/logic/categories.js'
  import TransactionList from '../../transacciones/components/TransactionList.svelte'
  import TransactionForm from '../../transacciones/components/TransactionForm.svelte'
  import Icon from '../../shared/components/Icon.svelte'

  import {
    periodoDeFecha,
    formatearEtiquetaPeriodo,
    rangoDePeriodo,
    calcularResumenPeriodo,
    calcularDistribucionCategorias,
    calcularComparativaMensual,
    obtenerPeriodosDisponibles,
  } from '../logic/statistics.js'
  import MetricCards from './MetricCards.svelte'
  import DonutChart from './DonutChart.svelte'
  import BarChart from './BarChart.svelte'
  import Select from '../../shared/components/Select.svelte'

  let periodoSeleccionado = $state(periodoDeFecha())
  let periodosDisponibles = $state([])
  let resumen = $state({ totalIngresos: 0, totalGastos: 0, ahorroNeto: 0, tasaAhorro: 0 })
  let distribucion = $state([])
  let comparativa = $state([])
  let cargando = $state(true)

  // Estados para historial desplegable de transacciones
  let historialExpandido = $state(false)
  let todasTransacciones = $state([])
  let categoriasDisponibles = $state([])
  let filtroTipo = $state('')
  let filtroMoneda = $state('')
  let filtroCategoria = $state('')
  let editandoTransaccion = $state(null)

  let opcionesPeriodos = $derived(
    periodosDisponibles.map((p) => ({
      value: p,
      label: formatearEtiquetaPeriodo(p),
    }))
  )

  let transaccionesDelMes = $derived.by(() => {
    const { desde, hasta } = rangoDePeriodo(periodoSeleccionado)
    return todasTransacciones.filter((t) => t.fecha >= desde && t.fecha <= hasta)
  })

  let transaccionesHistorial = $derived.by(() => {
    return transaccionesDelMes.filter((t) => {
      if (filtroTipo && t.tipo !== filtroTipo) return false
      if (filtroMoneda && t.moneda !== filtroMoneda) return false
      if (filtroCategoria && t.categoria !== filtroCategoria) return false
      return true
    })
  })

  async function cargar() {
    cargando = true
    try {
      const transacciones = await listarTransacciones()
      todasTransacciones = transacciones
      categoriasDisponibles = obtenerCategoriasDisponibles(transacciones)
      periodosDisponibles = obtenerPeriodosDisponibles(transacciones)

      if (!periodosDisponibles.includes(periodoSeleccionado)) {
        periodosDisponibles = [periodoSeleccionado, ...periodosDisponibles]
      }

      const { desde, hasta } = rangoDePeriodo(periodoSeleccionado)
      const txsMes = transacciones.filter((t) => t.fecha >= desde && t.fecha <= hasta)

      resumen = await calcularResumenPeriodo({ transacciones: txsMes })
      distribucion = await calcularDistribucionCategorias({ transacciones: txsMes })
      comparativa = await calcularComparativaMensual({ transacciones, meses: 6 })
    } finally {
      cargando = false
    }
  }

  function iniciarEdicion(t) {
    editandoTransaccion = t
  }

  function cancelarEdicion() {
    editandoTransaccion = null
  }

  async function manejarGuardarEdicion(datos) {
    if (editandoTransaccion) {
      await actualizarTransaccion(editandoTransaccion.id, datos)
      editandoTransaccion = null
      await cargar()
    }
  }

  async function manejarEliminar(id) {
    if (editandoTransaccion?.id === id) {
      cancelarEdicion()
    }
    await eliminarTransaccion(id)
    await cargar()
  }

  $effect(() => {
    periodoSeleccionado
    cargar()
  })
</script>

<div class="vista-estadisticas">
  <!-- Selector de período -->
  <section class="panel cabecera-estadisticas">
    <div class="fila-titulo-periodo">
      <h2>Estadísticas</h2>
      <div class="selector-periodo">
        <label for="select-periodo" class="sr-only">Seleccionar mes</label>
        <Select
          id="select-periodo"
          bind:value={periodoSeleccionado}
          options={opcionesPeriodos}
        />
      </div>
    </div>

    <!-- Tarjetas de métricas clave -->
    <MetricCards {resumen} />
  </section>

  <!-- Tarjeta Desplegable: Historial de Transacciones del Período -->
  <section class="panel-colapsable">
    <button
      type="button"
      class="panel-colapsable-header"
      onclick={() => (historialExpandido = !historialExpandido)}
      aria-expanded={historialExpandido}
    >
      <div class="panel-colapsable-titulo">
        <Icon name="transactions" size={18} />
        <span>Historial de Transacciones</span>
        <span class="badge-contador">{transaccionesDelMes.length}</span>
      </div>
      <span class="chevron-rotatorio" class:expandido={historialExpandido}>
        <Icon name="chevron-down" size={18} />
      </span>
    </button>

    {#if historialExpandido}
      <div class="panel-colapsable-contenido">
        {#if editandoTransaccion}
          <div class="panel-edicion-transaccion">
            <TransactionForm
              {categoriasDisponibles}
              {editandoTransaccion}
              onGuardar={manejarGuardarEdicion}
              onCancelarEdicion={cancelarEdicion}
            />
          </div>
        {/if}

        <TransactionList
          transacciones={transaccionesHistorial}
          {categoriasDisponibles}
          sinPanel={true}
          bind:filtroTipo
          bind:filtroMoneda
          bind:filtroCategoria
          onEditar={iniciarEdicion}
          onEliminar={manejarEliminar}
        />
      </div>
    {/if}
  </section>

  <!-- Gráfico de distribución de gastos por categoría -->
  <section class="panel">
    <h2>Gastos por Categoría</h2>
    <DonutChart data={distribucion} total={resumen.totalGastos} />
  </section>

  <!-- Gráfico comparativo de ingresos vs gastos mensual -->
  <section class="panel">
    <h2>Evolución Mensual (Últimos 6 meses)</h2>
    <BarChart data={comparativa} />
  </section>
</div>

<style>
  .vista-estadisticas {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .fila-titulo-periodo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .fila-titulo-periodo h2 {
    margin: 0;
  }

  .selector-periodo {
    min-width: 175px;
  }

  .panel-edicion-transaccion {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  [data-theme="dark"] .panel-edicion-transaccion {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
