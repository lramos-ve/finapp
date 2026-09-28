<script>
  let {
    categoriasDisponibles = [],
    filtroTipo = $bindable(''),
    filtroMoneda = $bindable(''),
    filtroCategoria = $bindable(''),
  } = $props()
</script>

<div class="fila filtros">
  <label>
    Tipo
    <div class="control-segmentado">
      <button type="button" class:activo={filtroTipo === ''} onclick={() => (filtroTipo = '')}>
        Todos
      </button>
      <button type="button" class:activo={filtroTipo === 'gasto'} class="gasto" onclick={() => (filtroTipo = 'gasto')}>
        Gasto
      </button>
      <button type="button" class:activo={filtroTipo === 'ingreso'} class="ingreso" onclick={() => (filtroTipo = 'ingreso')}>
        Ingreso
      </button>
    </div>
  </label>
  <label>
    Moneda
    <div class="control-segmentado">
      <button type="button" class:activo={filtroMoneda === ''} onclick={() => (filtroMoneda = '')}>
        Todas
      </button>
      <button type="button" class:activo={filtroMoneda === 'USD'} onclick={() => (filtroMoneda = 'USD')}>
        USD
      </button>
      <button type="button" class:activo={filtroMoneda === 'VES'} onclick={() => (filtroMoneda = 'VES')}>
        VES
      </button>
    </div>
  </label>
  <label>
    Categoría
    <select bind:value={filtroCategoria}>
      <option value="">Todas</option>
      {#each categoriasDisponibles as cat}
        <option value={cat}>{cat}</option>
      {/each}
    </select>
  </label>
</div>
