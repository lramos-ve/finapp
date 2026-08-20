<script>
  import { onMount } from 'svelte';
  import { session } from '../session.svelte.js';
  import { getInitialTheme, applyTheme, initThemeListener } from '../theme.js';

  let theme = $state(getInitialTheme());
  let showModal = $state(false);
  let newGroupName = $state('');
  let joinCode = $state('');
  let errorMsg = $state('');
  let successMsg = $state('');
  let copied = $state(false);

  // Inicializar Tema
  onMount(() => {
    applyTheme(theme);
    const removeThemeListener = initThemeListener(() => {
      if (theme === 'system') applyTheme('system');
    });

    return () => {
      removeThemeListener();
    };
  });

  function setTheme(newTheme) {
    theme = newTheme;
    applyTheme(newTheme);
  }

  async function handleLogin() {
    errorMsg = '';
    try {
      await session.login();
    } catch (e) {
      console.error(e);
      errorMsg = 'Error al iniciar sesión con Google: ' + (e.message || '');
    }
  }

  async function handleLogout() {
    await session.logout();
    showModal = false;
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    errorMsg = '';
    successMsg = '';
    try {
      await session.createGroup(newGroupName.trim());
      newGroupName = '';
      successMsg = '¡Grupo creado con éxito!';
    } catch (e) {
      errorMsg = e.message;
    }
  }

  async function handleJoinGroup() {
    if (!joinCode.trim()) return;
    errorMsg = '';
    successMsg = '';
    try {
      await session.joinGroup(joinCode.trim());
      joinCode = '';
      successMsg = '¡Te has unido al grupo!';
    } catch (e) {
      errorMsg = e.message;
    }
  }

  async function handleSelectGroup(groupId) {
    await session.selectGroup(groupId);
  }

  function copyGroupCode() {
    if (!session.activeGroup?.id) return;
    navigator.clipboard.writeText(session.activeGroup.id);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="header-top">
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    <h1>💸 FinApp</h1>
    {#if !session.isOnline}
      <span style="font-size: 0.7rem; background: var(--rojo); color: white; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600;">
        📶 Offline
      </span>
    {/if}
  </div>

  <div class="header-actions">
    <!-- Selector de Tema (Claro / Oscuro / Sistema) -->
    <div class="theme-toggle-group" title="Cambiar tema">
      <button 
        type="button" 
        class="theme-btn" 
        class:activo={theme === 'light'} 
        onclick={() => setTheme('light')}
        aria-label="Modo Claro"
      >
        ☀️
      </button>
      <button 
        type="button" 
        class="theme-btn" 
        class:activo={theme === 'dark'} 
        onclick={() => setTheme('dark')}
        aria-label="Modo Oscuro"
      >
        🌙
      </button>
      <button 
        type="button" 
        class="theme-btn" 
        class:activo={theme === 'system'} 
        onclick={() => setTheme('system')}
        aria-label="Modo Sistema"
      >
        💻
      </button>
    </div>

    <!-- Botón de Login o Perfil de Usuario -->
    {#if !session.loading}
      {#if session.user}
        <button type="button" class="user-badge" onclick={() => (showModal = true)}>
          {#if session.user.photoURL}
            <img src={session.user.photoURL} alt={session.user.displayName} class="user-avatar" />
          {:else}
            <div class="user-avatar">
              {(session.user.displayName || session.user.email || 'U')[0].toUpperCase()}
            </div>
          {/if}
          <span>{session.user.displayName || session.user.email?.split('@')[0]}</span>
        </button>
      {:else}
        <button type="button" class="btn-primary" onclick={handleLogin}>
          <span>🔑</span> Entrar con Google
        </button>
      {/if}
    {/if}
  </div>
</div>

<!-- Barra de Grupo Activo (si está autenticado) -->
{#if session.user}
  <div class="group-bar">
    <div class="group-info">
      <span class="group-tag">Grupo</span>
      <strong>{session.activeGroup ? session.activeGroup.name : 'Sin grupo seleccionado'}</strong>
      {#if session.activeGroup}
        <button 
          type="button" 
          class="btn-secondary" 
          style="padding: 0.15rem 0.4rem; font-size: 0.75rem;" 
          onclick={copyGroupCode}
          title="Copiar código de invitación para compartir"
        >
          {copied ? '✅ ¡Copiado!' : '📋 Copiar Código'}
        </button>
      {/if}
    </div>
    <button type="button" class="btn-secondary" onclick={() => (showModal = true)}>
      👥 Mis Grupos ({session.userGroups.length})
    </button>
  </div>
{/if}

<!-- Modal de Gestión de Grupos y Perfil -->
{#if showModal}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showModal = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showModal = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h3 id="modal-title">👥 Espacios de Trabajo / Grupos</h3>
        <button type="button" class="btn-close" onclick={() => (showModal = false)}>✕</button>
      </div>

      {#if errorMsg}
        <p class="error">{errorMsg}</p>
      {/if}
      {#if successMsg}
        <p style="color: var(--verde); font-size: 0.85rem; margin: 0;">{successMsg}</p>
      {/if}

      <!-- Lista de mis grupos -->
      <div>
        <div style="font-size: 0.85rem; color: var(--texto-tenue); margin-bottom: 0.5rem;">Mis Grupos Familiares / Privados:</div>
        {#if session.userGroups.length === 0}
          <p class="vacio" style="margin: 0 0 0.5rem 0;">Aún no perteneces a ningún grupo. ¡Crea uno para tu familia o únete con un código!</p>
        {:else}
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            {#each session.userGroups as g}
              <div style="display: flex; align-items: center; justify-content: space-between; background: var(--card-bg); padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--borde);">
                <div>
                  <strong style="font-size: 0.9rem;">{g.name}</strong>
                  <div style="font-size: 0.75rem; color: var(--texto-tenue);">ID: {g.id}</div>
                </div>
                {#if session.activeGroup?.id === g.id}
                  <span style="font-size: 0.75rem; color: var(--verde); font-weight: 600;">● Activo</span>
                {:else}
                  <button type="button" class="btn-secondary" style="font-size: 0.75rem;" onclick={() => handleSelectGroup(g.id)}>
                    Seleccionar
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <hr style="border: 0; border-top: 1px solid var(--borde); margin: 0;" />

      <!-- Crear nuevo grupo -->
      <form onsubmit={(e) => { e.preventDefault(); handleCreateGroup(); }}>
        <div style="font-size: 0.85rem; font-weight: 600;">Crear Nuevo Grupo</div>
        <div style="display: flex; gap: 0.5rem;">
          <input 
            type="text" 
            placeholder="Ej: Familia Gómez, Hogar..." 
            bind:value={newGroupName} 
            style="flex: 1;" 
          />
          <button type="submit" class="btn-primary">Crear</button>
        </div>
      </form>

      <!-- Unirse a grupo por código -->
      <form onsubmit={(e) => { e.preventDefault(); handleJoinGroup(); }}>
        <div style="font-size: 0.85rem; font-weight: 600;">Unirse con Código / ID</div>
        <div style="display: flex; gap: 0.5rem;">
          <input 
            type="text" 
            placeholder="Pega el ID del grupo..." 
            bind:value={joinCode} 
            style="flex: 1;" 
          />
          <button type="submit" class="btn-secondary">Unirme</button>
        </div>
      </form>

      <hr style="border: 0; border-top: 1px solid var(--borde); margin: 0;" />

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem; color: var(--texto-tenue);">{session.user?.email}</span>
        <button type="button" class="btn-secondary" style="color: var(--rojo);" onclick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
{/if}
