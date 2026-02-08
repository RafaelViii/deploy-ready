// ═══════════════════════════════════════════════════════════════
// SALES SYSTEM
// ═══════════════════════════════════════════════════════════════

async function loadSalesRecords() {
  try {
    const snapshot = await db.collection('sales')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
      
    allSalesRecords = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      
      allSalesRecords.push({
        id: doc.id,
        receiptId: data.receiptId,
        patientName: data.patientName,
        nurseName: data.nurseName,
        nurseId: data.nurseId,
        date: data.date,
        total: data.total || 0,
        itemCount: data.itemCount || 0,
        items: data.items || [],
        createdAt: createdAt,
        timestamp: createdAt ? createdAt.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : ''
      });
    });
    
    filterAndRenderSales();
    updateSalesSummary();
    updateCategoryBreakdown();
  } catch (error) {
    console.error('Error loading sales:', error);
  }
}

function filterSalesByPeriod(sales, period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);
  
  return sales.filter(sale => {
    if (!sale.createdAt) return false;
    
    if (period === 'today') {
      return sale.createdAt >= today;
    } else if (period === 'month') {
      return sale.createdAt >= thisMonth;
    } else if (period === 'year') {
      return sale.createdAt >= thisYear;
    }
    return true;
  });
}

function filterAndRenderSales() {
  const searchTerm = document.getElementById('salesSearchInput')?.value.toLowerCase() || '';
  let filtered = filterSalesByPeriod(allSalesRecords, currentSalesPeriod);
  
  if (searchTerm) {
    filtered = filtered.filter(sale => {
      const matchesPatient = sale.patientName?.toLowerCase().includes(searchTerm);
      const matchesNurse = sale.nurseName?.toLowerCase().includes(searchTerm);
      const matchesItems = sale.items?.some(item => 
        item.name?.toLowerCase().includes(searchTerm)
      );
      return matchesPatient || matchesNurse || matchesItems;
    });
  }
  
  renderSalesTable(filtered);
}

function renderSalesTable(sales) {
  const tbody = document.getElementById('salesTableBody');
  if (!tbody) return;
  
  if (sales.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No sales records found</td></tr>';
    return;
  }
  
  tbody.innerHTML = sales.map(sale => {
    const itemsBreakdown = sale.items.map(item => {
      return `${item.name} (${item.quantity})`;
    }).join(', ');
    
    return `
      <tr>
        <td>${sale.timestamp}</td>
        <td>${sale.patientName}</td>
        <td>${sale.nurseName}</td>
        <td>${itemsBreakdown}</td>
        <td>₱${sale.total.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

function updateSalesSummary() {
  const filtered = filterSalesByPeriod(allSalesRecords, currentSalesPeriod);
  
  const totalRevenue = filtered.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filtered.length;
  const totalItems = filtered.reduce((sum, sale) => sum + sale.itemCount, 0);
  const averageSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  if (document.getElementById('salesTotalRevenue')) {
    document.getElementById('salesTotalRevenue').textContent = 
      `₱${totalRevenue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
  }
  
  if (document.getElementById('salesTotalTransactions')) {
    document.getElementById('salesTotalTransactions').textContent = totalTransactions;
  }
  
  if (document.getElementById('salesTotalItems')) {
    document.getElementById('salesTotalItems').textContent = totalItems;
  }
  
  if (document.getElementById('salesAverageSale')) {
    document.getElementById('salesAverageSale').textContent = 
      `₱${averageSale.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
  }
}

function updateCategoryBreakdown() {
  const filtered = filterSalesByPeriod(allSalesRecords, currentSalesPeriod);
  const categoryTotals = {};
  
  filtered.forEach(sale => {
    sale.items?.forEach(item => {
      const category = 'General';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += (item.quantity || 0) * (item.price || 0);
    });
  });
  
  const container = document.getElementById('categoryBreakdownGrid');
  if (!container) return;
  
  if (Object.keys(categoryTotals).length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No category data available</p></div>';
    return;
  }
  
  container.innerHTML = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => `
      <div class="category-card">
        <h4>${category}</h4>
        <p>₱${total.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</p>
      </div>
    `).join('');
}

function initSalesListeners() {
  // Period filter buttons
  document.querySelectorAll('.sales-period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSalesPeriod = btn.dataset.period;
      document.querySelectorAll('.sales-period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAndRenderSales();
      updateSalesSummary();
      updateCategoryBreakdown();
    });
  });
  
  // Search input
  document.getElementById('salesSearchInput')?.addEventListener('input', filterAndRenderSales);
  
  // Export button
  document.getElementById('exportSalesBtn')?.addEventListener('click', () => {
    const filtered = filterSalesByPeriod(allSalesRecords, currentSalesPeriod);
    
    if (filtered.length === 0) {
      alert('No sales data to export');
      return;
    }
    
    const excelData = filtered.map(sale => ({
      'Date & Time': sale.timestamp,
      'Patient Name': sale.patientName,
      'Nurse': sale.nurseName,
      'Items': sale.items.map(item => `${item.name} (${item.quantity})`).join(', '),
      'Total': sale.total
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    
    const filename = `Sales_${currentSalesPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    alert(`✅ Exported ${filtered.length} sales records to ${filename}`);
  });
}
