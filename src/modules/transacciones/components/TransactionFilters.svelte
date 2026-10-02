<script>
  import Select from '../../shared/components/Select.svelte'

  let {
    categoriasDisponibles = [],
    filtroTipo = $bindable(''),
    filtroMoneda = $bindable(''),
    filtroCategoria = $bindable(''),
  } = $props()

  let opcionesCategorias = $derived([
    { value: '', label: 'Todas' },
    ...categoriasDisponibles.map((c) => ({ value: c, label: c })),
  ])
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
    <Select bind:value={filtroCategoria} options={opcionesCategorias} placeholder="Todas" />
  </label>
</div>
