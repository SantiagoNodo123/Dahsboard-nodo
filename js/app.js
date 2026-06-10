// js/app.js

window.App = {
  init: async function() {
    // Ya no limpiamos el storage en cada recarga
    // Storage.clear();
    
    // Cargar todos los datos del backend
    await Storage.loadAll();
    
    this.setCurrentDate();
    this.setupNavigation();
    this.setupForms();
    this.setupModal();
    this.setupTabs();
    this.setupMobileToggle();
    this.setupExportImport();
    this.setupIdeasRefresh();
    
    this.renderAllSections();
    
    // Defer chart init slightly to ensure DOM is ready
    setTimeout(() => {
      Charts.init();
    }, 100);
  },

  setupNavigation: function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active class
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Navigate
        const section = item.getAttribute('data-section');
        this.navigateTo(section);
      });
    });
  },

  navigateTo: function(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
    
    // Update Title
    const titles = {
      'overview': 'Resumen General',
      'sales': 'Registro de Ventas',
      'investments': 'Portafolio de Inversiones',
      'capital': 'Flujo de Capital',
      'investors': 'Gestión de Inversionistas',
      'expenses': 'Registro de Gastos',
      'costs': 'Costos Fijos y Variables',
      'social': 'Rendimiento en Redes Sociales'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';
    
    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
    
    // Rerender charts when section changes (fix for canvas sizing issues)
    setTimeout(() => {
      Charts.updateAll();
    }, 50);
  },

  setupForms: function() {
    const forms = [
      { id: 'form-sale', key: 'nodo_sales' },
      { id: 'form-investment', key: 'nodo_investments' },
      { id: 'form-capital-entry', key: 'nodo_capital' },
      { id: 'form-investor', key: 'nodo_investors' },
      { id: 'form-expense', key: 'nodo_expenses' },
      { id: 'form-fixed-cost', key: 'nodo_fixed_costs' },
      { id: 'form-variable-cost', key: 'nodo_variable_costs' },
      { id: 'form-social-post', key: 'nodo_social_posts' }
    ];

    forms.forEach(f => {
      const formEl = document.getElementById(f.id);
      if (!formEl) return;
      
      // Set default date to today for all date inputs in this form
      const dateInputs = formEl.querySelectorAll('input[type="date"]');
      const today = new Date().toISOString().split('T')[0];
      dateInputs.forEach(input => {
        if (!input.value) input.value = today;
      });

      formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if we're editing (form has data-edit-id)
        const editId = formEl.getAttribute('data-edit-id');
        
        const formData = new FormData(formEl);
        const dataObj = {};
        
        formData.forEach((value, key) => {
          // Convert numbers
          if (!isNaN(value) && value.trim() !== '') {
            dataObj[key] = Number(value);
          } else {
            dataObj[key] = value;
          }
        });

        // Deshabilitar botón mientras guarda
        const submitBtn = formEl.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Guardando...';
        }

        try {
          if (editId) {
            await Storage.update(f.key, editId, dataObj);
            formEl.removeAttribute('data-edit-id');
            if(submitBtn) submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Registrar';
            this.showNotification('Registro actualizado exitosamente en la BD', 'success');
          } else {
            await Storage.add(f.key, dataObj);
            this.showNotification('Registro guardado exitosamente en la BD', 'success');
          }
          
          formEl.reset();
          // Reset dates again
          dateInputs.forEach(input => input.value = today);
          
          this.renderAllSections();
          Charts.updateAll();
        } catch (error) {
          this.showNotification('Error al guardar en el servidor', 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (!editId) submitBtn.textContent = originalText;
          }
        }
      });
    });
  },

  setupModal: function() {
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');

    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  },

  showModal: function(title, bodyHTML, footerHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-footer').innerHTML = footerHTML || '';
    document.getElementById('modal-overlay').classList.add('active');
  },

  closeModal: function() {
    document.getElementById('modal-overlay').classList.remove('active');
  },

  setupTabs: function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all siblings
        const parent = btn.closest('.tabs');
        parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        // Add active to clicked
        btn.classList.add('active');
        
        // Hide all panes
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        // Show target pane
        const targetId = `tab-pane-${btn.getAttribute('data-tab')}`;
        document.getElementById(targetId).classList.add('active');
      });
    });
  },

  setupMobileToggle: function() {
    const toggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  },

  setupExportImport: function() {
    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    const fileInput = document.getElementById('import-file');

    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const dataStr = Storage.exportData();
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `nodo_dashboard_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      });
    }

    if (btnImport && fileInput) {
      btnImport.addEventListener('click', () => fileInput.click());
      
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = Storage.importData(event.target.result);
          if (success) {
            this.showNotification('Datos importados exitosamente', 'success');
            this.renderAllSections();
            Charts.updateAll();
          } else {
            this.showNotification('Error al importar datos. Archivo inválido.', 'error');
          }
        };
        reader.readAsText(file);
      });
    }
  },

  setupIdeasRefresh: function() {
    const btn = document.getElementById('btn-refresh-ideas');
    if (btn) {
      btn.addEventListener('click', () => {
        Social.renderIdeas('ideas-container');
        Social.renderStrategies('strategy-container');
        this.showNotification('Nuevas ideas generadas', 'info');
      });
    }
  },

  setCurrentDate: function() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      let dateStr = new Date().toLocaleDateString('es-ES', options);
      // Capitalize first letter
      dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      dateEl.textContent = dateStr;
    }
  },

  // Formatting Utilities
  formatCurrency: function(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  },
  
  formatNumber: function(value) {
    return new Intl.NumberFormat('en-US').format(value || 0);
  },
  
  formatDate: function(dateStr) {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if(parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString('es-ES');
  },

  getStatusBadgeClass: function(status) {
    const s = String(status).toLowerCase();
    if (['completada', 'activo', 'activa'].includes(s)) return 'badge-success';
    if (['pendiente', 'pausada'].includes(s)) return 'badge-warning';
    if (['cancelada', 'inactivo'].includes(s)) return 'badge-danger';
    return 'badge-purple';
  },

  showNotification: function(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    notif.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="notification-message">${message}</div>
      </div>
    `;

    container.appendChild(notif);
    
    // Trigger animation
    setTimeout(() => notif.classList.add('show'), 10);

    // Remove after 3s
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 400);
    }, 3000);
  },

  // Render Functions
  renderAllSections: function() {
    this.renderOverview();
    this.renderSales();
    this.renderInvestments();
    this.renderCapital();
    this.renderInvestors();
    this.renderExpenses();
    this.renderCosts();
    this.renderSocial();
  },

  renderOverview: function() {
    const sales = Storage.get('nodo_sales').filter(s => s.status === 'Completada');
    const capital = Storage.get('nodo_capital');
    const investments = Storage.get('nodo_investments');
    const expenses = Storage.get('nodo_expenses');
    const posts = Storage.get('nodo_social_posts');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // 1. Total Sales (All time)
    const totalSales = sales.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    document.getElementById('kpi-total-sales').textContent = this.formatCurrency(totalSales);

    // 2. Capital Available (Entries - Exits)
    const capEntries = capital.filter(c => c.type === 'Entrada').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const capExits = capital.filter(c => c.type === 'Salida').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    document.getElementById('kpi-total-capital').textContent = this.formatCurrency(capEntries - capExits);

    // 3. Total Investments
    const totalInvestments = investments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    document.getElementById('kpi-total-investments').textContent = this.formatCurrency(totalInvestments);

    // 4. Monthly Expenses
    const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    document.getElementById('kpi-total-expenses').textContent = this.formatCurrency(monthlyExpenses);

    // 5. ROI
    let roi = 0;
    const totalExp = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    if (totalExp > 0) {
      roi = ((totalSales - totalExp) / totalExp) * 100;
    }
    document.getElementById('kpi-roi').textContent = roi.toFixed(1) + '%';

    // 6. Average Engagement
    document.getElementById('kpi-engagement').textContent = Social.calculateEngagement(posts);

    // Render Activity List (combine last 5 items from everywhere)
    const activityList = document.getElementById('activity-list');
    if (activityList) {
      const allActivities = [
        ...sales.map(s => ({ date: s.date, text: `Venta registrada: ${s.client} - ${this.formatCurrency(s.amount)}` })),
        ...investments.map(i => ({ date: i.date, text: `Nueva inversión: ${i.name}` })),
        ...expenses.map(e => ({ date: e.date, text: `Gasto: ${e.concept} - ${this.formatCurrency(e.amount)}` }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      if (allActivities.length === 0) {
        activityList.innerHTML = `<div class="empty-text">No hay actividad reciente</div>`;
      } else {
        activityList.innerHTML = allActivities.map(a => `
          <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-content">
              <div class="activity-text">${a.text}</div>
              <div class="activity-time">${this.formatDate(a.date)}</div>
            </div>
          </div>
        `).join('');
      }
    }
  },

  generateTableHTML: function(data, columnsMap, keyName) {
    if (data.length === 0) {
      return `<tr><td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">No hay registros disponibles</td></tr>`;
    }

    return data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).map(item => {
      let tr = `<tr>`;
      columnsMap.forEach(col => {
        let val = item[col.field];
        if (col.type === 'currency') val = this.formatCurrency(val);
        if (col.type === 'date') val = this.formatDate(val);
        if (col.type === 'badge') val = `<span class="badge ${this.getStatusBadgeClass(val)}">${val}</span>`;
        if (col.type === 'percentage') val = `${val}%`;
        tr += `<td>${val}</td>`;
      });
      
      // Actions
      tr += `
        <td class="td-actions">
          <button class="btn-icon" onclick="App.editItem('${keyName}', '${item.id}')" title="Editar">✏️</button>
          <button class="btn-icon" onclick="App.deleteItem('${keyName}', '${item.id}')" title="Eliminar" style="color: var(--danger)">🗑️</button>
        </td>
      </tr>`;
      return tr;
    }).join('');
  },

  renderSales: function() {
    const tbody = document.getElementById('table-sales-body');
    if (!tbody) return;
    tbody.innerHTML = this.generateTableHTML(Storage.get('nodo_sales'), [
      { field: 'date', type: 'date' },
      { field: 'client', type: 'text' },
      { field: 'product', type: 'text' },
      { field: 'amount', type: 'currency' },
      { field: 'paymentMethod', type: 'text' },
      { field: 'status', type: 'badge' }
    ], 'nodo_sales');
  },

  renderInvestments: function() {
    const tbody = document.getElementById('table-investments-body');
    if (!tbody) return;
    tbody.innerHTML = this.generateTableHTML(Storage.get('nodo_investments'), [
      { field: 'date', type: 'date' },
      { field: 'name', type: 'text' },
      { field: 'type', type: 'text' },
      { field: 'amount', type: 'currency' },
      { field: 'expectedReturn', type: 'percentage' },
      { field: 'status', type: 'badge' }
    ], 'nodo_investments');
  },

  renderCapital: function() {
    const capital = Storage.get('nodo_capital');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Update mini KPIs
    const total = capital.reduce((sum, c) => sum + (c.type==='Entrada' ? Number(c.amount) : -Number(c.amount)), 0);
    const monthEntries = capital.filter(c => c.type==='Entrada' && new Date(c.date).getMonth()===currentMonth && new Date(c.date).getFullYear()===currentYear)
                                .reduce((sum, c) => sum + Number(c.amount), 0);
    const monthExits = capital.filter(c => c.type==='Salida' && new Date(c.date).getMonth()===currentMonth && new Date(c.date).getFullYear()===currentYear)
                              .reduce((sum, c) => sum + Number(c.amount), 0);

    const elTotal = document.getElementById('kpi-capital-total');
    const elEntries = document.getElementById('kpi-capital-entries');
    const elExits = document.getElementById('kpi-capital-exits');

    if(elTotal) elTotal.textContent = this.formatCurrency(total);
    if(elEntries) elEntries.textContent = this.formatCurrency(monthEntries);
    if(elExits) elExits.textContent = this.formatCurrency(monthExits);

    // Render Table
    const tbody = document.getElementById('table-capital-body');
    if (!tbody) return;
    tbody.innerHTML = this.generateTableHTML(capital, [
      { field: 'date', type: 'date' },
      { field: 'type', type: 'text' }, // Entrada/Salida could use badge styling but text is fine
      { field: 'amount', type: 'currency' },
      { field: 'description', type: 'text' },
      { field: 'category', type: 'badge' }
    ], 'nodo_capital');
  },

  renderInvestors: function() {
    const tbody = document.getElementById('table-investors-body');
    if (!tbody) return;
    tbody.innerHTML = this.generateTableHTML(Storage.get('nodo_investors'), [
      { field: 'name', type: 'text' },
      { field: 'email', type: 'text' },
      { field: 'phone', type: 'text' },
      { field: 'amountInvested', type: 'currency' },
      { field: 'percentage', type: 'percentage' },
      { field: 'date', type: 'date' },
      { field: 'status', type: 'badge' }
    ], 'nodo_investors');
  },

  renderExpenses: function() {
    const tbody = document.getElementById('table-expenses-body');
    if (!tbody) return;
    tbody.innerHTML = this.generateTableHTML(Storage.get('nodo_expenses'), [
      { field: 'date', type: 'date' },
      { field: 'concept', type: 'text' },
      { field: 'category', type: 'badge' },
      { field: 'amount', type: 'currency' },
      { field: 'recurring', type: 'text' }
    ], 'nodo_expenses');
  },

  renderCosts: function() {
    const tbodyFixed = document.getElementById('table-fixed-costs-body');
    const tbodyVar = document.getElementById('table-variable-costs-body');
    
    if (tbodyFixed) {
      tbodyFixed.innerHTML = this.generateTableHTML(Storage.get('nodo_fixed_costs'), [
        { field: 'concept', type: 'text' },
        { field: 'amount', type: 'currency' },
        { field: 'frequency', type: 'text' },
        { field: 'category', type: 'badge' }
      ], 'nodo_fixed_costs');
    }

    if (tbodyVar) {
      tbodyVar.innerHTML = this.generateTableHTML(Storage.get('nodo_variable_costs'), [
        { field: 'concept', type: 'text' },
        { field: 'amount', type: 'currency' },
        { field: 'frequency', type: 'text' },
        { field: 'category', type: 'badge' }
      ], 'nodo_variable_costs');
    }
  },

  renderSocial: function() {
    const posts = Storage.get('nodo_social_posts');
    const tbody = document.getElementById('table-social-posts-body');
    
    if (tbody) {
      tbody.innerHTML = this.generateTableHTML(posts, [
        { field: 'date', type: 'date' },
        { field: 'platform', type: 'badge' },
        { field: 'contentType', type: 'text' },
        { field: 'reach', type: 'text' },
        { field: 'likes', type: 'text' },
        { field: 'comments', type: 'text' },
        { field: 'shares', type: 'text' }
      ], 'nodo_social_posts');
    }

    Social.updatePlatformCards(posts);
    
    // Initial render of ideas if containers exist and are empty
    const ideasContainer = document.getElementById('ideas-container');
    if (ideasContainer && ideasContainer.innerHTML.trim() === '') {
      Social.renderIdeas('ideas-container');
      Social.renderStrategies('strategy-container');
      Social.renderBrandColors('brand-colors');
    }
  },

  deleteItem: function(key, id) {
    this.showModal('Confirmar Eliminación', 
      `<p>¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.</p>`,
      `<button class="btn btn-outline" onclick="App.closeModal()">Cancelar</button>
       <button class="btn btn-danger" onclick="App.executeDelete('${key}', '${id}')">Eliminar</button>`
    );
  },

  executeDelete: async function(key, id) {
    try {
      await Storage.delete(key, id);
      this.closeModal();
      this.showNotification('Registro eliminado de la BD', 'info');
      this.renderAllSections();
      Charts.updateAll();
    } catch (error) {
      this.showNotification('Error al eliminar en el servidor', 'error');
    }
  },

  editItem: function(key, id) {
    const item = Storage.getById(key, id);
    if (!item) return;

    // Find the correct form based on key
    const formMap = {
      'nodo_sales': 'form-sale',
      'nodo_investments': 'form-investment',
      'nodo_capital': 'form-capital-entry',
      'nodo_investors': 'form-investor',
      'nodo_expenses': 'form-expense',
      'nodo_fixed_costs': 'form-fixed-cost',
      'nodo_variable_costs': 'form-variable-cost',
      'nodo_social_posts': 'form-social-post'
    };

    const formId = formMap[key];
    const formEl = document.getElementById(formId);
    
    if (!formEl) return;

    // Populate form
    Object.keys(item).forEach(field => {
      const input = formEl.querySelector(`[name="${field}"]`);
      if (input) {
        input.value = item[field];
      }
    });

    // Mark form as editing
    formEl.setAttribute('data-edit-id', id);
    
    // Change button text
    const submitBtn = formEl.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.setAttribute('data-original-text', submitBtn.textContent);
      submitBtn.textContent = 'Guardar Cambios';
    }

    // Scroll to form smoothly
    formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.showNotification('Formulario listo para editar', 'info');
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => App.init());
