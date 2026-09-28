<script>
  import { listarTransacciones } from '../transactions.js'
  import {
    periodoDeFecha,
    formatearEtiquetaPeriodo,
    rangoDePeriodo,
    calcularResumenPeriodo,
    calcularDistribucionCategorias,
    calcularComparativaMensual,
    obtenerPeriodosDisponibles,
  } from '../statistics.js'
  import DonutChart from './DonutChart.svelte'
  import BarChart from './BarChart.svelte'
  import Icon from './Icon.svelte'

  let periodoSeleccionado = $state(periodoDeFecha())
  let periodosDisponibles = $state([])
  let resumen = $state({ totalIngresos: 0, totalGastos: 0, ahorroNeto: 0, tasaAhorro: 0 })
  let distribucion = $state([])
  let comparativa = $state([])
  let cargando = $state(true)

  async function cargar() {
    cargando = true
    try {
      const todas = await listarTransacciones({})
      periodosDisponibles = obtenerPeriodosDisponibles(todas)

      const rango = rangoDePeriodo(periodoSeleccionado)
      const [resumenData, distribucionData, comparativaData] = await Promise.all([
        calcularResumenPeriodo(rango),
        calcularDistribucionCategorias(rango),
        calcularComparativaMensual({ hastaPeriodo: periodoSeleccionado, meses: 6 }),
      ])

      resumen = resumenData
      distribucion = distribucionData
      comparativa = comparativaData
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
    <div class="balance-cards cards-estadisticas">
      <div class="card ingreso">
        <span class="label">Ingresos</span>
        <span class="valor">${resumen.totalIngresos.toFixed(2)}</span>
      </div>
      <div class="card gasto">
        <span class="label">Gastos</span>
        <span class="valor">${resumen.totalGastos.toFixed(2)}</span>
      </div>
      <div class="card neto" class:negativo={resumen.ahorroNeto < 0}>
        <span class="label">Ahorro Neto</span>
        <span class="valor">${resumen.ahorroNeto.toFixed(2)}</span>
      </div>
      <div class="card ahorro">
        <span class="label">Tasa de Ahorro</span>
        <span class="valor">{resumen.tasaAhorro}%</span>
      </div>
    </div>
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

  .cards-estadisticas {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  }

  .card.ahorro .valor {
    color: var(--acento);
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
