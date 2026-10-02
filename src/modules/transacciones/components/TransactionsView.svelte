<script>
  import {
    registrarTransaccion,
    listarTransacciones,
    obtenerBalance,
  } from '../logic/transactions.js'
  import { obtenerCategoriasDisponibles } from '../logic/categories.js'
  import TransactionBalance from './TransactionBalance.svelte'
  import TransactionForm from './TransactionForm.svelte'
  import Icon from '../../shared/components/Icon.svelte'

  let categoriasDisponibles = $state([])
  let balance = $state({ totalIngresos: 0, totalGastos: 0, balance: 0 })
  let mostrarModal = $state(false)

  async function cargar() {
    const todas = await listarTransacciones({})
    categoriasDisponibles = obtenerCategoriasDisponibles(todas)
    balance = await obtenerBalance({})
  }

  async function manejarGuardar(datos) {
    await registrarTransaccion(datos)
    mostrarModal = false
    await cargar()
  }

  function abrirModal() {
    mostrarModal = true
  }

  function cerrarModal() {
    mostrarModal = false
  }

  function manejarKeydown(event) {
    if (event.key === 'Escape' && mostrarModal) {
      cerrarModal()
    }
  }

  function manejarClickBackdrop(event) {
    if (event.target === event.currentTarget) {
      cerrarModal()
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
    class="boton-nuevo-registro"
    onclick={abrirModal}
    aria-haspopup="dialog"
  >
    <Icon name="plus" size={18} />
    <span>Registrar Transacción</span>
  </button>
</div>

{#if mostrarModal}
  <div
    class="modal-backdrop"
    onclick={manejarClickBackdrop}
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
        onCerrar={cerrarModal}
        onGuardar={manejarGuardar}
      />
    </div>
  </div>
{/if}
