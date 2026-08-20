<script>
  import { onMount } from 'svelte'
  import { registrarDeuda, registrarAbono, listarDeudas, listarAbonos, obtenerTotalesPorDireccion } from '../debts.js'
  import { getTasaOficialBCV } from '../rates.js'
  import { settings } from '../settings.svelte.js'

  let deudas = $state([])
  let totales = $state({ debo: 0, meDeben: 0 })
  let abonosPorDeuda = $state({}) // { [deudaId]: Array<Abono> }
  let historialAbierto = $state({}) // { [deudaId]: boolean }
  let menuAbiertoId = $state(null)
  let tasaBCVOficial = $state(null)
  let cargandoTasa = $state(false)

  // Modal Registrar Deuda
  let showModalRegistro = $state(false)
  let persona = $state('')
  let direccion = $state('debo') // 'debo' | 'me_deben'
  let moneda = $state(settings.defaultCurrency || 'USD')
  let monto = $state('')
  let tasaBCVDeuda = $state('')
  let fecha = $state(hoyISO())
  let notas = $state('')
  let error = $state('')
  let guardando = $state(false)

  // Convertibilidad bidireccional en modal de registro
  let valorConvertido = $derived.by(() => {
    const num = Number(monto)
    if (!num || num <= 0) return ''
    const tasa = Number(tasaBCVDeuda) || tasaBCVOficial
    if (!tasa || tasa <= 0) return ''

    if (moneda === 'VES') {
      return (num / tasa).toFixed(2)
    } else {
      return (num * tasa).toFixed(2)
    }
  })

  function handleConvertedInput(val) {
    const num = Number(val)
    const tasa = Number(tasaBCVDeuda) || tasaBCVOficial || 1
    if (!num || num <= 0) {
      monto = ''
      return
    }
    if (moneda === 'VES') {
      monto = (num * tasa).toFixed(2)
    } else {
      monto = (num / tasa).toFixed(2)
    }
  }

  // Modal Abonar a Deuda
  let showModalAbono = $state(false)
  let deudaSeleccionadaAbono = $state(null)
  let abonoMonto = $state('')
  let abonoMoneda = $state(settings.defaultCurrency || 'USD')
  let abonoTasaBCV = $state('')
  let abonoFecha = $state(hoyISO())
  let abonoNota = $state('')
  let abonoError = $state('')
  let guardandoAbono = $state(false)

  // Convertibilidad bidireccional en modal de abono
  let valorConvertidoAbono = $derived.by(() => {
    const num = Number(abonoMonto)
    if (!num || num <= 0) return ''
    const tasa = Number(abonoTasaBCV) || tasaBCVOficial
    if (!tasa || tasa <= 0) return ''

    if (abonoMoneda === 'VES') {
      return (num / tasa).toFixed(2)
    } else {
      return (num * tasa).toFixed(2)
    }
  })

  function handleConvertedInputAbono(val) {
    const num = Number(val)
    const tasa = Number(abonoTasaBCV) || tasaBCVOficial || 1
    if (!num || num <= 0) {
      abonoMonto = ''
      return
    }
    if (abonoMoneda === 'VES') {
      abonoMonto = (num * tasa).toFixed(2)
    } else {
      abonoMonto = (num / tasa).toFixed(2)
    }
  }

  // Toast Alerta
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
      if (forzar || !abonoTasaBCV) {
        abonoTasaBCV = data.promedio.toString()
      }
      if (forzar || !tasaBCVDeuda) {
        tasaBCVDeuda = data.promedio.toString()
      }
    } catch (e) {
      console.error(e)
    } finally {
      cargandoTasa = false
    }
  }

  async function cargar() {
    deudas = await listarDeudas({})
    totales = await obtenerTotalesPorDireccion()
    const mapa = {}
    for (const d of deudas) {
      mapa[d.id] = await listarAbonos(d.id)
    }
    abonosPorDeuda = mapa
  }

  function abrirModalRegistro() {
    persona = ''
    direccion = 'debo'
    moneda = settings.defaultCurrency || 'USD'
    monto = ''
    tasaBCVDeuda = tasaBCVOficial ? tasaBCVOficial.toString() : ''
    fecha = hoyISO()
    notas = ''
    error = ''
    showModalRegistro = true
    obtenerTasaActual()
  }

  async function enviar(e) {
    e.preventDefault()
    if (!persona.trim() || !monto) return
    error = ''
    guardando = true
    try {
      await registrarDeuda({
        persona: persona.trim(),
        direccion,
        monto: Number(monto),
        moneda,
        tasaBCV: moneda === 'VES' ? (Number(tasaBCVDeuda) || tasaBCVOficial) : undefined,
        fecha,
        notas
      })
      showModalRegistro = false
      triggerSuccessAlert('¡Deuda registrada con éxito!')
      await cargar()
    } catch (err) {
      error = err.message
    } finally {
      guardando = false
    }
  }

  function abrirAbono(deuda) {
    deudaSeleccionadaAbono = deuda
    abonoMonto = ''
    abonoMoneda = settings.defaultCurrency || 'USD'
    abonoTasaBCV = tasaBCVOficial ? tasaBCVOficial.toString() : ''
    abonoFecha = hoyISO()
    abonoNota = ''
    abonoError = ''
    showModalAbono = true
    obtenerTasaActual()
  }

  async function enviarAbono(e) {
    e.preventDefault()
    if (!deudaSeleccionadaAbono || !abonoMonto) return
    abonoError = ''
    guardandoAbono = true
    try {
      await registrarAbono({
        deudaId: deudaSeleccionadaAbono.id,
        monto: Number(abonoMonto),
        moneda: abonoMoneda,
        tasaBCV: abonoMoneda === 'VES' ? (Number(abonoTasaBCV) || tasaBCVOficial) : undefined,
        fecha: abonoFecha,
        nota: abonoNota
      })
      showModalAbono = false
      deudaSeleccionadaAbono = null
      triggerSuccessAlert('¡Abono registrado con éxito!')
      await cargar()
    } catch (err) {
      abonoError = err.message
    } finally {
      guardandoAbono = false
    }
  }

  function toggleHistorial(id, e) {
    if (e) e.stopPropagation()
    historialAbierto[id] = !historialAbierto[id]
  }

  onMount(() => {
    cargar()
    obtenerTasaActual()
  })
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

<!-- RESUMEN DE DEUDAS -->
<section class="panel">
  <div class="panel-header" style="margin-bottom: 0.85rem;">
    <h2>
      <i class="fa-solid fa-hand-holding-dollar" style="color: var(--acento);"></i>
      <span>Resumen de Deudas</span>
    </h2>

    <button type="button" class="btn-primary" onclick={abrirModalRegistro}>
      <i class="fa-solid fa-plus"></i>
      <span>Registrar Deuda</span>
    </button>
  </div>

  <div class="balance-cards">
    <div class="card gasto">
      <span class="label">
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
        <span>Yo Debo</span>
      </span>
      <span class="valor">${totales.debo.toFixed(2)}</span>
      {#if tasaBCVOficial && totales.debo > 0}
        <span style="font-size: 0.68rem; color: var(--texto-tenue); font-weight: 500;">
          ≈ Bs. {(totales.debo * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>

    <div class="card ingreso">
      <span class="label">
        <i class="fa-solid fa-arrow-down-left-and-up-right-to-center"></i>
        <span>Me Deben</span>
      </span>
      <span class="valor">${totales.meDeben.toFixed(2)}</span>
      {#if tasaBCVOficial && totales.meDeben > 0}
        <span style="font-size: 0.68rem; color: var(--texto-tenue); font-weight: 500;">
          ≈ Bs. {(totales.meDeben * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
        </span>
      {/if}
    </div>
  </div>
</section>

<!-- LISTA DE DEUDAS -->
<section class="panel">
  <h2>
    <i class="fa-solid fa-list" style="color: var(--acento);"></i>
    <span>Lista de Deudas ({deudas.length})</span>
  </h2>

  {#if deudas.length === 0}
    <p class="vacio">
      <i class="fa-regular fa-folder-open fa-2x" style="display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
      Sin deudas registradas todavía. ¡Toca en "Registrar Deuda" para agregar la primera!
    </p>
  {:else}
    <ul class="lista">
      {#each deudas as d (d.id)}
        <li class:ingreso={d.direccion === 'me_deben'} class:gasto={d.direccion === 'debo'} class:pagado={d.estado === 'pagada'}>
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; flex-wrap: wrap; gap: 0.5rem;">
            <div class="item-left">
              <div class="item-icon" class:ingreso={d.direccion === 'me_deben'} class:gasto={d.direccion === 'debo'}>
                <i class="fa-solid {d.direccion === 'me_deben' ? 'fa-hand-holding-dollar' : 'fa-money-bill-transfer'}"></i>
              </div>
              <div class="item-details">
                <span class="item-title">
                  {d.persona}
                  <span class="badge-pill" style="font-size: 0.65rem; padding: 0.05rem 0.35rem; margin-left: 0.3rem;">
                    {d.direccion === 'debo' ? 'Yo debo' : 'Me deben'}
                  </span>
                </span>
                <div class="item-meta">
                  <span><i class="fa-regular fa-calendar"></i> {d.fecha}</span>
                  {#if d.notas}
                    <span>• {d.notas}</span>
                  {/if}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div class="item-amounts">
                <span class="item-amount-usd" style="color: {d.direccion === 'me_deben' ? 'var(--verde)' : 'var(--rojo)'};">
                  ${d.saldoPendiente.toFixed(2)}
                </span>
                <span class="item-amount-original">
                  de ${d.montoOriginal.toFixed(2)}
                </span>
              </div>

              {#if d.estado === 'pendiente'}
                <button type="button" class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick={() => abrirAbono(d)}>
                  <i class="fa-solid fa-plus" style="color: var(--verde);"></i>
                  <span>Abonar</span>
                </button>
              {:else}
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--verde); display: flex; align-items: center; gap: 0.25rem;">
                  <i class="fa-solid fa-circle-check"></i> Pagada
                </span>
              {/if}

              <!-- Botón Ver Historial de Pagos -->
              <button 
                type="button" 
                class="btn-secondary" 
                style="padding: 0.3rem 0.55rem; font-size: 0.78rem;"
                onclick={(e) => toggleHistorial(d.id, e)}
                title={historialAbierto[d.id] ? 'Ocultar historial' : 'Ver historial de abonos'}
              >
                <i class="fa-solid {historialAbierto[d.id] ? 'fa-chevron-up' : 'fa-clock-rotate-left'}"></i>
              </button>
            </div>
          </div>

          <!-- Historial de Pagos / Abonos Desplegable -->
          {#if historialAbierto[d.id]}
            <div style="width: 100%; margin-top: 0.75rem; padding-top: 0.65rem; border-top: 1px solid var(--borde);">
              <div style="font-size: 0.74rem; font-weight: 700; color: var(--texto-tenue); text-transform: uppercase; margin-bottom: 0.4rem;">
                Historial de Abonos ({abonosPorDeuda[d.id]?.length || 0})
              </div>
              {#if !abonosPorDeuda[d.id] || abonosPorDeuda[d.id].length === 0}
                <div style="font-size: 0.75rem; color: var(--texto-tenue); font-style: italic;">
                  Sin abonos registrados todavía.
                </div>
              {:else}
                <ol class="lista-historial-fijo" style="margin: 0; padding: 0;">
                  {#each [...abonosPorDeuda[d.id]].reverse() as ab (ab.id || ab.fecha)}
                    <li class="item-historial-fijo">
                      <div class="col-fecha-hora">
                        <span class="txt-fecha">{ab.fecha}</span>
                      </div>
                      <div class="col-descripcion-nota">
                        <span class="txt-descripcion" style="color: var(--verde); font-weight: 600;">
                          + Abono
                          {#if ab.nota}
                            <span style="color: var(--texto-tenue); font-weight: 400;">• {ab.nota}</span>
                          {/if}
                        </span>
                      </div>
                      <div class="col-monto-responsable">
                        <span class="txt-monto" style="color: var(--verde);">
                          +${Number(ab.montoUSD || 0).toFixed(2)}
                        </span>
                        {#if ab.moneda === 'VES'}
                          <span style="font-size: 0.65rem; color: var(--texto-tenue); display: block;">
                            (Bs. {Number(ab.montoOriginal || ab.monto).toLocaleString('es-VE')})
                          </span>
                        {/if}
                      </div>
                    </li>
                  {/each}
                </ol>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<!-- MODAL REGISTRAR DEUDA -->
{#if showModalRegistro}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalRegistro = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalRegistro = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-hand-holding-dollar" style="color: var(--acento);"></i>
          <span>Registrar Deuda</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalRegistro = false)} aria-label="Cerrar">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <form onsubmit={enviar}>
        <!-- Fila 1: Persona / Contacto (Izquierda) y Moneda (Derecha) -->
        <div class="fila">
          <label style="flex: 2;">
            <span>Persona / Contacto</span>
            <input type="text" bind:value={persona} placeholder="Nombre de la persona o entidad" required />
          </label>

          <label style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Moneda</span>
              <button 
                type="button" 
                class="btn-secondary" 
                style="padding: 0 0.3rem; font-size: 0.62rem; min-height: 18px; gap: 0.2rem; border-radius: 4px; border-color: var(--borde); line-height: 1;" 
                onclick={() => obtenerTasaActual(true)}
                title="Actualizar tasa oficial BCV"
              >
                <i class="fa-solid fa-arrows-rotate {cargandoTasa ? 'fa-spin' : ''}"></i>
                <span>{cargandoTasa ? '...' : (tasaBCVOficial ? `BCV: ${tasaBCVOficial.toFixed(2)}` : 'Recargar')}</span>
              </button>
            </div>
            <select bind:value={moneda} onchange={() => { if (moneda === 'VES') obtenerTasaActual(); }}>
              <option value="USD">USD ($)</option>
              <option value="VES">VES (Bs.)</option>
            </select>
          </label>
        </div>

        <!-- Fila 2: Dirección y Monto -->
        <div class="fila">
          <label>
            <span>Dirección</span>
            <select bind:value={direccion}>
              <option value="debo">Yo debo (Por pagar)</option>
              <option value="me_deben">Me deben (Por cobrar)</option>
            </select>
          </label>

          <label>
            <span>Monto ({moneda === 'VES' ? 'Bs. VES' : '$ USD'})</span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              bind:value={monto} 
              placeholder={moneda === 'VES' ? 'Ej: 1500.00' : '0.00'} 
              required 
            />
          </label>
        </div>

        <!-- Fila 3: Equivalente y Fecha -->
        <div class="fila">
          <label>
            <span style="color: var(--acento);">
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

          <label>
            <span>Fecha</span>
            <input type="date" bind:value={fecha} required />
          </label>
        </div>

        <label class="ancho-completo">
          <span>Notas / Concepto</span>
          <input type="text" bind:value={notas} placeholder="Ej: Préstamo, Factura de servicio..." />
        </label>

        {#if error}
          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {error}</p>
        {/if}

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.6rem;">
          <button type="button" class="btn-secondary" onclick={() => (showModalRegistro = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardando}>
            <i class="fa-solid fa-check"></i>
            <span>{guardando ? 'Guardando...' : 'Registrar Deuda'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL ABONAR A DEUDA -->
{#if showModalAbono && deudaSeleccionadaAbono}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalAbono = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalAbono = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-hand-holding-dollar" style="color: var(--verde);"></i>
          <span>Abonar a {deudaSeleccionadaAbono.persona}</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalAbono = false)} aria-label="Cerrar">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <!-- Tarjeta informativa del Saldo Pendiente -->
      <div style="background: var(--bg-subtle); border: 1px solid var(--borde); border-radius: var(--radius-sm); padding: 0.65rem 0.8rem; margin-bottom: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 0.72rem; color: var(--texto-tenue); display: block;">Saldo Pendiente:</span>
          <span style="font-size: 1.15rem; font-weight: 700; color: {deudaSeleccionadaAbono.direccion === 'me_deben' ? 'var(--verde)' : 'var(--rojo)'};">
            ${Number(deudaSeleccionadaAbono.saldoPendiente).toFixed(2)} USD
          </span>
        </div>
        {#if tasaBCVOficial}
          <div style="text-align: right;">
            <span style="font-size: 0.72rem; color: var(--texto-tenue); display: block;">Equivalente BCV:</span>
            <span style="font-size: 0.88rem; font-weight: 600; color: var(--texto);">
              ≈ Bs. {(Number(deudaSeleccionadaAbono.saldoPendiente) * tasaBCVOficial).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
            </span>
          </div>
        {/if}
      </div>

      <form onsubmit={enviarAbono}>
        <!-- Fila 1: Moneda e info BCV -->
        <div class="fila">
          <label style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Moneda de Pago</span>
              <button 
                type="button" 
                class="btn-secondary" 
                style="padding: 0 0.3rem; font-size: 0.62rem; min-height: 18px; gap: 0.2rem; border-radius: 4px; border-color: var(--borde); line-height: 1;" 
                onclick={() => obtenerTasaActual(true)}
                title="Actualizar tasa oficial BCV"
              >
                <i class="fa-solid fa-arrows-rotate {cargandoTasa ? 'fa-spin' : ''}"></i>
                <span>{cargandoTasa ? '...' : (tasaBCVOficial ? `BCV: ${tasaBCVOficial.toFixed(2)}` : 'Recargar')}</span>
              </button>
            </div>
            <select bind:value={abonoMoneda} onchange={() => { if (abonoMoneda === 'VES') obtenerTasaActual(); }}>
              <option value="USD">USD ($)</option>
              <option value="VES">VES (Bs.)</option>
            </select>
          </label>

          <label style="flex: 1;">
            <span>Monto a Abonar ({abonoMoneda === 'VES' ? 'Bs. VES' : '$ USD'})</span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              bind:value={abonoMonto} 
              placeholder={abonoMoneda === 'VES' ? 'Ej: 1500.00' : '0.00'} 
              required 
            />
          </label>
        </div>

        <!-- Fila 2: Equivalente y Fecha -->
        <div class="fila">
          <label>
            <span style="color: var(--acento);">
              Equivalente ({abonoMoneda === 'VES' ? '$ USD' : 'Bs. VES'})
            </span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              value={valorConvertidoAbono} 
              oninput={(e) => handleConvertedInputAbono(e.currentTarget.value)}
              placeholder={abonoMoneda === 'VES' ? '≈ USD' : '≈ Bs.'} 
            />
          </label>

          <label>
            <span>Fecha del Abono</span>
            <input type="date" bind:value={abonoFecha} required />
          </label>
        </div>

        <label class="ancho-completo">
          <span>Nota / Comentario (Opcional)</span>
          <input type="text" bind:value={abonoNota} placeholder="Ej: Pago quincenal, Transferencia bancaria..." />
        </label>

        {#if abonoError}
          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {abonoError}</p>
        {/if}

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.6rem;">
          <button type="button" class="btn-secondary" onclick={() => (showModalAbono = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardandoAbono}>
            <i class="fa-solid fa-check"></i>
            <span>{guardandoAbono ? 'Guardando...' : 'Confirmar Abono'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
