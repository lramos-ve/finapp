<script>
  import { obtenerTasaBCV, obtenerUltimaTasaEnCache, guardarTasaEnCache } from '../../shared/services/bcv.js'
  import Icon from '../../shared/components/Icon.svelte'
  import DatePicker from '../../shared/components/DatePicker.svelte'

  let { deudaId, onConfirmar, onCancelar } = $props()

  let abonoMonto = $state('')
  let abonoMoneda = $state('USD')
  let abonoTasaBCV = $state('')
  let cargandoTasaAbono = $state(false)
  let tasaAbonoInfo = $state('')
  let abonoFecha = $state(new Date().toISOString().slice(0, 10))
  let abonoError = $state('')

  async function actualizarTasaAbono() {
    cargandoTasaAbono = true
    tasaAbonoInfo = ''
    try {
      const res = await obtenerTasaBCV({ forzar: true })
      abonoTasaBCV = String(res.tasa)
      if (res.error) {
        tasaAbonoInfo = `Usando caché (${res.error})`
      } else {
        tasaAbonoInfo = 'Tasa oficial actualizada'
      }
    } catch {
      tasaAbonoInfo = 'No se pudo obtener la tasa en línea'
    } finally {
      cargandoTasaAbono = false
    }
  }

  function alSeleccionarMonedaAbono(m) {
    abonoMoneda = m
    if (m === 'VES' && !abonoTasaBCV) {
      const enCache = obtenerUltimaTasaEnCache()
      if (enCache) {
        abonoTasaBCV = String(enCache)
        tasaAbonoInfo = 'Última tasa guardada'
      } else {
        actualizarTasaAbono()
      }
    }
  }

  async function enviarAbono(e) {
    e.preventDefault()
    abonoError = ''
    try {
      if (abonoMoneda === 'VES' && abonoTasaBCV) {
        guardarTasaEnCache(Number(abonoTasaBCV))
      }
      await onConfirmar(deudaId, {
        monto: Number(abonoMonto),
        moneda: abonoMoneda,
        tasaBCV: abonoMoneda === 'VES' ? Number(abonoTasaBCV) : undefined,
        fecha: abonoFecha,
      })
    } catch (err) {
      abonoError = err.message
    }
  }
</script>

<form class="abono-form" onsubmit={enviarAbono}>
  <label>
    Monto
    <input type="number" step="0.01" min="0.01" bind:value={abonoMonto} required />
  </label>
  <label>
    Moneda
    <div class="control-segmentado">
      <button type="button" class:activo={abonoMoneda === 'USD'} onclick={() => alSeleccionarMonedaAbono('USD')}>
        USD
      </button>
      <button type="button" class:activo={abonoMoneda === 'VES'} onclick={() => alSeleccionarMonedaAbono('VES')}>
        VES
      </button>
    </div>
  </label>
  {#if abonoMoneda === 'VES'}
    <label>
      Tasa BCV
      <div class="campo-tasa-bcv">
        <input type="number" step="0.01" min="0.01" bind:value={abonoTasaBCV} required />
        <button
          type="button"
          class="boton-bcv-fetch"
          disabled={cargandoTasaAbono}
          onclick={actualizarTasaAbono}
          aria-label="Actualizar tasa BCV"
          title={cargandoTasaAbono ? 'Consultando tasa...' : 'Consultar tasa oficial BCV'}
        >
          <Icon name="refresh-cw" size={16} class={cargandoTasaAbono ? 'girando' : ''} />
        </button>
      </div>
      {#if tasaAbonoInfo}
        <span class="tasa-bcv-info">{tasaAbonoInfo}</span>
      {/if}
    </label>
  {/if}
  <label>
    Fecha
    <DatePicker bind:value={abonoFecha} required />
  </label>
  {#if abonoError}<p class="error">{abonoError}</p>{/if}
  <button type="submit">Confirmar abono</button>
  <button type="button" class="boton-secundario" onclick={onCancelar}>Cancelar</button>
</form>
