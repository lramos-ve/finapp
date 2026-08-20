<script>
  import TransactionsView from './lib/components/TransactionsView.svelte'
  import DebtsView from './lib/components/DebtsView.svelte'
  import FixedExpensesView from './lib/components/FixedExpensesView.svelte'

  let vista = $state('transacciones')
</script>

<header>
  <h1>Finanzas</h1>
</header>

<nav>
  <button type="button" class:activo={vista === 'transacciones'} onclick={() => (vista = 'transacciones')}>
    Transacciones
  </button>
  <button type="button" class:activo={vista === 'deudas'} onclick={() => (vista = 'deudas')}>
    Deudas
  </button>
  <button type="button" class:activo={vista === 'gastosFijos'} onclick={() => (vista = 'gastosFijos')}>
    Gastos fijos
  </button>
</nav>

<main>
  {#if vista === 'transacciones'}
    <TransactionsView />
  {:else if vista === 'deudas'}
    <DebtsView />
  {:else if vista === 'gastosFijos'}
    <FixedExpensesView />
  {/if}
</main>
