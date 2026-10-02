<script>
  import { onMount } from 'svelte'
  import { obtenerTasaBCV, obtenerUltimaTasaEnCache, guardarTasaEnCache } from '../../shared/services/bcv.js'
  import Icon from '../../shared/components/Icon.svelte'

  let {
    categoriasDisponibles = [],
    editandoTransaccion = null,
    onGuardar,
    onCancelarEdicion,
  } = $props()

  let tipo = $state('gasto')
  let monto = $state('')
  let moneda = $state('USD')
  let tasaBCV = $state('')
  let cargandoTasa = $state(false)
  let tasaInfo = $state('')
  let fecha = $state(new Date().toISOString().slice(0, 10))
  let descripcion = $state('')
  let categoria = $state('')
  let error = $state('')

  async function actualizarTasaBCV() {
    cargandoTasa = true
    tasaInfo = ''
    try {
      const res = await obtenerTasaBCV({ forzar: true })
      tasaBCV = String(res.tasa)
      if (res.error) {
        tasaInfo = `Usando caché (${res.error})`
      } else {
        tasaInfo = 'Tasa oficial actualizada'
      }
    } catch {
      tasaInfo = 'No se pudo obtener la tasa en línea'
    } finally {
      cargandoTasa = false
    }
  }

  function cargarTasaInicial() {
    const enCache = obtenerUltimaTasaEnCache()
    if (enCache) {
      tasaBCV = String(enCache)
      tasaInfo = 'Tasa oficial en caché'
    } else {
      actualizarTasaBCV()
    }
  }

  onMount(() => {
    if (!editandoTransaccion && !tasaBCV) {
      cargarTasaInicial()
    }
  })

  $effect(() => {
    if (editandoTransaccion) {
      tipo = editandoTransaccion.tipo
      monto = String(editandoTransaccion.monto)
      moneda = editandoTransaccion.moneda
      tasaBCV = editandoTransaccion.tasaBCV ? String(editandoTransaccion.tasaBCV) : ''
      tasaInfo = ''
      fecha = editandoTransaccion.fecha
      descripcion = editandoTransaccion.descripcion || ''
      categoria = editandoTransaccion.categoria || ''
      error = ''
      if (!tasaBCV) {
        cargarTasaInicial()
      }
    } else {
      tipo = 'gasto'
      monto = ''
      moneda = 'USD'
      fecha = new Date().toISOString().slice(0, 10)
      descripcion = ''
      categoria = ''
      error = ''
      if (!tasaBCV) {
        cargarTasaInicial()
      }
    }
  })

  function alSeleccionarMoneda(m) {
    moneda = m
    if (!tasaBCV) {
      cargarTasaInicial()
    }
  }

  let montoNum = $derived(Number(monto) || 0)
  let tasaNum = $derived(Number(tasaBCV) || 0)
  let textoEquivalente = $derived.by(() => {
    if (montoNum <= 0 || tasaNum <= 0) return ''
    if (moneda === 'USD') {
      const bs = montoNum * tasaNum
      return `≈ Bs. ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    if (moneda === 'VES') {
      const usd = montoNum / tasaNum
      return `≈ $${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return ''
  })

  async function enviar(e) {
    e.preventDefault()
    error = ''
    try {
      const numTasa = Number(tasaBCV)
      if (numTasa > 0) {
        guardarTasaEnCache(numTasa)
      }
      await onGuardar({
        tipo,
        monto: Number(monto),
        moneda,
        tasaBCV: numTasa > 0 ? numTasa : undefined,
        fecha,
        descripcion,
        categoria,
      })
      if (!editandoTransaccion) {
        monto = ''
        descripcion = ''
        categoria = ''
      }
    } catch (err) {
      error = err.message
    }
  }
</script>

<section class="panel">
  <h2>{editandoTransaccion ? 'Editar transacción' : 'Registrar transacción'}</h2>
  <form onsubmit={enviar}>
    <div class="fila">
      <label>
        Tipo
        <div class="control-segmentado">
          <button type="button" class:activo={tipo === 'gasto'} class="gasto" onclick={() => (tipo = 'gasto')}>
            Gasto
          </button>
          <button type="button" class:activo={tipo === 'ingreso'} class="ingreso" onclick={() => (tipo = 'ingreso')}>
            Ingreso
          </button>
        </div>
      </label>
      <label>
        Moneda
        <div class="control-segmentado">
          <button type="button" class:activo={moneda === 'USD'} onclick={() => alSeleccionarMoneda('USD')}>
            USD
          </button>
          <button type="button" class:activo={moneda === 'VES'} onclick={() => alSeleccionarMoneda('VES')}>
            VES
          </button>
        </div>
      </label>
    </div>
    <div class="fila">
      <label>
        Monto
        <input type="number" step="0.01" min="0.01" bind:value={monto} required placeholder="0.00" />
        {#if textoEquivalente}
          <span class="preview-equivalente">{textoEquivalente}</span>
        {/if}
      </label>
      <label>
        Tasa BCV {moneda === 'USD' ? '(opcional)' : ''}
        <div class="campo-tasa-bcv">
          <input
            type="number"
            step="0.01"
            min="0.01"
            bind:value={tasaBCV}
            required={moneda === 'VES'}
            placeholder="Tasa oficial"
          />
          <button
            type="button"
            class="boton-bcv-fetch"
            disabled={cargandoTasa}
            onclick={actualizarTasaBCV}
            aria-label="Actualizar tasa BCV"
            title={cargandoTasa ? 'Consultando tasa...' : 'Consultar tasa oficial BCV'}
          >
            <Icon name="refresh-cw" size={16} class={cargandoTasa ? 'girando' : ''} />
          </button>
        </div>
        {#if tasaInfo}
          <span class="tasa-bcv-info">{tasaInfo}</span>
        {/if}
      </label>
      <label>
        Fecha
        <input type="date" bind:value={fecha} required />
      </label>
    </div>
    <div class="fila">
      <label>
        Categoría
        <input
          type="text"
          list="categorias-lista"
          bind:value={categoria}
          placeholder="Selecciona o escribe..."
        />
        <datalist id="categorias-lista">
          {#each categoriasDisponibles as cat}
            <option value={cat}></option>
          {/each}
        </datalist>
      </label>
      <label>
        Descripción
        <input type="text" bind:value={descripcion} placeholder="opcional" />
      </label>
    </div>
    {#if error}<p class="error">{error}</p>{/if}
    {#if editandoTransaccion}
      <div class="fila-botones">
        <button type="submit">Guardar cambios</button>
        <button type="button" class="boton-secundario" onclick={onCancelarEdicion}>Cancelar</button>
      </div>
    {:else}
      <button type="submit">Registrar</button>
    {/if}
  </form>
</section>
