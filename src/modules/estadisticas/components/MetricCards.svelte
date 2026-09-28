<script>
  let { resumen = { totalIngresos: 0, totalGastos: 0, ahorroNeto: 0, tasaAhorro: 0 } } = $props()
</script>

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

<style>
  .cards-estadisticas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
</style>
