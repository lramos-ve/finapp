/**
 * Gestor de configuraciones y preferencias de usuario.
 */
const STORAGE_KEY_CURRENCY = 'finapp_default_currency';

class SettingsState {
  defaultCurrency = $state('VES');

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (saved === 'VES' || saved === 'USD') {
        this.defaultCurrency = saved;
      } else {
        this.defaultCurrency = 'VES';
      }
    }
  }

  setDefaultCurrency(curr) {
    if (curr === 'VES' || curr === 'USD') {
      this.defaultCurrency = curr;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CURRENCY, curr);
      }
    }
  }
}

export const settings = new SettingsState();
