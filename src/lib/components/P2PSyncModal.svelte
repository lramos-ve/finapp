<script>
  import { onDestroy } from 'svelte'
  import { P2PSession } from '../p2p.js'
  import { restaurarDatos } from '../backup.js'
  import QRCodeDisplay from './QRCodeDisplay.svelte'

  let { onCerrar = () => {} } = $props()

  let modo = $state('enviar') // 'enviar' | 'recibir'
  let session = new P2PSession()

  // Estado Emisor
  let codigoEmisor = $state('')
  let emisorListo = $state(false)
  let receptorConectado = $state(false)
  let enviando = $state(false)
  let envioExitoso = $state(false)
  let emisorError = $state('')

  // Estado Receptor
  let codigoEntrada = $state('')
  let receptorConectando = $state(false)
  let conectadoConEmisor = $state(false)
  let datosRecibidos = $state(null)
  let mensajeRecibido = $state(null)
  let aplicandoDatos = $state(false)
  let aplicacionExitosa = $state(false)
  let receptorError = $state('')

  onDestroy(() => {
    session.cerrar()
  })

  function iniciarComoEmisor() {
    emisorError = ''
    emisorListo = false
    receptorConectado = false
    enviando = false
    envioExitoso = false

    session.iniciarEmisor({
      onReady: (id) => {
        codigoEmisor = id
        emisorListo = true
      },
      onConnected: () => {
        receptorConectado = true
      },
      onError: (err) => {
        emisorError = err.message || 'Error en la conexión P2P'
      },
      onClose: () => {
        receptorConectado = false
      },
    })
  }

  async function handleEnviarDatos() {
    if (!receptorConectado) return
    emisorError = ''
    enviando = true
    try {
      await session.enviarDatos()
      envioExitoso = true
    } catch (err) {
      emisorError = err.message || 'Error al transferir datos'
    } finally {
      enviando = false
    }
  }

  function handleConectarReceptor(e) {
    e.preventDefault()
    if (!codigoEntrada.trim()) return

    receptorError = ''
    receptorConectando = true
    conectadoConEmisor = false
    datosRecibidos = null
    aplicacionExitosa = false

    session.conectarReceptor(codigoEntrada.trim(), {
      onConnected: () => {
        receptorConectando = false
        conectadoConEmisor = true
      },
      onDataReceived: (data, rawMsg) => {
        datosRecibidos = data
        mensajeRecibido = rawMsg
      },
      onError: (err) => {
        receptorConectando = false
        receptorError = err.message || 'Error de conexión con el dispositivo emisor'
      },
      onClose: () => {
        conectadoConEmisor = false
      },
    })
  }

  async function handleAplicarDatos() {
    if (!mensajeRecibido) return
    receptorError = ''
    aplicandoDatos = true
    try {
      await restaurarDatos(mensajeRecibido)
      aplicacionExitosa = true
      datosRecibidos = null
      mensajeRecibido = null
    } catch (err) {
      receptorError = err.message || 'Error al aplicar los datos recibidos'
    } finally {
      aplicandoDatos = false
    }
  }

  function cambiarModo(nuevoModo) {
    modo = nuevoModo
    session.cerrar()
    codigoEmisor = ''
    emisorListo = false
    receptorConectado = false
    emisorError = ''
    receptorError = ''
    datosRecibidos = null
    aplicacionExitosa = false
    conectadoConEmisor = false

    if (nuevoModo === 'enviar') {
      iniciarComoEmisor()
    }
  }

  $effect(() => {
    if (modo === 'enviar' && !emisorListo && !session.peer) {
      iniciarComoEmisor()
    }
  })
</script>

<div class="panel" style="border: 2px solid var(--acento); position: relative;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
    <h2 style="margin: 0; color: var(--acento);">Sincronización P2P Directa (WebRTC)</h2>
    <button
      type="button"
      onclick={onCerrar}
      style="background: transparent; border: none; color: var(--texto-tenue); font-size: 1.25rem; cursor: pointer; padding: 0.2rem 0.5rem;"
      aria-label="Cerrar"
    >
      ✕
    </button>
  </div>

  <p class="vacio" style="margin: 0 0 1rem 0;">
    Conecta dos navegadores directamente para transferir tu información de forma instantánea y privada, sin servidores.
  </p>

  <!-- Selector de rol -->
  <div class="control-segmentado" style="margin-bottom: 1.25rem;">
    <button
      type="button"
      class:activo={modo === 'enviar'}
      onclick={() => cambiarModo('enviar')}
    >
      📤 Enviar a otro dispositivo
    </button>
    <button
      type="button"
      class:activo={modo === 'recibir'}
      onclick={() => cambiarModo('recibir')}
    >
      📥 Recibir de otro dispositivo
    </button>
  </div>

  <!-- MODO: ENVIAR -->
  {#if modo === 'enviar'}
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem;">
      {#if !emisorListo}
        <p class="vacio">Iniciando canal de sincronización seguro...</p>
      {:else}
        <p style="font-size: 0.9rem; color: var(--texto-tenue); margin: 0;">
          Escanea este código QR o ingresa el código en el dispositivo receptor:
        </p>

        <QRCodeDisplay texto={codigoEmisor} tamano={180} />

        <div style="background: var(--bg); border: 1px solid var(--borde); border-radius: 8px; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 0.85rem; color: var(--texto-tenue);">Código:</span>
          <strong style="letter-spacing: 0.08em; font-size: 1.1rem; color: var(--acento);">{codigoEmisor}</strong>
        </div>

        {#if !receptorConectado}
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 6px; padding: 0.4rem 0.8rem; font-size: 0.85rem; color: #f59e0b;">
            ⏳ Esperando que el otro dispositivo se conecte...
          </div>
        {:else}
          <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid var(--verde); border-radius: 6px; padding: 0.5rem 0.8rem; font-size: 0.9rem; color: var(--verde); font-weight: 600;">
            🟢 ¡Dispositivo conectado!
          </div>

          <button
            type="button"
            onclick={handleEnviarDatos}
            disabled={enviando}
            style="background: var(--verde); color: #000; border: none; border-radius: 8px; padding: 0.6rem 1.4rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem;"
          >
            {enviando ? 'Enviando datos...' : '📤 Enviar Todos los Datos Ahora'}
          </button>
        {/if}

        {#if envioExitoso}
          <p style="color: var(--verde); font-size: 0.9rem; font-weight: 600; margin: 0;">
            ✅ ¡Datos transmitidos con éxito al otro dispositivo!
          </p>
        {/if}
      {/if}

      {#if emisorError}
        <p class="error">{emisorError}</p>
      {/if}
    </div>
  {/if}

  <!-- MODO: RECIBIR -->
  {#if modo === 'recibir'}
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <p style="font-size: 0.9rem; color: var(--texto-tenue); margin: 0;">
        Ingresa el código que aparece en la pantalla del dispositivo emisor:
      </p>

      <form onsubmit={handleConectarReceptor}>
        <div class="fila">
          <label>
            Código del emisor
            <input
              type="text"
              placeholder="ej. finapp-xyz123"
              bind:value={codigoEntrada}
              disabled={conectadoConEmisor || receptorConectando}
              required
            />
          </label>
        </div>

        {#if !conectadoConEmisor}
          <button type="submit" disabled={receptorConectando || !codigoEntrada.trim()}>
            {receptorConectando ? 'Conectando...' : 'Conectar con Dispositivo'}
          </button>
        {/if}
      </form>

      {#if conectadoConEmisor && !datosRecibidos && !aplicacionExitosa}
        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid var(--verde); border-radius: 6px; padding: 0.5rem 0.8rem; font-size: 0.85rem; color: var(--verde);">
          🟢 Conectado con el emisor. Esperando que presione "Enviar Datos"...
        </div>
      {/if}

      {#if datosRecibidos}
        <div style="background: var(--bg); border: 1px solid var(--borde); border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
          <h3 style="margin: 0; font-size: 0.95rem; color: var(--acento);">Datos Recibidos</h3>
          <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: var(--texto-tenue);">
            <li>Transacciones: {datosRecibidos.transacciones?.length ?? 0}</li>
            <li>Deudas: {datosRecibidos.deudas?.length ?? 0}</li>
            <li>Gastos Fijos: {datosRecibidos.gastosFijos?.length ?? 0}</li>
          </ul>

          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--rojo); border-radius: 6px; padding: 0.5rem; margin-top: 0.25rem;">
            <p style="color: var(--rojo); font-size: 0.85rem; margin: 0; font-weight: 600;">
              ⚠️ Esta acción reemplazará los datos actuales en este dispositivo con los recibidos.
            </p>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
            <button
              type="button"
              onclick={handleAplicarDatos}
              disabled={aplicandoDatos}
              style="background: var(--verde); color: #000; border: none; border-radius: 8px; padding: 0.55rem 1.2rem; font-weight: 700; cursor: pointer; flex: 1;"
            >
              {aplicandoDatos ? 'Aplicando...' : 'Confirmar y Restaurar Datos'}
            </button>
            <button
              type="button"
              onclick={() => {
                datosRecibidos = null
                mensajeRecibido = null
              }}
              style="background: var(--panel); border: 1px solid var(--borde); color: var(--texto); border-radius: 8px; padding: 0.55rem 1rem; cursor: pointer;"
            >
              Descartar
            </button>
          </div>
        </div>
      {/if}

      {#if aplicacionExitosa}
        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid var(--verde); border-radius: 6px; padding: 0.75rem; text-align: center;">
          <p style="color: var(--verde); font-weight: 700; margin: 0; font-size: 0.95rem;">
            🎉 ¡Base de datos sincronizada con éxito!
          </p>
        </div>
      {/if}

      {#if receptorError}
        <p class="error">{receptorError}</p>
      {/if}
    </div>
  {/if}
</div>
