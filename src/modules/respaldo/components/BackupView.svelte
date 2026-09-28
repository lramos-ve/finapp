<script>
  import BackupActions from './BackupActions.svelte'
  import BackupPasswordModal from './BackupPasswordModal.svelte'
  import P2PSyncModal from './P2PSyncModal.svelte'

  let mostrarP2P = $state(false)
</script>

<BackupActions onAbrirP2P={() => (mostrarP2P = true)} />

{#if mostrarP2P}
  <P2PSyncModal onCerrar={() => (mostrarP2P = false)} />
{/if}

<BackupPasswordModal />
