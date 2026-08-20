import { auth, loginWithGoogle, logout as firebaseLogout, onAuthStateChanged } from './firebase.js';
import { 
  createGroup as apiCreateGroup, 
  getUserProfile, 
  getUserGroups, 
  setActiveGroup as apiSetActiveGroup, 
  joinGroupByCode as apiJoinGroupByCode 
} from './groups.js';

class SessionState {
  user = $state(null);
  activeGroup = $state(null);
  userGroups = $state([]);
  loading = $state(true);
  isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => (this.isOnline = true));
      window.addEventListener('offline', () => (this.isOnline = false));

      onAuthStateChanged(auth, async (currentUser) => {
        this.user = currentUser;
        this.loading = false;
        if (currentUser) {
          await this.reloadGroups();
        } else {
          this.activeGroup = null;
          this.userGroups = [];
        }
      });
    }
  }

  async reloadGroups() {
    if (!this.user) return;
    try {
      this.userGroups = await getUserGroups(this.user.uid);
      const profile = await getUserProfile(this.user.uid);

      if (profile?.activeGroupId) {
        this.activeGroup = this.userGroups.find(g => g.id === profile.activeGroupId) || this.userGroups[0] || null;
      } else if (this.userGroups.length > 0) {
        this.activeGroup = this.userGroups[0];
        await apiSetActiveGroup(this.user.uid, this.activeGroup.id);
      } else {
        this.activeGroup = null;
      }
    } catch (err) {
      console.error('Error al cargar grupos:', err);
    }
  }

  async login() {
    return await loginWithGoogle();
  }

  async logout() {
    await firebaseLogout();
    this.user = null;
    this.activeGroup = null;
    this.userGroups = [];
  }

  async createGroup(name) {
    if (!this.user) throw new Error('Debes iniciar sesión primero');
    const groupId = await apiCreateGroup(name, this.user);
    await this.reloadGroups();
    return groupId;
  }

  async joinGroup(code) {
    if (!this.user) throw new Error('Debes iniciar sesión primero');
    const group = await apiJoinGroupByCode(code, this.user);
    await this.reloadGroups();
    return group;
  }

  async selectGroup(groupId) {
    if (!this.user) return;
    await apiSetActiveGroup(this.user.uid, groupId);
    await this.reloadGroups();
  }
}

export const session = new SessionState();
