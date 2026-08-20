<script>
  import Navbar from './lib/components/Navbar.svelte'
  import TransactionsView from './lib/components/TransactionsView.svelte'
  import SavingsView from './lib/components/SavingsView.svelte'
  import FixedExpensesView from './lib/components/FixedExpensesView.svelte'
  import DebtsView from './lib/components/DebtsView.svelte'
  import StatsView from './lib/components/StatsView.svelte'

  let vista = $state('transacciones')
</script>

<Navbar bind:vista={vista} />

<main>
  {#if vista === 'transacciones'}
    <TransactionsView />
  {:else if vista === 'ahorro'}
    <SavingsView />
  {:else if vista === 'gastosFijos'}
    <FixedExpensesView />
  {:else if vista === 'deudas'}
    <DebtsView />
  {:else if vista === 'estadisticas'}
    <StatsView />
  {/if}
</main>

