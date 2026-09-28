<script>
  import Icon from '../../shared/components/Icon.svelte'

  let {
    gastosFijos = [],
    instanciasPorPeriodo = [],
    onDesactivar,
    onPagar,
  } = $props()

  let pagoAbiertoPara = $state(null)
  let pagoMonto = $state('')
  let pagoMoneda = $state('USD')
  let pagoTasaBCV = $state('')
  let pagoFecha = $state(new Date().toISOString().slice(0, 10))
  let pagoError = $state('')

  function gastoFijoDe(gastoFijoId) {
    return gastosFijos.find((g) => g.id === gastoFijoId)
  }

  function nombreDe(gastoFijoId) {
    return gastoFijoDe(gastoFijoId)?.nombre ?? '—'
  }

  function abrirPago(instanciaId) {
    pagoAbiertoPara = instanciaId
    pagoMonto = ''
    pagoMoneda = 'USD'
    pagoTasaBCV = ''
    pagoFecha = new Date().toISOString().slice(0, 10)
    pagoError = ''
  }

  async function enviarPago(e, instanciaId) {
    e.preventDefault()
    pagoError = ''
    try {
      await onPagar(instanciaId, {
        monto: Number(pagoMonto),
        moneda: pagoMoneda,
        tasaBCV: pagoMoneda === 'VES' ? Number(pagoTasaBCV) : undefined,
        fecha: pagoFecha,
      })
      pagoAbiertoPara = null
    } catch (err) {
      pagoError = err.message
    }
  }
</script>

<section class="panel">
  <h2>Gastos fijos activos</h2>
  {#if gastosFijos.filter((g) => g.activo).length === 0}
    <p class="vacio">Sin gastos fijos activos.</p>
  {:else}
    <ul class="lista">
      {#each gastosFijos.filter((g) => g.activo) as g (g.id)}
        <li>
          {#if g.categoria}
            <span class="badge-categoria">{g.categoria}</span>
          {/if}
          <span class="descripcion">{g.nombre} — ${g.monto.toFixed(2)} (día {g.diaVencimiento})</span>
          <button type="button" class="boton-accion desactivar" onclick={() => onDesactivar(g.id)}>
            <Icon name="power" size={14} />
            <span>Desactivar</span>
          </button>
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
              {#if gastoFijoDe(i.gastoFijoId)?.categoria}
                <span class="badge-categoria">{gastoFijoDe(i.gastoFijoId).categoria}</span>
              {/if}
              <span class="descripcion">{nombreDe(i.gastoFijoId)}</span>
              <span class="monto-usd">
                ${i.saldoPendiente.toFixed(2)}
                {#if i.montoArrastrado > 0}
                  (${i.montoPeriodo.toFixed(2)} + ${i.montoArrastrado.toFixed(2)} arrastrado)
                {/if}
              </span>
              <span class="estado">{i.estado}</span>
              {#if i.estado !== 'pagado'}
                <button type="button" class="boton-accion pagar" onclick={() => abrirPago(i.id)}>
                  <Icon name="check" size={14} />
                  <span>Pagar</span>
                </button>
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
                <button type="button" class="boton-secundario" onclick={() => (pagoAbiertoPara = null)}>Cancelar</button>
              </form>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/each}
