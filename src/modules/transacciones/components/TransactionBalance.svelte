<script>
  let { balance = { totalIngresos: 0, totalGastos: 0, balance: 0 } } = $props()
</script>

<section class="panel">
  <h2>Balance</h2>
  <div class="balance-cards">
    <div class="card ingreso">
      <span class="label">Ingresos</span>
      <span class="valor">${balance.totalIngresos.toFixed(2)}</span>
    </div>
    <div class="card gasto">
      <span class="label">Gastos</span>
      <span class="valor">${balance.totalGastos.toFixed(2)}</span>
    </div>
    <div class="card neto" class:negativo={balance.balance < 0}>
      <span class="label">Neto</span>
      <span class="valor">${balance.balance.toFixed(2)}</span>
    </div>
  </div>
</section>
