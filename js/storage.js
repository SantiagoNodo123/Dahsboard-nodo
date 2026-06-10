// js/storage.js

const API_URL = 'http://localhost:3000/api';

window.Storage = {
  // Local cache to keep get() synchronous for the UI
  data: {
    'nodo_sales': [],
    'nodo_investments': [],
    'nodo_capital': [],
    'nodo_investors': [],
    'nodo_expenses': [],
    'nodo_fixed_costs': [],
    'nodo_variable_costs': [],
    'nodo_social_posts': []
  },

  // Load all data from the backend into the local cache
  loadAll: async function() {
    const keys = Object.keys(this.data);
    try {
      const promises = keys.map(key => fetch(`${API_URL}/${key}`).then(res => res.json()));
      const results = await Promise.all(promises);
      
      keys.forEach((key, index) => {
        // results[index] might be { error: '...' } if table doesn't exist, handle it safely
        this.data[key] = Array.isArray(results[index]) ? results[index] : [];
      });
      console.log('Todos los datos cargados desde el servidor:', this.data);
      return true;
    } catch (error) {
      console.error('Error loading data from server:', error);
      return false;
    }
  },

  // Get data (synchronous, from cache)
  get: function(key) {
    return this.data[key] || [];
  },

  // Add new item (async to backend, then update cache)
  add: async function(key, item) {
    item.id = item.id || this.generateId();
    try {
      const response = await fetch(`${API_URL}/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const savedItem = await response.json();
      
      if (this.data[key]) {
        this.data[key].push(savedItem);
      }
      return this.data[key];
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  // Update item by ID
  update: async function(key, id, updatedFields) {
    try {
      const response = await fetch(`${API_URL}/${key}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const savedItem = await response.json();
      
      const index = this.data[key].findIndex(item => item.id === id);
      if (index !== -1) {
        this.data[key][index] = { ...this.data[key][index], ...savedItem };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  // Delete item by ID
  delete: async function(key, id) {
    try {
      await fetch(`${API_URL}/${key}/${id}`, {
        method: 'DELETE'
      });
      
      this.data[key] = this.data[key].filter(item => item.id !== id);
      return this.data[key];
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  // Get item by ID from cache
  getById: function(key, id) {
    const data = this.get(key);
    return data.find(item => item.id === id) || null;
  },

  // Generate unique ID
  generateId: function() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // Export all data (from cache)
  exportData: function() {
    return JSON.stringify(this.data, null, 2);
  },

  // Import data (save to backend one by one)
  importData: async function(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      for (const key in importedData) {
        if (key.startsWith('nodo_') && Array.isArray(importedData[key])) {
          // Para no hacer cientos de peticiones, lo ideal en el futuro es un endpoint /bulk,
          // por ahora hacemos POST uno por uno
          for (const item of importedData[key]) {
             await fetch(`${API_URL}/${key}`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(item)
             });
          }
        }
      }
      // Reload cache
      await this.loadAll();
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  },

  // Clear all data - not supported directly in the backend yet without writing a /clear endpoint,
  // we'll just throw a warning. For full DB wipes, a specific backend route is safer.
  clear: function() {
    console.warn("Storage.clear() ya no borra la base de datos SQL por seguridad.");
  },

  initSampleData: function() {
    // Ya no cargamos datos locales.
  }
};
