// ═══════════════════════════════════════════════════════════════
// MANUAL INVENTORY UPDATE SYSTEM - FIREBASE INTEGRATED
// ═══════════════════════════════════════════════════════════════

let manualUpdateData = [];
let currentManualUpdateSearch = '';
let currentManualUpdateCategory = 'all';

// ═══════════════════════════════════════════════════════════════
// LOAD DATA FROM FIREBASE
// ═══════════════════════════════════════════════════════════════

async function loadManualUpdateItems() {
  try {
    console.log('🔵 Loading manual update items from Firebase...');
    
    const snapshot = await db.collection('products').get();
    
    manualUpdateData = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      manualUpdateData.push({
        id: doc.id,
        product: data.name,
        category: data.category,
        expiry: data.expiry || data.expiryDate || new Date().toISOString().split('T')[0],
        stock: data.quantity || 0,
        price: data.price || 0,
        monthlySold: data.monthlySold || 0
      });
    });
    
    console.log('🔵 Manual update items loaded:', manualUpdateData.length, manualUpdateData);
    
    populateManualUpdateCategoryFilter();
    renderManualUpdateList();
    
  } catch (error) {
    console.error('❌ Error loading manual update items:', error);
    alert('Error loading products: ' + error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// POPULATE CATEGORY FILTER
// ═══════════════════════════════════════════════════════════════

function populateManualUpdateCategoryFilter() {
  const select = document.getElementById('manualUpdateCategoryFilter');
  if (!select) {
    console.log('⚠️ manualUpdateCategoryFilter not found');
    return;
  }
  
  const categories = [...new Set(manualUpdateData.map(item => item.category))].filter(Boolean).sort();
  
  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  
  console.log('✅ Populated category filter with', categories.length, 'categories');
}

// ═══════════════════════════════════════════════════════════════
// RENDER MANUAL UPDATE LIST
// ═══════════════════════════════════════════════════════════════

function renderManualUpdateList() {
  console.log('🔵 Rendering manual update list...');
  
  const container = document.getElementById('manualUpdateList');
  if (!container) {
    console.error('❌ manualUpdateList container not found!');
    return;
  }
  
  console.log('Container found:', container);
  console.log('Data to render:', manualUpdateData.length, 'items');
  
  // Update date display
  const dateDisplay = document.getElementById('manualUpdateDateDisplay');
  if (dateDisplay) {
    const date = new Date();
    dateDisplay.textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Filter products
  let filtered = manualUpdateData.filter(item => {
    const matchesSearch = !currentManualUpdateSearch || 
      item.product.toLowerCase().includes(currentManualUpdateSearch.toLowerCase());
    
    const matchesCategory = currentManualUpdateCategory === 'all' || 
      item.category === currentManualUpdateCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  console.log('Filtered items:', filtered.length);
  
  // Sort by category then name
  filtered.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.product.localeCompare(b.product);
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p>No products found</p>
        <p style="font-size: 0.9rem; color: #6b7280;">Total products in database: ${manualUpdateData.length}</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  filtered.forEach(item => {
    // Determine stock status color
    let stockColor = '#10b981'; // Green for good stock
    if (item.stock === 0) {
      stockColor = '#dc2626'; // Red
    } else if (item.stock < 20) {
      stockColor = '#f59e0b'; // Orange
    }
    
    html += `
      <div class="manual-update-item">
        <div class="manual-update-item-info">
          <div class="manual-update-item-name">${item.product}</div>
          <span class="manual-update-item-category">${item.category}</span>
        </div>
        
        <div class="manual-update-field">
          <div class="manual-update-field-label">Expiry Date</div>
          <div class="manual-update-field-value">${formatManualDate(item.expiry)}</div>
        </div>
        
        <div class="manual-update-field">
          <div class="manual-update-field-label">Current Stock</div>
          <div class="manual-update-field-value manual-current-stock" 
               data-product-id="${item.id}"
               data-original-stock="${item.stock}"
               style="color: ${stockColor}; font-weight: 700;">
            ${item.stock}
          </div>
        </div>
        
        <div class="manual-update-field">
          <div class="manual-update-field-label">Sales (Edit)</div>
          <input type="number" 
                 class="manual-sales-input" 
                 data-product-id="${item.id}" 
                 value="0" 
                 min="0"
                 max="${item.stock}"
                 placeholder="Enter sales quantity">
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  console.log('✅ Rendered', filtered.length, 'items');
  
  // Attach event listeners
  attachManualUpdateListeners();
}

// ═══════════════════════════════════════════════════════════════
// FORMAT DATE HELPER
// ═══════════════════════════════════════════════════════════════

function formatManualDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (e) {
    return 'N/A';
  }
}

// ═══════════════════════════════════════════════════════════════
// ATTACH EVENT LISTENERS TO INPUTS
// ═══════════════════════════════════════════════════════════════

function attachManualUpdateListeners() {
  console.log('🔵 Attaching manual update listeners...');
  
  const inputs = document.querySelectorAll('.manual-sales-input');
  console.log('Found', inputs.length, 'input fields');
  
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const productId = e.target.dataset.productId;
      const stockDisplay = document.querySelector(`.manual-current-stock[data-product-id="${productId}"]`);
      
      if (!stockDisplay) return;
      
      const originalStock = parseInt(stockDisplay.dataset.originalStock);
      const salesQty = parseInt(e.target.value) || 0;
      const newStock = Math.max(0, originalStock - salesQty);
      
      // Update display
      stockDisplay.textContent = newStock;
      
      // Update color based on new stock level
      if (newStock === 0) {
        stockDisplay.style.color = '#dc2626'; // Red
      } else if (newStock < 20) {
        stockDisplay.style.color = '#f59e0b'; // Orange
      } else {
        stockDisplay.style.color = '#10b981'; // Green
      }
      
      // Highlight the input if changed
      if (salesQty > 0) {
        e.target.style.background = '#fef3c7';
        e.target.style.borderColor = '#f59e0b';
      } else {
        e.target.style.background = '';
        e.target.style.borderColor = '';
      }
    });
    
    // Prevent negative values and values greater than stock
    input.addEventListener('blur', (e) => {
      const productId = e.target.dataset.productId;
      const stockDisplay = document.querySelector(`.manual-current-stock[data-product-id="${productId}"]`);
      const originalStock = parseInt(stockDisplay.dataset.originalStock);
      
      let value = parseInt(e.target.value) || 0;
      
      if (value < 0) value = 0;
      if (value > originalStock) value = originalStock;
      
      e.target.value = value;
    });
  });
  
  console.log('✅ Listeners attached');
}

// ═══════════════════════════════════════════════════════════════
// SAVE MANUAL UPDATES TO FIREBASE
// ═══════════════════════════════════════════════════════════════

async function saveManualUpdates() {
  console.log('💾 Saving manual updates...');
  
  const inputs = document.querySelectorAll('.manual-sales-input');
  let updates = [];
  
  inputs.forEach(input => {
    const salesQty = parseInt(input.value);
    if (salesQty && salesQty > 0) {
      const productId = input.dataset.productId;
      const product = manualUpdateData.find(p => p.id === productId);
      
      if (product) {
        const newStock = Math.max(0, product.stock - salesQty);
        updates.push({ 
          id: productId,
          product: product.product, 
          salesQty: salesQty,
          originalStock: product.stock,
          newStock: newStock
        });
      }
    }
  });
  
  console.log('Updates to save:', updates);
  
  if (updates.length === 0) {
    alert('ℹ️ No sales data entered.\n\nPlease enter sales quantities to update.');
    return;
  }
  
  // Show confirmation with details
  const summary = updates.map(u => 
    `• ${u.product}: ${u.originalStock} → ${u.newStock} (${u.salesQty} sold)`
  ).join('\n');
  
  if (!confirm(`💾 Save sales data for ${updates.length} product(s)?\n\n${summary}`)) {
    return;
  }
  
  try {
    // Show saving animation
    const saveBtn = document.getElementById('saveManualUpdatesBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = '💾 Saving...';
      saveBtn.style.opacity = '0.6';
    }
    
    // Update Firebase using batch
    const batch = db.batch();
    
    for (const update of updates) {
      const newStatus = update.newStock === 0 ? 'Out of Stock' : 
                        update.newStock <= 5 ? 'Low Stock' : 'Available';
      
      const docRef = db.collection('products').doc(update.id);
      batch.update(docRef, {
        quantity: update.newStock,
        status: newStatus,
        monthlySold: firebase.firestore.FieldValue.increment(update.salesQty),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdatedBy: window.currentUser?.uid || 'Unknown'
      });
      
      // Update local data
      const product = manualUpdateData.find(p => p.id === update.id);
      if (product) {
        product.stock = update.newStock;
        product.monthlySold += update.salesQty;
      }
    }
    
    await batch.commit();
    
    console.log('✅ Successfully updated', updates.length, 'products in Firebase');
    
    // Success state
    if (saveBtn) {
      saveBtn.textContent = '✅ Saved!';
      saveBtn.style.background = '#10b981';
      saveBtn.style.opacity = '1';
    }
    
    // Update inventory view if needed
    if (typeof loadProductsFromFirebase === 'function') {
      await loadProductsFromFirebase();
    }
    if (typeof renderInventoryProducts === 'function') {
      renderInventoryProducts();
    }
    
    // Show success message
    alert(`✅ Successfully saved sales for ${updates.length} product(s)!`);
    
    // Close and return after delay
    setTimeout(() => {
      const manualUpdatePage = document.getElementById('manualUpdatePage');
      const inventoryPage = document.getElementById('inventory');
      
      if (manualUpdatePage) {
        manualUpdatePage.style.display = 'none';
        manualUpdatePage.classList.remove('active');
      }
      
      if (inventoryPage) {
        inventoryPage.style.display = 'block';
        inventoryPage.classList.add('active');
      }
      
      // Reset button state
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save All Changes';
        saveBtn.style.background = '#2563eb';
        saveBtn.style.opacity = '1';
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error saving manual updates:', error);
    alert('❌ Error saving updates: ' + error.message);
    
    // Reset button on error
    const saveBtn = document.getElementById('saveManualUpdatesBtn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '💾 Save All Changes';
      saveBtn.style.background = '#2563eb';
      saveBtn.style.opacity = '1';
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZE MANUAL UPDATE LISTENERS (SEARCH, FILTER, SAVE)
// ═══════════════════════════════════════════════════════════════

function initManualUpdateListeners() {
  console.log('🟢 Initializing manual update listeners');
  
  // Search input
  const searchInput = document.getElementById('manualUpdateSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentManualUpdateSearch = e.target.value;
      renderManualUpdateList();
    });
    console.log('✅ Search listener attached');
  }
  
  // Category filter
  const categoryFilter = document.getElementById('manualUpdateCategoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      currentManualUpdateCategory = e.target.value;
      renderManualUpdateList();
    });
    console.log('✅ Category filter listener attached');
  }
  
  // Save button
  const saveBtn = document.getElementById('saveManualUpdatesBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveManualUpdates);
    console.log('✅ Save button listener attached');
  }
  
  console.log('✅ Manual update listeners initialized');
}

// ═══════════════════════════════════════════════════════════════
// MANUAL UPDATE NAVIGATION (PASSWORD PROTECTED)
// ═══════════════════════════════════════════════════════════════

function initManualUpdateNavigation() {
  console.log('🔍 Initializing manual update navigation...');
  
  // Navigate to manual update page (with password protection)
  const goToManualUpdateBtn = document.getElementById('goToManualUpdateBtn');
  console.log('🔍 goToManualUpdateBtn element:', goToManualUpdateBtn);
  
  if (goToManualUpdateBtn) {
    console.log('✅ Button found! Attaching listener...');
    
    goToManualUpdateBtn.addEventListener('click', () => {
      console.log('🔐 Manual Update button CLICKED!!!');
      
      const myCallback = async () => {
        console.log('🎉 CALLBACK IS RUNNING!');
        
        const timestamp = new Date().toLocaleString();
        console.log(`✅ Manual Inventory Update accessed at ${timestamp} by ${window.currentUser?.email || 'Unknown'}`);
        
        const inventoryPage = document.getElementById('inventory');
        const manualUpdatePage = document.getElementById('manualUpdatePage');
        
        console.log('Inventory page element:', inventoryPage);
        console.log('Manual Update page element:', manualUpdatePage);
        
        if (inventoryPage) {
          inventoryPage.classList.remove('active');
          inventoryPage.style.display = 'none';
          console.log('✅ Inventory page hidden');
        }
        
        if (manualUpdatePage) {
          manualUpdatePage.style.display = 'block';
          manualUpdatePage.classList.add('active');
          console.log('✅ Manual update page shown');
        }
        
        console.log('📥 Loading manual update data...');
        await loadManualUpdateItems();
        
        window.scrollTo(0, 0);
      };
      
      console.log('🔍 About to call showPasswordModal...');
      showPasswordModal(
        'manual-update',
        '🔒 Enter password to access Manual Inventory Update.',
        myCallback
      );
    });
    
    console.log('✅ Manual update button listener attached!');
  } else {
    console.error('❌ goToManualUpdateBtn NOT FOUND in DOM!');
    console.log('Available buttons with "manual" in ID:');
    document.querySelectorAll('[id*="manual"]').forEach(el => {
      console.log('  -', el.id, el);
    });
  }
  
  // Back button
  const backFromManualUpdateBtn = document.getElementById('backFromManualUpdateBtn');
  console.log('🔍 backFromManualUpdateBtn element:', backFromManualUpdateBtn);
  
  if (backFromManualUpdateBtn) {
    backFromManualUpdateBtn.addEventListener('click', () => {
      console.log('🔙 Back button clicked');
      
      const manualUpdatePage = document.getElementById('manualUpdatePage');
      const inventoryPage = document.getElementById('inventory');
      
      if (manualUpdatePage) {
        manualUpdatePage.style.display = 'none';
        manualUpdatePage.classList.remove('active');
      }
      
      if (inventoryPage) {
        inventoryPage.classList.add('active');
        inventoryPage.style.display = 'block';
      }
    });
    console.log('✅ Back button listener attached');
  } else {
    console.error('❌ backFromManualUpdateBtn NOT FOUND in DOM!');
  }
}