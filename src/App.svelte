<script>
  import TransactionsView from './lib/components/TransactionsView.svelte'
  import DebtsView from './lib/components/DebtsView.svelte'
  import FixedExpensesView from './lib/components/FixedExpensesView.svelte'
  import BackupView from './lib/components/BackupView.svelte'
  import Icon from './lib/components/Icon.svelte'
  import { theme } from './lib/theme.svelte.js'

  let vista = $state('transacciones')
</script>

<header>
  <h1>
    <Icon name="wallet" size={26} class="logo-icono" />
    <span>FinApp</span>
  </h1>
  <button
    type="button"
    class="boton-tema"
    onclick={() => theme.alternar()}
    aria-label="Cambiar tema claro u oscuro"
    title={theme.actual === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
  >
    <Icon name={theme.actual === 'dark' ? 'sun' : 'moon'} size={20} />
  </button>
</header>

<nav aria-label="Navegación principal">
  <button
    type="button"
    class:activo={vista === 'transacciones'}
    onclick={() => (vista = 'transacciones')}
    aria-label="Transacciones"
  >
    <Icon name="transactions" size={22} />
    <span class="tooltip" role="tooltip">Transacciones</span>
  </button>
  <button
    type="button"
    class:activo={vista === 'deudas'}
    onclick={() => (vista = 'deudas')}
    aria-label="Deudas"
  >
    <Icon name="debts" size={22} />
    <span class="tooltip" role="tooltip">Deudas</span>
  </button>
  <button
    type="button"
    class:activo={vista === 'gastosFijos'}
    onclick={() => (vista = 'gastosFijos')}
    aria-label="Gastos fijos"
  >
    <Icon name="fixedExpenses" size={22} />
    <span class="tooltip" role="tooltip">Gastos fijos</span>
  </button>
  <button
    type="button"
    class:activo={vista === 'respaldo'}
    onclick={() => (vista = 'respaldo')}
    aria-label="Respaldo"
  >
    <Icon name="backup" size={22} />
    <span class="tooltip" role="tooltip">Respaldo</span>
  </button>
</nav>

<main>
  {#if vista === 'transacciones'}
    <TransactionsView />
  {:else if vista === 'deudas'}
    <DebtsView />
  {:else if vista === 'gastosFijos'}
    <FixedExpensesView />
  {:else if vista === 'respaldo'}
    <BackupView />
  {/if}
</main>
