<script>
  import { onMount, untrack } from 'svelte'
  import { session } from '../session.svelte.js'
  import { settings } from '../settings.svelte.js'
  import { 
    subscribeTransactions, 
    addTransaction, 
    deleteTransaction 
  } from '../groups.js'
  import { 
    registrarTransaccion as registrarLocal, 
    listarTransacciones as listarLocal, 
    obtenerBalance as balanceLocal 
  } from '../transactions.js'
  import { getTasaOficialBCV } from '../rates.js'
  import { redondear } from '../money.js'
  import { subscribeCategories } from '../categories.js'

  let tipo = $state('gasto')
  let monto = $state('')
  let moneda = $state('VES')
  let tasaBCV = $state('')
  let tasaBCVOficial = $state(null)
  let cargandoTasa = $state(false)
  let fecha = $state(hoyISO())
  let descripcion = $state('')
  let categoria = $state('')
  let categorias = $state([])
  let error = $state('')
  let guardando = $state(false)

  let categoriasFiltradas = $derived.by(() => {
    return categorias.filter(c => c.tipo === tipo)
  })

  $effect(() => {
    // Si cambia el tipo o categorías, asegurar que hay una categoría seleccionada válida
    if (categoriasFiltradas.length > 0) {
      if (!categoriasFiltradas.some(c => c.nombre === categoria)) {
        categoria = categoriasFiltradas[0].nombre
      }
    }
  })

  // Filtros por Checkbox (por defecto se muestran todas las operaciones)
  let mostrarGastos = $state(true)
  let mostrarIngresos = $state(true)
  let mostrarUSD = $state(true)
  let mostrarVES = $state(true)
  let mostrarFiltros = $state(false)

  let algunFiltroActivo = $derived.by(() => {
    return !mostrarGastos || !mostrarIngresos || !mostrarUSD || !mostrarVES
  })

  function marcarTodosLosFiltros() {
    mostrarGastos = true
    mostrarIngresos = true
    mostrarUSD = true
    mostrarVES = true
  }

  let rawTransacciones = $state([])
  let unsubscribeFirestore = null

  function hoyISO() {
    return new Date().toISOString().slice(0, 10)
  }

  async function obtenerTasaActual(forzar = false) {
    if (cargandoTasa) return
    cargandoTasa = true
    try {
      const data = await getTasaOficialBCV()
      tasaBCVOficial = data.promedio
      if (forzar || !tasaBCV) {
        tasaBCV = data.promedio.toString()
      }
    } catch (e) {
      console.error('No se pudo obtener tasa BCV:', e)
    } finally {
      cargandoTasa = false
    }
  }

  async function seleccionarMoneda(m) {
    moneda = m
    if (m === 'VES') {
      await obtenerTasaActual()
    }
  }

  // Valor numérico de convertibilidad en tiempo real
  let valorConvertido = $derived.by(() => {
    const numMonto = Number(monto)
    if (!numMonto || numMonto <= 0) return ''
    const tasa = Number(tasaBCV) || tasaBCVOficial
    if (!tasa || tasa <= 0) return ''

    if (moneda === 'VES') {
      return (numMonto / tasa).toFixed(2)
    } else {
      return (numMonto * tasa).toFixed(2)
    }
  })

  function handleConvertedInput(val) {
    const num = Number(val)
    const tasa = Number(tasaBCV) || tasaBCVOficial || 1
    if (!num || num <= 0) {
      monto = ''
      return
    }
    if (moneda === 'VES') {
      // Entrada en USD -> Monto principal en VES = USD * tasa
      monto = (num * tasa).toFixed(2)
    } else {
      // Entrada en VES -> Monto principal en USD = VES / tasa
      monto = (num / tasa).toFixed(2)
    }
  }

  // Filtrado de transacciones por Checkboxes
  let transaccionesFiltradas = $derived.by(() => {
    return rawTransacciones.filter(t => {
      const matchTipo = (t.tipo === 'gasto' && mostrarGastos) || (t.tipo === 'ingreso' && mostrarIngresos)
      const matchMoneda = (t.moneda === 'USD' && mostrarUSD) || (t.moneda === 'VES' && mostrarVES)
      return matchTipo && matchMoneda
    })
  })

  // Balance calculado en tiempo real
  let balance = $derived.by(() => {
    let totalIngresos = 0
    let totalGastos = 0
    for (const t of rawTransacciones) {
      const val = Number(t.montoUSD) || 0
      if (t.tipo === 'ingreso') totalIngresos += val
      else totalGastos += val
    }
    return {
      totalIngresos: redondear(totalIngresos),
      totalGastos: redondear(totalGastos),
      balance: redondear(totalIngresos - totalGastos)
    }
  })

  let unsubscribeCategories = null

  function setupTransactionsSource() {
    if (unsubscribeFirestore) {
      unsubscribeFirestore()
      unsubscribeFirestore = null
    }
    if (unsubscribeCategories) {
      unsubscribeCategories()
      unsubscribeCategories = null
    }

    unsubscribeCategories = subscribeCategories(session.activeGroup?.id, (items) => {
      categorias = items
    })

    if (session.activeGroup?.id) {
      // Conectado a Firestore (Grupo Activo) con caché offline automática
      unsubscribeFirestore = subscribeTransactions(session.activeGroup.id, (items) => {
        rawTransacciones = items
      })
    } else {
      // Modo local (Dexie)
      cargarLocal()
    }
  }

  async function cargarLocal() {
    rawTransacciones = await listarLocal({})
  }

  let showModalRegistro = $state(false)
  let showSuccessAlert = $state(false)
  let successMessage = $state('')

  function triggerSuccessAlert(msg) {
    successMessage = msg
    showSuccessAlert = true
    setTimeout(() => {
      showSuccessAlert = false
    }, 3000)
  }

  function abrirModalRegistro(tipoDefecto = 'gasto') {
    tipo = tipoDefecto
    moneda = 'VES'
    monto = ''
    descripcion = ''
    error = ''
    showModalRegistro = true
    obtenerTasaActual()
  }

  async function enviar(e) {
    e.preventDefault()
    error = ''
    guardando = true
    try {
      const datos = {
        tipo,
        monto: Number(monto),
        moneda,
        tasaBCV: moneda === 'VES' ? Number(tasaBCV) : undefined,
        fecha,
        descripcion,
        categoria: categoria || (categoriasFiltradas[0]?.nombre ?? ''),
      }

      if (session.activeGroup?.id) {
        // Guardar en Firestore (sincroniza en la nube y funciona offline)
        await addTransaction(session.activeGroup.id, datos, session.user)
      } else {
        // Guardar en Dexie local
        await registrarLocal(datos)
        await cargarLocal()
      }

      monto = ''
      descripcion = ''
      showModalRegistro = false
      triggerSuccessAlert(tipo === 'ingreso' ? '¡Ingreso registrado con éxito!' : '¡Gasto registrado con éxito!')
    } catch (err) {
      console.error(err)
      error = err.message
    } finally {
      guardando = false
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Seguro que deseas eliminar esta transacción?')) return
    try {
      if (session.activeGroup?.id) {
        await deleteTransaction(session.activeGroup.id, id)
      }
    } catch (err) {
      console.error(err)
      error = err.message
    }
  }

  onMount(() => {
    obtenerTasaActual()
    setupTransactionsSource()
    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore()
    }
  })

  $effect(() => {
    // Reaccionar cuando cambie el grupo activo
    const currentGroupId = session.activeGroup?.id
    untrack(() => {
      setupTransactionsSource()
    })
  })
</script>

<svelte:window onclick={() => (mostrarFiltros = false)} />

<!-- Sweet Alert Success Toast -->
{#if showSuccessAlert}
  <div class="alert-toast" role="status">
    <i class="fa-solid fa-circle-check" style="color: var(--verde); font-size: 1.1rem;"></i>
    <span>{successMessage}</span>
  </div>
{/if}

<section class="panel">
  <div class="panel-header" style="margin-bottom: 0.85rem;">
    <h2>
      <i class="fa-solid fa-chart-pie" style="color: var(--acento);"></i>
      <span>Balance</span>
    </h2>

    <button type="button" class="btn-primary" onclick={() => abrirModalRegistro('gasto')}>
      <i class="fa-solid fa-plus"></i>
      <span>Registrar</span>
    </button>
  </div>

  <div class="balance-cards">
    <div class="card ingreso" style="cursor: pointer;" onclick={() => abrirModalRegistro('ingreso')} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter') abrirModalRegistro('ingreso'); }} title="Registrar nuevo ingreso">
      <span class="label">
        <i class="fa-solid fa-arrow-trend-up"></i>
        <span>Ingresos</span>
      </span>
      <span class="valor">${balance.totalIngresos.toFixed(2)}</span>
      {#if tasaBCVOficial && balance.totalIngresos > 0}
        <span style="font-size: 0.68rem; color: var(--texto-tenue); font-weight: 500; margin-top: 0.1rem;">
          ≈ Bs. {(balance.totalIngresos * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>
    <div class="card gasto" style="cursor: pointer;" onclick={() => abrirModalRegistro('gasto')} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter') abrirModalRegistro('gasto'); }} title="Registrar nuevo gasto">
      <span class="label">
        <i class="fa-solid fa-arrow-trend-down"></i>
        <span>Gastos</span>
      </span>
      <span class="valor">${balance.totalGastos.toFixed(2)}</span>
      {#if tasaBCVOficial && balance.totalGastos > 0}
        <span style="font-size: 0.68rem; color: var(--texto-tenue); font-weight: 500; margin-top: 0.1rem;">
          ≈ Bs. {(balance.totalGastos * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>
    <div class="card neto" class:negativo={balance.balance < 0}>
      <span class="label">
        <i class="fa-solid fa-scale-balanced"></i>
        <span>Neto</span>
      </span>
      <span class="valor">${balance.balance.toFixed(2)}</span>
      {#if tasaBCVOficial && balance.balance !== 0}
        <span style="font-size: 0.68rem; color: var(--texto-tenue); font-weight: 500; margin-top: 0.1rem;">
          ≈ Bs. {(balance.balance * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>
  </div>
</section>

<!-- POPUP MODAL RESPONSIVO (Bottom Sheet en móvil / Centrado en PC) -->
{#if showModalRegistro}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalRegistro = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalRegistro = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-registro-title">
      <div class="bottom-sheet-handle"></div>

      <div class="modal-header">
        <h3 id="modal-registro-title">
          <i class="fa-solid fa-circle-plus" style="color: var(--acento);"></i>
          <span>Registrar Movimiento</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalRegistro = false)} aria-label="Cerrar">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <form onsubmit={enviar}>
        <div class="fila" style="margin-bottom: 0.85rem;">
          <!-- Toggle Tipo: Gasto (izq) <-> Ingreso (der) -->
          <div style="display: flex; flex-direction: column; flex: 1; min-width: 125px;">
            <span style="font-size: 0.72rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--texto-tenue); text-transform: uppercase; letter-spacing: 0.03em;">Tipo</span>
            <div class="mini-toggle-row">
              <span 
                class="mini-toggle-tag" 
                class:active={tipo === 'gasto'} 
                onclick={() => (tipo = 'gasto')} 
                role="button" 
                tabindex="0" 
                onkeydown={(e) => { if (e.key === 'Enter') tipo = 'gasto'; }}
              >
                <i class="fa-solid fa-arrow-down" style="color: var(--rojo); font-size: 0.68rem;"></i> Gasto
              </span>
              <label class="switch-mini">
                <input 
                  type="checkbox" 
                  checked={tipo === 'ingreso'} 
                  onchange={(e) => (tipo = e.currentTarget.checked ? 'ingreso' : 'gasto')} 
                  aria-label="Alternar Gasto o Ingreso"
                />
                <span class="switch-mini-slider" class:ingreso-on={tipo === 'ingreso'} class:gasto-on={tipo === 'gasto'}></span>
              </label>
              <span 
                class="mini-toggle-tag" 
                class:active={tipo === 'ingreso'} 
                onclick={() => (tipo = 'ingreso')} 
                role="button" 
                tabindex="0" 
                onkeydown={(e) => { if (e.key === 'Enter') tipo = 'ingreso'; }}
              >
                <i class="fa-solid fa-arrow-up" style="color: var(--verde); font-size: 0.68rem;"></i> Ingreso
              </span>
            </div>
          </div>

          <!-- Toggle Moneda: VES (izq) <-> USD (der) -->
          <div style="display: flex; flex-direction: column; flex: 1; min-width: 125px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <span style="font-size: 0.72rem; font-weight: 600; color: var(--texto-tenue); text-transform: uppercase; letter-spacing: 0.03em;">Moneda</span>
              <button 
                type="button" 
                class="btn-secondary" 
                style="padding: 0 0.3rem; font-size: 0.62rem; min-height: 18px; gap: 0.2rem; border-radius: 4px; border-color: var(--borde); line-height: 1;"
                onclick={() => obtenerTasaActual(true)}
                title="Actualizar tasa oficial BCV en vivo"
              >
                <i class="fa-solid fa-arrows-rotate {cargandoTasa ? 'fa-spin' : ''}" style="color: var(--acento); font-size: 0.6rem;"></i>
                <span>{cargandoTasa ? '...' : (tasaBCVOficial ? `BCV: ${tasaBCVOficial.toFixed(2)}` : 'Recargar')}</span>
              </button>
            </div>
            <div class="mini-toggle-row">
              <span 
                class="mini-toggle-tag" 
                class:active={moneda === 'VES'} 
                onclick={() => seleccionarMoneda('VES')} 
                role="button" 
                tabindex="0" 
                onkeydown={(e) => { if (e.key === 'Enter') seleccionarMoneda('VES'); }}
              >
                <i class="fa-solid fa-money-bill-wave" style="font-size: 0.68rem;"></i> VES
              </span>
              <label class="switch-mini">
                <input 
                  type="checkbox" 
                  checked={moneda === 'USD'} 
                  onchange={(e) => seleccionarMoneda(e.currentTarget.checked ? 'USD' : 'VES')} 
                  aria-label="Alternar VES o USD"
                />
                <span class="switch-mini-slider" class:usd-on={moneda === 'USD'}></span>
              </label>
              <span 
                class="mini-toggle-tag" 
                class:active={moneda === 'USD'} 
                onclick={() => seleccionarMoneda('USD')} 
                role="button" 
                tabindex="0" 
                onkeydown={(e) => { if (e.key === 'Enter') seleccionarMoneda('USD'); }}
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
              Monto ({moneda === 'VES' ? 'Bs. VES' : '$ USD'})
            </span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              bind:value={monto} 
              required 
              placeholder={moneda === 'VES' ? 'Ej: 1500.00' : 'Ej: 10.00'} 
            />
          </label>

          <label>
            <span style="font-size: 0.78rem; font-weight: 600; color: var(--acento);">
              Equivalente ({moneda === 'VES' ? '$ USD' : 'Bs. VES'})
            </span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              value={valorConvertido} 
              oninput={(e) => handleConvertedInput(e.currentTarget.value)}
              placeholder={moneda === 'VES' ? '≈ USD' : '≈ Bs.'} 
            />
          </label>
        </div>

        <!-- Fila de Categoría y Fecha -->
        <div class="fila">
          <label>
            <span style="font-size: 0.78rem; font-weight: 600;">
              Categoría ({tipo === 'gasto' ? 'Gasto' : 'Ingreso'})
            </span>
            <select 
              bind:value={categoria} 
              required 
              style="padding: 0.55rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid var(--borde); background: var(--bg); color: var(--texto); font-size: 0.84rem; width: 100%;"
            >
              {#each categoriasFiltradas as cat}
                <option value={cat.nombre}>{cat.nombre}</option>
              {/each}
            </select>
          </label>

          <label>
            <span style="font-size: 0.78rem; font-weight: 600;">Fecha</span>
            <input type="date" bind:value={fecha} required />
          </label>
        </div>

        <label class="ancho-completo">
          Descripción
          <input type="text" bind:value={descripcion} placeholder="Ej: Supermercado, Almuerzo, Sueldo..." />
        </label>

        {#if error}
          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {error}</p>
        {/if}

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.5rem;">
          <button type="button" class="btn-secondary" onclick={() => (showModalRegistro = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardando}>
            <i class="fa-solid fa-check"></i>
            <span>{guardando ? 'Guardando...' : 'Registrar'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<section class="panel">
  <div class="panel-header" style="margin-bottom: 0.75rem; position: relative;">
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <h2 style="margin: 0;">
        <i class="fa-solid fa-list" style="color: var(--acento);"></i>
        <span>Historial</span>
      </h2>
      {#if session.activeGroup}
        <span class="badge-pill" style="font-size: 0.72rem; pointer-events: none;">
          <i class="fa-solid fa-cloud" style="color: var(--acento);"></i>
          <span>{session.activeGroup.name}</span>
        </span>
      {/if}
    </div>

    <!-- Menú Dropdown Flotante para Filtros (estilo Gastos Fijos) -->
    <div class="action-menu-wrapper" role="presentation">
      <button 
        type="button" 
        class="btn-secondary" 
        style="padding: 0.3rem 0.65rem; font-size: 0.78rem; min-height: 30px; gap: 0.35rem;"
        onclick={(e) => { e.stopPropagation(); mostrarFiltros = !mostrarFiltros; }}
        title="Filtrar por tipo y moneda"
      >
        <i class="fa-solid fa-filter" style="color: {algunFiltroActivo ? 'var(--acento)' : 'inherit'};"></i>
        <span>Filtros</span>
        {#if algunFiltroActivo}
          <span class="badge-pill" style="font-size: 0.65rem; padding: 0.05rem 0.35rem; background: var(--acento); color: var(--acento-texto);">
            Filtrado
          </span>
        {/if}
        <i class="fa-solid {mostrarFiltros ? 'fa-chevron-up' : 'fa-chevron-down'}" style="font-size: 0.7rem; opacity: 0.7;"></i>
      </button>

      {#if mostrarFiltros}
        <div 
          class="action-menu-dropdown" 
          style="min-width: 200px; padding: 0.75rem; top: calc(100% + 6px); right: 0;"
          role="presentation"
          onclick={(e) => e.stopPropagation()}
        >
          <!-- Grupo Tipo -->
          <div style="margin-bottom: 0.6rem;">
            <div style="font-size: 0.7rem; font-weight: 700; color: var(--texto-tenue); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.35rem;">
              Tipo de movimiento
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={mostrarGastos} />
                <span><i class="fa-solid fa-arrow-down" style="color: var(--rojo); font-size: 0.75rem; width: 14px;"></i> Gastos</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={mostrarIngresos} />
                <span><i class="fa-solid fa-arrow-up" style="color: var(--verde); font-size: 0.75rem; width: 14px;"></i> Ingresos</span>
              </label>
            </div>
          </div>

          <div style="border-top: 1px solid var(--borde); margin: 0.35rem 0;"></div>

          <!-- Grupo Moneda -->
          <div style="margin-bottom: 0.4rem;">
            <div style="font-size: 0.7rem; font-weight: 700; color: var(--texto-tenue); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.35rem;">
              Moneda
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={mostrarUSD} />
                <span><i class="fa-solid fa-dollar-sign" style="font-size: 0.75rem; width: 14px;"></i> USD ($)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={mostrarVES} />
                <span><i class="fa-solid fa-money-bill-wave" style="font-size: 0.75rem; width: 14px;"></i> VES (Bs.)</span>
              </label>
            </div>
          </div>

          {#if algunFiltroActivo}
            <div style="border-top: 1px solid var(--borde); margin: 0.35rem 0 0.45rem 0;"></div>
            <button 
              type="button" 
              class="btn-secondary" 
              style="width: 100%; justify-content: center; padding: 0.25rem 0.5rem; font-size: 0.72rem; min-height: 24px; color: var(--acento);"
              onclick={() => { marcarTodosLosFiltros(); }}
            >
              <i class="fa-solid fa-rotate-left"></i>
              <span>Mostrar todo</span>
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  {#if transaccionesFiltradas.length === 0}
    <p class="vacio">
      <i class="fa-regular fa-folder-open fa-2x" style="display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
      Sin transacciones registradas todavía.
    </p>
  {:else}
    <ul class="lista">
      {#each transaccionesFiltradas as t (t.id)}
        <li class:ingreso={t.tipo === 'ingreso'} class:gasto={t.tipo === 'gasto'}>
          <div class="item-left">
            <div class="item-icon" class:ingreso={t.tipo === 'ingreso'} class:gasto={t.tipo === 'gasto'}>
              <i class="fa-solid {t.tipo === 'ingreso' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
            </div>
            <div class="item-details">
              <span class="item-title">{t.descripcion || t.categoria || (t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto')}</span>
              <div class="item-meta">
                <span><i class="fa-regular fa-calendar"></i> {t.fecha}</span>
                {#if t.categoria}
                  <span class="badge-pill" style="font-size: 0.65rem; padding: 0.05rem 0.35rem; background: var(--bg-subtle);">
                    {t.categoria}
                  </span>
                {/if}
                {#if t.createdByName}
                  <span>• <i class="fa-regular fa-user"></i> {t.createdByName}</span>
                {/if}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="item-amounts">
              <span class="item-amount-usd" style="color: {t.tipo === 'ingreso' ? 'var(--verde)' : 'var(--rojo)'};">
                {t.tipo === 'ingreso' ? '+' : '-'}${Number(t.montoUSD).toFixed(2)}
              </span>
              {#if t.moneda === 'VES'}
                <span class="item-amount-original">
                  Bs. {Number(t.monto).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </span>
              {/if}
            </div>

            {#if session.activeGroup?.id}
              <button 
                type="button" 
                class="btn-close" 
                onclick={() => eliminar(t.id)} 
                title="Eliminar transacción"
                aria-label="Eliminar transacción"
              >
                <i class="fa-solid fa-trash-can" style="font-size: 0.85rem;"></i>
              </button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
