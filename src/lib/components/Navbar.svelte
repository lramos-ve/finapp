<script>
  import { onMount } from 'svelte';
  import { session } from '../session.svelte.js';
  import { settings } from '../settings.svelte.js';
  import { getInitialTheme, applyTheme, initThemeListener } from '../theme.js';
  import { subscribeCategories, addCategory, deleteCategory } from '../categories.js';

  let { vista = $bindable('transacciones') } = $props();

  let theme = $state(getInitialTheme());
  let drawerOpen = $state(false);
  let showGroupModal = $state(false);
  let showCategoriesModal = $state(false);
  
  let newGroupName = $state('');
  let joinCode = $state('');
  let errorMsg = $state('');
  let successMsg = $state('');
  let copied = $state(false);

  // Estado para gestión de categorías
  let tabCategoria = $state('gasto');
  let nuevaCatNombre = $state('');
  let categoriasList = $state([]);
  let catMsg = $state('');
  let catError = $state('');

  let unsubscribeCategories = null;

  $effect(() => {
    const groupId = session.activeGroup?.id;
    if (unsubscribeCategories) {
      unsubscribeCategories();
    }
    unsubscribeCategories = subscribeCategories(groupId, (items) => {
      categoriasList = items;
    });
  });

  async function handleCrearCategoria(e) {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) return;
    catError = '';
    catMsg = '';
    try {
      await addCategory(session.activeGroup?.id, {
        nombre: nuevaCatNombre.trim(),
        tipo: tabCategoria,
        icono: tabCategoria === 'ingreso' ? 'fa-circle-dollar-to-slot' : 'fa-tag'
      });
      nuevaCatNombre = '';
      catMsg = '¡Categoría agregada con éxito!';
      setTimeout(() => (catMsg = ''), 2500);
    } catch (err) {
      catError = err.message || 'Error al agregar categoría';
    }
  }

  async function handleEliminarCategoria(cat) {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      await deleteCategory(session.activeGroup?.id, cat.id);
      catMsg = `"${cat.nombre}" eliminada`;
      setTimeout(() => (catMsg = ''), 2500);
    } catch (err) {
      catError = err.message || 'Error al eliminar categoría';
    }
  }

  onMount(() => {
    applyTheme(theme);
    const removeListener = initThemeListener(() => {
      if (theme === 'system') applyTheme('system');
    });
    return () => removeListener();
  });

  function setTheme(t) {
    theme = t;
    applyTheme(t);
  }

  async function handleLogin() {
    errorMsg = '';
    try {
      await session.login();
    } catch (e) {
      errorMsg = e.message || 'Error al iniciar sesión con Google';
    }
  }

  async function handleLogout() {
    await session.logout();
    drawerOpen = false;
    showGroupModal = false;
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

  function copyGroupCode() {
    if (!session.activeGroup?.id) return;
    navigator.clipboard.writeText(session.activeGroup.id);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<!-- TOP APP BAR -->
<header>
  <div class="top-bar">
    <button 
      type="button" 
      class="brand" 
      style="display: flex; align-items: center; gap: 0.5rem; background: none; border: none; padding: 0; cursor: pointer; color: inherit; text-align: left;" 
      onclick={() => (vista = 'transacciones')}
      aria-label="Ir a transacciones"
    >
      <img src="/logo.png" alt="Saca La Cuenta" style="width: 30px; height: 30px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.25);" />
      <span style="font-weight: 800; letter-spacing: -0.02em; font-size: 1.05rem;">Saca La Cuenta</span>
    </button>

    <div class="top-actions">
      <!-- Indicador Offline -->
      {#if !session.isOnline}
        <div class="badge-pill offline" title="Sin conexión a internet. Los datos se guardan localmente y se sincronizarán al volver.">
          <i class="fa-solid fa-wifi"></i>
          <span>Offline</span>
        </div>
      {/if}

      <!-- Badge de Grupo Activo -->
      {#if session.user}
        <button 
          type="button" 
          class="badge-pill" 
          onclick={() => (showGroupModal = true)}
          title="Espacio de trabajo activo"
        >
          <i class="fa-solid fa-users" style="color: var(--acento);"></i>
          <span>{session.activeGroup ? session.activeGroup.name : 'Sin grupo'}</span>
        </button>
      {/if}

      <!-- Botón Sandwich / Menú -->
      <button 
        type="button" 
        class="btn-icon" 
        onclick={() => (drawerOpen = true)}
        aria-label="Abrir menú de configuración"
      >
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>
  </div>
</header>

<!-- BOTTOM NAVIGATION BAR (Mobile First Thumb Navigation) -->
<nav class="bottom-nav">
  <button 
    type="button" 
    class="nav-item" 
    class:activo={vista === 'transacciones'} 
    onclick={() => (vista = 'transacciones')}
  >
    <i class="fa-solid fa-arrow-right-arrow-left"></i>
    <span>Movimientos</span>
  </button>

  <button 
    type="button" 
    class="nav-item" 
    class:activo={vista === 'ahorro'} 
    onclick={() => (vista = 'ahorro')}
  >
    <i class="fa-solid fa-piggy-bank"></i>
    <span>Ahorros</span>
  </button>

  <button 
    type="button" 
    class="nav-item" 
    class:activo={vista === 'gastosFijos'} 
    onclick={() => (vista = 'gastosFijos')}
  >
    <i class="fa-solid fa-calendar-check"></i>
    <span>Gastos Fijos</span>
  </button>

  <button 
    type="button" 
    class="nav-item" 
    class:activo={vista === 'deudas'} 
    onclick={() => (vista = 'deudas')}
  >
    <i class="fa-solid fa-hand-holding-dollar"></i>
    <span>Deudas</span>
  </button>

  <button 
    type="button" 
    class="nav-item" 
    class:activo={vista === 'estadisticas'} 
    onclick={() => (vista = 'estadisticas')}
  >
    <i class="fa-solid fa-chart-pie"></i>
    <span>Estadísticas</span>
  </button>
</nav>

<!-- DRAWER / MENU SANDWICH LATERAL -->
{#if drawerOpen}
  <div 
    class="drawer-backdrop" 
    onclick={(e) => { if (e.target === e.currentTarget) drawerOpen = false; }}
    onkeydown={(e) => { if (e.key === 'Escape') drawerOpen = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="drawer-content" role="dialog" aria-modal="true">
      <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.1rem;">
          <i class="fa-solid fa-gear" style="color: var(--acento);"></i>
          <span>Configuración</span>
        </div>
        <button type="button" class="btn-close" onclick={() => (drawerOpen = false)} aria-label="Cerrar menú">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <!-- Sección de Usuario -->
      <div class="drawer-section">
        <div class="drawer-section-title">Cuenta</div>
        {#if session.user}
          <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--card-bg); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--borde);">
            {#if session.user.photoURL}
              <img src={session.user.photoURL} alt={session.user.displayName} style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
            {:else}
              <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--acento); color: var(--acento-texto); display: flex; align-items: center; justify-content: center; font-weight: bold;">
                {(session.user.displayName || session.user.email || 'U')[0].toUpperCase()}
              </div>
            {/if}
            <div style="flex: 1; overflow: hidden;">
              <div style="font-weight: 600; font-size: 0.9rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                {session.user.displayName || 'Usuario'}
              </div>
              <div style="font-size: 0.75rem; color: var(--texto-tenue); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                {session.user.email}
              </div>
            </div>
          </div>
          <button type="button" class="btn-secondary" style="width: 100%; color: var(--rojo);" onclick={handleLogout}>
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Cerrar Sesión</span>
          </button>
        {:else}
          <button type="button" class="btn-primary" style="width: 100%;" onclick={handleLogin}>
            <i class="fa-brands fa-google"></i>
            <span>Iniciar con Google</span>
          </button>
        {/if}
      </div>

      <!-- Sección de Tema -->
      <div class="drawer-section">
        <div class="drawer-section-title">Apariencia</div>
        <div class="control-segmentado">
          <button type="button" class:activo={theme === 'light'} onclick={() => setTheme('light')}>
            <i class="fa-solid fa-sun"></i>
            <span>Claro</span>
          </button>
          <button type="button" class:activo={theme === 'dark'} onclick={() => setTheme('dark')}>
            <i class="fa-solid fa-moon"></i>
            <span>Oscuro</span>
          </button>
          <button type="button" class:activo={theme === 'system'} onclick={() => setTheme('system')}>
            <i class="fa-solid fa-desktop"></i>
            <span>Auto</span>
          </button>
        </div>
      </div>

      <!-- Sección de Moneda por Defecto -->
      <div class="drawer-section">
        <div class="drawer-section-title">Moneda por defecto</div>
        <div class="control-segmentado">
          <button 
            type="button" 
            class:activo={settings.defaultCurrency === 'VES'} 
            onclick={() => settings.setDefaultCurrency('VES')}
          >
            <i class="fa-solid fa-money-bill-wave"></i>
            <span>VES (Bs.)</span>
          </button>
          <button 
            type="button" 
            class:activo={settings.defaultCurrency === 'USD'} 
            onclick={() => settings.setDefaultCurrency('USD')}
          >
            <i class="fa-solid fa-dollar-sign"></i>
            <span>USD ($)</span>
          </button>
        </div>
      </div>

      <!-- Sección de Categorías -->
      <div class="drawer-section">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="drawer-section-title">Categorías ({categoriasList.length})</span>
          <button 
            type="button" 
            class="btn-secondary" 
            style="padding: 0.2rem 0.5rem; font-size: 0.75rem; min-height: auto;" 
            onclick={() => { drawerOpen = false; showCategoriesModal = true; }}
          >
            <i class="fa-solid fa-tags"></i> Gestionar
          </button>
        </div>
      </div>

      <!-- Sección de Grupos -->
      {#if session.user}
        <div class="drawer-section">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="drawer-section-title">Grupos ({session.userGroups.length})</span>
            <button type="button" class="btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; min-height: auto;" onclick={() => { drawerOpen = false; showGroupModal = true; }}>
              <i class="fa-solid fa-plus"></i> Gestionar
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            {#each session.userGroups as g}
              <button 
                type="button" 
                class="btn-secondary" 
                style="justify-content: space-between; font-size: 0.82rem; text-align: left; {session.activeGroup?.id === g.id ? 'border-color: var(--acento); background: var(--acento-bg); font-weight: 700;' : ''}"
                onclick={() => session.selectGroup(g.id)}
              >
                <span>{g.name}</span>
                {#if session.activeGroup?.id === g.id}
                  <i class="fa-solid fa-check" style="color: var(--acento);"></i>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Pie del Drawer -->
      <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--borde); font-size: 0.75rem; color: var(--texto-muted); text-align: center;">
        <div>Saca La Cuenta • PWA v1.0.0 • Local-First</div>
      </div>
    </div>
  </div>
{/if}

<!-- MODAL DE GESTIÓN DE GRUPOS -->
{#if showGroupModal}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showGroupModal = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showGroupModal = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-users" style="color: var(--acento);"></i>
          <span>Grupos y Familia</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showGroupModal = false)} aria-label="Cerrar modal">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      {#if errorMsg}
        <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {errorMsg}</p>
      {/if}
      {#if successMsg}
        <p style="color: var(--verde); font-size: 0.85rem; margin: 0; display: flex; align-items: center; gap: 0.35rem;">
          <i class="fa-solid fa-circle-check"></i> {successMsg}
        </p>
      {/if}

      <!-- Grupo Activo Actual & Compartir Código -->
      {#if session.activeGroup}
        <div style="background: var(--card-bg); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--borde);">
          <div style="font-size: 0.75rem; color: var(--texto-tenue);">Grupo Activo:</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.25rem;">
            <strong style="font-size: 1rem;">{session.activeGroup.name}</strong>
            <button 
              type="button" 
              class="btn-secondary" 
              style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" 
              onclick={copyGroupCode}
              title="Copiar código de invitación"
            >
              <i class="fa-solid fa-copy"></i>
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>
          </div>
          <div style="font-size: 0.7rem; color: var(--texto-muted); margin-top: 0.3rem;">
            ID: <code style="font-family: monospace;">{session.activeGroup.id}</code>
          </div>
        </div>
      {/if}

      <hr style="border: 0; border-top: 1px solid var(--borde); margin: 0;" />

      <!-- Crear nuevo grupo -->
      <form onsubmit={(e) => { e.preventDefault(); handleCreateGroup(); }}>
        <div style="font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid fa-folder-plus" style="color: var(--acento);"></i>
          <span>Crear Nuevo Grupo</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <input 
            type="text" 
            placeholder="Ej: Familia Gómez, Hogar..." 
            bind:value={newGroupName} 
            style="flex: 1;" 
            required
          />
          <button type="submit" class="btn-primary">Crear</button>
        </div>
      </form>

      <!-- Unirse a grupo por código -->
      <form onsubmit={(e) => { e.preventDefault(); handleJoinGroup(); }}>
        <div style="font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
          <i class="fa-solid fa-user-plus" style="color: var(--verde);"></i>
          <span>Unirse con Código / ID</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <input 
            type="text" 
            placeholder="Pega el ID del grupo..." 
            bind:value={joinCode} 
            style="flex: 1;" 
            required
          />
          <button type="submit" class="btn-secondary">Unirme</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL DE GESTIÓN DE CATEGORÍAS (CRUD) -->
{#if showCategoriesModal}
  <div 
    class="modal-overlay" 
    onclick={(e) => { if (e.target === e.currentTarget) showCategoriesModal = false; }} 
    onkeydown={(e) => { if (e.key === 'Escape') showCategoriesModal = false; }}
    role="presentation"
    tabindex="-1"
  >
    <div class="modal-card" role="dialog" aria-modal="true" style="max-height: 85vh; display: flex; flex-direction: column;">
      <div class="modal-header">
        <h3>
          <i class="fa-solid fa-tags" style="color: var(--acento);"></i>
          <span>Categorías de {tabCategoria === 'gasto' ? 'Gastos' : 'Ingresos'}</span>
        </h3>
        <button type="button" class="btn-close" onclick={() => (showCategoriesModal = false)} aria-label="Cerrar modal">
          <i class="fa-solid fa-xmark fa-lg"></i>
        </button>
      </div>

      <!-- Segmentado de Tabs: Gastos / Ingresos -->
      <div class="control-segmentado" style="margin-bottom: 0.75rem;">
        <button 
          type="button" 
          class:activo={tabCategoria === 'gasto'} 
          onclick={() => (tabCategoria = 'gasto')}
        >
          <i class="fa-solid fa-arrow-down" style="color: var(--rojo);"></i>
          <span>Gastos ({categoriasList.filter(c => c.tipo === 'gasto').length})</span>
        </button>
        <button 
          type="button" 
          class:activo={tabCategoria === 'ingreso'} 
          onclick={() => (tabCategoria = 'ingreso')}
        >
          <i class="fa-solid fa-arrow-up" style="color: var(--verde);"></i>
          <span>Ingresos ({categoriasList.filter(c => c.tipo === 'ingreso').length})</span>
        </button>
      </div>

      {#if catError}
        <p class="error"><i class="fa-solid fa-circle-exclamation"></i> {catError}</p>
      {/if}
      {#if catMsg}
        <p style="color: var(--verde); font-size: 0.85rem; margin: 0; display: flex; align-items: center; gap: 0.35rem;">
          <i class="fa-solid fa-circle-check"></i> {catMsg}
        </p>
      {/if}

      <!-- Formulario Agregar Nueva Categoría -->
      <form onsubmit={handleCrearCategoria} style="display: flex; gap: 0.45rem; margin-bottom: 0.85rem;">
        <input 
          type="text" 
          placeholder={`Nueva categoría de ${tabCategoria === 'gasto' ? 'gasto' : 'ingreso'}...`} 
          bind:value={nuevaCatNombre} 
          style="flex: 1; font-size: 0.85rem;" 
          required
        />
        <button type="submit" class="btn-primary" style="white-space: nowrap; padding: 0.4rem 0.75rem; font-size: 0.82rem;">
          <i class="fa-solid fa-plus"></i> Agregar
        </button>
      </form>

      <!-- Lista de Categorías -->
      <div style="overflow-y: auto; max-height: 280px; display: flex; flex-direction: column; gap: 0.35rem; padding-right: 0.2rem;">
        {#each categoriasList.filter(c => c.tipo === tabCategoria) as cat (cat.id || cat.nombre)}
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.65rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--borde); font-size: 0.84rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid {cat.icono || 'fa-tag'}" style="color: {tabCategoria === 'gasto' ? 'var(--rojo)' : 'var(--verde)'}; font-size: 0.85rem; width: 16px; text-align: center;"></i>
              <span style="font-weight: 500;">{cat.nombre}</span>
            </div>
            <button 
              type="button" 
              class="btn-secondary" 
              style="padding: 0.15rem 0.4rem; min-height: auto; border: none; color: var(--texto-tenue); font-size: 0.78rem;" 
              onclick={() => handleEliminarCategoria(cat)}
              title="Eliminar categoría"
            >
              <i class="fa-solid fa-trash-can" style="color: var(--rojo);"></i>
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
