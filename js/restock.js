// ═══════════════════════════════════════════════════════════════
// RESTOCK SYSTEM - FIREBASE INTEGRATED
// ═══════════════════════════════════════════════════════════════

let restockData = [];
let currentRestockFilter = 'all'; // 'all', 'low-stock', 'out-of-stock'
let currentRestockSearch = '';
let currentRestockCategory = 'all';


async function loadRestockItems() {
  try {
    console.log('🔵 Loading restock items from Firebase...');
    
    const snapshot = await db.collection('products').get();
    
    restockData = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const quantity = data.quantity || 0;
      
      // Determine status based on quantity
      let status = 'normal';
      if (quantity === 0) {
        status = 'out';
      } else if (quantity <= 5) {
        status = 'low';
      }
      
      restockData.push({
        id: doc.id, // Firebase document ID
        product: data.name,
        category: data.category,
        status: status,
        monthlySold: data.monthlySold || 0,
        currentStock: quantity,
        previousCost: data.price || 0,
        newCost: '',
        newStockQty: 0,
        checked: false
      });
    });
    
    console.log('🔵 Restock items loaded:', restockData.length);
    
    // Populate category filter
    populateRestockCategoryFilter();
    
    renderRestockItems();
    
  } catch (error) {
    console.error('❌ Error loading restock items:', error);
    alert('Error loading products: ' + error.message);
  }
}

// Populate category filter dropdown
function populateRestockCategoryFilter() {
  const filterEl = document.getElementById('restockCategoryFilter');
  if (!filterEl) return;
  
  // Get unique categories from restockData
  const categories = [...new Set(restockData.map(item => item.category))].sort();
  
  filterEl.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filterEl.appendChild(option);
  });
}

// Render restock items
function renderRestockItems() {
  const listEl = document.getElementById('restockItemsList');
  if (!listEl) {
    console.error('❌ restockItemsList element not found');
    return;
  }
  
  let filtered = restockData;
  
  // Apply stock status filter
  if (currentRestockFilter === 'low-stock') {
    filtered = filtered.filter(item => item.status === 'low');
  } else if (currentRestockFilter === 'out-of-stock') {
    filtered = filtered.filter(item => item.status === 'out');
  }
  
  // Apply search filter
  if (currentRestockSearch) {
    filtered = filtered.filter(item => 
      item.product.toLowerCase().includes(currentRestockSearch.toLowerCase())
    );
  }
  
  // Apply category filter
  if (currentRestockCategory !== 'all') {
    filtered = filtered.filter(item => item.category === currentRestockCategory);
  }
  
  if (filtered.length === 0) {
    listEl.innerHTML = '<div style="text-align: center; padding: 3rem; color: #9ca3af;">No items found matching your filters.</div>';
    updateRestockCounter();
    return;
  }
  
  let html = '';
  
  filtered.forEach((item) => {
    const actualIndex = restockData.indexOf(item);
    const statusClass = item.status === 'low' ? 'low' : item.status === 'out' ? 'out' : '';
    const statusText = item.status === 'low' ? 'Low Stock' : item.status === 'out' ? 'Out of Stock' : 'Normal';
    
    html += `
      <div class="restock-card ${item.checked ? 'selected' : ''}" data-index="${actualIndex}">
        <div class="restock-card-header">
          <div class="restock-card-title">
            <div class="restock-product-name">${item.product}</div>
            <div class="restock-category-status">
              <span class="restock-category">${item.category}</span>
              ${statusClass ? `<span class="restock-status ${statusClass}">${statusText}</span>` : ''}
            </div>
          </div>
          <div class="restock-checkbox-delete">
            <input type="checkbox" class="restock-checkbox" data-index="${actualIndex}" ${item.checked ? 'checked' : ''}>
          </div>
        </div>
        
        <div class="restock-card-body">
          <div class="restock-field">
            <div class="restock-field-label">Monthly Sold</div>
            <div class="restock-field-value">${item.monthlySold}</div>
          </div>
          
          <div class="restock-field">
            <div class="restock-field-label">Current Stock</div>
            <div class="restock-field-value">${item.currentStock}</div>
          </div>
          
          <div class="restock-field">
            <div class="restock-field-label">Previous Cost</div>
            <div class="restock-field-value">₱${item.previousCost.toFixed(2)}</div>
          </div>
        </div>
        
        <div class="restock-card-footer">
          <div class="restock-inputs-row">
            <div class="restock-input-group">
              <div class="restock-input-label">New Cost (Per Item)</div>
              <input type="number" class="new-cost-input" data-index="${actualIndex}" 
                     placeholder="₱0.00" value="${item.newCost}" step="0.01">
            </div>
            
            <div class="restock-input-group">
              <div class="restock-input-label">New Stocks (Qty)</div>
              <input type="number" class="new-stock-input" data-index="${actualIndex}" 
                     placeholder="0" value="${item.newStockQty || ''}" min="0">
            </div>
          </div>
          
          <button class="btn-add-cost" data-index="${actualIndex}">+ New Cost</button>
        </div>
      </div>
    `;
  });
  
  listEl.innerHTML = html;
  
  // Add event listeners
  attachRestockEventListeners();
  updateRestockCounter();
}

// Attach event listeners to restock cards
function attachRestockEventListeners() {
  // Checkboxes
  document.querySelectorAll('.restock-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      restockData[index].checked = e.target.checked;
      renderRestockItems();
    });
  });
  
  // New cost inputs
  document.querySelectorAll('.new-cost-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      restockData[index].newCost = e.target.value;
    });
  });
  
  // New stock inputs - auto-check when value added
  document.querySelectorAll('.new-stock-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      const value = parseInt(e.target.value) || 0;
      restockData[index].newStockQty = value;
      
      // Auto-check if value > 0
      if (value > 0 && !restockData[index].checked) {
        restockData[index].checked = true;
        renderRestockItems();
      }
      updateRestockCounter();
    });
  });
  
  // Add cost buttons
  document.querySelectorAll('.btn-add-cost').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const input = document.querySelector(`.new-cost-input[data-index="${index}"]`);
      if (input) input.focus();
    });
  });
}

// Update restock counter
function updateRestockCounter() {
  const checkedCount = restockData.filter(item => item.checked && item.newStockQty > 0).length;
  const updateCounter = document.getElementById('updateCounter');
  const updateStocksBtn = document.getElementById('updateStocksBtn');
  
  if (updateCounter) {
    updateCounter.textContent = `(${checkedCount})`;
  }
  
  if (updateStocksBtn) {
    if (checkedCount > 0) {
      updateStocksBtn.disabled = false; // ← ADD THIS LINE
      updateStocksBtn.classList.add('active');
      updateStocksBtn.style.cursor = 'pointer';
    } else {
      updateStocksBtn.disabled = true; // ← ADD THIS LINE
      updateStocksBtn.classList.remove('active');
      updateStocksBtn.style.cursor = 'not-allowed';
    }
  }
}

// Setup delete button handler
// Setup delete button handler
function setupDeleteButton() {
  const btn = document.getElementById('deleteSelectedBtn');
  if (!btn) {
    console.error('Delete button NOT found!');
    return;
  }
  
  console.log('Setting up delete button handler');
  
  // Remove any existing listeners by cloning
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  
  newBtn.addEventListener('click', () => {
    console.log('✕ Delete button clicked!');
    const toDelete = restockData.filter(item => item.checked);
    console.log('Items to delete:', toDelete.length);
    
    if (toDelete.length === 0) {
      alert('⚠️ No items selected. Please check items first.');
      return;
    }
    
    // ✅ USE MODAL INSTEAD OF PROMPT
    showPasswordModal(
      'delete',
      `🔒 Enter password to delete ${toDelete.length} item(s). This action will be logged.`,
      async () => {
        // This runs after correct password
        if (confirm(`Delete ${toDelete.length} selected item(s) from Firebase?`)) {
          try {
            // Delete from Firebase using batch
            const batch = db.batch();
            toDelete.forEach(item => {
              const docRef = db.collection('products').doc(item.id);
              batch.delete(docRef);
            });
            await batch.commit();
            
            // Remove from local array
            restockData = restockData.filter(item => !item.checked);
            
            alert(`✓ ${toDelete.length} item(s) deleted successfully!`);
            console.log('Items deleted successfully from Firebase');
            
            renderRestockItems();
            
            // Refresh inventory and other views
            if (typeof loadProductsFromFirebase === 'function') {
              await loadProductsFromFirebase();
            }
            if (typeof renderInventoryProducts === 'function') {
              renderInventoryProducts();
            }
            
          } catch (error) {
            console.error('Error deleting items:', error);
            alert('❌ Error deleting items: ' + error.message);
          }
        }
      }
    );
  });
  
  console.log('Delete button handler attached successfully');
}

// Update stocks
async function updateStocks() {
  const toUpdate = restockData.filter(item => item.checked && item.newStockQty > 0);
  
  if (toUpdate.length === 0) {
    alert('No items to update. Add stock quantities first.');
    return;
  }
  
  try {
    // Show loading state
    const updateBtn = document.getElementById('updateStocksBtn');
    if (updateBtn) {
      updateBtn.disabled = true;
      updateBtn.innerHTML = '⏳ Updating...';
    }
    
    // Update Firebase using batch
    const batch = db.batch();
    
    toUpdate.forEach(item => {
      const newStock = item.currentStock + item.newStockQty;
      const newCost = item.newCost ? parseFloat(item.newCost) : item.previousCost;
      
      // Determine new status based on stock level
      let newStatus = 'Available';
      if (newStock === 0) {
        newStatus = 'Out of Stock';
      } else if (newStock <= 5) {
        newStatus = 'Low Stock';
      }
      
      const docRef = db.collection('products').doc(item.id);
      batch.update(docRef, {
        quantity: newStock,
        price: newCost,
        status: newStatus,
        lastRestocked: firebase.firestore.FieldValue.serverTimestamp(),
        lastRestockedBy: currentUser?.uid || 'Unknown'
      });
      
      // Update local data
      item.currentStock = newStock;
      if (item.newCost) {
        item.previousCost = newCost;
      }
      item.newStockQty = 0;
      item.newCost = '';
      item.checked = false;
      
      // Update status
      if (newStock === 0) {
        item.status = 'out';
      } else if (newStock <= 5) {
        item.status = 'low';
      } else {
        item.status = 'normal';
      }
    });
    
    await batch.commit();
    
    console.log('✅ Successfully updated', toUpdate.length, 'items in Firebase');
    
    alert(`Successfully updated ${toUpdate.length} item(s)!`);
    
    // Reset button
    if (updateBtn) {
      updateBtn.disabled = false;
      updateBtn.innerHTML = '✓ Update Stocks <span id="updateCounter">(0)</span>';
    }
    
    renderRestockItems();
    
    // Refresh inventory and other views
    if (typeof loadProductsFromFirebase === 'function') {
      await loadProductsFromFirebase();
    }
    if (typeof renderInventoryProducts === 'function') {
      renderInventoryProducts();
    }
    
  } catch (error) {
    console.error('Error updating stocks:', error);
    alert('❌ Error updating stocks: ' + error.message);
    
    // Reset button on error
    const updateBtn = document.getElementById('updateStocksBtn');
    if (updateBtn) {
      updateBtn.disabled = false;
      updateBtn.innerHTML = '✓ Update Stocks <span id="updateCounter">(0)</span>';
    }
  }
}

// Switch restock filter
function switchRestockFilter(filter) {
  currentRestockFilter = filter;
  
  // Update active tab
  document.querySelectorAll('.restock-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.restock-filter-btn[data-filter="${filter}"]`)?.classList.add('active');
  
  renderRestockItems();
}

// Initialize restock listeners
function initRestockListeners() {
  console.log('🟢 Initializing restock listeners');
  
  // Search input
  const searchInput = document.getElementById('restockSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentRestockSearch = e.target.value;
      renderRestockItems();
    });
  }
  
  // Category filter
  const categoryFilter = document.getElementById('restockCategoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      currentRestockCategory = e.target.value;
      renderRestockItems();
    });
  }
  
  // Filter buttons (All, Low Stock, Out of Stock)
  document.querySelectorAll('.restock-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      switchRestockFilter(filter);
    });
  });
  
  // Update Stocks button
  const updateStocksBtn = document.getElementById('updateStocksBtn');
  if (updateStocksBtn) {
    updateStocksBtn.addEventListener('click', updateStocks);
  }
  
  // Delete button
  setupDeleteButton();
  
  console.log('✅ Restock listeners initialized');
}

// Navigate to restock page
const goToRestockBtn = document.getElementById('goToRestockBtn');
if (goToRestockBtn) {
  goToRestockBtn.addEventListener('click', async () => {
    const inventoryPage = document.getElementById('inventory');
    const restockPage = document.getElementById('restockPage');
    
    // Hide inventory page
    if (inventoryPage) {
      inventoryPage.classList.remove('active');
      inventoryPage.style.display = 'none'; // ← ADD THIS
    }
    
    // Show restock page
    if (restockPage) {
      restockPage.style.display = 'block';
      restockPage.classList.add('active'); // ← ADD THIS
    }
    
    // Load fresh data from Firebase
    await loadRestockItems();
    
    // Setup delete button when page opens
    setupDeleteButton();

    // Scroll to top
    window.scrollTo(0, 0);
  });
}

// Navigate back to inventory
const backFromRestockBtn = document.getElementById('backFromRestockBtn');
if (backFromRestockBtn) {
  backFromRestockBtn.addEventListener('click', () => {
    const inventoryPage = document.getElementById('inventory');
    const restockPage = document.getElementById('restockPage');
    
    // Hide restock page
    if (restockPage) {
      restockPage.style.display = 'none';
      restockPage.classList.remove('active'); // ← ADD THIS
    }
    
    // Show inventory page
    if (inventoryPage) {
      inventoryPage.style.display = 'block'; // ← ADD THIS
      inventoryPage.classList.add('active');
    }
  });
}