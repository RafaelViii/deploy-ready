// ═══════════════════════════════════════════════════════════════
// INVENTORY SYSTEM
// ═══════════════════════════════════════════════════════════════

function renderInventoryProducts() {
  const tbody = document.getElementById('inventoryProductsBody');
  if (!tbody) return;
  
  const searchTerm = document.getElementById('inventorySearchInput')?.value.toLowerCase() || '';
  
  let filtered = productsMaster.filter(p => {
    const matchesSearch = p.product.toLowerCase().includes(searchTerm) || 
                          p.category.toLowerCase().includes(searchTerm);
    
    let matchesStatus = true;
    if (currentInventoryFilter === 'low') {
      matchesStatus = p.stock > 0 && p.stock < 20;
    } else if (currentInventoryFilter === 'out') {
      matchesStatus = p.stock === 0;
    }
    
    return matchesSearch && matchesStatus;
  });
  
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>${p.category}</td>
      <td>${p.product}</td>
      <td>${p.stock}</td>
      <td>${p.expiry}</td>
      <td>₱${p.price}</td>
    </tr>
  `).join('') || '<tr><td colspan="5">No products</td></tr>';
  
  updateStatusCounts();
}

function updateStatusCounts() {
  const all = productsMaster.length;
  const low = productsMaster.filter(p => p.stock > 0 && p.stock < 20).length;
  const out = productsMaster.filter(p => p.stock === 0).length;
  
  document.getElementById('allCount').textContent = all;
  document.getElementById('lowCount').textContent = low;
  document.getElementById('outCount').textContent = out;
}

function initInventoryListeners() {
  // Status filter boxes
  document.querySelectorAll('.status-box[data-status]').forEach(box => {
    box.addEventListener('click', () => {
      const status = box.dataset.status;
      currentInventoryFilter = status;
      
      document.querySelectorAll('.status-box[data-status]').forEach(b => {
        b.classList.remove('active');
      });
      box.classList.add('active');
      
      renderInventoryProducts();
    });
  });
  
  // Search input
  document.getElementById('inventorySearchInput')?.addEventListener('input', renderInventoryProducts);
  
  // Add product button
  document.getElementById('addProductBtn')?.addEventListener('click', () => {
    document.getElementById('addProductModal').classList.add('active');
  });
  
  // Add new product box
  document.getElementById('addNewProductBox')?.addEventListener('click', () => {
    document.getElementById('addProductModal').classList.add('active');
  });
  
  // Close modal
  document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('addProductModal').classList.remove('active');
  });
  
  // Add product form
  document.getElementById('addProductForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    
    const newProduct = {
      product: document.getElementById('productName').value.trim(),
      category: document.getElementById('productCategory').value,
      expiry: document.getElementById('productExpiry').value,
      stock: parseInt(document.getElementById('productQty').value) || 0,
      price: parseFloat(document.getElementById('productPrice')?.value) || 0
    };
    
    try {
      await saveProductToFirebase(newProduct);
      productsMaster.push(newProduct);
      document.getElementById('addProductModal').classList.remove('active');
      e.target.reset();
      renderInventoryProducts();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}

function populateCategoryDropdown() {
  const select = document.getElementById('productCategory');
  if (select) {
    select.innerHTML = '<option value="">Select Category</option>' +
      categories.map(c => `<option value="${c}">${c}</option>`).join('');
  }
}
