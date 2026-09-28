<script>
  import {
    exportarDatos,
    validarEstructuraRespaldo,
    restaurarDatos,
    descargarArchivoRespaldo,
  } from '../backup.js'
  import P2PSyncModal from './P2PSyncModal.svelte'
  import Icon from './Icon.svelte'

  let mostrarP2P = $state(false)

  // Estado para exportación
  let exportPassword = $state('')
  let exportPasswordConfirm = $state('')
  let exportando = $state(false)
  let exportExito = $state('')
  let exportError = $state('')

  // Estado para importación
  let archivoSeleccionado = $state(null)
  let payloadImportar = $state(null)
  let importPassword = $state('')
  let importando = $state(false)
  let importExito = $state('')
  let importError = $state('')
  let mostrarConfirmacion = $state(false)
  let arrastrando = $state(false)

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

  function procesarArchivo(file) {
    if (!file) return
    archivoSeleccionado = file.name
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        validarEstructuraRespaldo(json)
        payloadImportar = json
      } catch (err) {
        importError = err.message || 'El archivo seleccionado no es un respaldo válido'
        payloadImportar = null
      }
    }

    reader.onerror = () => {
      importError = 'No se pudo leer el archivo seleccionado'
      payloadImportar = null
    }

    reader.readAsText(file)
  }

  function handleSeleccionarArchivo(e) {
    importError = ''
    importExito = ''
    payloadImportar = null
    mostrarConfirmacion = false
    importPassword = ''

    const file = e.target.files?.[0]
    procesarArchivo(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    arrastrando = false
    importError = ''
    importExito = ''
    payloadImportar = null
    mostrarConfirmacion = false
    importPassword = ''

    const file = e.dataTransfer?.files?.[0]
    if (file) {
      if (!file.name.endsWith('.json')) {
        importError = 'Por favor selecciona un archivo con formato .json'
        return
      }
      procesarArchivo(file)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    arrastrando = true
  }

  function handleDragLeave(e) {
    e.preventDefault()
    arrastrando = false
  }

  async function ejecutarRestauracion() {
    if (!payloadImportar) return
    importError = ''
    importExito = ''

    if (payloadImportar.encrypted && !importPassword.trim()) {
      importError = 'Debes ingresar la contraseña del respaldo cifrado'
      return
    }

    try {
      importando = true
      const resultado = await restaurarDatos(payloadImportar, {
        password: importPassword.trim() || undefined,
      })

      const totalRegistros = Object.values(resultado.restaurados).reduce(
        (acc, n) => acc + n,
        0
      )

      importExito = `Restauración completada con éxito. Se recuperaron ${totalRegistros} registros.`
      payloadImportar = null
      archivoSeleccionado = null
      importPassword = ''
      mostrarConfirmacion = false
    } catch (err) {
      importError = err.message || 'Error al restaurar los datos'
      mostrarConfirmacion = false
    } finally {
      importando = false
    }
  }
</script>

<div class="panel">
  <h2>Copia de Seguridad y Sincronización</h2>
  <p class="vacio" style="margin-top: 0.25rem; margin-bottom: 1rem;">
    FinApp almacena tus datos de forma local en tu navegador. Puedes sincronizar directamente con otro dispositivo o respaldar en archivos JSON.
  </p>

  {#if !mostrarP2P}
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
          onclick={() => (mostrarP2P = true)}
          style="background: var(--acento); color: var(--bg); border: none; border-radius: 8px; padding: 0.55rem 1.2rem; font-weight: 600; cursor: pointer;"
        >
          Iniciar Sincronización P2P
        </button>
      </div>
    </div>
  {/if}
</div>

{#if mostrarP2P}
  <P2PSyncModal onCerrar={() => (mostrarP2P = false)} />
{/if}

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

<!-- SECCIÓN: IMPORTAR -->
<section class="panel">
  <h2>Importar y Restaurar</h2>
  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    <p class="vacio" style="margin: 0;">
      Selecciona un archivo de respaldo previo (<code>.json</code>) para restaurar tus registros.
    </p>

    <div
      class="dropzone"
      class:arrastrando
      class:con-archivo={!!archivoSeleccionado}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      role="region"
      aria-label="Zona para seleccionar o arrastrar archivo de respaldo"
    >
      <input
        id="input-archivo-respaldo"
        type="file"
        accept=".json"
        onchange={handleSeleccionarArchivo}
        disabled={importando}
        class="input-archivo-oculto"
      />
      <label for="input-archivo-respaldo" class="dropzone-contenido">
        {#if archivoSeleccionado}
          <div class="dropzone-icono archivo">
            <Icon name="file" size={28} />
          </div>
          <div class="dropzone-textos">
            <span class="dropzone-titulo">{archivoSeleccionado}</span>
            <span class="dropzone-subtitulo">Haz clic o arrastra otro archivo para cambiarlo</span>
          </div>
        {:else}
          <div class="dropzone-icono">
            <Icon name="upload" size={28} />
          </div>
          <div class="dropzone-textos">
            <span class="dropzone-titulo">Arrastra tu archivo .json aquí o haz clic</span>
            <span class="dropzone-subtitulo">Formatos compatibles: respaldo JSON (.json)</span>
          </div>
        {/if}
      </label>
    </div>

    {#if payloadImportar}
      <div style="background: var(--bg); box-shadow: var(--neu-inset-sm); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; gap: 0.65rem;">
        <div style="font-size: 0.85rem; display: flex; justify-content: space-between;">
          <span style="color: var(--texto-tenue);">Fecha del respaldo:</span>
          <strong>{new Date(payloadImportar.timestamp).toLocaleString()}</strong>
        </div>
        <div style="font-size: 0.85rem; display: flex; justify-content: space-between;">
          <span style="color: var(--texto-tenue);">Tipo de archivo:</span>
          <strong style="display: inline-flex; align-items: center; gap: 0.35rem;">
            {#if payloadImportar.encrypted}
              <Icon name="lock" size={15} />
              <span>Cifrado ({payloadImportar.crypto?.algorithm || 'AES-GCM'})</span>
            {:else}
              <Icon name="file" size={15} />
              <span>Sin cifrar (JSON plano)</span>
            {/if}
          </strong>
        </div>

        {#if payloadImportar.encrypted}
          <label style="margin-top: 0.25rem;">
            Contraseña del respaldo
            <input
              type="password"
              placeholder="Ingresa la contraseña para descifrar"
              bind:value={importPassword}
              autocomplete="current-password"
            />
          </label>
        {/if}

        {#if !mostrarConfirmacion}
          <div style="margin-top: 0.5rem;">
            <button
              type="button"
              onclick={() => (mostrarConfirmacion = true)}
              style="background: var(--bg); color: #f59e0b; box-shadow: var(--neu-elevated); border: none; border-radius: 12px; padding: 0.65rem 1.4rem; font-weight: 700; cursor: pointer; width: 100%;"
            >
              Restaurar Base de Datos
            </button>
          </div>
        {:else}
          <div style="background: rgba(239, 68, 68, 0.08); box-shadow: var(--neu-inset-sm); border-radius: 12px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem;">
            <p style="color: var(--rojo); font-size: 0.85rem; margin: 0; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
              <Icon name="alert-triangle" size={18} />
              <span>¿Confirmas la restauración? Esta acción reemplazará todos los datos actuales de la aplicación con los del archivo seleccionado.</span>
            </p>
            <div style="display: flex; gap: 0.65rem;">
              <button
                type="button"
                onclick={ejecutarRestauracion}
                disabled={importando}
                style="background: var(--rojo); color: white; border: none; border-radius: 10px; padding: 0.6rem 1rem; font-weight: 700; cursor: pointer; flex: 1;"
              >
                {importando ? 'Restaurando...' : 'Sí, Sobreescribir y Restaurar'}
              </button>
              <button
                type="button"
                onclick={() => (mostrarConfirmacion = false)}
                disabled={importando}
                style="background: var(--bg); color: var(--texto); box-shadow: var(--neu-elevated-sm); border: none; border-radius: 10px; padding: 0.6rem 1rem; cursor: pointer;"
              >
                Cancelar
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    {#if importError}
      <p class="error">{importError}</p>
    {/if}

    {#if importExito}
      <p style="color: var(--verde); font-size: 0.85rem; margin: 0;">{importExito}</p>
    {/if}
  </div>
</section>

<style>
  .input-archivo-oculto {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .dropzone {
    background: var(--bg);
    box-shadow: var(--neu-inset-sm);
    border: 2px dashed var(--borde-suave);
    border-radius: 16px;
    padding: 1.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    user-select: none;
    margin-top: 0.25rem;
  }

  .dropzone:hover {
    border-color: var(--acento);
    box-shadow: var(--neu-elevated-sm);
  }

  .dropzone.arrastrando {
    border-color: var(--acento);
    background: var(--bg);
    box-shadow: var(--neu-inset);
    transform: scale(0.99);
  }

  .dropzone.con-archivo {
    border-style: solid;
    border-color: var(--verde);
    box-shadow: var(--neu-elevated-sm);
  }

  .dropzone-contenido {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    cursor: pointer;
    width: 100%;
  }

  .dropzone-icono {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    background: var(--bg);
    box-shadow: var(--neu-elevated-sm);
    color: var(--acento);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dropzone:hover .dropzone-icono {
    transform: translateY(-2px);
    box-shadow: var(--neu-hover);
  }

  .dropzone-icono.archivo {
    color: var(--verde);
  }

  .dropzone-textos {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .dropzone-titulo {
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--texto);
    word-break: break-all;
  }

  .dropzone-subtitulo {
    font-size: 0.78rem;
    color: var(--texto-tenue);
  }
</style>
