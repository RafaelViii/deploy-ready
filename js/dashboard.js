// ═══════════════════════════════════════════════════════════════
// CHARTS & DASHBOARD
// ═══════════════════════════════════════════════════════════════

function initCharts() {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    income: [15000, 18000, 20000, 17000, 22000, 28000, 24000, 26000, 23000, 25000, 27000, 30000],
    expenses: [9000, 11000, 12000, 10500, 13000, 15000, 14000, 15500, 13500, 14500, 16000, 17000],
    cashFlow: [6000, 7000, 8000, 6500, 9000, 13000, 10000, 10500, 9500, 10500, 11000, 13000],
    profitMargin: [40, 39, 40, 38, 41, 46, 42, 41, 41, 42, 41, 43]
  };
  
  // Income vs Expenses Chart
  if (document.getElementById('revExp')) {
    new Chart(document.getElementById('revExp'), {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Income',
            data: chartData.income,
            borderColor: '#2563eb',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Expenses',
            data: chartData.expenses,
            borderColor: '#ef4444',
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Cash Flow Chart
  if (document.getElementById('cashFlow')) {
    new Chart(document.getElementById('cashFlow'), {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Cash Flow',
            data: chartData.cashFlow,
            backgroundColor: '#10b981'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
  
  // Profit Margin Chart
  if (document.getElementById('profitMargin')) {
    new Chart(document.getElementById('profitMargin'), {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Profit Margin %',
            data: chartData.profitMargin,
            borderColor: '#f59e0b',
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
}

function updateDashboardInventoryCounts() {
  if (productsMaster.length === 0) return;
  
  const availableCount = productsMaster.filter(p => p.stock >= 20).length;
  const lowStockCount = productsMaster.filter(p => p.stock > 0 && p.stock < 20).length;
  const outStockCount = productsMaster.filter(p => p.stock === 0).length;
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const expiringCount = productsMaster.filter(p => {
    if (!p.expiry) return false;
    const expiryDate = new Date(p.expiry);
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
  }).length;
  
  if (document.getElementById('dashAvailableCount'))
    document.getElementById('dashAvailableCount').textContent = availableCount;
  if (document.getElementById('dashLowStockCount'))
    document.getElementById('dashLowStockCount').textContent = lowStockCount;
  if (document.getElementById('dashOutStockCount'))
    document.getElementById('dashOutStockCount').textContent = outStockCount;
  if (document.getElementById('dashExpiringCount'))
    document.getElementById('dashExpiringCount').textContent = expiringCount;
}

function updateDashboardDate() {
  const dateEl = document.getElementById('dashboardDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
