<script>
  let { categoriasDisponibles = [], onCrear } = $props()

  let nombre = $state('')
  let categoria = $state('')
  let monto = $state('')
  let diaVencimiento = $state('')
  let error = $state('')

  async function enviar(e) {
    e.preventDefault()
    error = ''
    try {
      await onCrear({
        nombre,
        monto: Number(monto),
        diaVencimiento: Number(diaVencimiento),
        categoria,
      })
      nombre = ''
      categoria = ''
      monto = ''
      diaVencimiento = ''
    } catch (err) {
      error = err.message
    }
  }
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
        Categoría
        <input
          type="text"
          list="categorias-lista-gf"
          bind:value={categoria}
          placeholder="Selecciona o escribe..."
        />
        <datalist id="categorias-lista-gf">
          {#each categoriasDisponibles as cat}
            <option value={cat}></option>
          {/each}
        </datalist>
      </label>
    </div>
    <div class="fila">
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
