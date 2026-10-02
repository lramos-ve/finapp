<script>
  import DatePicker from '../../shared/components/DatePicker.svelte'

  let { onRegistrar } = $props()

  let persona = $state('')
  let direccion = $state('debo')
  let monto = $state('')
  let fecha = $state(new Date().toISOString().slice(0, 10))
  let notas = $state('')
  let error = $state('')

  async function enviar(e) {
    e.preventDefault()
    error = ''
    try {
      await onRegistrar({ persona, direccion, monto: Number(monto), fecha, notas })
      persona = ''
      monto = ''
      notas = ''
    } catch (err) {
      error = err.message
    }
  }
</script>

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
        <div class="control-segmentado">
          <button type="button" class:activo={direccion === 'debo'} class="gasto" onclick={() => (direccion = 'debo')}>
            Yo debo
          </button>
          <button type="button" class:activo={direccion === 'me_deben'} class="ingreso" onclick={() => (direccion = 'me_deben')}>
            Me deben
          </button>
        </div>
      </label>
    </div>
    <div class="fila">
      <label>
        Monto (USD)
        <input type="number" step="0.01" min="0.01" bind:value={monto} required />
      </label>
      <label>
        Fecha
        <DatePicker bind:value={fecha} required />
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
