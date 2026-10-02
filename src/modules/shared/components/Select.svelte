<script>
  import Icon from './Icon.svelte'
  import {
    normalizarOpciones,
    filtrarOpciones,
    buscarOpcionPorValor,
  } from '../utils/select.js'

  let {
    value = $bindable(''),
    options = [],
    allowCustom = false,
    placeholder = 'Selecciona una opción',
    disabled = false,
    required = false,
    id = '',
    name = '',
    class: className = '',
  } = $props()

  let isOpen = $state(false)
  let contenedorEl = $state(null)
  let inputEl = $state(null)
  let highlightedIndex = $state(-1)

  // Normalizar opciones a objetos { value, label, icon }
  let normalizedOptions = $derived(normalizarOpciones(options))

  // Opciones filtradas en modo autocompletado/combobox
  let displayedOptions = $derived.by(() => {
    if (allowCustom && value && isOpen) {
      return filtrarOpciones(normalizedOptions, value)
    }
    return normalizedOptions
  })

  // Opción actualmente seleccionada (en modo selección simple)
  let selectedOption = $derived(buscarOpcionPorValor(normalizedOptions, value))

  let displayText = $derived(
    selectedOption ? selectedOption.label : (allowCustom ? value : '')
  )

  let justSelected = false

  function alternar(e) {
    if (disabled) return
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
    if (isOpen) {
      cerrar()
    } else {
      abrir(e)
    }
  }

  function abrir(e) {
    if (disabled || justSelected) return
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation()
    }
    isOpen = true
    // Encontrar índice actual para resaltado
    const idx = displayedOptions.findIndex((opt) => opt.value === String(value))
    highlightedIndex = idx >= 0 ? idx : (displayedOptions.length > 0 ? 0 : -1)
  }

  function cerrar() {
    isOpen = false
    highlightedIndex = -1
  }

  function seleccionar(opt) {
    value = opt.value
    justSelected = true
    cerrar()
    setTimeout(() => {
      justSelected = false
    }, 200)
    if (allowCustom && inputEl) {
      inputEl.focus()
    }
  }

  function alEnfocarInput(e) {
    if (justSelected) return
    abrir(e)
  }

  function alInteractuarVentana(e) {
    if (!isOpen) return
    if (contenedorEl && !contenedorEl.contains(e.target)) {
      cerrar()
    }
  }

  function alPresionarTeclaVentana(e) {
    if (e.key === 'Escape' && isOpen) {
      cerrar()
    }
  }

  function manejarKeyDown(e) {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || (!allowCustom && (e.key === 'Enter' || e.key === ' '))) {
        e.preventDefault()
        abrir()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (displayedOptions.length > 0) {
        highlightedIndex = (highlightedIndex + 1) % displayedOptions.length
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (displayedOptions.length > 0) {
        highlightedIndex = (highlightedIndex - 1 + displayedOptions.length) % displayedOptions.length
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && displayedOptions[highlightedIndex]) {
        e.preventDefault()
        seleccionar(displayedOptions[highlightedIndex])
      } else if (allowCustom) {
        // En modo editable, presionar Enter con el dropdown abierto confirma el texto actual
        cerrar()
      }
    } else if (e.key === 'Tab') {
      cerrar()
    }
  }
</script>

<svelte:window onclick={alInteractuarVentana} onkeydown={alPresionarTeclaVentana} />

<div
  class="neumorphic-select-container {className}"
  bind:this={contenedorEl}
  onkeydown={manejarKeyDown}
  role="presentation"
>
  {#if allowCustom}
    <!-- Modo Combobox / Autocompletado editable -->
    <div class="neumorphic-select-input-wrapper">
      <input
        bind:this={inputEl}
        type="text"
        {id}
        {name}
        {placeholder}
        {disabled}
        bind:value={value}
        onfocus={alEnfocarInput}
        onclick={abrir}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        autocomplete="off"
      />
      <button
        type="button"
        class="neumorphic-select-arrow-btn"
        onclick={alternar}
        {disabled}
        tabindex="-1"
        aria-label="Alternar opciones"
      >
        <span class="neumorphic-select-arrow" class:open={isOpen}>
          <Icon name="chevron-down" size={16} />
        </span>
      </button>
    </div>
  {:else}
    <!-- Modo Selector Rígido -->
    <button
      type="button"
      {id}
      class="neumorphic-select-trigger"
      class:open={isOpen}
      class:placeholder={!displayText}
      onclick={alternar}
      {disabled}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <span class="trigger-label">{displayText || placeholder}</span>
      <span class="neumorphic-select-arrow" class:open={isOpen}>
        <Icon name="chevron-down" size={16} />
      </span>
    </button>
  {/if}

  <!-- Campo oculto para requerimiento y formularios si aplica -->
  {#if required}
    <input
      type="text"
      value={value}
      required
      tabindex="-1"
      style="position: absolute; opacity: 0; pointer-events: none; height: 0; width: 0; margin: 0; padding: 0; border: none;"
    />
  {/if}

  <!-- Menú emergente neumórfico -->
  {#if isOpen}
    <ul class="neumorphic-dropdown-menu" role="listbox" tabindex="-1">
      {#each displayedOptions as opt, idx}
        <li role="presentation">
          <button
            type="button"
            class="dropdown-item"
            class:selected={opt.value === String(value)}
            class:highlighted={idx === highlightedIndex}
            onclick={() => seleccionar(opt)}
            role="option"
            aria-selected={opt.value === String(value)}
          >
            <span>{opt.label}</span>
            {#if opt.value === String(value)}
              <Icon name="check" size={15} />
            {/if}
          </button>
        </li>
      {:else}
        <li class="dropdown-empty" role="presentation">
          No hay opciones disponibles
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .trigger-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 0.5rem;
  }
</style>
