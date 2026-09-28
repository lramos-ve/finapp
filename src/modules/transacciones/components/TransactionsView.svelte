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

  let editandoTransaccion = $state(null)
  let filtroTipo = $state('')
  let filtroMoneda = $state('')
  let filtroCategoria = $state('')

  let transacciones = $state([])
  let categoriasDisponibles = $state([])
  let balance = $state({ totalIngresos: 0, totalGastos: 0, balance: 0 })

  async function cargar() {
    const todas = await listarTransacciones({})
    categoriasDisponibles = obtenerCategoriasDisponibles(todas)
    transacciones = await listarTransacciones({
      tipo: filtroTipo || undefined,
      moneda: filtroMoneda || undefined,
      categoria: filtroCategoria || undefined,
    })
    balance = await obtenerBalance({})
  }

  function cargarParaEditar(t) {
    editandoTransaccion = t
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    editandoTransaccion = null
  }

  async function manejarGuardar(datos) {
    if (editandoTransaccion) {
      await actualizarTransaccion(editandoTransaccion.id, datos)
      editandoTransaccion = null
    } else {
      await registrarTransaccion(datos)
    }
    await cargar()
  }

  async function manejarEliminar(id) {
    if (editandoTransaccion?.id === id) {
      cancelarEdicion()
    }
    await eliminarTransaccion(id)
    await cargar()
  }

  $effect(() => {
    filtroTipo
    filtroMoneda
    filtroCategoria
    cargar()
  })
</script>

<TransactionBalance {balance} />

<TransactionForm
  {categoriasDisponibles}
  {editandoTransaccion}
  onGuardar={manejarGuardar}
  onCancelarEdicion={cancelarEdicion}
/>

<TransactionList
  {transacciones}
  {categoriasDisponibles}
  bind:filtroTipo
  bind:filtroMoneda
  bind:filtroCategoria
  onEditar={cargarParaEditar}
  onEliminar={manejarEliminar}
/>
