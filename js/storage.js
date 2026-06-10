// js/storage.js

window.Storage = {
  // Get data by key
  get: function(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  // Save full array to key
  set: function(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Add new item to key
  add: function(key, item) {
    const data = this.get(key);
    item.id = item.id || this.generateId();
    data.push(item);
    this.set(key, data);
    return data;
  },

  // Update item by ID
  update: function(key, id, updatedFields) {
    const data = this.get(key);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedFields };
      this.set(key, data);
      return true;
    }
    return false;
  },

  // Delete item by ID
  delete: function(key, id) {
    const data = this.get(key);
    const newData = data.filter(item => item.id !== id);
    this.set(key, newData);
    return newData;
  },

  // Get item by ID
  getById: function(key, id) {
    const data = this.get(key);
    return data.find(item => item.id === id) || null;
  },

  // Generate unique ID
  generateId: function() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // Export all data
  exportData: function() {
    const exportObj = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('nodo_')) {
        exportObj[key] = JSON.parse(localStorage.getItem(key));
      }
    }
    return JSON.stringify(exportObj, null, 2);
  },

  // Import data
  importData: function(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      for (const key in data) {
        if (key.startsWith('nodo_')) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
      }
      return true;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  },

  // Clear all data
  clear: function() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('nodo_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  // Initialize sample data if empty
  initSampleData: function() {
    // Ya no cargamos datos de prueba. El dashboard inicia en 0.
  }
};
