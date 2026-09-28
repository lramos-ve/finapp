<script>
  import {
    registrarTransaccion,
    actualizarTransaccion,
    eliminarTransaccion,
    listarTransacciones,
    obtenerBalance,
  } from '../transactions.js'
  import { obtenerTasaBCV, obtenerUltimaTasaEnCache, guardarTasaEnCache } from '../bcv.js'
  import Icon from './Icon.svelte'

  let tipo = $state('gasto')
  let monto = $state('')
  let moneda = $state('USD')
  let tasaBCV = $state('')
  let cargandoTasa = $state(false)
  let tasaInfo = $state('')
  let fecha = $state(hoyISO())
  let descripcion = $state('')
  let error = $state('')
  let editandoId = $state(null)

  let filtroTipo = $state('')
  let filtroMoneda = $state('')

  let transacciones = $state([])
  let balance = $state({ totalIngresos: 0, totalGastos: 0, balance: 0 })

  function hoyISO() {
    return new Date().toISOString().slice(0, 10)
  }

  async function cargar() {
    transacciones = await listarTransacciones({
      tipo: filtroTipo || undefined,
      moneda: filtroMoneda || undefined,
    })
    balance = await obtenerBalance({})
  }

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

  function alSeleccionarMoneda(m) {
    moneda = m
    if (m === 'VES' && !tasaBCV) {
      const enCache = obtenerUltimaTasaEnCache()
      if (enCache) {
        tasaBCV = String(enCache)
        tasaInfo = 'Última tasa guardada'
      } else {
        actualizarTasaBCV()
      }
    }
  }

  function cargarParaEditar(t) {
    editandoId = t.id
    tipo = t.tipo
    monto = String(t.monto)
    moneda = t.moneda
    tasaBCV = t.tasaBCV ? String(t.tasaBCV) : ''
    tasaInfo = ''
    fecha = t.fecha
    descripcion = t.descripcion || ''
    error = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    editandoId = null
    monto = ''
    descripcion = ''
    tasaInfo = ''
    error = ''
  }

  async function confirmarEliminar(t) {
    const desc = t.descripcion ? `"${t.descripcion}"` : (t.tipo === 'ingreso' ? 'el ingreso' : 'el gasto')
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${desc}?`)) {
      if (editandoId === t.id) {
        cancelarEdicion()
      }
      await eliminarTransaccion(t.id)
      await cargar()
    }
  }

  async function enviar(e) {
    e.preventDefault()
    error = ''
    try {
      if (moneda === 'VES' && tasaBCV) {
        guardarTasaEnCache(Number(tasaBCV))
      }
      const datos = {
        tipo,
        monto: Number(monto),
        moneda,
        tasaBCV: moneda === 'VES' ? Number(tasaBCV) : undefined,
        fecha,
        descripcion,
      }
      if (editandoId) {
        await actualizarTransaccion(editandoId, datos)
        editandoId = null
      } else {
        await registrarTransaccion(datos)
      }
      monto = ''
      descripcion = ''
      tasaInfo = ''
      await cargar()
    } catch (err) {
      error = err.message
    }
  }

  $effect(() => {
    filtroTipo
    filtroMoneda
    cargar()
  })
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

<section class="panel">
  <h2>{editandoId ? 'Editar transacción' : 'Registrar transacción'}</h2>
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
        <input type="number" step="0.01" min="0.01" bind:value={monto} required />
      </label>
      {#if moneda === 'VES'}
        <label>
          Tasa BCV
          <div class="campo-tasa-bcv">
            <input type="number" step="0.01" min="0.01" bind:value={tasaBCV} required />
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
      {/if}
      <label>
        Fecha
        <input type="date" bind:value={fecha} required />
      </label>
    </div>
    <label class="ancho-completo">
      Descripción
      <input type="text" bind:value={descripcion} placeholder="opcional" />
    </label>
    {#if error}<p class="error">{error}</p>{/if}
    {#if editandoId}
      <div class="fila-botones">
        <button type="submit">Guardar cambios</button>
        <button type="button" class="boton-secundario" onclick={cancelarEdicion}>Cancelar</button>
      </div>
    {:else}
      <button type="submit">Registrar</button>
    {/if}
  </form>
</section>

<section class="panel">
  <h2>Transacciones</h2>
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
  </div>
  {#if transacciones.length === 0}
    <p class="vacio">Sin transacciones registradas todavía.</p>
  {:else}
    <ul class="lista">
      {#each transacciones as t (t.id)}
        <li class:ingreso={t.tipo === 'ingreso'} class:gasto={t.tipo === 'gasto'}>
          <span class="fecha">{t.fecha}</span>
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
              onclick={() => cargarParaEditar(t)}
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
