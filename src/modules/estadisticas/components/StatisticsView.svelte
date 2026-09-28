<script>
  import { listarTransacciones } from '../../transacciones/index.js'

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

  let periodoSeleccionado = $state(periodoDeFecha())
  let periodosDisponibles = $state([])
  let resumen = $state({ totalIngresos: 0, totalGastos: 0, ahorroNeto: 0, tasaAhorro: 0 })
  let distribucion = $state([])
  let comparativa = $state([])
  let cargando = $state(true)

  async function cargar() {
    cargando = true
    try {
      const transacciones = await listarTransacciones()
      periodosDisponibles = obtenerPeriodosDisponibles(transacciones)

      if (!periodosDisponibles.includes(periodoSeleccionado)) {
        periodosDisponibles = [periodoSeleccionado, ...periodosDisponibles]
      }

      const { desde, hasta } = rangoDePeriodo(periodoSeleccionado)
      const txsMes = transacciones.filter((t) => t.fecha >= desde && t.fecha <= hasta)

      resumen = calcularResumenPeriodo(txsMes)
      distribucion = calcularDistribucionCategorias(txsMes)
      comparativa = calcularComparativaMensual(transacciones, 6)
    } finally {
      cargando = false
    }
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
        <select id="select-periodo" bind:value={periodoSeleccionado}>
          {#each periodosDisponibles as p}
            <option value={p}>{formatearEtiquetaPeriodo(p)}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Tarjetas de métricas clave -->
    <MetricCards {resumen} />
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

  .selector-periodo select {
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.5rem 0.85rem;
    cursor: pointer;
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
