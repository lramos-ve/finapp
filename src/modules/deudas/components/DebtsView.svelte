<script>
  import {
    registrarDeuda,
    registrarAbono,
    listarDeudas,
    obtenerTotalesPorDireccion,
    eliminarDeuda,
  } from '../logic/debts.js'
  import DebtForm from './DebtForm.svelte'
  import DebtList from './DebtList.svelte'

  let deudas = $state([])
  let totales = $state({ debo: 0, meDeben: 0 })

  async function cargar() {
    deudas = await listarDeudas({})
    totales = await obtenerTotalesPorDireccion()
  }

  async function manejarRegistrar(datos) {
    await registrarDeuda(datos)
    await cargar()
  }

  async function manejarAbonar(deudaId, datos) {
    await registrarAbono(datos)
    await cargar()
  }

  async function manejarEliminar(deudaId) {
    await eliminarDeuda(deudaId)
    await cargar()
  }

  cargar()
</script>

<DebtForm onRegistrar={manejarRegistrar} />

<DebtList
  {deudas}
  {totales}
  onAbonar={manejarAbonar}
  onEliminar={manejarEliminar}
/>
