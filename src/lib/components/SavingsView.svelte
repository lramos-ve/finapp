<script>
  import { onMount } from 'svelte'
  import { session } from '../session.svelte.js'
  import { settings } from '../settings.svelte.js'
  import { getTasaOficialBCV } from '../rates.js'
  import {
    subscribeSavings,
    createSavingFund,
    recordSavingMovement,
    updateSavingFund,
    updateSavingMovement,
    togglePauseSavingFund,
    deleteSavingFund,
    cargarAhorrosLocales,
    getGlobalSavingsGoal,
    setGlobalSavingsGoal
  } from '../savings.js'

  let ahorros = $state([])
  let tasaBCVOficial = $state(null)
  let cargandoTasa = $state(false)

  // Meta Global
  let metaGlobalUSD = $state(0)
  let showModalMetaGlobal = $state(false)
  let nuevaMetaGlobalInput = $state('')
  let guardandoMetaGlobal = $state(false)

  // Modales
  let showModalNuevo = $state(false)
  let showModalMovimiento = $state(false)
  let showModalEditar = $state(false)
  let fondoSeleccionado = $state(null)

  // Historial desplegado por tarjeta
  let historialAbierto = $state({})

  // Dropdown de 3 puntos activo por tarjeta
  let menuAbiertoId = $state(null)

  // Formulario Nueva Operación
  let nuevoNombre = $state('')
  let nuevoTipoAhorro = $state('fisico') // 'fisico' | 'electronico'
  let tipoOperacionModal = $state('abono') // 'abono' (depósito) | 'retiro'
  let nuevaMetaUSD = $state('')
  let nuevoSaldoInicial = $state('')
  let nuevaDescripcion = $state('')
  let nuevoIcono = $state('fa-piggy-bank')
  let guardandoFondo = $state(false)
  let errorFondo = $state('')

  // Formulario Movimiento (Abonar / Retirar)
  let tipoMovimiento = $state('abono') // 'abono' | 'retiro'
  let monedaMovimiento = $state('USD')
  let montoMovimiento = $state('')
  let tasaBCVMovimiento = $state('')
  let fechaMovimiento = $state(hoyISO())
  let notaMovimiento = $state('')
  let guardandoMovimiento = $state(false)
  let errorMovimiento = $state('')

  // Toast / Alerta de éxito
  let showSuccessAlert = $state(false)
  let successMessage = $state('')

  function hoyISO() {
    return new Date().toISOString().slice(0, 10)
  }

  function triggerSuccessAlert(msg) {
    successMessage = msg
    showSuccessAlert = true
    setTimeout(() => {
      showSuccessAlert = false
    }, 3000)
  }

  async function obtenerTasaActual(forzar = false) {
    if (cargandoTasa) return
    cargandoTasa = true
    try {
      const data = await getTasaOficialBCV()
      tasaBCVOficial = data.promedio
      if (forzar || !tasaBCVMovimiento) {
        tasaBCVMovimiento = data.promedio.toString()
      }
    } catch (e) {
      console.error('Error al obtener tasa BCV:', e)
    } finally {
      cargandoTasa = false
    }
  }

  // Métricas Globales de Ahorro
  let totalAhorradoUSD = $derived.by(() => {
    return ahorros.reduce((acc, a) => acc + (a.pausado ? 0 : Number(a.saldoActual || 0)), 0)
  })

  let totalFisicoUSD = $derived.by(() => {
    return ahorros
      .filter(a => a.tipoAhorro === 'fisico' && !a.pausado)
      .reduce((acc, a) => acc + Number(a.saldoActual || 0), 0)
  })

  let totalElectronicoUSD = $derived.by(() => {
    return ahorros
      .filter(a => a.tipoAhorro === 'electronico' && !a.pausado)
      .reduce((acc, a) => acc + Number(a.saldoActual || 0), 0)
  })

  let totalAhorradoVES = $derived.by(() => {
    if (!tasaBCVOficial) return 0
    return totalAhorradoUSD * tasaBCVOficial
  })

  // Convertibilidad en el formulario de movimiento
  let valorConvertidoMovimiento = $derived.by(() => {
    const num = Number(montoMovimiento)
    if (!num || num <= 0) return ''
    const tasa = Number(tasaBCVMovimiento) || tasaBCVOficial
    if (!tasa || tasa <= 0) return ''

    if (monedaMovimiento === 'VES') {
      return (num / tasa).toFixed(2)
    } else {
      return (num * tasa).toFixed(2)
    }
  })

  function handleConvertedInputMovimiento(val) {
    const num = Number(val)
    const tasa = Number(tasaBCVMovimiento) || tasaBCVOficial || 1
    if (!num || num <= 0) {
      montoMovimiento = ''
      return
    }
    if (monedaMovimiento === 'VES') {
      montoMovimiento = (num * tasa).toFixed(2)
    } else {
      montoMovimiento = (num / tasa).toFixed(2)
    }
  }

  // Suscripción de datos
  let unsubscribe = null

  $effect(() => {
    const groupId = session.activeGroup?.id
    getGlobalSavingsGoal(groupId).then(val => {
      metaGlobalUSD = val
      nuevaMetaGlobalInput = val > 0 ? val.toString() : ''
    })

    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    if (groupId) {
      unsubscribe = subscribeSavings(groupId, (items) => {
        ahorros = items
      })
    } else {
      cargarAhorrosLocales().then(items => {
        ahorros = items
      })
    }
  })

  onMount(() => {
    obtenerTasaActual()
  })

  function toggleMenu(id, e) {
    e.stopPropagation()
    menuAbiertoId = menuAbiertoId === id ? null : id
  }

  function toggleHistorial(id, e) {
    if (e) e.stopPropagation()
    historialAbierto[id] = !historialAbierto[id]
    menuAbiertoId = null
  }

  function abrirNuevoFondo() {
    nuevoNombre = ''
    nuevoTipoAhorro = 'fisico'
    tipoOperacionModal = 'abono'
    nuevaMetaUSD = ''
    nuevoSaldoInicial = ''
    nuevaDescripcion = ''
    nuevoIcono = 'fa-piggy-bank'
    errorFondo = ''
    showModalNuevo = true
  }

  async function handleCrearFondo(e) {
    e.preventDefault()
    if (!nuevoNombre.trim()) return
    errorFondo = ''
    guardandoFondo = true
    try {
      const montoNum = Number(nuevoSaldoInicial) || 0
      const fondoExistente = ahorros.find(a => a.nombre.toLowerCase().trim() === nuevoNombre.toLowerCase().trim())

      if (fondoExistente) {
        // Registrar movimiento en el fondo existente
        await recordSavingMovement(session.activeGroup?.id, fondoExistente, {
          tipo: tipoOperacionModal,
          monto: montoNum,
          moneda: 'USD',
          fecha: hoyISO(),
          nota: nuevaDescripcion
        }, session.user)
        triggerSuccessAlert(tipoOperacionModal === 'abono' ? `¡Depósito registrado en ${fondoExistente.nombre}!` : `¡Retiro registrado en ${fondoExistente.nombre}!`)
      } else {
        // Crear nuevo fondo con el saldo
        const saldoInicial = tipoOperacionModal === 'abono' ? montoNum : 0
        await createSavingFund(session.activeGroup?.id, {
          nombre: nuevoNombre,
          tipoAhorro: nuevoTipoAhorro,
          saldoInicial,
          descripcion: nuevaDescripcion,
          icono: nuevoTipoAhorro === 'electronico' ? 'fa-vault' : 'fa-piggy-bank'
        }, session.user)
        triggerSuccessAlert('¡Operación registrada con éxito!')
      }

      showModalNuevo = false
      if (!session.activeGroup?.id) {
        ahorros = await cargarAhorrosLocales()
      }
    } catch (err) {
      errorFondo = err.message
    } finally {
      guardandoFondo = false
    }
  }

  function abrirMovimiento(fondo, tipoDefecto = 'abono') {
    fondoSeleccionado = fondo
    tipoMovimiento = tipoDefecto
    monedaMovimiento = settings.defaultCurrency || 'USD'
    montoMovimiento = ''
    fechaMovimiento = hoyISO()
    notaMovimiento = ''
    errorMovimiento = ''
    menuAbiertoId = null
    showModalMovimiento = true
    obtenerTasaActual()
  }

  async function handleGuardarMovimiento(e) {
    e.preventDefault()
    if (!fondoSeleccionado || !montoMovimiento) return
    errorMovimiento = ''
    guardandoMovimiento = true
    try {
      await recordSavingMovement(session.activeGroup?.id, fondoSeleccionado, {
        tipo: tipoMovimiento,
        monto: Number(montoMovimiento),
        moneda: monedaMovimiento,
        tasaBCV: monedaMovimiento === 'VES' ? Number(tasaBCVMovimiento) : null,
        fecha: fechaMovimiento,
        nota: notaMovimiento
      }, session.user)

      showModalMovimiento = false
      triggerSuccessAlert(tipoMovimiento === 'abono' ? '¡Abono registrado con éxito!' : '¡Retiro registrado con éxito!')
      if (!session.activeGroup?.id) {
        ahorros = await cargarAhorrosLocales()
      }
    } catch (err) {
      errorMovimiento = err.message
    } finally {
      guardandoMovimiento = false
    }
  }

  function abrirEditar(fondo) {
    fondoSeleccionado = fondo
    nuevoNombre = fondo.nombre
    nuevoTipoAhorro = fondo.tipoAhorro || 'fisico'
    nuevaMetaUSD = fondo.metaUSD ? fondo.metaUSD.toString() : ''
    nuevaDescripcion = fondo.descripcion || ''
    errorFondo = ''
    menuAbiertoId = null
    showModalEditar = true
  }

  async function handleGuardarEdicion(e) {
    e.preventDefault()
    if (!fondoSeleccionado || !nuevoNombre.trim()) return
    errorFondo = ''
    guardandoFondo = true
    try {
      await updateSavingFund(session.activeGroup?.id, fondoSeleccionado.id, {
        nombre: nuevoNombre,
        tipoAhorro: nuevoTipoAhorro,
        metaUSD: nuevaMetaUSD ? Number(nuevaMetaUSD) : null,
        descripcion: nuevaDescripcion
      })

      showModalEditar = false
      triggerSuccessAlert('Fondo de ahorro actualizado')
      if (!session.activeGroup?.id) {
        ahorros = await cargarAhorrosLocales()
      }
    } catch (err) {
      errorFondo = err.message
    } finally {
      guardandoFondo = false
    }
  }

  // Editar Registro de Ahorro
  let registroSeleccionado = $state(null)
  let showModalEditarRegistro = $state(false)
  let editNombre = $state('')
  let editTipoAhorro = $state('fisico')
  let editTipoOperacion = $state('abono')
  let editMontoUSD = $state('')
  let editFecha = $state('')
  let editNota = $state('')
  let guardandoEdicionRegistro = $state(false)
  let errorEdicionRegistro = $state('')

  // Lista plana de todos los registros de ahorro
  let todosLosRegistros = $derived.by(() => {
    const lista = []
    for (const fondo of ahorros) {
      if (Array.isArray(fondo.movimientos) && fondo.movimientos.length > 0) {
        for (const mov of fondo.movimientos) {
          lista.push({
            fondoId: fondo.id,
            fondoNombre: fondo.nombre,
            fondoTipoAhorro: fondo.tipoAhorro || 'fisico',
            movId: mov.id || `mov-${mov.createdAt}`,
            fecha: mov.fecha || new Date(mov.createdAt || Date.now()).toISOString().slice(0, 10),
            tipo: mov.tipo || 'abono',
            montoUSD: Number(mov.montoUSD || mov.montoOriginal || 0),
            moneda: mov.moneda || 'USD',
            nota: mov.nota || '',
            createdAt: mov.createdAt || 0
          })
        }
      } else if (Number(fondo.saldoActual || 0) > 0) {
        lista.push({
          fondoId: fondo.id,
          fondoNombre: fondo.nombre,
          fondoTipoAhorro: fondo.tipoAhorro || 'fisico',
          movId: `saldo-${fondo.id}`,
          fecha: new Date(fondo.createdAt || Date.now()).toISOString().slice(0, 10),
          tipo: 'abono',
          montoUSD: Number(fondo.saldoActual || 0),
          moneda: 'USD',
          nota: fondo.descripcion || 'Registro inicial',
          createdAt: fondo.createdAt || 0
        })
      }
    }
    return lista.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || b.fecha.localeCompare(a.fecha))
  })

  function abrirEditarRegistro(reg) {
    registroSeleccionado = reg
    editNombre = reg.fondoNombre
    editTipoAhorro = reg.fondoTipoAhorro
    editTipoOperacion = reg.tipo
    editMontoUSD = reg.montoUSD ? reg.montoUSD.toString() : ''
    editFecha = reg.fecha
    editNota = reg.nota || ''
    errorEdicionRegistro = ''
    showModalEditarRegistro = true
  }

  async function handleGuardarEdicionRegistro(e) {
    e.preventDefault()
    if (!registroSeleccionado || !editNombre.trim() || !editMontoUSD) return
    errorEdicionRegistro = ''
    guardandoEdicionRegistro = true
    try {
      await updateSavingMovement(session.activeGroup?.id, registroSeleccionado.fondoId, registroSeleccionado.movId, {
        nombre: editNombre,
        tipoAhorro: editTipoAhorro,
        tipo: editTipoOperacion,
        montoUSD: Number(editMontoUSD),
        fecha: editFecha,
        nota: editNota
      })

      showModalEditarRegistro = false
      triggerSuccessAlert('Registro de ahorro actualizado con éxito')
      if (!session.activeGroup?.id) {
        ahorros = await cargarAhorrosLocales()
      }
    } catch (err) {
      errorEdicionRegistro = err.message
    } finally {
      guardandoEdicionRegistro = false
    }
  }
</script>

<svelte:window onclick={() => { menuAbiertoId = null; }} />

<!-- NOTIFICACIÓN SWEET ALERT RESPONSIVA -->
{#if showSuccessAlert}
  <div class="sweet-alert-container">
    <div class="sweet-alert-card">
      <div class="sweet-alert-icon">
        <i class="fa-solid fa-check"></i>
      </div>
      <div class="sweet-alert-title">¡Operación Exitosa!</div>
      <div class="sweet-alert-text">{successMessage}</div>
    </div>
  </div>
{/if}

<!-- RESUMEN GLOBAL DE AHORROS -->
<section class="panel">
  <!-- Fila Superior: Meta de Ahorro (80%) y Botón Nuevo Ahorro (20%) -->
  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.85rem; flex-wrap: wrap;">
    <!-- Tarjeta Meta Sin Bordes (80%) -->
    <div 
      style="flex: 1 1 70%; min-width: 220px; cursor: pointer; padding: 0.15rem 0; border: none; background: transparent;" 
      onclick={() => { nuevaMetaGlobalInput = metaGlobalUSD > 0 ? metaGlobalUSD.toString() : ''; showModalMetaGlobal = true; }} 
      role="button" 
      tabindex="0" 
      onkeydown={(e) => { if (e.key === 'Enter') { nuevaMetaGlobalInput = metaGlobalUSD > 0 ? metaGlobalUSD.toString() : ''; showModalMetaGlobal = true; } }} 
      title="Toca para establecer o editar tu meta de ahorro"
    >
      {#if metaGlobalUSD > 0}
        <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <i class="fa-solid fa-bullseye" style="color: var(--acento); font-size: 0.95rem;"></i>
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--texto);">Meta:</span>
            <span style="font-size: 1.05rem; font-weight: 800; color: var(--acento);">
              ${Number(metaGlobalUSD).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem;">
            <span style="font-weight: 600; color: var(--acento);">{Math.min(100, Math.round((totalAhorradoUSD / metaGlobalUSD) * 100))}% alcanzado</span>
            {#if metaGlobalUSD > totalAhorradoUSD}
              <span style="color: var(--texto-tenue);">• Faltan <strong style="color: var(--verde);">${(metaGlobalUSD - totalAhorradoUSD).toFixed(0)}</strong></span>
            {:else}
              <span style="color: var(--verde); font-weight: 700;">• ¡Cumplida!</span>
            {/if}
            <i class="fa-solid fa-pen" style="font-size: 0.62rem; color: var(--texto-tenue); opacity: 0.7;"></i>
          </div>
        </div>

        <div style="margin-top: 0.3rem; background: var(--bg-subtle); border-radius: 9999px; height: 5px; overflow: hidden; border: 1px solid var(--borde);">
          <div style="height: 100%; background: linear-gradient(90deg, var(--acento), var(--verde)); width: {Math.min(100, Math.round((totalAhorradoUSD / metaGlobalUSD) * 100))}%; transition: width 0.3s ease;"></div>
        </div>
      {:else}
        <div style="display: flex; align-items: center; gap: 0.45rem; color: var(--acento);">
          <i class="fa-solid fa-bullseye" style="font-size: 0.95rem;"></i>
          <span style="font-size: 0.82rem; font-weight: 600;">+ Establecer Meta de Ahorro</span>
          <span style="font-size: 0.7rem; color: var(--texto-tenue);">(Define un objetivo en $ USD)</span>
        </div>
      {/if}
    </div>

    <!-- Botón Nueva Operación (20%) -->
    <div style="flex: 0 0 auto; display: flex; justify-content: flex-end;">
      <button 
        type="button" 
        class="btn-primary" 
        onclick={abrirNuevoFondo} 
        style="padding: 0.35rem 0.65rem; font-size: 0.78rem; white-space: nowrap;"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Nueva Operación</span>
      </button>
    </div>
  </div>

  <div class="balance-cards">
    <!-- Cajón 1: Total Ahorrado -->
    <div class="card neto" style="border-color: rgba(16, 185, 129, 0.4);">
      <span class="label" style="color: var(--verde); font-weight: 600;">
        <i class="fa-solid fa-piggy-bank"></i>
        <span>Total Ahorrado</span>
      </span>
      <span class="valor" style="color: var(--verde);">
        ${totalAhorradoUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      {#if tasaBCVOficial}
        <span style="font-size: 0.68rem; color: var(--texto-tenue); font-weight: 500;">
          ≈ Bs. {totalAhorradoVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      {/if}
    </div>

    <!-- Cajón 2: Dólares Físicos -->
    <div class="card">
      <span class="label">
        <i class="fa-solid fa-money-bill-wave" style="color: var(--verde);"></i>
        <span>Dólares Físicos</span>
      </span>
      <span class="valor">
        ${totalFisicoUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">Efectivo / Caja</span>
    </div>

    <!-- Cajón 3: Electrónicos -->
    <div class="card">
      <span class="label">
        <i class="fa-solid fa-vault" style="color: #0284c7;"></i>
        <span>Electrónicos</span>
      </span>
      <span class="valor" style="color: #0284c7;">
        ${totalElectronicoUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span style="font-size: 0.68rem; color: var(--texto-tenue);">Zelle / Binance / Cuentas</span>
    </div>
  </div>
</section>

<!-- TABLA DE HISTORIAL DE AHORRO -->
<section class="panel" style="margin-top: 1rem;">
  <div class="panel-header" style="margin-bottom: 0.85rem;">
    <h3 style="margin: 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem;">
      <i class="fa-solid fa-clock-rotate-left" style="color: var(--acento);"></i>
      <span>Historial de Ahorro ({todosLosRegistros.length})</span>
    </h3>
  </div>

  {#if todosLosRegistros.length === 0}
    <p class="vacio">
      <i class="fa-solid fa-piggy-bank fa-2x" style="display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
      No hay registros de ahorro. ¡Toca en "Nueva Operación" para registrar tu primer ahorro!
    </p>
  {:else}
    <div style="overflow-x: auto;">
      <table class="tabla-transacciones" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid var(--borde); text-align: left; font-size: 0.72rem; color: var(--texto-tenue); text-transform: uppercase;">
            <th style="padding: 0.5rem 0.6rem;">Fecha</th>
            <th style="padding: 0.5rem 0.6rem;">Operación</th>
            <th style="padding: 0.5rem 0.6rem;">Modalidad</th>
            <th style="padding: 0.5rem 0.6rem;">Tipo</th>
            <th style="padding: 0.5rem 0.6rem; text-align: right;">Monto</th>
            <th style="padding: 0.5rem 0.6rem; text-align: center; width: 45px;"></th>
          </tr>
        </thead>
        <tbody>
          {#each todosLosRegistros as reg (reg.movId + reg.fondoId)}
            <tr style="border-bottom: 1px solid var(--borde); font-size: 0.85rem;">
              <td style="padding: 0.6rem; white-space: nowrap; color: var(--texto-tenue); font-size: 0.78rem;">
                {reg.fecha}
              </td>
              <td style="padding: 0.6rem;">
                <strong style="color: var(--texto); display: block;">{reg.fondoNombre}</strong>
                {#if reg.nota}
                  <span style="font-size: 0.72rem; color: var(--texto-tenue); display: block;">{reg.nota}</span>
                {/if}
              </td>
              <td style="padding: 0.6rem; white-space: nowrap;">
                <span class="badge-pill" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">
                  {reg.fondoTipoAhorro === 'electronico' ? 'Electrónico' : 'Físico'}
                </span>
              </td>
              <td style="padding: 0.6rem; white-space: nowrap;">
                <span style="font-weight: 600; font-size: 0.78rem; color: {reg.tipo === 'abono' ? 'var(--verde)' : 'var(--rojo)'};">
                  {reg.tipo === 'abono' ? '+ Depósito' : '- Retiro'}
                </span>
              </td>
              <td style="padding: 0.6rem; text-align: right; white-space: nowrap;">
                <span style="font-weight: 700; color: {reg.tipo === 'abono' ? 'var(--verde)' : 'var(--rojo)'};">
                  {reg.tipo === 'abono' ? '+' : '-'}${reg.montoUSD.toFixed(2)}
                </span>
                {#if tasaBCVOficial}
                  <span style="font-size: 0.68rem; color: var(--texto-tenue); display: block;">
                    ≈ Bs. {(reg.montoUSD * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                  </span>
                {/if}
              </td>
              <td style="padding: 0.6rem; text-align: center; position: relative;">
                <div class="action-menu-wrapper" style="display: inline-block;">
                  <button 
                    type="button" 
                    class="btn-icon" 
                    style="width: 28px; height: 28px; font-size: 0.85rem; border-radius: 6px;"
                    onclick={(e) => { e.stopPropagation(); menuAbiertoId = menuAbiertoId === (reg.movId + reg.fondoId) ? null : (reg.movId + reg.fondoId); }}
                    title="Opciones"
                    aria-label="Opciones"
                  >
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </button>

                  {#if menuAbiertoId === (reg.movId + reg.fondoId)}
                    <div 
                      class="action-menu-dropdown" 
                      style="position: absolute; right: 0.5rem; top: calc(100% + 2px); z-index: 100; min-width: 120px;"
                      role="presentation"
                      onclick={(e) => e.stopPropagation()}
                    >
                      <button 
                        type="button" 
                        class="action-menu-item" 
                        onclick={(e) => { e.stopPropagation(); menuAbiertoId = null; abrirEditarRegistro(reg); }}
                      >
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>Editar</span>
                      </button>
                    </div>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<!-- MODAL NUEVA OPERACIÓN -->
{#if showModalNuevo}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalNuevo = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalNuevo = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-money-bill-transfer" style="color: var(--acento);"></i>
          <span>Nueva Operación</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalNuevo = false)} aria-label="Cerrar">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <form onsubmit={handleCrearFondo}>
        <label class="ancho-completo">
          <span>Nombre de la operación</span>
          <input type="text" bind:value={nuevoNombre} placeholder="Ej: Efectivo, Zelle, Ahorro Viaje..." required />
        </label>

        <!-- Par de Selects: Modalidad (Izquierda) y Operación (Derecha) -->
        <div class="fila">
          <label>
            <span>Modalidad</span>
            <select bind:value={nuevoTipoAhorro}>
              <option value="fisico">Físico</option>
              <option value="electronico">Electrónico</option>
            </select>
          </label>

          <label>
            <span>Operación</span>
            <select bind:value={tipoOperacionModal}>
              <option value="abono">Depósito</option>
              <option value="retiro">Retiro</option>
            </select>
          </label>
        </div>

        <label class="ancho-completo">
          <span>Monto ($ USD)</span>
          <input type="number" step="0.01" min="0.01" bind:value={nuevoSaldoInicial} placeholder="0.00" required />
        </label>

        <label class="ancho-completo">
          <span>Descripción</span>
          <input type="text" bind:value={nuevaDescripcion} placeholder="Ej: Guardado en caja fuerte, cuenta Zinli..." />
        </label>

        {#if errorFondo}
          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {errorFondo}</p>
        {/if}

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.6rem;">
          <button type="button" class="btn-secondary" onclick={() => (showModalNuevo = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardandoFondo}>
            <i class="fa-solid fa-check"></i>
            <span>{guardandoFondo ? 'Guardando...' : 'Registrar Operación'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL ABONAR / RETIRAR DINERO -->
{#if showModalMovimiento && fondoSeleccionado}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalMovimiento = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalMovimiento = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-money-bill-transfer" style="color: var(--acento);"></i>
          <span>{tipoMovimiento === 'abono' ? 'Abonar a' : 'Retirar de'} {fondoSeleccionado.nombre}</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalMovimiento = false)} aria-label="Cerrar">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <form onsubmit={handleGuardarMovimiento}>
        <div class="fila" style="margin-bottom: 0.75rem;">
          <!-- Tipo: Abono / Retiro -->
          <div style="display: flex; flex-direction: column; flex: 1; min-width: 125px;">
            <span style="font-size: 0.72rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--texto-tenue); text-transform: uppercase;">Operación</span>
            <div class="mini-toggle-row">
              <span 
                class="mini-toggle-tag" 
                class:active={tipoMovimiento === 'abono'} 
                onclick={() => (tipoMovimiento = 'abono')}
                role="button"
                tabindex="0"
                onkeydown={(e) => { if (e.key === 'Enter') tipoMovimiento = 'abono'; }}
              >
                <i class="fa-solid fa-plus" style="color: var(--verde); font-size: 0.68rem;"></i> Abono
              </span>
              <label class="switch-mini">
                <input 
                  type="checkbox" 
                  checked={tipoMovimiento === 'retiro'} 
                  onchange={(e) => (tipoMovimiento = e.currentTarget.checked ? 'retiro' : 'abono')} 
                  aria-label="Abonar o Retirar"
                />
                <span class="switch-mini-slider" class:gasto-on={tipoMovimiento === 'retiro'} class:ingreso-on={tipoMovimiento === 'abono'}></span>
              </label>
              <span 
                class="mini-toggle-tag" 
                class:active={tipoMovimiento === 'retiro'} 
                onclick={() => (tipoMovimiento = 'retiro')}
                role="button"
                tabindex="0"
                onkeydown={(e) => { if (e.key === 'Enter') tipoMovimiento = 'retiro'; }}
              >
                <i class="fa-solid fa-minus" style="color: var(--rojo); font-size: 0.68rem;"></i> Retiro
              </span>
            </div>
          </div>

          <!-- Moneda: VES / USD -->
          <div style="display: flex; flex-direction: column; flex: 1; min-width: 125px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <span style="font-size: 0.72rem; font-weight: 600; color: var(--texto-tenue); text-transform: uppercase;">Moneda</span>
              <button 
                type="button" 
                class="btn-secondary" 
                style="padding: 0 0.3rem; font-size: 0.62rem; min-height: 18px; gap: 0.2rem; border-radius: 4px; border-color: var(--borde);"
                onclick={() => obtenerTasaActual(true)}
                title="Actualizar tasa oficial BCV"
              >
                <i class="fa-solid fa-arrows-rotate {cargandoTasa ? 'fa-spin' : ''}" style="color: var(--acento); font-size: 0.6rem;"></i>
                <span>{cargandoTasa ? '...' : (tasaBCVOficial ? `BCV: ${tasaBCVOficial.toFixed(2)}` : 'Recargar')}</span>
              </button>
            </div>
            <div class="mini-toggle-row">
              <span 
                class="mini-toggle-tag" 
                class:active={monedaMovimiento === 'VES'} 
                onclick={() => (monedaMovimiento = 'VES')}
                role="button"
                tabindex="0"
                onkeydown={(e) => { if (e.key === 'Enter') monedaMovimiento = 'VES'; }}
              >
                <i class="fa-solid fa-money-bill-wave" style="font-size: 0.68rem;"></i> VES
              </span>
              <label class="switch-mini">
                <input 
                  type="checkbox" 
                  checked={monedaMovimiento === 'USD'} 
                  onchange={(e) => (monedaMovimiento = e.currentTarget.checked ? 'USD' : 'VES')} 
                  aria-label="VES o USD"
                />
                <span class="switch-mini-slider" class:usd-on={monedaMovimiento === 'USD'}></span>
              </label>
              <span 
                class="mini-toggle-tag" 
                class:active={monedaMovimiento === 'USD'} 
                onclick={() => (monedaMovimiento = 'USD')}
                role="button"
                tabindex="0"
                onkeydown={(e) => { if (e.key === 'Enter') monedaMovimiento = 'USD'; }}
              >
                <i class="fa-solid fa-dollar-sign" style="font-size: 0.68rem;"></i> USD
              </span>
            </div>
          </div>
        </div>

        <!-- Fila de Montos con Convertibilidad Bidireccional -->
        <div class="fila">
          <label>
            <span style="font-size: 0.78rem; font-weight: 600;">
              Monto ({monedaMovimiento === 'VES' ? 'Bs. VES' : '$ USD'})
            </span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              bind:value={montoMovimiento} 
              required 
              placeholder={monedaMovimiento === 'VES' ? 'Ej: 1500.00' : 'Ej: 50.00'} 
            />
          </label>

          <label>
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--acento);">
              Equivalente ({monedaMovimiento === 'VES' ? '$ USD' : 'Bs. VES'})
            </span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              value={valorConvertidoMovimiento} 
              oninput={(e) => handleConvertedInputMovimiento(e.currentTarget.value)}
              placeholder={monedaMovimiento === 'VES' ? '≈ USD' : '≈ Bs.'} 
            />
          </label>
        </div>

        <div class="fila">
          <label>
            <span style="font-size: 0.78rem; font-weight: 600;">Fecha</span>
            <input type="date" bind:value={fechaMovimiento} required />
          </label>

          <label>
            <span style="font-size: 0.78rem; font-weight: 600;">Nota / Motivo</span>
            <input type="text" bind:value={notaMovimiento} placeholder="Ej: Ahorro quincenal, Emergencia..." />
          </label>
        </div>

        {#if errorMovimiento}
          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {errorMovimiento}</p>
        {/if}

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.6rem;">
          <button type="button" class="btn-secondary" onclick={() => (showModalMovimiento = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardandoMovimiento}>
            <i class="fa-solid fa-check"></i>
            <span>{guardandoMovimiento ? 'Guardando...' : (tipoMovimiento === 'abono' ? 'Registrar Abono' : 'Registrar Retiro')}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL EDITAR REGISTRO DE AHORRO -->
{#if showModalEditarRegistro && registroSeleccionado}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalEditarRegistro = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalEditarRegistro = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-pen-to-square" style="color: var(--acento);"></i>
          <span>Editar Operación de Ahorro</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalEditarRegistro = false)} aria-label="Cerrar">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <form onsubmit={handleGuardarEdicionRegistro}>
        <label class="ancho-completo">
          <span>Nombre de la operación</span>
          <input type="text" bind:value={editNombre} required />
        </label>

        <!-- Par de Selects: Modalidad (Izquierda) y Operación (Derecha) -->
        <div class="fila">
          <label>
            <span>Modalidad</span>
            <select bind:value={editTipoAhorro}>
              <option value="fisico">Físico</option>
              <option value="electronico">Electrónico</option>
            </select>
          </label>

          <label>
            <span>Operación</span>
            <select bind:value={editTipoOperacion}>
              <option value="abono">Depósito</option>
              <option value="retiro">Retiro</option>
            </select>
          </label>
        </div>

        <div class="fila">
          <label>
            <span>Monto ($ USD)</span>
            <input type="number" step="0.01" min="0.01" bind:value={editMontoUSD} required />
          </label>

          <label>
            <span>Fecha</span>
            <input type="date" bind:value={editFecha} required />
          </label>
        </div>

        <label class="ancho-completo">
          <span>Descripción / Nota</span>
          <input type="text" bind:value={editNota} placeholder="Ej: Guardado en caja fuerte, cuenta Zinli..." />
        </label>

        {#if errorEdicionRegistro}
          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {errorEdicionRegistro}</p>
        {/if}

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.6rem;">
          <button type="button" class="btn-secondary" onclick={() => (showModalEditarRegistro = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardandoEdicionRegistro}>
            <i class="fa-solid fa-check"></i>
            <span>{guardandoEdicionRegistro ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL ESTABLECER / EDITAR META GLOBAL -->
{#if showModalMetaGlobal}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalMetaGlobal = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalMetaGlobal = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-bullseye" style="color: var(--acento);"></i>
          <span>Meta de Ahorro Global</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalMetaGlobal = false)} aria-label="Cerrar">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <form onsubmit={async (e) => {
        e.preventDefault();
        guardandoMetaGlobal = true;
        try {
          const num = Number(nuevaMetaGlobalInput) || 0;
          metaGlobalUSD = await setGlobalSavingsGoal(session.activeGroup?.id, num);
          showModalMetaGlobal = false;
          triggerSuccessAlert(num > 0 ? '¡Meta de ahorro establecida!' : 'Meta eliminada');
        } catch (err) {
          alert(err.message);
        } finally {
          guardandoMetaGlobal = false;
        }
      }}>
        <label class="ancho-completo">
          <span>Monto Objetivo en Dólares ($ USD)</span>
          <input type="number" step="1" min="0" bind:value={nuevaMetaGlobalInput} placeholder="Ej: 500, 1000, 2500..." required />
        </label>

        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: -0.3rem;">
          {#each [100, 250, 500, 1000, 2000, 5000] as valorRapido}
            <button 
              type="button" 
              class="btn-secondary" 
              style="padding: 0.15rem 0.45rem; font-size: 0.72rem; min-height: 24px;"
              onclick={() => (nuevaMetaGlobalInput = valorRapido.toString())}
            >
              ${valorRapido}
            </button>
          {/each}
        </div>

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.6rem;">
          {#if metaGlobalUSD > 0}
            <button 
              type="button" 
              class="btn-secondary" 
              style="margin-right: auto; color: var(--rojo); padding: 0.3rem 0.6rem; font-size: 0.78rem;"
              onclick={async () => {
                nuevaMetaGlobalInput = '0';
                metaGlobalUSD = await setGlobalSavingsGoal(session.activeGroup?.id, 0);
                showModalMetaGlobal = false;
                triggerSuccessAlert('Meta eliminada');
              }}
            >
              <i class="fa-solid fa-trash-can"></i> Quitar
            </button>
          {/if}
          <button type="button" class="btn-secondary" onclick={() => (showModalMetaGlobal = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardandoMetaGlobal}>
            <i class="fa-solid fa-check"></i>
            <span>{guardandoMetaGlobal ? 'Guardando...' : 'Guardar Meta'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

