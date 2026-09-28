<script>
  import Icon from '../../shared/components/Icon.svelte'
  import DebtPaymentModal from './DebtPaymentModal.svelte'

  let {
    deudas = [],
    totales = { debo: 0, meDeben: 0 },
    onAbonar,
    onEliminar,
  } = $props()

  let abonoAbiertoPara = $state(null)

  function abrirAbono(deudaId) {
    abonoAbiertoPara = deudaId
  }

  function cerrarAbono() {
    abonoAbiertoPara = null
  }

  async function manejarConfirmarAbono(deudaId, datos) {
    await onAbonar(deudaId, datos)
    abonoAbiertoPara = null
  }

  async function confirmarEliminarDeuda(deuda) {
    const confirmacion = window.confirm(
      `¿Eliminar la deuda de "${deuda.persona}"? Se eliminarán también todos los abonos asociados a ella.`
    )
    if (!confirmacion) return

    await onEliminar(deuda.id)
    if (abonoAbiertoPara === deuda.id) {
      abonoAbiertoPara = null
    }
  }
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
            <div class="acciones-fila">
              {#if d.estado === 'pendiente'}
                <button type="button" class="boton-accion abonar" onclick={() => abrirAbono(d.id)}>
                  <Icon name="plus" size={15} />
                  <span>Abonar</span>
                </button>
              {/if}
              <button
                type="button"
                class="boton-accion eliminar"
                aria-label="Eliminar deuda"
                title="Eliminar deuda"
                onclick={() => confirmarEliminarDeuda(d)}
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
          {#if abonoAbiertoPara === d.id}
            <DebtPaymentModal
              deudaId={d.id}
              onConfirmar={manejarConfirmarAbono}
              onCancelar={cerrarAbono}
            />
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
