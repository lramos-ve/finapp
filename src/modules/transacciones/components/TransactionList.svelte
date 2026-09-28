<script>
  import Icon from '../../shared/components/Icon.svelte'
  import TransactionFilters from './TransactionFilters.svelte'

  let {
    transacciones = [],
    categoriasDisponibles = [],
    filtroTipo = $bindable(''),
    filtroMoneda = $bindable(''),
    filtroCategoria = $bindable(''),
    onEditar,
    onEliminar,
  } = $props()

  function confirmarEliminar(t) {
    const desc = t.descripcion ? `"${t.descripcion}"` : (t.tipo === 'ingreso' ? 'el ingreso' : 'el gasto')
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${desc}?`)) {
      onEliminar(t.id)
    }
  }
</script>

<section class="panel">
  <h2>Transacciones</h2>

  <TransactionFilters
    {categoriasDisponibles}
    bind:filtroTipo
    bind:filtroMoneda
    bind:filtroCategoria
  />

  {#if transacciones.length === 0}
    <p class="vacio">Sin transacciones registradas todavía.</p>
  {:else}
    <ul class="lista">
      {#each transacciones as t (t.id)}
        <li class:ingreso={t.tipo === 'ingreso'} class:gasto={t.tipo === 'gasto'}>
          <span class="fecha">{t.fecha}</span>
          {#if t.categoria}
            <span class="badge-categoria">{t.categoria}</span>
          {/if}
          <span class="descripcion">{t.descripcion || (t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto')}</span>
          <span class="monto-original">
            {t.moneda === 'VES' ? `Bs. ${t.monto.toFixed(2)} (tasa ${t.tasaBCV})` : `$${t.monto.toFixed(2)}`}
          </span>
          <span class="monto-usd">{t.tipo === 'ingreso' ? '+' : '-'}${t.montoUSD.toFixed(2)}</span>
          <div class="acciones-fila">
            <button
              type="button"
              class="boton-accion editar"
              aria-label="Editar transacción"
              title="Editar transacción"
              onclick={() => onEditar(t)}
            >
              <Icon name="pencil" size={15} />
            </button>
            <button
              type="button"
              class="boton-accion eliminar"
              aria-label="Eliminar transacción"
              title="Eliminar transacción"
              onclick={() => confirmarEliminar(t)}
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
