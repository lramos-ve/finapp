<script>
  import { onMount } from 'svelte';
  import { session } from '../session.svelte.js';
  import {
    subscribeFixedExpenses,
    addFixedExpense,
    editFixedExpense,
    deleteFixedExpense,
    toggleFixedExpense,
  } from '../groups.js';
  import {
    definirGastoFijo,
    editarGastoFijo,
    eliminarGastoFijo,
    desactivarGastoFijo,
    activarGastoFijo,
    listarGastosFijos,
    listarInstancias,
    registrarPagoInstancia,
    sincronizarGastosFijos,
  } from '../fixedExpenses.js';
  import { getTasaOficialBCV } from '../rates.js';
  import { settings } from '../settings.svelte.js';

  let showModalDefinir = $state(false);
  let showSuccessAlert = $state(false);
  let successMessage = $state('');

  // Dropdown abierto por plantilla (id de la plantilla abierta o Set)
  let plantillasAbiertas = $state(new Set());
  let menuAbiertoId = $state(null);

  function toggleMenu(id) {
    menuAbiertoId = menuAbiertoId === id ? null : id;
  }

  // Estado para Crear / Editar plantilla
  let editandoId = $state(null);
  let nombre = $state('');
  let monto = $state('');
  let diaVencimiento = $state('');
  let error = $state('');
  let guardando = $state(false);

  let gastosFijos = $state([]);
  let instanciasPorGastoFijo = $state({}); // { [gastoFijoId]: Array<Instancia> }
  let unsubscribeFirestore = null;

  let pagoAbiertoPara = $state(null);
  let pagoMonto = $state('');
  let pagoMoneda = $state(settings.defaultCurrency || 'USD');
  let pagoTasaBCV = $state('');
  let tasaBCVOficial = $state(null);
  let pagoFecha = $state(hoyISO());
  let pagoError = $state('');

  function hoyISO() {
    return new Date().toISOString().slice(0, 10);
  }

  let gastosFijosActivos = $derived.by(() => {
    return gastosFijos.filter((g) => g.activo === 1 || g.activo === true);
  });

  // Total mensual comprometido en plantillas activas
  let totalMensualActivo = $derived.by(() => {
    return gastosFijosActivos.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
  });

  async function cargar() {
    if (session.activeGroup?.id) {
      if (unsubscribeFirestore) unsubscribeFirestore();
      unsubscribeFirestore = subscribeFixedExpenses(session.activeGroup.id, async (items) => {
        gastosFijos = items;
        await cargarInstancias(items);
      });
    } else {
      await sincronizarGastosFijos();
      const items = await listarGastosFijos({});
      gastosFijos = items;
      await cargarInstancias(items);
    }
  }

  async function cargarInstancias(items) {
    const mapaInstancias = {};
    for (const g of items) {
      const instancias = await listarInstancias({ gastoFijoId: g.id });
      mapaInstancias[g.id] = instancias.sort((a, b) => (a.periodo < b.periodo ? 1 : -1));
    }
    instanciasPorGastoFijo = mapaInstancias;
  }

  function toggleDropdownPlantilla(id) {
    if (plantillasAbiertas.has(id)) {
      plantillasAbiertas.delete(id);
    } else {
      plantillasAbiertas.add(id);
    }
    plantillasAbiertas = new Set(plantillasAbiertas);
  }

  function triggerSuccessAlert(msg) {
    successMessage = msg;
    showSuccessAlert = true;
    setTimeout(() => {
      showSuccessAlert = false;
    }, 3000);
  }

  function abrirCrear() {
    editandoId = null;
    nombre = '';
    monto = '';
    diaVencimiento = '';
    error = '';
    showModalDefinir = true;
  }

  function abrirEdicion(g) {
    editandoId = g.id;
    nombre = g.nombre;
    monto = g.monto.toString();
    diaVencimiento = g.diaVencimiento.toString();
    error = '';
    showModalDefinir = true;
  }

  async function enviar(e) {
    e.preventDefault();
    error = '';
    guardando = true;
    try {
      if (editandoId) {
        if (session.activeGroup?.id) {
          await editFixedExpense(session.activeGroup.id, editandoId, {
            nombre: nombre.trim(),
            monto: Number(monto),
            diaVencimiento: Number(diaVencimiento),
          });
        }
        try {
          await editarGastoFijo({
            id: editandoId,
            nombre: nombre.trim(),
            monto: Number(monto),
            diaVencimiento: Number(diaVencimiento),
          });
        } catch (_) {}
        triggerSuccessAlert('¡Gasto fijo actualizado en Firebase!');
      } else {
        let nuevoId = null;
        if (session.activeGroup?.id) {
          nuevoId = await addFixedExpense(
            session.activeGroup.id,
            {
              nombre: nombre.trim(),
              monto: Number(monto),
              diaVencimiento: Number(diaVencimiento),
            },
            session.user
          );
        }
        const nuevo = await definirGastoFijo({ 
          nombre: nombre.trim(), 
          monto: Number(monto), 
          diaVencimiento: Number(diaVencimiento) 
        });
        const idParaAbrir = nuevoId || nuevo?.id;
        if (idParaAbrir) {
          plantillasAbiertas.add(idParaAbrir);
          plantillasAbiertas = new Set(plantillasAbiertas);
        }
        triggerSuccessAlert('¡Gasto fijo guardado en Firebase!');
      }

      nombre = '';
      monto = '';
      diaVencimiento = '';
      editandoId = null;
      showModalDefinir = false;
      await cargar();
    } catch (err) {
      error = err.message;
    } finally {
      guardando = false;
    }
  }

  async function handleToggle(id, estadoActual) {
    try {
      const activoBool = estadoActual === 1 || estadoActual === true;
      if (session.activeGroup?.id) {
        await toggleFixedExpense(session.activeGroup.id, id, !activoBool);
      }
      if (activoBool) {
        await desactivarGastoFijo(id);
        triggerSuccessAlert('Plantilla pausada');
      } else {
        await activarGastoFijo(id);
        triggerSuccessAlert('Plantilla reactivada');
      }
      await cargar();
    } catch (err) {
      console.error(err);
    }
  }

  async function eliminar(g) {
    if (!confirm(`¿Eliminar definitivamente el gasto fijo "${g.nombre}" de Firebase?`)) return;
    try {
      if (session.activeGroup?.id) {
        await deleteFixedExpense(session.activeGroup.id, g.id);
      }
      try {
        await eliminarGastoFijo(g.id);
      } catch (_) {}

      plantillasAbiertas.delete(g.id);
      plantillasAbiertas = new Set(plantillasAbiertas);
      await cargar();
      triggerSuccessAlert(`"${g.nombre}" eliminado`);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  }

  async function obtenerTasaActual() {
    try {
      const data = await getTasaOficialBCV();
      tasaBCVOficial = data.promedio;
      if (!pagoTasaBCV) {
        pagoTasaBCV = data.promedio.toString();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function abrirPago(instanciaId, saldo) {
    pagoAbiertoPara = instanciaId;
    pagoMonto = saldo ? saldo.toString() : '';
    pagoMoneda = settings.defaultCurrency || 'USD';
    pagoTasaBCV = '';
    pagoFecha = hoyISO();
    pagoError = '';
    obtenerTasaActual();
  }

  async function enviarPago(e, instanciaId) {
    e.preventDefault();
    pagoError = '';
    try {
      await registrarPagoInstancia({
        instanciaId,
        monto: Number(pagoMonto),
        moneda: pagoMoneda,
        tasaBCV: pagoMoneda === 'VES' ? Number(pagoTasaBCV) : undefined,
        fecha: pagoFecha,
      });
      pagoAbiertoPara = null;
      await cargar();
      triggerSuccessAlert('¡Pago registrado con éxito!');
    } catch (err) {
      pagoError = err.message;
    }
  }

  onMount(() => {
    cargar();
    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  });
</script>

<svelte:window onclick={() => (menuAbiertoId = null)} />

<!-- Sweet Alert Success Toast -->
{#if showSuccessAlert}
  <div class="alert-toast" role="status">
    <i class="fa-solid fa-circle-check" style="color: var(--verde); font-size: 1.1rem;"></i>
    <span>{successMessage}</span>
  </div>
{/if}

<!-- ENCABEZADO Y RESUMEN GENERAL -->
<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
  <div>
    <h2 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
      <i class="fa-solid fa-calendar-check" style="color: var(--acento);"></i>
      <span>Gastos Fijos Recurrentes</span>
      {#if session.activeGroup}
        <span class="badge-pill" style="font-size: 0.72rem; font-weight: normal; margin-left: 0.25rem;">
          <i class="fa-solid fa-cloud" style="color: var(--acento);"></i>
          <span>{session.activeGroup.name}</span>
        </span>
      {/if}
    </h2>
    <div style="font-size: 0.82rem; color: var(--texto-tenue); margin-top: 0.2rem;">
      Compromiso mensual activo: <strong style="color: var(--rojo); font-size: 0.95rem;">${totalMensualActivo.toFixed(2)} / mes</strong>
    </div>
  </div>

  <button type="button" class="btn-primary" onclick={abrirCrear}>
    <i class="fa-solid fa-plus"></i>
    <span>Nuevo Gasto Fijo</span>
  </button>
</div>

<!-- LISTADO DE PLANTILLAS: CADA PLANTILLA ES UN DROPDOWN COLAPSABLE CON SU HISTORIAL -->
{#if gastosFijos.length === 0}
  <section class="panel">
    <p class="vacio">
      <i class="fa-regular fa-calendar-xmark fa-3x" style="display: block; margin-bottom: 0.75rem; opacity: 0.4;"></i>
      No tienes gastos fijos configurados en este grupo.<br />
      Pulsa en <strong>"+ Nuevo Gasto Fijo"</strong> para agregar alquiler, internet, servicios, etc.
    </p>
  </section>
{:else}
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    {#each gastosFijos as g (g.id)}
      {@const estaAbierto = plantillasAbiertas.has(g.id)}
      {@const instancias = instanciasPorGastoFijo[g.id] || []}
      {@const esActivo = g.activo === 1 || g.activo === true}

      <div class="panel" style="margin-bottom: 0; padding: 0; position: relative; z-index: {menuAbiertoId === g.id ? 100 : 1}; opacity: {esActivo ? '1' : '0.75'}; transition: all 0.2s ease;">
        
        <!-- CABECERA DEL DROPDOWN POR PLANTILLA (Clickable) -->
        <div 
          style="padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; background: {estaAbierto ? 'var(--panel-hover)' : 'var(--panel)'}; border-bottom: {estaAbierto ? '1px solid var(--borde)' : 'none'}; gap: 0.6rem; border-radius: var(--radius);"
          onclick={() => toggleDropdownPlantilla(g.id)}
          role="button"
          tabindex="0"
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDropdownPlantilla(g.id); }}
        >
          <!-- Info Izquierda -->
          <div style="display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; overflow: hidden;">
            <div class="item-icon {esActivo ? 'gasto' : ''}" style="width: 32px; height: 32px; font-size: 0.82rem;">
              <i class="fa-solid fa-calendar-day"></i>
            </div>
            <div style="min-width: 0; overflow: hidden;">
              <div style="font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <span style="overflow: hidden; text-overflow: ellipsis;">{g.nombre}</span>
                <span class="badge-pill" style="font-size: 0.65rem; padding: 0.05rem 0.35rem; background: {esActivo ? 'var(--verde-bg)' : 'var(--card-bg)'}; color: {esActivo ? 'var(--verde)' : 'var(--texto-muted)'}; flex-shrink: 0;">
                  {esActivo ? 'Activo' : 'Pausado'}
                </span>
              </div>
              <div style="font-size: 0.72rem; color: var(--texto-tenue); margin-top: 0.1rem; display: flex; align-items: center; gap: 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <span><i class="fa-regular fa-clock"></i> Vence día {g.diaVencimiento}</span>
                <span>• {instancias.length} períodos</span>
              </div>
            </div>
          </div>

          <!-- Monto y Menú de 3 puntos Verticales -->
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0;">
            <span style="font-size: 1.05rem; font-weight: 800; color: var(--rojo);">
              ${Number(g.monto).toFixed(2)}
            </span>

            <div class="action-menu-wrapper">
              <button 
                type="button" 
                class="btn-icon" 
                style="width: 32px; height: 32px; font-size: 0.9rem; border-radius: 6px;"
                onclick={(e) => { e.stopPropagation(); toggleMenu(g.id); }}
                title="Opciones de plantilla"
                aria-label="Opciones"
              >
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>

              {#if menuAbiertoId === g.id}
                <div class="action-menu-dropdown" role="menu">
                  <!-- 1. Historial -->
                  <button 
                    type="button" 
                    class="action-menu-item" 
                    onclick={(e) => { e.stopPropagation(); toggleDropdownPlantilla(g.id); menuAbiertoId = null; }}
                  >
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <span>{estaAbierto ? 'Ocultar Historial' : 'Historial'}</span>
                  </button>

                  <!-- 2. Editar -->
                  <button 
                    type="button" 
                    class="action-menu-item" 
                    onclick={(e) => { e.stopPropagation(); abrirEdicion(g); menuAbiertoId = null; }}
                  >
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>Editar</span>
                  </button>

                  <!-- 3. Pausar / Activar -->
                  <button 
                    type="button" 
                    class="action-menu-item" 
                    onclick={(e) => { e.stopPropagation(); handleToggle(g.id, g.activo); menuAbiertoId = null; }}
                  >
                    <i class="fa-solid {esActivo ? 'fa-pause' : 'fa-play'}" style="color: {esActivo ? 'var(--rojo)' : 'var(--verde)'};"></i>
                    <span>{esActivo ? 'Pausar' : 'Activar'}</span>
                  </button>

                  <!-- 4. Borrar -->
                  <button 
                    type="button" 
                    class="action-menu-item danger" 
                    onclick={(e) => { e.stopPropagation(); eliminar(g); menuAbiertoId = null; }}
                  >
                    <i class="fa-solid fa-trash-can"></i>
                    <span>Borrar</span>
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- CONTENIDO DEL DROPDOWN: TABLA / HISTORIAL DE PAGOS DE ESTA PLANTILLA -->
        {#if estaAbierto}
          <div style="padding: 0.7rem 0.85rem; background: var(--bg-subtle); border-bottom-left-radius: var(--radius); border-bottom-right-radius: var(--radius);">
            <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--texto-muted); margin-bottom: 0.45rem; display: flex; align-items: center; gap: 0.35rem;">
              <i class="fa-solid fa-clock-rotate-left"></i>
              <span>Historial de Pagos y Períodos</span>
            </div>

            {#if instancias.length === 0}
              <p class="vacio" style="padding: 0.5rem 0; font-size: 0.8rem;">No hay períodos generados para esta plantilla aún.</p>
            {:else}
              <ul class="lista" style="gap: 0.3rem;">
                {#each instancias as i (i.id)}
                  {@const estaPagado = i.estado === 'pagado'}
                  {@const estaVencido = i.estado === 'vencida'}

                  <li style="background: var(--panel); padding: 0.4rem 0.65rem; border-left: 3px solid {estaPagado ? 'var(--verde)' : estaVencido ? 'var(--rojo)' : 'var(--acento)'};">
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 0.45rem; flex-wrap: nowrap;">
                      <!-- Período y Estado -->
                      <div class="item-left">
                        <div class="item-icon {estaPagado ? 'ingreso' : 'gasto'}" style="width: 26px; height: 26px; font-size: 0.72rem;">
                          <i class="fa-solid {estaPagado ? 'fa-check' : 'fa-receipt'}"></i>
                        </div>
                        <div class="item-details">
                          <span class="item-title" style="font-size: 0.8rem;">
                            Período {i.periodo}
                          </span>
                          <div class="item-meta">
                            <span class="estado" style="font-weight: 700; font-size: 0.68rem; color: {estaPagado ? 'var(--verde)' : estaVencido ? 'var(--rojo)' : 'var(--texto-tenue)'};">
                              {i.estado}
                            </span>
                            {#if i.montoArrastrado > 0}
                              <span style="color: var(--rojo); font-weight: 600; font-size: 0.68rem;">
                                • +${Number(i.montoArrastrado).toFixed(2)}
                              </span>
                            {/if}
                          </div>
                        </div>
                      </div>

                      <!-- Monto y Botón de Pagar (con/sin icono dependiendo de la pantalla) -->
                      <div style="display: flex; align-items: center; gap: 0.55rem; flex-shrink: 0;">
                        <div class="item-amounts">
                          <span class="item-amount-usd" style="color: {estaPagado ? 'var(--verde)' : 'var(--rojo)'}; font-size: 0.85rem;">
                            ${Number(i.saldoPendiente).toFixed(2)}
                          </span>
                          <span class="item-amount-original" style="font-size: 0.65rem;">
                            Tot: ${Number(i.montoPeriodo).toFixed(2)}
                          </span>
                        </div>

                        <!-- Botón Pagar si NO está pagado / Insignia si está pagado -->
                        {#if !estaPagado}
                          <button 
                            type="button" 
                            class="btn-pay" 
                            onclick={() => abrirPago(i.id, i.saldoPendiente)}
                            title="Registrar pago de este período"
                          >
                            <i class="fa-solid fa-credit-card"></i>
                            <span class="btn-text">Pagar</span>
                          </button>
                        {:else}
                          <span style="font-size: 0.72rem; font-weight: 700; color: var(--verde); display: flex; align-items: center; gap: 0.2rem; flex-shrink: 0;">
                            <i class="fa-solid fa-circle-check"></i>
                            <span class="btn-text">Pagado</span>
                          </span>
                        {/if}
                      </div>
                    </div>

                    <!-- Formulario Desplegable de Pago para este período específico -->
                    {#if pagoAbiertoPara === i.id}
                      <form class="abono-form" style="width: 100%; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--borde);" onsubmit={(e) => enviarPago(e, i.id)}>
                        <div class="fila" style="width: 100%;">
                          <label>
                            Monto a abonar/pagar
                            <input 
                              type="number" 
                              step="0.01" 
                              min="0.01" 
                              max={i.saldoPendiente} 
                              bind:value={pagoMonto} 
                              required 
                              placeholder="0.00" 
                            />
                          </label>
                          <label>
                            Moneda
                            <div class="control-segmentado">
                              <button type="button" class:activo={pagoMoneda === 'USD'} onclick={() => (pagoMoneda = 'USD')}>
                                USD
                              </button>
                              <button type="button" class:activo={pagoMoneda === 'VES'} onclick={() => (pagoMoneda = 'VES')}>
                                VES {#if tasaBCVOficial}<small style="font-size: 0.7em;">({tasaBCVOficial.toFixed(1)})</small>{/if}
                              </button>
                            </div>
                          </label>
                          {#if pagoMoneda === 'VES'}
                            <label>
                              <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>Tasa BCV</span>
                                <button 
                                  type="button" 
                                  class="btn-secondary" 
                                  style="padding: 0.1rem 0.3rem; font-size: 0.7rem; min-height: 20px;" 
                                  onclick={obtenerTasaActual}
                                  title="Actualizar tasa BCV"
                                >
                                  <i class="fa-solid fa-arrows-rotate"></i>
                                </button>
                              </div>
                              <input type="number" step="0.0001" min="0.01" bind:value={pagoTasaBCV} required placeholder="Tasa BCV" />
                            </label>
                          {/if}
                          <label>
                            Fecha de Pago
                            <input type="date" bind:value={pagoFecha} required />
                          </label>
                        </div>

                        {#if pagoError}
                          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {pagoError}</p>
                        {/if}

                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                          <button type="button" class="btn-secondary" onclick={() => (pagoAbiertoPara = null)}>
                            Cancelar
                          </button>
                          <button type="submit" class="btn-primary">
                            <i class="fa-solid fa-check"></i>
                            <span>Confirmar Pago</span>
                          </button>
                        </div>
                      </form>
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<!-- POPUP MODAL RESPONSIVO PARA CREAR O EDITAR GASTO FIJO -->
{#if showModalDefinir}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModalDefinir = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModalDefinir = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-gasto-title">
      <div class="bottom-sheet-handle"></div>

      <div class="modal-header">
        <h3 id="modal-gasto-title">
          <i class="fa-solid {editandoId ? 'fa-pen-to-square' : 'fa-calendar-plus'}" style="color: var(--acento);"></i>
          <span>{editandoId ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showModalDefinir = false)} aria-label="Cerrar ventana">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <form onsubmit={enviar}>
        <div class="fila">
          <label class="ancho-completo">
            <span>Nombre del compromiso</span>
            <input 
              type="text" 
              bind:value={nombre} 
              required 
              placeholder="Ej: Alquiler, Internet, Netflix, Gimnasio..." 
            />
          </label>
        </div>

        <div class="fila">
          <label>
            <span>Monto mensual (USD)</span>
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              bind:value={monto} 
              required 
              placeholder="0.00" 
            />
          </label>
          <label>
            <span>Día de vencimiento (1 - 31)</span>
            <input 
              type="number" 
              min="1" 
              max="31" 
              bind:value={diaVencimiento} 
              required 
              placeholder="Ej: 5" 
            />
          </label>
        </div>

        {#if error}
          <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {error}</p>
        {/if}

        <div style="display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 0.5rem;">
          <button type="button" class="btn-secondary" onclick={() => (showModalDefinir = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={guardando}>
            <i class="fa-solid fa-check"></i>
            <span>{guardando ? 'Guardando...' : editandoId ? 'Guardar Cambios' : 'Guardar Gasto Fijo'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
