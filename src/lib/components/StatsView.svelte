<script>
  import { onMount } from 'svelte'
  import { session } from '../session.svelte.js'
  import { listarTransacciones } from '../transactions.js'
  import { cargarAhorrosLocales, getGlobalSavingsGoal, subscribeSavings } from '../savings.js'
  import { listarGastosFijos } from '../fixedExpenses.js'
  import { listarDeudas, obtenerTotalesPorDireccion } from '../debts.js'
  import { getTasaOficialBCV } from '../rates.js'
  import { subscribeTransactions, subscribeFixedExpenses, subscribeDebts } from '../groups.js'

  // Período seleccionado
  let periodo = $state('mes_actual') // 'mes_actual' | 'mes_anterior' | 'ultimos_3' | 'ano_actual' | 'todo'

  // Datos brutos
  let transacciones = $state([])
  let ahorros = $state([])
  let gastosFijos = $state([])
  let deudas = $state([])
  let totalesDeudas = $state({ debo: 0, meDeben: 0 })
  let metaGlobalUSD = $state(0)
  let tasaBCVOficial = $state(null)
  let cargando = $state(true)

  // Subscripciones
  let unsubTrans = null
  let unsubSavings = null
  let unsubFixed = null

  // Helpers de fechas
  function getRangoFechas(p) {
    const ahora = new Date()
    const anio = ahora.getFullYear()
    const mes = ahora.getMonth() // 0-11

    if (p === 'mes_actual') {
      const inicio = new Date(anio, mes, 1).toISOString().slice(0, 10)
      const fin = new Date(anio, mes + 1, 0).toISOString().slice(0, 10)
      return { inicio, fin, label: ahora.toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }
    }
    if (p === 'mes_anterior') {
      const inicio = new Date(anio, mes - 1, 1).toISOString().slice(0, 10)
      const fin = new Date(anio, mes, 0).toISOString().slice(0, 10)
      const fechaMesAnt = new Date(anio, mes - 1, 1)
      return { inicio, fin, label: fechaMesAnt.toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }
    }
    if (p === 'ultimos_3') {
      const inicio = new Date(anio, mes - 2, 1).toISOString().slice(0, 10)
      const fin = new Date(anio, mes + 1, 0).toISOString().slice(0, 10)
      return { inicio, fin, label: 'Últimos 3 meses' }
    }
    if (p === 'ano_actual') {
      const inicio = `${anio}-01-01`
      const fin = `${anio}-12-31`
      return { inicio, fin, label: `Año ${anio}` }
    }
    return { inicio: '2000-01-01', fin: '2099-12-31', label: 'Histórico Total' }
  }

  let rango = $derived(getRangoFechas(periodo))

  // Transacciones filtradas por el período
  let transaccionesFiltradas = $derived.by(() => {
    return transacciones.filter(t => t.fecha >= rango.inicio && t.fecha <= rango.fin)
  })

  // 1. KPIs del Período
  let ingresosPeriodo = $derived.by(() => {
    return transaccionesFiltradas
      .filter(t => t.tipo === 'ingreso')
      .reduce((acc, t) => acc + (Number(t.montoUSD) || 0), 0)
  })

  let gastosPeriodo = $derived.by(() => {
    return transaccionesFiltradas
      .filter(t => t.tipo === 'gasto')
      .reduce((acc, t) => acc + (Number(t.montoUSD) || 0), 0)
  })

  let balancePeriodo = $derived(ingresosPeriodo - gastosPeriodo)

  let tasaAhorro = $derived.by(() => {
    if (ingresosPeriodo <= 0) return 0
    const ratio = ((ingresosPeriodo - gastosPeriodo) / ingresosPeriodo) * 100
    return Math.max(0, Math.round(ratio))
  })

  // 2. Patrimonio y Posición Global
  let totalAhorradoUSD = $derived.by(() => {
    return ahorros.reduce((acc, f) => {
      const movimientos = f.movimientos || []
      const abonos = movimientos.filter(m => m.tipo === 'abono').reduce((s, m) => s + (Number(m.montoUSD) || 0), 0)
      const retiros = movimientos.filter(m => m.tipo === 'retiro').reduce((s, m) => s + (Number(m.montoUSD) || 0), 0)
      return acc + (abonos - retiros)
    }, 0)
  })

  let totalFisicoUSD = $derived.by(() => {
    return ahorros
      .filter(f => f.tipoAhorro === 'fisico')
      .reduce((acc, f) => {
        const movs = f.movimientos || []
        const abonos = movs.filter(m => m.tipo === 'abono').reduce((s, m) => s + (Number(m.montoUSD) || 0), 0)
        const retiros = movs.filter(m => m.tipo === 'retiro').reduce((s, m) => s + (Number(m.montoUSD) || 0), 0)
        return acc + (abonos - retiros)
      }, 0)
  })

  let totalElectronicoUSD = $derived.by(() => {
    return ahorros
      .filter(f => f.tipoAhorro === 'electronico')
      .reduce((acc, f) => {
        const movs = f.movimientos || []
        const abonos = movs.filter(m => m.tipo === 'abono').reduce((s, m) => s + (Number(m.montoUSD) || 0), 0)
        const retiros = movs.filter(m => m.tipo === 'retiro').reduce((s, m) => s + (Number(m.montoUSD) || 0), 0)
        return acc + (abonos - retiros)
      }, 0)
  })

  let balanceCuentaTotal = $derived.by(() => {
    const totalIng = transacciones.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + (Number(t.montoUSD) || 0), 0)
    const totalGas = transacciones.filter(t => t.tipo === 'gasto').reduce((s, t) => s + (Number(t.montoUSD) || 0), 0)
    return totalIng - totalGas
  })

  let patrimonioNeto = $derived.by(() => {
    // Patrimonio = Balance Cuentas + Total Ahorrado + Me Deben - Yo Debo
    return balanceCuentaTotal + totalAhorradoUSD + (totalesDeudas.meDeben || 0) - (totalesDeudas.debo || 0)
  })

  // 3. Gastos por Categoría
  let gastosPorCategoria = $derived.by(() => {
    const mapa = {}
    const total = gastosPeriodo
    const listaGastos = transaccionesFiltradas.filter(t => t.tipo === 'gasto')

    for (const g of listaGastos) {
      const cat = g.categoria?.trim() || 'Sin Categoría'
      if (!mapa[cat]) {
        mapa[cat] = { nombre: cat, montoUSD: 0, cantidad: 0 }
      }
      mapa[cat].montoUSD += Number(g.montoUSD) || 0
      mapa[cat].cantidad += 1
    }

    const resultado = Object.values(mapa).map(c => {
      const porcentaje = total > 0 ? (c.montoUSD / total) * 100 : 0
      return {
        ...c,
        porcentaje: Math.round(porcentaje),
        porcentajeExacto: porcentaje
      }
    })

    return resultado.sort((a, b) => b.montoUSD - a.montoUSD)
  })

  let categoriaMayorImpacto = $derived.by(() => {
    return gastosPorCategoria.length > 0 ? gastosPorCategoria[0] : null
  })

  // 4. Desglose Bimonetario (USD vs VES en Gastos)
  let desgloseMonedaGastos = $derived.by(() => {
    const gastos = transaccionesFiltradas.filter(t => t.tipo === 'gasto')
    let enUSD = 0
    let enVES = 0

    for (const g of gastos) {
      if (g.moneda === 'VES') {
        enVES += Number(g.montoUSD) || 0
      } else {
        enUSD += Number(g.montoUSD) || 0
      }
    }

    const total = enUSD + enVES
    const pctUSD = total > 0 ? Math.round((enUSD / total) * 100) : 0
    const pctVES = total > 0 ? Math.round((enVES / total) * 100) : 0

    return { enUSD, enVES, pctUSD, pctVES, total }
  })

  // 5. Gastos Fijos vs Gastos Variables
  let totalComprometidoGastosFijos = $derived.by(() => {
    return gastosFijos
      .filter(g => g.activo === 1 || g.activo === true)
      .reduce((acc, g) => acc + (Number(g.monto) || 0), 0)
  })

  let proporcionFijoVariable = $derived.by(() => {
    const totalGasto = gastosPeriodo || 0
    const fijos = totalComprometidoGastosFijos
    const variable = Math.max(0, totalGasto - fijos)
    const totalReferencia = Math.max(totalGasto, fijos)
    const pctFijo = totalReferencia > 0 ? Math.round((fijos / totalReferencia) * 100) : 0
    const pctVar = Math.max(0, 100 - pctFijo)
    return { fijos, variable, pctFijo, pctVar }
  })

  // 6. Métricas de Eficiencia
  let metricasEficiencia = $derived.by(() => {
    const listaGastos = transaccionesFiltradas.filter(t => t.tipo === 'gasto')
    const numDias = Math.max(1, Math.round((new Date(rango.fin) - new Date(rango.inicio)) / (1000 * 60 * 60 * 24)))
    const gastoDiario = gastosPeriodo / (periodo === 'mes_actual' ? Math.max(1, new Date().getDate()) : numDias)
    const ticketPromedio = listaGastos.length > 0 ? gastosPeriodo / listaGastos.length : 0

    let mayorGasto = null
    for (const g of listaGastos) {
      if (!mayorGasto || g.montoUSD > mayorGasto.montoUSD) {
        mayorGasto = g
      }
    }

    return {
      gastoDiario,
      ticketPromedio,
      mayorGasto,
      totalTransacciones: transaccionesFiltradas.length
    }
  })

  // 7. Barras de Evolución Temporal (Agrupación por Semanas o Meses)
  let histogramaTemporal = $derived.by(() => {
    const items = [...transaccionesFiltradas].sort((a, b) => (a.fecha > b.fecha ? 1 : -1))
    const grupos = {}

    for (const t of items) {
      // Agrupar por mes o por fecha
      const clave = periodo === 'ano_actual' || periodo === 'todo' 
        ? t.fecha.slice(0, 7) // YYYY-MM
        : t.fecha.slice(0, 10) // Día

      if (!grupos[clave]) {
        grupos[clave] = { clave, ingresos: 0, gastos: 0 }
      }
      if (t.tipo === 'ingreso') grupos[clave].ingresos += Number(t.montoUSD) || 0
      else grupos[clave].gastos += Number(t.montoUSD) || 0
    }

    const lista = Object.values(grupos).slice(-10)
    const maxVal = Math.max(1, ...lista.map(g => Math.max(g.ingresos, g.gastos)))

    return lista.map(g => ({
      ...g,
      pctIngresos: Math.round((g.ingresos / maxVal) * 100),
      pctGastos: Math.round((g.gastos / maxVal) * 100),
      label: formatClaveLabel(g.clave)
    }))
  })

  function formatClaveLabel(c) {
    if (c.length === 7) {
      const [y, m] = c.split('-')
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      return `${meses[parseInt(m, 10) - 1]}`
    }
    const partes = c.split('-')
    return `${partes[2]}/${partes[1]}`
  }

  // Carga de datos
  async function cargarTodo() {
    cargando = true
    try {
      const dataBCV = await getTasaOficialBCV()
      tasaBCVOficial = dataBCV.promedio

      const groupId = session.activeGroup?.id

      if (!groupId) {
        transacciones = await listarTransacciones({})
        ahorros = await cargarAhorrosLocales()
        gastosFijos = await listarGastosFijos()
        deudas = await listarDeudas({})
        totalesDeudas = await obtenerTotalesPorDireccion()
        metaGlobalUSD = await getGlobalSavingsGoal(null)
      } else {
        metaGlobalUSD = await getGlobalSavingsGoal(groupId)
        deudas = await listarDeudas({})
        totalesDeudas = await obtenerTotalesPorDireccion()
      }
    } catch (e) {
      console.error(e)
    } finally {
      cargando = false
    }
  }

  $effect(() => {
    const groupId = session.activeGroup?.id
    if (groupId) {
      if (unsubTrans) unsubTrans()
      if (unsubSavings) unsubSavings()
      if (unsubFixed) unsubFixed()

      unsubTrans = subscribeTransactions(groupId, items => {
        transacciones = items
      })
      unsubSavings = subscribeSavings(groupId, items => {
        ahorros = items
      })
      unsubFixed = subscribeFixedExpenses(groupId, items => {
        gastosFijos = items
      })
    } else {
      cargarTodo()
    }
  })

  onMount(() => {
    cargarTodo()
    return () => {
      if (unsubTrans) unsubTrans()
      if (unsubSavings) unsubSavings()
      if (unsubFixed) unsubFixed()
    }
  })
</script>

<!-- CABECERA Y SELECTOR DE PERÍODO -->
<section class="panel" style="margin-bottom: 1rem;">
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.6rem;">
    <div>
      <h2 style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.15rem;">
        <i class="fa-solid fa-chart-pie" style="color: var(--acento);"></i>
        <span>Estadísticas Financieras</span>
      </h2>
      <span style="font-size: 0.74rem; color: var(--texto-tenue);">
        Analítica inteligente • {rango.label}
      </span>
    </div>

    <!-- Selector de Período -->
    <div style="display: flex; align-items: center; gap: 0.3rem;">
      <select 
        bind:value={periodo} 
        style="padding: 0.35rem 0.65rem; font-size: 0.78rem; min-height: 32px; border-radius: var(--radius-sm); font-weight: 600;"
        aria-label="Seleccionar período de análisis"
      >
        <option value="mes_actual">Este Mes</option>
        <option value="mes_anterior">Mes Anterior</option>
        <option value="ultimos_3">Últimos 3 Meses</option>
        <option value="ano_actual">Este Año</option>
        <option value="todo">Histórico Total</option>
      </select>
    </div>
  </div>
</section>

<!-- 1. KPIS PRINCIPALES: INGRESOS, GASTOS, BALANCE Y TASA DE AHORRO -->
<section class="panel" style="margin-bottom: 1rem;">
  <div class="balance-cards" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
    <!-- Ingresos -->
    <div class="card ingreso">
      <span class="label">
        <i class="fa-solid fa-arrow-down" style="color: var(--verde);"></i>
        <span>Ingresos</span>
      </span>
      <span class="valor" style="color: var(--verde);">
        ${ingresosPeriodo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      {#if tasaBCVOficial}
        <span style="font-size: 0.68rem; color: var(--texto-tenue);">
          ≈ Bs. {(ingresosPeriodo * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>

    <!-- Gastos -->
    <div class="card gasto">
      <span class="label">
        <i class="fa-solid fa-arrow-up" style="color: var(--rojo);"></i>
        <span>Gastos</span>
      </span>
      <span class="valor" style="color: var(--rojo);">
        ${gastosPeriodo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      {#if tasaBCVOficial}
        <span style="font-size: 0.68rem; color: var(--texto-tenue);">
          ≈ Bs. {(gastosPeriodo * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>

    <!-- Balance Neto -->
    <div class="card {balancePeriodo >= 0 ? 'ingreso' : 'gasto'}">
      <span class="label">
        <i class="fa-solid fa-wallet" style="color: {balancePeriodo >= 0 ? 'var(--verde)' : 'var(--rojo)'};"></i>
        <span>Flujo Neto</span>
      </span>
      <span class="valor" style="color: {balancePeriodo >= 0 ? 'var(--verde)' : 'var(--rojo)'};">
        {balancePeriodo >= 0 ? '+' : '-'}${Math.abs(balancePeriodo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">
        {balancePeriodo >= 0 ? 'Superávit del período' : 'Déficit del período'}
      </span>
    </div>

    <!-- Tasa de Ahorro -->
    <div class="card" style="border-left: 3px solid var(--acento);">
      <span class="label">
        <i class="fa-solid fa-piggy-bank" style="color: var(--acento);"></i>
        <span>Tasa de Ahorro</span>
      </span>
      <span class="valor" style="color: var(--acento);">
        {tasaAhorro}%
      </span>
      <div style="width: 100%; background: var(--bg-subtle); height: 5px; border-radius: 4px; overflow: hidden; margin-top: 0.3rem;">
        <div style="width: {Math.min(100, tasaAhorro)}%; background: var(--acento); height: 100%; border-radius: 4px;"></div>
      </div>
    </div>
  </div>
</section>

<!-- 2. POSICIÓN PATRIMONIAL GLOBAL Y SALUD FINANCIERA -->
<section class="panel" style="margin-bottom: 1rem;">
  <h3 style="margin: 0 0 0.85rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.45rem;">
    <i class="fa-solid fa-vault" style="color: var(--acento);"></i>
    <span>Patrimonio & Posición Financiera Global</span>
  </h3>

  <div class="balance-cards" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
    <!-- Patrimonio Neto -->
    <div class="card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%);">
      <span class="label">
        <i class="fa-solid fa-gem" style="color: #6366f1;"></i>
        <span>Patrimonio Neto Estimado</span>
      </span>
      <span class="valor" style="color: #6366f1; font-size: 1.15rem;">
        ${patrimonioNeto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      {#if tasaBCVOficial}
        <span style="font-size: 0.68rem; color: var(--texto-tenue);">
          ≈ Bs. {(patrimonioNeto * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>

    <!-- Total Ahorrado Acumulado -->
    <div class="card">
      <span class="label">
        <i class="fa-solid fa-coins" style="color: var(--verde);"></i>
        <span>Ahorros Totales</span>
      </span>
      <span class="valor" style="color: var(--verde);">
        ${totalAhorradoUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">
        Físico: ${totalFisicoUSD.toFixed(0)} • Electrónico: ${totalElectronicoUSD.toFixed(0)}
      </span>
    </div>

    <!-- Deudas Netas -->
    <div class="card">
      <span class="label">
        <i class="fa-solid fa-scale-balanced" style="color: {totalesDeudas.meDeben >= totalesDeudas.debo ? 'var(--verde)' : 'var(--rojo)'};"></i>
        <span>Posición Deudas</span>
      </span>
      <span class="valor" style="color: {totalesDeudas.meDeben >= totalesDeudas.debo ? 'var(--verde)' : 'var(--rojo)'};">
        ${((totalesDeudas.meDeben || 0) - (totalesDeudas.debo || 0)).toFixed(2)}
      </span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">
        Me deben: ${totalesDeudas.meDeben.toFixed(0)} • Debo: ${totalesDeudas.debo.toFixed(0)}
      </span>
    </div>
  </div>
</section>

<!-- 3. DISTRIBUCIÓN DE GASTOS POR CATEGORÍA -->
<section class="panel" style="margin-bottom: 1rem;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
    <h3 style="margin: 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.45rem;">
      <i class="fa-solid fa-tags" style="color: var(--acento);"></i>
      <span>Distribución de Gastos por Categoría</span>
    </h3>
    {#if categoriaMayorImpacto}
      <span class="badge-pill" style="font-size: 0.65rem; padding: 0.1rem 0.4rem; background: rgba(239, 68, 68, 0.12); color: var(--rojo);">
        Mayor: {categoriaMayorImpacto.nombre} ({categoriaMayorImpacto.porcentaje}%)
      </span>
    {/if}
  </div>

  {#if gastosPorCategoria.length === 0}
    <p class="vacio" style="padding: 1.5rem 0;">
      <i class="fa-solid fa-receipt fa-2x" style="display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
      No hay gastos registrados en este período.
    </p>
  {:else}
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      {#each gastosPorCategoria as cat, idx}
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; margin-bottom: 0.25rem;">
            <span style="display: flex; align-items: center; gap: 0.35rem; font-weight: 600;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: {idx === 0 ? 'var(--rojo)' : idx === 1 ? 'var(--acento)' : '#0284c7'};"></span>
              <span>{cat.nombre}</span>
              <small style="color: var(--texto-tenue); font-weight: normal;">({cat.cantidad} {cat.cantidad === 1 ? 'pago' : 'pagos'})</small>
            </span>
            <span style="font-weight: 700; color: var(--texto);">
              ${cat.montoUSD.toFixed(2)}
              <span style="font-weight: 500; font-size: 0.72rem; color: var(--texto-tenue); margin-left: 0.25rem;">
                ({cat.porcentaje}%)
              </span>
            </span>
          </div>

          <div style="width: 100%; height: 8px; background: var(--bg-subtle); border-radius: 6px; overflow: hidden; border: 1px solid var(--borde);">
            <div 
              style="width: {cat.porcentaje}%; height: 100%; border-radius: 6px; transition: width 0.4s ease; background: {idx === 0 ? 'var(--rojo)' : idx === 1 ? 'var(--acento)' : '#0284c7'};"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<!-- 4. COMPARATIVA TEMPORAL (HISTOGRAMA CSS PURO) -->
{#if histogramaTemporal.length > 0}
  <section class="panel" style="margin-bottom: 1rem;">
    <h3 style="margin: 0 0 0.85rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.45rem;">
      <i class="fa-solid fa-chart-simple" style="color: var(--acento);"></i>
      <span>Evolución Temporal de Flujo de Caja</span>
    </h3>

    <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 130px; padding-top: 1rem; border-bottom: 1px solid var(--borde); gap: 0.4rem;">
      {#each histogramaTemporal as g}
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 0.25rem;">
          <div style="display: flex; gap: 3px; align-items: flex-end; height: 95px; width: 100%; justify-content: center;">
            <!-- Barra Ingreso -->
            <div 
              style="width: 10px; min-width: 8px; height: {Math.max(4, g.pctIngresos)}%; background: var(--verde); border-radius: 3px 3px 0 0;" 
              title="Ingresos: ${g.ingresos.toFixed(2)}"
            ></div>
            <!-- Barra Gasto -->
            <div 
              style="width: 10px; min-width: 8px; height: {Math.max(4, g.pctGastos)}%; background: var(--rojo); border-radius: 3px 3px 0 0;" 
              title="Gastos: ${g.gastos.toFixed(2)}"
            ></div>
          </div>
          <span style="font-size: 0.65rem; color: var(--texto-tenue); white-space: nowrap;">{g.label}</span>
        </div>
      {/each}
    </div>

    <div style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 0.6rem; font-size: 0.72rem; color: var(--texto-tenue);">
      <span style="display: flex; align-items: center; gap: 0.3rem;">
        <span style="width: 8px; height: 8px; background: var(--verde); border-radius: 2px;"></span>
        <span>Ingresos</span>
      </span>
      <span style="display: flex; align-items: center; gap: 0.3rem;">
        <span style="width: 8px; height: 8px; background: var(--rojo); border-radius: 2px;"></span>
        <span>Gastos</span>
      </span>
    </div>
  </section>
{/if}

<!-- 5. ESTRUCTURA BIMONETARIA & GASTOS FIJOS VS VARIABLES -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
  <!-- Desglose Moneda -->
  <section class="panel">
    <h3 style="margin: 0 0 0.75rem; font-size: 0.92rem; display: flex; align-items: center; gap: 0.4rem;">
      <i class="fa-solid fa-money-bill-transfer" style="color: var(--acento);"></i>
      <span>Moneda de Gastos</span>
    </h3>

    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem;">
      <span style="color: var(--texto);">Dólares ($): <strong>{desgloseMonedaGastos.pctUSD}%</strong></span>
      <span style="color: var(--texto);">Bolívares (Bs.): <strong>{desgloseMonedaGastos.pctVES}%</strong></span>
    </div>

    <!-- Barra de proporción -->
    <div style="display: flex; height: 10px; border-radius: 6px; overflow: hidden; border: 1px solid var(--borde); margin-bottom: 0.65rem;">
      <div style="width: {desgloseMonedaGastos.pctUSD}%; background: #0284c7;" title="USD"></div>
      <div style="width: {desgloseMonedaGastos.pctVES}%; background: var(--verde);" title="VES"></div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--texto-tenue);">
      <span>USD: ${desgloseMonedaGastos.enUSD.toFixed(2)}</span>
      <span>VES: ${desgloseMonedaGastos.enVES.toFixed(2)}</span>
    </div>
  </section>

  <!-- Fijos vs Variables -->
  <section class="panel">
    <h3 style="margin: 0 0 0.75rem; font-size: 0.92rem; display: flex; align-items: center; gap: 0.4rem;">
      <i class="fa-solid fa-calendar-check" style="color: var(--acento);"></i>
      <span>Gastos Fijos vs Variables</span>
    </h3>

    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.8rem;">
      <span style="color: var(--texto);">Fijos: <strong>{proporcionFijoVariable.pctFijo}%</strong></span>
      <span style="color: var(--texto);">Variables: <strong>{proporcionFijoVariable.pctVar}%</strong></span>
    </div>

    <div style="display: flex; height: 10px; border-radius: 6px; overflow: hidden; border: 1px solid var(--borde); margin-bottom: 0.65rem;">
      <div style="width: {proporcionFijoVariable.pctFijo}%; background: var(--acento);" title="Gastos Fijos"></div>
      <div style="width: {proporcionFijoVariable.pctVar}%; background: #eab308;" title="Gastos Variables"></div>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--texto-tenue);">
      <span>Fijos: ${proporcionFijoVariable.fijos.toFixed(2)}</span>
      <span>Variables: ${proporcionFijoVariable.variable.toFixed(2)}</span>
    </div>
  </section>
</div>

<!-- 6. MÉTRICAS CLAVE Y RENDIMIENTO DIARIO -->
<section class="panel" style="margin-bottom: 2rem;">
  <h3 style="margin: 0 0 0.85rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.45rem;">
    <i class="fa-solid fa-bolt" style="color: var(--acento);"></i>
    <span>Métricas Clave de Rendimiento</span>
  </h3>

  <div class="balance-cards" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
    <div class="card">
      <span class="label">Gasto Promedio Diario</span>
      <span class="valor">${metricasEficiencia.gastoDiario.toFixed(2)}</span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">Por día en el período</span>
    </div>

    <div class="card">
      <span class="label">Ticket Promedio</span>
      <span class="valor">${metricasEficiencia.ticketPromedio.toFixed(2)}</span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">Por cada gasto realizado</span>
    </div>

    <div class="card">
      <span class="label">Total Operaciones</span>
      <span class="valor">{metricasEficiencia.totalTransacciones}</span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">Movimientos en rango</span>
    </div>

    <div class="card">
      <span class="label">Mayor Gasto</span>
      <span class="valor" style="color: var(--rojo);">
        ${metricasEficiencia.mayorGasto ? Number(metricasEficiencia.mayorGasto.montoUSD).toFixed(2) : '0.00'}
      </span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        {metricasEficiencia.mayorGasto ? (metricasEficiencia.mayorGasto.descripcion || metricasEficiencia.mayorGasto.categoria || 'Gasto') : 'Ninguno'}
      </span>
    </div>
  </div>
</section>
