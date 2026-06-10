// js/charts.js

const CHART_COLORS = {
  purple: '#9b59f0',
  purpleLight: '#b47aff',
  purpleDark: '#6a3db5',
  success: '#4ade80',
  danger: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',
  pink: '#f472b6',
  cyan: '#22d3ee',
  orange: '#fb923c'
};

window.Charts = {
  instances: {},

  init: function() {
    // Set global defaults
    Chart.defaults.color = '#8888a0';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family = 'Inter, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.04)';

    this.createRevenueExpensesChart();
    this.createCostsDonutChart();
    this.createSalesBarChart();
    this.createInvestmentReturnsChart();
    this.createCapitalLineChart();
    this.createInvestorsPieChart();
    this.createExpensesBarChart();
    this.createCostsComparisonChart();
    this.createEngagementChart();
    this.createFollowersChart();
  },

  updateAll: function() {
    Object.keys(this.instances).forEach(key => this.destroy(key));
    this.init();
  },

  destroy: function(name) {
    if (this.instances[name]) {
      this.instances[name].destroy();
      delete this.instances[name];
    }
  },

  // Helper: Get last n month names
  getMonthLabels: function(n) {
    const labels = [];
    const d = new Date();
    d.setDate(1);
    for (let i = n - 1; i >= 0; i--) {
      const monthDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const monthStr = monthDate.toLocaleString('es-ES', { month: 'short' });
      labels.push(monthStr.charAt(0).toUpperCase() + monthStr.slice(1));
    }
    return labels;
  },

  // Helper: Aggregate data by month
  aggregateByMonth: function(data, dateField, valueField, numMonths = 6) {
    const result = Array(numMonths).fill(0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    data.forEach(item => {
      if (!item[dateField] || !item[valueField]) return;
      
      const itemDate = new Date(item[dateField]);
      const itemMonth = itemDate.getMonth();
      const itemYear = itemDate.getFullYear();
      
      let diffMonths = (currentYear - itemYear) * 12 + (currentMonth - itemMonth);
      
      if (diffMonths >= 0 && diffMonths < numMonths) {
        result[numMonths - 1 - diffMonths] += Number(item[valueField]) || 0;
      }
    });
    
    return result;
  },

  createGradient: function(ctx, colorStart, colorEnd) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  },

  createRevenueExpensesChart: function() {
    const ctx = document.getElementById('chart-revenue-expenses');
    if (!ctx) return;

    const salesData = Storage.get('nodo_sales').filter(s => s.status === 'Completada');
    const expensesData = Storage.get('nodo_expenses');
    
    const labels = this.getMonthLabels(6);
    const salesValues = this.aggregateByMonth(salesData, 'date', 'amount');
    const expensesValues = this.aggregateByMonth(expensesData, 'date', 'amount');

    const gradientPurple = this.createGradient(ctx.getContext('2d'), 'rgba(155, 89, 240, 0.4)', 'rgba(155, 89, 240, 0.0)');

    this.instances['revenue-expenses'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ventas',
            data: salesValues,
            borderColor: CHART_COLORS.purple,
            backgroundColor: gradientPurple,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: CHART_COLORS.purple,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Gastos',
            data: expensesValues,
            borderColor: CHART_COLORS.danger,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointBackgroundColor: CHART_COLORS.danger,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        }
      }
    });
  },

  createCostsDonutChart: function() {
    const ctx = document.getElementById('chart-costs-donut');
    if (!ctx) return;

    const fixed = Storage.get('nodo_fixed_costs');
    const variable = Storage.get('nodo_variable_costs');

    const totalFixed = fixed.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalVariable = variable.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // If both zero, show dummy data to avoid empty chart visually
    const data = (totalFixed === 0 && totalVariable === 0) ? [1, 1] : [totalFixed, totalVariable];
    const empty = (totalFixed === 0 && totalVariable === 0);

    this.instances['costs-donut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Costos Fijos', 'Costos Variables'],
        datasets: [{
          data: data,
          backgroundColor: empty ? ['#2a2a3e', '#1a1a2e'] : [CHART_COLORS.purple, CHART_COLORS.purpleLight],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                if (empty) return 'Sin datos';
                const value = context.parsed;
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
              }
            }
          }
        }
      }
    });
  },

  createSalesBarChart: function() {
    const ctx = document.getElementById('chart-sales-bar');
    if (!ctx) return;

    const salesData = Storage.get('nodo_sales').filter(s => s.status === 'Completada');
    const labels = this.getMonthLabels(6);
    const salesValues = this.aggregateByMonth(salesData, 'date', 'amount');

    const gradientBar = this.createGradient(ctx.getContext('2d'), CHART_COLORS.purpleLight, CHART_COLORS.purpleDark);

    this.instances['sales-bar'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Ventas Mensuales',
          data: salesValues,
          backgroundColor: gradientBar,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  createInvestmentReturnsChart: function() {
    const ctx = document.getElementById('chart-investment-returns');
    if (!ctx) return;

    const investments = Storage.get('nodo_investments').slice(0, 8); // top 8 to fit
    
    if (investments.length === 0) return;

    const labels = investments.map(i => i.name);
    const data = investments.map(i => i.expectedReturn);
    
    // Color based on status
    const bgColors = investments.map(i => {
      if (i.status === 'Completada') return CHART_COLORS.success;
      if (i.status === 'Pausada') return CHART_COLORS.warning;
      return CHART_COLORS.purple;
    });

    this.instances['investment-returns'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '% Retorno Esperado',
          data: data,
          backgroundColor: bgColors,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bar
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) { return context.parsed.x + '% Retorno Esperado'; }
            }
          }
        }
      }
    });
  },

  createCapitalLineChart: function() {
    const ctx = document.getElementById('chart-capital-line');
    if (!ctx) return;

    const capitalData = Storage.get('nodo_capital');
    
    // We need to calculate running balance over time (let's do by month for simplicity, or just last N entries)
    // For a better visual, let's group by month
    const labels = this.getMonthLabels(6);
    const entries = this.aggregateByMonth(capitalData.filter(c => c.type === 'Entrada'), 'date', 'amount');
    const exits = this.aggregateByMonth(capitalData.filter(c => c.type === 'Salida'), 'date', 'amount');
    
    // Calculate running balance per month (simplified)
    let initialBalance = 10000; // Fake initial balance for nice chart
    const balanceData = [];
    
    for (let i = 0; i < 6; i++) {
      initialBalance = initialBalance + entries[i] - exits[i];
      balanceData.push(initialBalance);
    }

    const gradient = this.createGradient(ctx.getContext('2d'), 'rgba(74, 222, 128, 0.4)', 'rgba(74, 222, 128, 0.0)');

    this.instances['capital-line'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Balance de Capital',
          data: balanceData,
          borderColor: CHART_COLORS.success,
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: CHART_COLORS.success
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  },

  createInvestorsPieChart: function() {
    const ctx = document.getElementById('chart-investors-pie');
    if (!ctx) return;

    const investors = Storage.get('nodo_investors').filter(i => i.status === 'Activo');
    
    let totalAssigned = 0;
    const labels = [];
    const data = [];
    const colors = [CHART_COLORS.purple, CHART_COLORS.cyan, CHART_COLORS.pink, CHART_COLORS.warning, CHART_COLORS.success];
    
    investors.forEach(inv => {
      labels.push(inv.name);
      data.push(Number(inv.percentage));
      totalAssigned += Number(inv.percentage);
    });

    // Add company share if less than 100%
    if (totalAssigned < 100) {
      labels.push('Empresa (Nodo)');
      data.push(100 - totalAssigned);
    }

    if (data.length === 0) return;

    this.instances['investors-pie'] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) { return context.label + ': ' + context.parsed + '%'; }
            }
          }
        }
      }
    });
  },

  createExpensesBarChart: function() {
    const ctx = document.getElementById('chart-expenses-bar');
    if (!ctx) return;

    const expenses = Storage.get('nodo_expenses');
    
    // Group by category
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (labels.length === 0) return;

    this.instances['expenses-bar'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Gastos por Categoría',
          data: data,
          backgroundColor: CHART_COLORS.purpleLight,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  createCostsComparisonChart: function() {
    const ctx = document.getElementById('chart-costs-comparison');
    if (!ctx) return;

    const fixed = Storage.get('nodo_fixed_costs');
    const variable = Storage.get('nodo_variable_costs');

    // Get all unique categories
    const categoriesSet = new Set();
    fixed.forEach(c => categoriesSet.add(c.category));
    variable.forEach(c => categoriesSet.add(c.category));
    
    const categories = Array.from(categoriesSet);
    
    // Sum for each category
    const fixedData = categories.map(cat => {
      return fixed.filter(c => c.category === cat).reduce((sum, c) => sum + Number(c.amount), 0);
    });
    
    const variableData = categories.map(cat => {
      return variable.filter(c => c.category === cat).reduce((sum, c) => sum + Number(c.amount), 0);
    });

    if (categories.length === 0) return;

    this.instances['costs-comparison'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Costos Fijos',
            data: fixedData,
            backgroundColor: CHART_COLORS.purple,
            borderRadius: 4
          },
          {
            label: 'Costos Variables',
            data: variableData,
            backgroundColor: CHART_COLORS.purpleLight,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  },

  createEngagementChart: function() {
    const ctx = document.getElementById('chart-engagement');
    if (!ctx) return;

    const posts = Storage.get('nodo_social_posts');
    const platforms = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Twitter', 'YouTube'];
    
    const platformColors = {
      'Instagram': '#E1306C',
      'Facebook': '#1877F2',
      'TikTok': '#00f2ea',
      'LinkedIn': '#0A66C2',
      'Twitter': '#1DA1F2',
      'YouTube': '#FF0000'
    };

    const data = platforms.map(platform => {
      const platformPosts = posts.filter(p => p.platform === platform);
      if (platformPosts.length === 0) return 0;
      
      const totalReach = platformPosts.reduce((sum, p) => sum + Number(p.reach), 0);
      const totalEngagement = platformPosts.reduce((sum, p) => sum + Number(p.likes) + Number(p.comments) + Number(p.shares), 0);
      
      if (totalReach === 0) return 0;
      return (totalEngagement / totalReach) * 100;
    });

    this.instances['engagement'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: platforms,
        datasets: [{
          label: 'Engagement Rate (%)',
          data: data,
          backgroundColor: platforms.map(p => platformColors[p] || CHART_COLORS.purple),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  createFollowersChart: function() {
    const ctx = document.getElementById('chart-followers');
    if (!ctx) return;

    // Simulate follower growth for demo purposes
    const labels = this.getMonthLabels(6);
    
    this.instances['followers'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Instagram',
            data: [1200, 1500, 1900, 2400, 3100, 4200],
            borderColor: '#E1306C',
            tension: 0.4
          },
          {
            label: 'TikTok',
            data: [800, 1400, 2600, 4500, 8000, 12500],
            borderColor: '#00f2ea',
            tension: 0.4
          },
          {
            label: 'LinkedIn',
            data: [500, 650, 800, 1100, 1400, 1800],
            borderColor: '#0A66C2',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false }
      }
    });
  }
};
