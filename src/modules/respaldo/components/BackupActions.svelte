<script>
  import { exportarDatos, descargarArchivoRespaldo } from '../logic/backup.js'
  import Icon from '../../shared/components/Icon.svelte'

  let { onAbrirP2P } = $props()

  let exportPassword = $state('')
  let exportPasswordConfirm = $state('')
  let exportando = $state(false)
  let exportExito = $state('')
  let exportError = $state('')

  async function handleExportar(e) {
    e.preventDefault()
    exportError = ''
    exportExito = ''

    if (exportPassword && exportPassword !== exportPasswordConfirm) {
      exportError = 'Las contraseñas de exportación no coinciden'
      return
    }

    try {
      exportando = true
      const payload = await exportarDatos({
        password: exportPassword.trim() || undefined,
      })
      descargarArchivoRespaldo(payload)
      exportExito = payload.encrypted
        ? 'Respaldo cifrado exportado y descargado exitosamente.'
        : 'Respaldo descargado exitosamente (sin cifrar).'
      exportPassword = ''
      exportPasswordConfirm = ''
    } catch (err) {
      exportError = err.message || 'Error al exportar los datos'
    } finally {
      exportando = false
    }
  }
</script>

<div class="panel">
  <h2>Copia de Seguridad y Sincronización</h2>
  <p class="vacio" style="margin-top: 0.25rem; margin-bottom: 1rem;">
    FinApp almacena tus datos de forma local en tu navegador. Puedes sincronizar directamente con otro dispositivo o respaldar en archivos JSON.
  </p>

  <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid var(--acento); border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
      <div>
        <strong style="color: var(--acento); font-size: 1rem; display: inline-flex; align-items: center; gap: 0.4rem;">
          <Icon name="zap" size={18} />
          <span>Sincronización P2P Directa</span>
        </strong>
        <p class="vacio" style="margin: 0.2rem 0 0 0; font-size: 0.85rem;">
          Transfiere tus datos entre tu teléfono y tu computadora mediante WebRTC y código QR sin intermediarios.
        </p>
      </div>
      <button
        type="button"
        onclick={onAbrirP2P}
        style="background: var(--acento); color: var(--bg); border: none; border-radius: 8px; padding: 0.55rem 1.2rem; font-weight: 600; cursor: pointer;"
      >
        Iniciar Sincronización P2P
      </button>
    </div>
  </div>
</div>

<!-- SECCIÓN: EXPORTAR -->
<section class="panel">
  <h2>Exportar Datos</h2>
  <form onsubmit={handleExportar}>
    <p class="vacio" style="margin: 0;">
      Puedes descargar una copia íntegra de tu historial. Opcionalmente, protégela con una contraseña para cifrarla (AES-GCM).
    </p>

    <div class="fila">
      <label>
        Contraseña (Opcional)
        <input
          type="password"
          placeholder="Sin contraseña (texto plano)"
          bind:value={exportPassword}
          autocomplete="new-password"
        />
      </label>

      {#if exportPassword}
        <label>
          Confirmar Contraseña
          <input
            type="password"
            placeholder="Repite la contraseña"
            bind:value={exportPasswordConfirm}
            autocomplete="new-password"
            required
          />
        </label>
      {/if}
    </div>

    {#if exportPassword}
      <p class="vacio" style="color: var(--acento); font-size: 0.8rem; margin: 0; display: inline-flex; align-items: center; gap: 0.4rem;">
        <Icon name="info" size={15} />
        <span>Importante: El cifrado es de conocimiento cero. Si olvidas esta contraseña no será posible recuperar el archivo.</span>
      </p>
    {/if}

    {#if exportError}
      <p class="error">{exportError}</p>
    {/if}

    {#if exportExito}
      <p style="color: var(--verde); font-size: 0.85rem; margin: 0;">{exportExito}</p>
    {/if}

    <button type="submit" disabled={exportando}>
      {exportando ? 'Generando respaldo...' : 'Descargar Respaldo'}
    </button>
  </form>
</section>
