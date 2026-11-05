<script>
  import Icon from '../../shared/components/Icon.svelte'
  import {
    obtenerMetaAhorro,
    guardarMetaAhorro,
    agregarAhorro,
    eliminarMetaAhorro,
    calcularProgresoMeta,
  } from '../logic/savings-goal.js'

  let meta = $state(null)
  let editando = $state(false)
  let nombre = $state('')
  let monto = $state('')
  let ahorradoInput = $state('')
  let agregando = $state(false)
  let aporte = $state('')
  let error = $state('')

  let progreso = $derived(calcularProgresoMeta(meta))

  async function cargar() {
    meta = await obtenerMetaAhorro()
  }

  function abrirEditor() {
    nombre = meta?.nombre ?? ''
    monto = meta ? String(meta.montoObjetivo) : ''
    ahorradoInput = meta ? String(meta.ahorrado ?? 0) : ''
    error = ''
    editando = true
  }

  async function guardar(e) {
    e.preventDefault()
    try {
      meta = await guardarMetaAhorro({ nombre, montoObjetivo: monto, ahorrado: ahorradoInput })
      editando = false
    } catch (err) {
      error = err.message
    }
  }

  async function sumarAporte(e) {
    e.preventDefault()
    try {
      meta = await agregarAhorro(aporte)
      aporte = ''
      error = ''
      agregando = false
    } catch (err) {
      error = err.message
    }
  }

  async function quitar() {
    if (window.confirm('¿Eliminar tu meta de ahorro?')) {
      await eliminarMetaAhorro()
      meta = null
    }
  }

  cargar()
</script>

<section class="panel meta-ahorro">
  <h2>Meta de ahorro</h2>

  {#if editando}
    <form class="meta-form" onsubmit={guardar}>
      <label>
        <span class="meta-label">Nombre</span>
        <input type="text" bind:value={nombre} placeholder="Ej. Viaje, fondo de emergencia" maxlength="40" />
      </label>
      <label>
        <span class="meta-label">Monto objetivo (USD)</span>
        <input type="number" bind:value={monto} min="1" step="0.01" inputmode="decimal" required />
      </label>
      {#if meta}
        <label>
          <span class="meta-label">Ahorrado hasta ahora (USD)</span>
          <input type="number" bind:value={ahorradoInput} min="0" step="0.01" inputmode="decimal" />
        </label>
      {/if}
      {#if error}<p class="meta-error">{error}</p>{/if}
      <div class="meta-botones">
        <button type="button" class="boton-secundario" onclick={() => (editando = false)}>Cancelar</button>
        <button type="submit" class="boton-secundario meta-guardar">Guardar</button>
      </div>
    </form>
  {:else if meta}
    <div class="meta-cabecera">
      <strong class="meta-nombre">{meta.nombre}</strong>
      <div class="acciones-fila">
        <button type="button" class="boton-accion editar" aria-label="Editar meta" title="Editar meta" onclick={abrirEditor}>
          <Icon name="pencil" size={15} />
        </button>
        <button type="button" class="boton-accion eliminar" aria-label="Eliminar meta" title="Eliminar meta" onclick={quitar}>
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
    <div class="meta-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progreso.porcentaje} aria-label="Progreso de la meta de ahorro">
      <div class="meta-relleno" class:lograda={progreso.lograda} style="width: {progreso.porcentaje}%"></div>
    </div>
    <div class="meta-detalle">
      <span><strong>${progreso.ahorrado.toFixed(2)}</strong> de ${meta.montoObjetivo.toFixed(2)}</span>
      <span class="meta-porcentaje">{progreso.porcentaje}%</span>
    </div>
    <p class="meta-nota">
      {progreso.lograda ? '¡Meta lograda! 🎉' : `Te faltan $${progreso.restante.toFixed(2)}`}
    </p>
    {#if agregando}
      <form class="meta-aporte" onsubmit={sumarAporte}>
        <input type="number" bind:value={aporte} step="0.01" inputmode="decimal" placeholder="Monto en USD (negativo para restar)" required />
        <button type="submit" class="boton-secundario meta-guardar">Guardar</button>
        <button type="button" class="boton-secundario" onclick={() => { agregando = false; error = '' }}>Cancelar</button>
      </form>
      {#if error}<p class="meta-error">{error}</p>{/if}
    {:else}
      <button type="button" class="boton-secundario meta-guardar" onclick={() => { agregando = true; error = '' }}>
        <Icon name="plus" size={16} /> Agregar ahorro
      </button>
    {/if}
  {:else}
    <p class="meta-nota">Define cuánto quieres ahorrar y registra manualmente cuánto llevas ahorrado.</p>
    <button type="button" class="boton-secundario meta-guardar" onclick={abrirEditor}>
      <Icon name="plus" size={16} /> Definir meta
    </button>
  {/if}
</section>

<style>
  .meta-cabecera { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.75rem; }
  .meta-nombre { font-size: 1rem; }
  .meta-barra { height: 14px; border-radius: 999px; background: var(--bg); box-shadow: var(--neu-inset-sm); overflow: hidden; }
  .meta-relleno { height: 100%; border-radius: 999px; background: var(--acento); transition: width 0.4s ease; }
  .meta-relleno.lograda { background: var(--verde); }
  .meta-detalle { display: flex; justify-content: space-between; margin-top: 0.65rem; font-size: 0.9rem; }
  .meta-porcentaje { color: var(--acento); font-weight: 700; }
  .meta-nota { margin: 0.5rem 0 0.75rem; color: var(--texto-tenue); font-size: 0.85rem; }
  .meta-aporte { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .meta-aporte input { flex: 1; min-width: 8rem; }
  .meta-form { display: flex; flex-direction: column; gap: 0.75rem; }
  .meta-form label { display: flex; flex-direction: column; gap: 0.35rem; }
  .meta-label { font-size: 0.8rem; color: var(--texto-tenue); }
  .meta-error { color: var(--rojo); font-size: 0.85rem; margin: 0; }
  .meta-botones { display: flex; gap: 0.75rem; justify-content: flex-end; }
  .meta-guardar { color: var(--acento); display: inline-flex; align-items: center; gap: 0.4rem; }
</style>
