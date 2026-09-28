<script>
  import {
    definirGastoFijo,
    desactivarGastoFijo,
    listarGastosFijos,
    listarInstancias,
    registrarPagoInstancia,
    sincronizarGastosFijos,
    periodoDe,
    siguientePeriodo,
  } from '../logic/fixedExpenses.js'
  import { obtenerCategoriasDisponibles } from '../../transacciones/index.js'

  import FixedExpenseForm from './FixedExpenseForm.svelte'
  import FixedExpenseList from './FixedExpenseList.svelte'

  let gastosFijos = $state([])
  let categoriasDisponibles = $state([])
  let instanciasPorPeriodo = $state([])

  async function cargar() {
    await sincronizarGastosFijos()
    gastosFijos = await listarGastosFijos({})
    categoriasDisponibles = obtenerCategoriasDisponibles(gastosFijos)

    const periodoActual = periodoDe(new Date())
    const periodoSiguiente = siguientePeriodo(periodoActual)

    const [actual, siguiente] = await Promise.all([
      listarInstancias({ periodo: periodoActual }),
      listarInstancias({ periodo: periodoSiguiente }),
    ])

    instanciasPorPeriodo = [
      { periodo: periodoActual, instancias: actual },
      { periodo: periodoSiguiente, instancias: siguiente },
    ]
  }

  async function manejarCrear(datos) {
    await definirGastoFijo(datos)
    await cargar()
  }

  async function manejarDesactivar(id) {
    await desactivarGastoFijo(id)
    await cargar()
  }

  async function manejarPagar(instanciaId, datosPago) {
    await registrarPagoInstancia(instanciaId, datosPago)
    await cargar()
  }

  cargar()
</script>

<FixedExpenseForm {categoriasDisponibles} onCrear={manejarCrear} />

<FixedExpenseList
  {gastosFijos}
  {instanciasPorPeriodo}
  onDesactivar={manejarDesactivar}
  onPagar={manejarPagar}
/>
