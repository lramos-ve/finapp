<script>
  import QRCode from 'qrcode'

  let { texto = '', tamano = 200 } = $props()
  let dataUrl = $state('')
  let error = $state('')

  $effect(() => {
    if (texto) {
      QRCode.toDataURL(texto, {
        width: tamano,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => {
          dataUrl = url
          error = ''
        })
        .catch((err) => {
          error = err.message
        })
    }
  })
</script>

{#if dataUrl}
  <div style="background: white; padding: 0.5rem; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <img
      src={dataUrl}
      alt="Código QR de sincronización"
      width={tamano}
      height={tamano}
      style="display: block; max-width: 100%; height: auto;"
    />
  </div>
{:else if error}
  <p class="error">{error}</p>
{/if}
