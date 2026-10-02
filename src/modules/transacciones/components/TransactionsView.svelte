<script>
  import {
    registrarTransaccion,
    listarTransacciones,
    obtenerBalance,
  } from '../logic/transactions.js'
  import { obtenerCategoriasDisponibles } from '../logic/categories.js'
  import TransactionBalance from './TransactionBalance.svelte'
  import TransactionForm from './TransactionForm.svelte'

  let categoriasDisponibles = $state([])
  let balance = $state({ totalIngresos: 0, totalGastos: 0, balance: 0 })

  async function cargar() {
    const todas = await listarTransacciones({})
    categoriasDisponibles = obtenerCategoriasDisponibles(todas)
    balance = await obtenerBalance({})
  }

  async function manejarGuardar(datos) {
    await registrarTransaccion(datos)
    await cargar()
  }

  $effect(() => {
    cargar()
  })
</script>

<TransactionBalance {balance} />

<TransactionForm
  {categoriasDisponibles}
  onGuardar={manejarGuardar}
/>
