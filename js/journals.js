// ═══════════════════════════════════════════════════════════════
// JOURNALS / CHARGE SLIP SYSTEM
// ═══════════════════════════════════════════════════════════════

function renderJournalItems() {
  const list = document.getElementById('journalItemsList');
  if (!list) return;
  
  if (journalCurrentItems.length === 0) {
    list.innerHTML = '<div class="empty-journal"><p>No items • Tap category to start</p></div>';
    return;
  }
  
  let html = '';
  let total = 0;
  
  journalCurrentItems.forEach((item, idx) => {
    html += `
      <div class="journal-item">
        <div>${item.name}</div>
        <div>${item.quantity} × ₱${item.price}</div>
        <div>₱${item.total}</div>
      </div>
    `;
    total += item.total;
  });
  
  html += `
    <div class="journal-total">
      <strong>TOTAL</strong>
      <strong>₱${total}</strong>
    </div>
  `;
  
  list.innerHTML = html;
}

window.backToCategories = function() {
  document.getElementById('journalCategoryGrid').classList.remove('journal-hidden');
  document.getElementById('journalProductGrid').classList.add('journal-hidden');
  document.getElementById('journalSelectionTitle').textContent = 'Select Category';
};

window.selectProduct = function(name, price) {
  window.selectedProduct = { name, price };
  document.getElementById('journalAddItemBtn').disabled = false;
};

function initJournalListeners() {
  // Quantity controls
  document.getElementById('journalIncreaseQty')?.addEventListener('click', () => {
    currentJournalQty++;
    document.getElementById('journalQtyDisplay').textContent = currentJournalQty;
  });
  
  document.getElementById('journalDecreaseQty')?.addEventListener('click', () => {
    if (currentJournalQty > 1) {
      currentJournalQty--;
      document.getElementById('journalQtyDisplay').textContent = currentJournalQty;
    }
  });
  
  // Category selection
  document.getElementById('journalCategoryGrid')?.addEventListener('click', e => {
    const btn = e.target.closest('.journal-grid-btn');
    if (!btn) return;
    
    const category = btn.dataset.category;
    const products = journalDB[category] || [];
    
    document.getElementById('journalSelectionTitle').textContent = category;
    document.getElementById('journalProductGrid').innerHTML = 
      '<button class="journal-back-btn" onclick="backToCategories()">← Back</button>' +
      products.map(p => `
        <button class="journal-grid-btn" onclick="selectProduct('${p.name}', ${p.price})">
          ${p.name}<br/>₱${p.price}
        </button>
      `).join('');
    
    document.getElementById('journalCategoryGrid').classList.add('journal-hidden');
    document.getElementById('journalProductGrid').classList.remove('journal-hidden');
  });
  
  // Add item to list
  document.getElementById('journalAddItemBtn')?.addEventListener('click', () => {
    if (!window.selectedProduct) return;
    
    const qty = currentJournalQty;
    journalCurrentItems.push({
      name: window.selectedProduct.name,
      price: window.selectedProduct.price,
      quantity: qty,
      total: window.selectedProduct.price * qty
    });
    
    renderJournalItems();
    document.getElementById('journalOkBtn').disabled = false;
    
    // Reset
    currentJournalQty = 1;
    document.getElementById('journalQtyDisplay').textContent = '1';
    window.selectedProduct = null;
    document.getElementById('journalAddItemBtn').disabled = true;
  });
  
  // Save charge slip
  document.getElementById('journalOkBtn')?.addEventListener('click', async () => {
    const patientName = document.getElementById('journalPatientName')?.value.trim();
    
    if (!patientName) {
      alert('Please enter patient name');
      return;
    }
    
    if (journalCurrentItems.length === 0) {
      alert('Please add items to the charge slip');
      return;
    }
    
    if (!currentUser) {
      alert('User not logged in');
      return;
    }
    
    const slipId = 'CS_' + Date.now();
    const total = journalCurrentItems.reduce((sum, item) => sum + item.total, 0);
    const itemCount = journalCurrentItems.reduce((sum, item) => sum + item.quantity, 0);
    
    try {
      const serverTS = firebase.firestore.FieldValue.serverTimestamp();
      
      // Save charge slip
      await db.collection('chargeSlips').doc(slipId).set({
        receiptId: slipId,
        patientName: patientName,
        nurseId: currentUser.uid,
        nurseName: currentUser.name || currentUser.email,
        date: new Date().toISOString().split('T')[0],
        total: total,
        itemCount: itemCount,
        items: journalCurrentItems,
        status: 'saved',
        createdAt: serverTS
      });
      
      // Save to sales collection
      await db.collection('sales').doc(slipId).set({
        receiptId: slipId,
        patientName: patientName,
        nurseId: currentUser.uid,
        nurseName: currentUser.name || currentUser.email,
        date: new Date().toISOString().split('T')[0],
        total: total,
        itemCount: itemCount,
        items: journalCurrentItems,
        createdAt: serverTS
      });
      
      alert(`✅ Charge slip saved! Receipt: ${slipId}`);
      
      // Reset form
      journalCurrentItems = [];
      renderJournalItems();
      document.getElementById('journalPatientName').value = '';
      document.getElementById('journalOkBtn').disabled = true;
    } catch (error) {
      console.error('Error saving charge slip:', error);
      alert('Error saving charge slip: ' + error.message);
    }
  });
  
  // Recent button
  document.getElementById('journalRecentBtn')?.addEventListener('click', () => {
    alert('Recent receipts feature coming soon!');
  });
}
