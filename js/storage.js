// js/storage.js
// Persistencia 100% localStorage — compatible con GitHub Pages
// Misma interfaz async que la versión con backend para no cambiar app.js

const STORAGE_PREFIX = 'nodo_';

window.Storage = {

  // Cache en memoria (igual que antes, para que get() sea síncrono)
  data: {
    'nodo_sales':          [],
    'nodo_investments':    [],
    'nodo_capital':        [],
    'nodo_investors':      [],
    'nodo_expenses':       [],
    'nodo_fixed_costs':    [],
    'nodo_variable_costs': [],
    'nodo_social_posts':   []
  },

  // ─── CARGA INICIAL ──────────────────────────────────────────────────────────
  // Llamado una vez en App.init() — lee localStorage y llena el cache
  loadAll: async function() {
    try {
      Object.keys(this.data).forEach(key => {
        const raw = localStorage.getItem(key);
        this.data[key] = raw ? JSON.parse(raw) : [];
      });
      console.log('Datos cargados desde localStorage:', this.data);
      return true;
    } catch (error) {
      console.error('Error cargando datos:', error);
      return false;
    }
  },

  // ─── LECTURA SÍNCRONA (desde cache) ─────────────────────────────────────────
  get: function(key) {
    return this.data[key] || [];
  },

  // ─── ESCRITURA INTERNA ───────────────────────────────────────────────────────
  // Guarda el array completo en cache Y en localStorage
  _save: function(key) {
    localStorage.setItem(key, JSON.stringify(this.data[key] || []));
  },

  // ─── AGREGAR ─────────────────────────────────────────────────────────────────
  add: async function(key, item) {
    item.id = item.id || this.generateId();
    if (!this.data[key]) this.data[key] = [];
    this.data[key].push(item);
    this._save(key);
    return this.data[key];
  },

  // ─── ACTUALIZAR ──────────────────────────────────────────────────────────────
  update: async function(key, id, updatedFields) {
    const index = (this.data[key] || []).findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[key][index] = { ...this.data[key][index], ...updatedFields };
      this._save(key);
      return true;
    }
    return false;
  },

  // ─── ELIMINAR ────────────────────────────────────────────────────────────────
  delete: async function(key, id) {
    this.data[key] = (this.data[key] || []).filter(item => item.id !== id);
    this._save(key);
    return this.data[key];
  },

  // ─── BUSCAR POR ID ───────────────────────────────────────────────────────────
  getById: function(key, id) {
    return (this.data[key] || []).find(item => item.id === id) || null;
  },

  // ─── GENERAR ID ÚNICO ────────────────────────────────────────────────────────
  generateId: function() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // ─── EXPORTAR ────────────────────────────────────────────────────────────────
  exportData: function() {
    return JSON.stringify(this.data, null, 2);
  },

  // ─── IMPORTAR ────────────────────────────────────────────────────────────────
  importData: async function(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      for (const key in imported) {
        if (key.startsWith(STORAGE_PREFIX) && Array.isArray(imported[key])) {
          this.data[key] = imported[key];
          this._save(key);
        }
      }
      return true;
    } catch (e) {
      console.error('Error importando datos:', e);
      return false;
    }
  },

  // ─── LIMPIAR TODO ────────────────────────────────────────────────────────────
  clear: function() {
    Object.keys(this.data).forEach(key => {
      this.data[key] = [];
      localStorage.removeItem(key);
    });
  },

  // ─── DATOS DE MUESTRA (no se usa, solo por compatibilidad) ──────────────────
  initSampleData: function() {
    // No se cargan datos de prueba. El dashboard inicia en 0.
  }

};
