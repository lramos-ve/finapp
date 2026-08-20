<script>
  import { registrarTransaccion, listarTransacciones, obtenerBalance } from '../transactions.js'

  let tipo = $state('gasto')
  let monto = $state('')
  let moneda = $state('USD')
  let tasaBCV = $state('')
  let fecha = $state(hoyISO())
  let descripcion = $state('')
  let error = $state('')

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

  async function enviar(e) {
    e.preventDefault()
    error = ''
    try {
      await registrarTransaccion({
        tipo,
        monto: Number(monto),
        moneda,
        tasaBCV: moneda === 'VES' ? Number(tasaBCV) : undefined,
        fecha,
        descripcion,
      })
      monto = ''
      tasaBCV = ''
      descripcion = ''
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
  <h2>Registrar transacción</h2>
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
          <button type="button" class:activo={moneda === 'USD'} onclick={() => (moneda = 'USD')}>
            USD
          </button>
          <button type="button" class:activo={moneda === 'VES'} onclick={() => (moneda = 'VES')}>
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
          <input type="number" step="0.01" min="0.01" bind:value={tasaBCV} required />
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
    <button type="submit">Registrar</button>
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
        </li>
      {/each}
    </ul>
  {/if}
</section>
