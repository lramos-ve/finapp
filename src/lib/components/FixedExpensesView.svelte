<script>
  import {
    definirGastoFijo,
    desactivarGastoFijo,
    listarGastosFijos,
    listarInstancias,
    registrarPagoInstancia,
    sincronizarGastosFijos,
    periodoDe,
    siguientePeriodo,
  } from '../fixedExpenses.js'

  let nombre = $state('')
  let monto = $state('')
  let diaVencimiento = $state('')
  let error = $state('')

  let gastosFijos = $state([])
  let instanciasPorPeriodo = $state([])

  let pagoAbiertoPara = $state(null)
  let pagoMonto = $state('')
  let pagoMoneda = $state('USD')
  let pagoTasaBCV = $state('')
  let pagoFecha = $state(hoyISO())
  let pagoError = $state('')

  function hoyISO() {
    return new Date().toISOString().slice(0, 10)
  }

  function nombreDe(gastoFijoId) {
    return gastosFijos.find((g) => g.id === gastoFijoId)?.nombre ?? '—'
  }

  async function cargar() {
    await sincronizarGastosFijos()
    gastosFijos = await listarGastosFijos({})

    const periodoActual = periodoDe(new Date())
    const periodoSiguiente = siguientePeriodo(periodoActual)

    const [actual, siguiente] = await Promise.all([
      listarInstancias({ periodo: periodoActual }),
      listarInstancias({ periodo: periodoSiguiente }),
    ])

    instanciasPorPeriodo = [
      { periodo: periodoActual, instancias: actual },
      { periodo: periodoSiguiente, instancias: siguiente },
    ]
  }

  async function enviar(e) {
    e.preventDefault()
    error = ''
    try {
      await definirGastoFijo({ nombre, monto: Number(monto), diaVencimiento: Number(diaVencimiento) })
      nombre = ''
      monto = ''
      diaVencimiento = ''
      await cargar()
    } catch (err) {
      error = err.message
    }
  }

  async function desactivar(id) {
    await desactivarGastoFijo(id)
    await cargar()
  }

  function abrirPago(instanciaId) {
    pagoAbiertoPara = instanciaId
    pagoMonto = ''
    pagoMoneda = 'USD'
    pagoTasaBCV = ''
    pagoFecha = hoyISO()
    pagoError = ''
  }

  async function enviarPago(e, instanciaId) {
    e.preventDefault()
    pagoError = ''
    try {
      await registrarPagoInstancia({
        instanciaId,
        monto: Number(pagoMonto),
        moneda: pagoMoneda,
        tasaBCV: pagoMoneda === 'VES' ? Number(pagoTasaBCV) : undefined,
        fecha: pagoFecha,
      })
      pagoAbiertoPara = null
      await cargar()
    } catch (err) {
      pagoError = err.message
    }
  }

  cargar()
</script>

<section class="panel">
  <h2>Definir gasto fijo</h2>
  <form onsubmit={enviar}>
    <div class="fila">
      <label>
        Nombre
        <input type="text" bind:value={nombre} required />
      </label>
      <label>
        Monto (USD)
        <input type="number" step="0.01" min="0.01" bind:value={monto} required />
      </label>
      <label>
        Día de vencimiento
        <input type="number" min="1" max="31" bind:value={diaVencimiento} required />
      </label>
    </div>
    {#if error}<p class="error">{error}</p>{/if}
    <button type="submit">Definir</button>
  </form>
</section>

<section class="panel">
  <h2>Gastos fijos activos</h2>
  {#if gastosFijos.filter((g) => g.activo).length === 0}
    <p class="vacio">Sin gastos fijos activos.</p>
  {:else}
    <ul class="lista">
      {#each gastosFijos.filter((g) => g.activo) as g (g.id)}
        <li>
          <span class="descripcion">{g.nombre} — ${g.monto.toFixed(2)} (día {g.diaVencimiento})</span>
          <button type="button" onclick={() => desactivar(g.id)}>Desactivar</button>
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#each instanciasPorPeriodo as grupo (grupo.periodo)}
  <section class="panel">
    <h2>Período {grupo.periodo}</h2>
    {#if grupo.instancias.length === 0}
      <p class="vacio">Sin instancias para este período.</p>
    {:else}
      <ul class="lista">
        {#each grupo.instancias as i (i.id)}
          <li class:gasto={i.estado === 'vencida'} class:pagado={i.estado === 'pagado'}>
            <div class="deuda-fila">
              <span class="descripcion">{nombreDe(i.gastoFijoId)}</span>
              <span class="monto-usd">
                ${i.saldoPendiente.toFixed(2)}
                {#if i.montoArrastrado > 0}
                  (${i.montoPeriodo.toFixed(2)} + ${i.montoArrastrado.toFixed(2)} arrastrado)
                {/if}
              </span>
              <span class="estado">{i.estado}</span>
              {#if i.estado !== 'pagado'}
                <button type="button" onclick={() => abrirPago(i.id)}>Pagar</button>
              {/if}
            </div>
            {#if pagoAbiertoPara === i.id}
              <form class="abono-form" onsubmit={(e) => enviarPago(e, i.id)}>
                <label>
                  Monto
                  <input type="number" step="0.01" min="0.01" bind:value={pagoMonto} required />
                </label>
                <label>
                  Moneda
                  <div class="control-segmentado">
                    <button type="button" class:activo={pagoMoneda === 'USD'} onclick={() => (pagoMoneda = 'USD')}>
                      USD
                    </button>
                    <button type="button" class:activo={pagoMoneda === 'VES'} onclick={() => (pagoMoneda = 'VES')}>
                      VES
                    </button>
                  </div>
                </label>
                {#if pagoMoneda === 'VES'}
                  <label>
                    Tasa BCV
                    <input type="number" step="0.01" min="0.01" bind:value={pagoTasaBCV} required />
                  </label>
                {/if}
                <label>
                  Fecha
                  <input type="date" bind:value={pagoFecha} required />
                </label>
                {#if pagoError}<p class="error">{pagoError}</p>{/if}
                <button type="submit">Confirmar pago</button>
                <button type="button" onclick={() => (pagoAbiertoPara = null)}>Cancelar</button>
              </form>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/each}
