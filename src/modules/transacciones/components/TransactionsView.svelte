<script>
  import {
    registrarTransaccion,
    actualizarTransaccion,
    eliminarTransaccion,
    listarTransacciones,
    obtenerBalance,
  } from '../logic/transactions.js'
  import { obtenerCategoriasDisponibles } from '../logic/categories.js'
  import TransactionBalance from './TransactionBalance.svelte'
  import TransactionForm from './TransactionForm.svelte'
  import TransactionList from './TransactionList.svelte'
  import Icon from '../../shared/components/Icon.svelte'

  let todasTransacciones = $state([])
  let categoriasDisponibles = $state([])
  let balance = $state({ totalIngresos: 0, totalGastos: 0, balance: 0 })
  let mostrarModalRegistro = $state(false)
  let mostrarModalHistorial = $state(false)
  let filtroTipo = $state('')
  let filtroMoneda = $state('')
  let filtroCategoria = $state('')
  let editandoTransaccion = $state(null)

  let transaccionesFiltradas = $derived.by(() => {
    return todasTransacciones.filter((t) => {
      if (filtroTipo && t.tipo !== filtroTipo) return false
      if (filtroMoneda && t.moneda !== filtroMoneda) return false
      if (filtroCategoria && t.categoria !== filtroCategoria) return false
      return true
    })
  })

  async function cargar() {
    todasTransacciones = await listarTransacciones({})
    categoriasDisponibles = obtenerCategoriasDisponibles(todasTransacciones)
    balance = await obtenerBalance({})
  }

  async function manejarGuardarRegistro(datos) {
    await registrarTransaccion(datos)
    mostrarModalRegistro = false
    await cargar()
  }

  function iniciarEdicion(t) {
    editandoTransaccion = t
  }

  function cancelarEdicion() {
    editandoTransaccion = null
  }

  async function manejarGuardarEdicion(datos) {
    if (editandoTransaccion) {
      await actualizarTransaccion(editandoTransaccion.id, datos)
      editandoTransaccion = null
      await cargar()
    }
  }

  async function manejarEliminar(id) {
    if (editandoTransaccion?.id === id) {
      cancelarEdicion()
    }
    await eliminarTransaccion(id)
    await cargar()
  }

  function cerrarModalHistorial() {
    mostrarModalHistorial = false
    editandoTransaccion = null
  }

  function manejarKeydown(event) {
    if (event.key === 'Escape') {
      if (editandoTransaccion) {
        cancelarEdicion()
      } else if (mostrarModalRegistro) {
        mostrarModalRegistro = false
      } else if (mostrarModalHistorial) {
        cerrarModalHistorial()
      }
    }
  }

  $effect(() => {
    cargar()
  })
</script>

<svelte:window onkeydown={manejarKeydown} />

<TransactionBalance {balance} />

<div class="contenedor-acciones-transacciones">
  <button
    type="button"
    class="boton-accion-transacciones primario"
    onclick={() => (mostrarModalRegistro = true)}
    aria-haspopup="dialog"
  >
    <Icon name="plus" size={18} />
    <span>Registrar Transacción</span>
  </button>
  <button
    type="button"
    class="boton-accion-transacciones secundario"
    onclick={() => (mostrarModalHistorial = true)}
    aria-haspopup="dialog"
  >
    <Icon name="transactions" size={18} />
    <span>Historial de Transacciones</span>
    <span class="badge-contador">{todasTransacciones.length}</span>
  </button>
</div>

{#if mostrarModalRegistro}
  <div
    class="modal-backdrop"
    onclick={(e) => e.target === e.currentTarget && (mostrarModalRegistro = false)}
    role="presentation"
  >
    <div
      class="modal-neumorphic"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar transacción"
    >
      <TransactionForm
        {categoriasDisponibles}
        esModal={true}
        onCerrar={() => (mostrarModalRegistro = false)}
        onGuardar={manejarGuardarRegistro}
      />
    </div>
  </div>
{/if}

{#if mostrarModalHistorial}
  <div
    class="modal-backdrop"
    onclick={(e) => e.target === e.currentTarget && cerrarModalHistorial()}
    role="presentation"
  >
    <div
      class="modal-neumorphic modal-lg"
      role="dialog"
      aria-modal="true"
      aria-label="Historial de transacciones"
    >
      <div class="modal-header">
        <h2>Historial de transacciones</h2>
        <button
          type="button"
          class="boton-cerrar-modal"
          onclick={cerrarModalHistorial}
          aria-label="Cerrar modal"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <div class="modal-cuerpo-scroll">
        {#if editandoTransaccion}
          <div style="margin-bottom: 1.25rem;">
            <TransactionForm
              {categoriasDisponibles}
              {editandoTransaccion}
              onGuardar={manejarGuardarEdicion}
              onCancelarEdicion={cancelarEdicion}
            />
          </div>
        {/if}

        <TransactionList
          transacciones={transaccionesFiltradas}
          {categoriasDisponibles}
          sinPanel={true}
          bind:filtroTipo
          bind:filtroMoneda
          bind:filtroCategoria
          onEditar={iniciarEdicion}
          onEliminar={manejarEliminar}
        />
      </div>
    </div>
  </div>
{/if}
