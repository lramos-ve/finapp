<script>
  import Icon from '../../shared/components/Icon.svelte'
  import Select from '../../shared/components/Select.svelte'

  let {
    categoriasDisponibles = [],
    filtroTipo = $bindable(''),
    filtroMoneda = $bindable(''),
    filtroCategoria = $bindable(''),
  } = $props()

  let abierto = $state(false)
  let activos = $derived([filtroTipo, filtroMoneda, filtroCategoria].filter(Boolean).length)

  function limpiar() {
    filtroTipo = ''
    filtroMoneda = ''
    filtroCategoria = ''
  }

  let opcionesCategorias = $derived([
    { value: '', label: 'Todas' },
    ...categoriasDisponibles.map((c) => ({ value: c, label: c })),
  ])
</script>

<div class="barra-filtro">
  <button
    type="button"
    class="boton-filtro"
    class:activo={abierto || activos > 0}
    aria-expanded={abierto}
    aria-controls="panel-filtros"
    onclick={() => (abierto = !abierto)}
  >
    <Icon name="filter" size={16} />
    <span>Filtros</span>
    {#if activos > 0}<span class="badge-contador">{activos}</span>{/if}
  </button>
  {#if activos > 0}
    <button type="button" class="boton-limpiar-filtros" onclick={limpiar}>Limpiar</button>
  {/if}
</div>

{#if abierto}
<div class="fila filtros" id="panel-filtros">
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
{/if}
