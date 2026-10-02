<script>
  import Icon from './Icon.svelte'
  import {
    MESES,
    DIAS_SEMANA,
    obtenerFechaHoyISO,
    parsearFechaISO,
    formatearFechaLegible,
    generarCuadriculaCalendario,
  } from '../utils/date.js'

  let {
    value = $bindable(''),
    required = false,
    disabled = false,
    min = '',
    max = '',
    id = '',
    name = '',
    placeholder = 'Selecciona una fecha',
    class: className = '',
  } = $props()

  let isOpen = $state(false)
  let contenedorEl = $state(null)

  // Inicializar mes y año de visualización
  const inicial = parsearFechaISO(value) || parsearFechaISO(obtenerFechaHoyISO())
  let viewYear = $state(inicial.ano)
  let viewMonth = $state(inicial.mes)

  // Sincronizar mes/año cuando cambia el valor externamente
  $effect(() => {
    const f = parsearFechaISO(value)
    if (f) {
      viewYear = f.ano
      viewMonth = f.mes
    }
  })

  // Generar cuadrícula de días para el mes visible
  let diasCalendario = $derived(
    generarCuadriculaCalendario({
      viewYear,
      viewMonth,
      value,
      min,
      max,
    })
  )
  function mesAnterior() {
    if (viewMonth === 0) {
      viewMonth = 11
      viewYear--
    } else {
      viewMonth--
    }
  }

  function mesSiguiente() {
    if (viewMonth === 11) {
      viewMonth = 0
      viewYear++
    } else {
      viewMonth++
    }
  }

  function seleccionarFecha(iso, isDisabled) {
    if (isDisabled) return
    value = iso
    isOpen = false
  }

  function seleccionarHoy() {
    const hoy = obtenerFechaHoyISO()
    if ((min && hoy < min) || (max && hoy > max)) return
    value = hoy
    const parsed = parsearFechaISO(hoy)
    if (parsed) {
      viewYear = parsed.ano
      viewMonth = parsed.mes
    }
    isOpen = false
  }

  function alternar() {
    if (disabled) return
    isOpen = !isOpen
  }

  function alInteractuarVentana(e) {
    if (!isOpen) return
    if (contenedorEl && !contenedorEl.contains(e.target)) {
      isOpen = false
    }
  }

  function alPresionarTecla(e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false
    }
  }
</script>

<svelte:window onclick={alInteractuarVentana} onkeydown={alPresionarTecla} />

<div class="datepicker-contenedor {className}" bind:this={contenedorEl}>
  <!-- Input activador con apariencia neumórfica -->
  <div class="datepicker-input-wrapper">
    <input
      type="text"
      readonly
      value={formatearFechaLegible(value)}
      {placeholder}
      {disabled}
      {id}
      {name}
      onclick={alternar}
      onkeydown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          alternar()
        }
      }}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label="Seleccionar fecha"
    />
    <!-- Campo oculto para asegurar validación requerida si está en un formulario -->
    {#if required}
      <input
        type="text"
        tabindex="-1"
        aria-hidden="true"
        required
        value={value}
        style="position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;"
      />
    {/if}
    <span class="datepicker-icono">
      <Icon name="calendar" size={16} />
    </span>
  </div>

  <!-- Popover Emergente de Calendario Neumórfico -->
  {#if isOpen}
    <div
      class="datepicker-popover"
      role="dialog"
      aria-modal="true"
      aria-label="Calendario de selección de fecha"
    >
      <!-- Cabecera de mes y año -->
      <div class="datepicker-header">
        <button
          type="button"
          class="datepicker-nav-btn"
          onclick={mesAnterior}
          aria-label="Mes anterior"
          title="Mes anterior"
        >
          <Icon name="chevron-left" size={16} />
        </button>

        <span class="datepicker-titulo">
          {MESES[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          class="datepicker-nav-btn"
          onclick={mesSiguiente}
          aria-label="Mes siguiente"
          title="Mes siguiente"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <!-- Fila de días de la semana -->
      <div class="datepicker-grid-header" aria-hidden="true">
        {#each DIAS_SEMANA as d}
          <span>{d}</span>
        {/each}
      </div>

      <!-- Cuadrícula de días -->
      <div class="datepicker-grid-days" role="grid">
        {#each diasCalendario as d}
          <button
            type="button"
            class="datepicker-day-btn"
            class:selected={d.selected}
            class:today={d.isToday}
            class:other-month={d.otherMonth}
            disabled={d.disabled}
            onclick={() => seleccionarFecha(d.iso, d.disabled)}
            aria-label="{d.dia} de {MESES[d.mes]} de {d.ano}"
          >
            {d.dia}
          </button>
        {/each}
      </div>

      <!-- Pie con botón de acceso rápido -->
      <div class="datepicker-footer">
        <button
          type="button"
          class="datepicker-btn-hoy"
          onclick={seleccionarHoy}
        >
          Hoy
        </button>
      </div>
    </div>
  {/if}
</div>
