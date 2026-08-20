<script>
  import { registrarDeuda, registrarAbono, listarDeudas, obtenerTotalesPorDireccion } from '../debts.js'

  let persona = $state('')
  let direccion = $state('debo')
  let monto = $state('')
  let fecha = $state(hoyISO())
  let notas = $state('')
  let error = $state('')

  let deudas = $state([])
  let totales = $state({ debo: 0, meDeben: 0 })

  // Estado del formulario de abono, uno a la vez, indexado por id de deuda
  let abonoAbiertoPara = $state(null)
  let abonoMonto = $state('')
  let abonoMoneda = $state('USD')
  let abonoTasaBCV = $state('')
  let abonoFecha = $state(hoyISO())
  let abonoError = $state('')

  function hoyISO() {
    return new Date().toISOString().slice(0, 10)
  }

  async function cargar() {
    deudas = await listarDeudas({})
    totales = await obtenerTotalesPorDireccion()
  }

  async function enviar(e) {
    e.preventDefault()
    error = ''
    try {
      await registrarDeuda({ persona, direccion, monto: Number(monto), fecha, notas })
      persona = ''
      monto = ''
      notas = ''
      await cargar()
    } catch (err) {
      error = err.message
    }
  }

  function abrirAbono(deudaId) {
    abonoAbiertoPara = deudaId
    abonoMonto = ''
    abonoMoneda = 'USD'
    abonoTasaBCV = ''
    abonoFecha = hoyISO()
    abonoError = ''
  }

  async function enviarAbono(e, deudaId) {
    e.preventDefault()
    abonoError = ''
    try {
      await registrarAbono({
        deudaId,
        monto: Number(abonoMonto),
        moneda: abonoMoneda,
        tasaBCV: abonoMoneda === 'VES' ? Number(abonoTasaBCV) : undefined,
        fecha: abonoFecha,
      })
      abonoAbiertoPara = null
      await cargar()
    } catch (err) {
      abonoError = err.message
    }
  }

  cargar()
</script>

<section class="panel">
  <h2>Deudas</h2>
  <div class="balance-cards">
    <div class="card gasto">
      <span class="label">Debo</span>
      <span class="valor">${totales.debo.toFixed(2)}</span>
    </div>
    <div class="card ingreso">
      <span class="label">Me deben</span>
      <span class="valor">${totales.meDeben.toFixed(2)}</span>
    </div>
  </div>
</section>

<section class="panel">
  <h2>Registrar deuda</h2>
  <form onsubmit={enviar}>
    <div class="fila">
      <label>
        Persona
        <input type="text" bind:value={persona} required />
      </label>
      <label>
        Dirección
        <select bind:value={direccion}>
          <option value="debo">Yo debo</option>
          <option value="me_deben">Me deben</option>
        </select>
      </label>
    </div>
    <div class="fila">
      <label>
        Monto (USD)
        <input type="number" step="0.01" min="0.01" bind:value={monto} required />
      </label>
      <label>
        Fecha
        <input type="date" bind:value={fecha} required />
      </label>
    </div>
    <label class="ancho-completo">
      Notas
      <input type="text" bind:value={notas} placeholder="opcional" />
    </label>
    {#if error}<p class="error">{error}</p>{/if}
    <button type="submit">Registrar</button>
  </form>
</section>

<section class="panel">
  <h2>Listado</h2>
  {#if deudas.length === 0}
    <p class="vacio">Sin deudas registradas todavía.</p>
  {:else}
    <ul class="lista">
      {#each deudas as d (d.id)}
        <li class:ingreso={d.direccion === 'me_deben'} class:gasto={d.direccion === 'debo'}>
          <div class="deuda-fila">
            <span class="fecha">{d.fecha}</span>
            <span class="descripcion">
              {d.persona} — {d.direccion === 'debo' ? 'yo debo' : 'me debe'}
            </span>
            <span class="monto-usd">${d.saldoPendiente.toFixed(2)} / ${d.montoOriginal.toFixed(2)}</span>
            <span class="estado">{d.estado}</span>
            {#if d.estado === 'pendiente'}
              <button type="button" onclick={() => abrirAbono(d.id)}>Abonar</button>
            {/if}
          </div>
          {#if abonoAbiertoPara === d.id}
            <form class="abono-form" onsubmit={(e) => enviarAbono(e, d.id)}>
              <label>
                Monto
                <input type="number" step="0.01" min="0.01" bind:value={abonoMonto} required />
              </label>
              <label>
                Moneda
                <select bind:value={abonoMoneda}>
                  <option value="USD">USD</option>
                  <option value="VES">VES</option>
                </select>
              </label>
              {#if abonoMoneda === 'VES'}
                <label>
                  Tasa BCV
                  <input type="number" step="0.01" min="0.01" bind:value={abonoTasaBCV} required />
                </label>
              {/if}
              <label>
                Fecha
                <input type="date" bind:value={abonoFecha} required />
              </label>
              {#if abonoError}<p class="error">{abonoError}</p>{/if}
              <button type="submit">Confirmar abono</button>
              <button type="button" onclick={() => (abonoAbiertoPara = null)}>Cancelar</button>
            </form>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
