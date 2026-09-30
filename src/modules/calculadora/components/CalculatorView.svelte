<script>
  import { onMount } from 'svelte'
  import {
    obtenerTasasOficialesBCV,
    obtenerUltimaTasaEnCache,
    obtenerUltimaTasaEuroEnCache,
    obtenerDetalleCacheBCV,
  } from '../../shared/services/bcv.js'
  import {
    convertirDivisasBCV,
    formatearMoneda,
    MONEDAS_CALCULADORA,
  } from '../logic/calculator.js'
  import Icon from '../../shared/components/Icon.svelte'

  let monedaOrigen = $state('USD')
  let montoInput = $state('10')

  let tasaUSD = $state(obtenerUltimaTasaEnCache() || 0)
  let tasaEUR = $state(obtenerUltimaTasaEuroEnCache() || 0)
  let fechaUSD = $state('')
  let fechaEUR = $state('')
  let cargandoTasas = $state(false)
  let mensajeError = $state('')
  let copiadoMoneda = $state('')

  async function cargarTasas(forzar = false) {
    cargandoTasas = true
    mensajeError = ''
    try {
      const res = await obtenerTasasOficialesBCV({ forzar })
      tasaUSD = res.usd.tasa
      fechaUSD = res.usd.fechaActualizacion || ''
      tasaEUR = res.eur.tasa
      fechaEUR = res.eur.fechaActualizacion || ''

      if (res.usd.error && res.eur.error) {
        mensajeError = 'No se pudo conectar con el BCV. Usando últimas tasas en caché.'
      }
    } catch (err) {
      mensajeError = 'Error al actualizar cotizaciones: ' + err.message
    } finally {
      cargandoTasas = false
    }
  }

  onMount(() => {
    const detalle = obtenerDetalleCacheBCV()
    if (detalle) {
      fechaUSD = detalle.fechaActualizacionUSD || detalle.fechaActualizacion || ''
      fechaEUR = detalle.fechaActualizacionEUR || ''
    }
    cargarTasas(false)
  })

  // Cálculo reactivo
  let conversiones = $derived(
    convertirDivisasBCV({
      monto: Number(montoInput) || 0,
      monedaOrigen,
      tasaUSD,
      tasaEUR,
    })
  )

  function copiarAlPortapapeles(texto, moneda) {
    if (!navigator?.clipboard) return
    navigator.clipboard.writeText(String(texto))
    copiadoMoneda = moneda
    setTimeout(() => {
      if (copiadoMoneda === moneda) copiadoMoneda = ''
    }, 1800)
  }

  function formatearFecha(isoString) {
    if (!isoString) return 'Caché local'
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }
</script>

<div class="vista-calculadora">
  <!-- Encabezado con tasas oficiales BCV -->
  <section class="panel cabecera-calculadora">
    <div class="fila-titulo-tasas">
      <div>
        <h2>Calculadora de Divisas</h2>
        <span class="subtitulo-oficial">Exclusiva Banco Central de Venezuela (BCV)</span>
      </div>
      <button
        type="button"
        class="boton-accion refrescar-tasas"
        disabled={cargandoTasas}
        onclick={() => cargarTasas(true)}
        aria-label="Actualizar cotizaciones del BCV"
        title="Actualizar cotizaciones oficiales en vivo"
      >
        <Icon name="refresh-cw" size={16} class={cargandoTasas ? 'girando' : ''} />
        <span>{cargandoTasas ? 'Actualizando...' : 'Actualizar'}</span>
      </button>
    </div>

    {#if mensajeError}
      <p class="error" style="margin-top: 0.5rem;">{mensajeError}</p>
    {/if}

    <!-- Tarjetas de Cotización Oficial -->
    <div class="tarjetas-cotizacion">
      <div class="card-cotizacion">
        <div class="info-moneda">
          <span class="insignia-moneda usd">USD</span>
          <div>
            <strong class="nombre-moneda">Dólar Oficial BCV</strong>
            <span class="fecha-tasa">{formatearFecha(fechaUSD)}</span>
          </div>
        </div>
        <div class="precio-tasa">
          <span class="valor-tasa">{tasaUSD > 0 ? `Bs. ${tasaUSD.toFixed(2)}` : 'Sin cotización'}</span>
        </div>
      </div>

      <div class="card-cotizacion">
        <div class="info-moneda">
          <span class="insignia-moneda eur">EUR</span>
          <div>
            <strong class="nombre-moneda">Euro Oficial BCV</strong>
            <span class="fecha-tasa">{formatearFecha(fechaEUR)}</span>
          </div>
        </div>
        <div class="precio-tasa">
          <span class="valor-tasa">{tasaEUR > 0 ? `Bs. ${tasaEUR.toFixed(2)}` : 'Sin cotización'}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Panel de Conversión -->
  <section class="panel panel-conversion">
    <h2>Convertir Monto</h2>

    <div class="fila selector-y-monto">
      <label class="campo-moneda">
        <span>Moneda de entrada</span>
        <div class="control-segmentado">
          {#each MONEDAS_CALCULADORA as m}
            <button
              type="button"
              class:activo={monedaOrigen === m}
              onclick={() => (monedaOrigen = m)}
            >
              {m}
            </button>
          {/each}
        </div>
      </label>

      <label class="campo-monto">
        <span>Monto a convertir</span>
        <input
          type="number"
          step="any"
          min="0"
          placeholder="0.00"
          bind:value={montoInput}
          class="input-monto-calculadora"
        />
      </label>
    </div>

    <!-- Resultados Equivalentes -->
    <div class="resultados-conversion">
      {#each MONEDAS_CALCULADORA as m}
        {#if m !== monedaOrigen}
          <div class="tarjeta-resultado">
            <div class="cabecera-resultado">
              <span class="insignia-moneda {m.toLowerCase()}">{m}</span>
              <span class="etiqueta-resultado">
                {m === 'VES' ? 'Bolívares Oficiales' : (m === 'USD' ? 'Dólares' : 'Euros')}
              </span>
              <button
                type="button"
                class="boton-copiar"
                onclick={() => copiarAlPortapapeles(conversiones[m], m)}
                aria-label="Copiar {conversiones[m]} {m}"
                title="Copiar resultado"
              >
                <Icon name={copiadoMoneda === m ? 'check' : 'copy'} size={15} />
                <span>{copiadoMoneda === m ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div class="cuerpo-resultado">
              <span class="monto-convertido">
                {formatearMoneda(conversiones[m], m)}
              </span>
              <span class="formula-explicativa">
                {#if monedaOrigen === 'USD' && m === 'VES'}
                  {Number(montoInput) || 0} USD × {tasaUSD.toFixed(2)}
                {:else if monedaOrigen === 'EUR' && m === 'VES'}
                  {Number(montoInput) || 0} EUR × {tasaEUR.toFixed(2)}
                {:else if monedaOrigen === 'VES' && m === 'USD'}
                  {Number(montoInput) || 0} VES ÷ {tasaUSD.toFixed(2)}
                {:else if monedaOrigen === 'VES' && m === 'EUR'}
                  {Number(montoInput) || 0} VES ÷ {tasaEUR.toFixed(2)}
                {:else if monedaOrigen === 'USD' && m === 'EUR'}
                  ({Number(montoInput) || 0} USD × {tasaUSD.toFixed(2)}) ÷ {tasaEUR.toFixed(2)}
                {:else if monedaOrigen === 'EUR' && m === 'USD'}
                  ({Number(montoInput) || 0} EUR × {tasaEUR.toFixed(2)}) ÷ {tasaUSD.toFixed(2)}
                {/if}
              </span>
            </div>
          </div>
        {/if}
      {/each}
    </div>

    <!-- Aviso Oficial -->
    <div class="aviso-oficial">
      <Icon name="info" size={16} />
      <span>
        Cálculos calculados estrictamente bajo las tasas vigentes publicadas por el Banco Central de Venezuela. No se incluyen cotizaciones de mercado paralelo ni criptomonedas (USDT).
      </span>
    </div>
  </section>
</div>

<style>
  .vista-calculadora {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .fila-titulo-tasas {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .fila-titulo-tasas h2 {
    margin: 0;
  }

  .subtitulo-oficial {
    font-size: 0.8rem;
    color: var(--texto-tenue);
    font-weight: 500;
  }

  .refrescar-tasas {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .tarjetas-cotizacion {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .card-cotizacion {
    background: var(--bg);
    box-shadow: var(--neu-inset-sm);
    border-radius: 14px;
    padding: 1rem 1.15rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-moneda {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .insignia-moneda {
    font-size: 0.75rem;
    font-weight: 800;
    padding: 0.3rem 0.55rem;
    border-radius: 8px;
    letter-spacing: 0.5px;
    box-shadow: var(--neu-elevated-sm);
  }

  .insignia-moneda.usd {
    background: rgba(34, 197, 94, 0.15);
    color: var(--verde);
  }

  .insignia-moneda.eur {
    background: rgba(56, 189, 248, 0.15);
    color: var(--acento);
  }

  .insignia-moneda.ves {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .nombre-moneda {
    display: block;
    font-size: 0.88rem;
    color: var(--texto);
  }

  .fecha-tasa {
    font-size: 0.75rem;
    color: var(--texto-tenue);
  }

  .valor-tasa {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--texto);
  }

  .selector-y-monto {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .campo-moneda span,
  .campo-monto span {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--texto-tenue);
    margin-bottom: 0.4rem;
  }

  .input-monto-calculadora {
    font-size: 1.2rem;
    font-weight: 700;
    padding: 0.65rem 0.9rem;
    width: 100%;
    border-radius: 12px;
  }

  .resultados-conversion {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .tarjeta-resultado {
    background: var(--bg);
    box-shadow: var(--neu-elevated);
    border-radius: 16px;
    padding: 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    transition: transform 0.2s ease;
  }

  .cabecera-resultado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .etiqueta-resultado {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--texto-tenue);
    flex: 1;
  }

  .boton-copiar {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--bg);
    box-shadow: var(--neu-elevated-sm);
    border: none;
    border-radius: 8px;
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--texto);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .boton-copiar:hover {
    box-shadow: var(--neu-inset-sm);
    color: var(--acento);
  }

  .cuerpo-resultado {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .monto-convertido {
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--texto);
    word-break: break-all;
  }

  .formula-explicativa {
    font-size: 0.75rem;
    color: var(--texto-tenue);
    font-family: monospace;
  }

  .aviso-oficial {
    background: rgba(56, 189, 248, 0.06);
    border: 1px solid rgba(56, 189, 248, 0.2);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.78rem;
    color: var(--texto-tenue);
    line-height: 1.4;
  }

  @keyframes girar {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  :global(.girando) {
    animation: girar 1s linear infinite;
  }
</style>
