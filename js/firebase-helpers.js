// ═══════════════════════════════════════════════════════════════
// 🔥 FIREBASE HELPERS
// ═══════════════════════════════════════════════════════════════

const TS = firebase.firestore.Timestamp;
const tsToDate = v => v?.toDate ? v.toDate() : new Date(v);
const todayKey = () => new Date().toISOString().split("T")[0];

// ────────────────────────────────────────────────────────────────
// PRODUCTS
// ────────────────────────────────────────────────────────────────

async function loadProductsFromFirebase() {
  const snapshot = await db.collection("products").get();
  productsMaster.length = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    productsMaster.push({
      id: doc.id,
      product: data.name,
      category: data.category,
      expiry: data.expiryDate?.toDate?.()?.toISOString().split("T")[0] || data.expiryDate,
      stock: data.quantity || 0,
      price: data.price || 0
    });
  });
  
  renderInventoryProducts?.();
  updateStatusCounts?.();
  updateDashboardInventoryCounts?.();
}

async function saveProductToFirebase(product) {
  try {
    const docRef = await db.collection("products").add({
      name: product.product,
      category: product.category,
      expiryDate: product.expiry,
      quantity: product.stock,
      price: product.price,
      status: product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'Available',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    product.id = docRef.id;
    return docRef;
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// ────────────────────────────────────────────────────────────────
// PATIENTS
// ────────────────────────────────────────────────────────────────

async function savePatientToFirebase(p) {
  await db.collection("patients").add({
    name: p.patientName,
    labType: p.labType,
    nurseOnDuty: p.nurseOnDuty,
    assignedTo: null,
    status: "pending",
    createdAt: TS.now()
  });
}

async function loadPatientsFromFirebase() {
  try {
    const snapshot = await db.collection("patients")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
      
    patientRecords = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      
      patientRecords.push({
        id: doc.id,
        timestamp: createdAt ? createdAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) : '',
        date: createdAt ? createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : '',
        patientName: data.name || data.patientName || '',
        labType: data.labType || '',
        nurseOnDuty: data.nurseOnDuty || '',
        assigned: data.assignedTo || 'Pending'
      });
    });
    
    renderPatientRecords();
  } catch (error) {
    console.error('Error loading patients:', error);
  }
}

// ────────────────────────────────────────────────────────────────
// CHARGE SLIPS & SALES
// ────────────────────────────────────────────────────────────────

async function saveChargeSlipToFirebase(slip) {
  // Save charge slip
  await db.collection("chargeSlips").add({
    patientName: slip.patientName,
    nurseName: slip.nurseName,
    items: slip.items,
    total: slip.total,
    createdAt: TS.now()
  });
  
  // Save to daily sales
  await db.collection("dailySales")
    .doc(todayKey())
    .collection("transactions")
    .add({
      patientName: slip.patientName,
      nurseName: slip.nurseName,
      items: slip.items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      total: slip.total,
      createdAt: TS.now()
    });
  
  // Update product stock
  for (const item of slip.items) {
    const product = productsMaster.find(p => p.product === item.name);
    if (product?.id) {
      const newStock = Math.max(0, product.stock - item.quantity);
      await db.collection("products").doc(product.id).update({
        quantity: newStock,
        status: newStock === 0 ? "Out of Stock" : newStock <= 5 ? "Low Stock" : "Available"
      });
      product.stock = newStock;
    }
  }
}

// ────────────────────────────────────────────────────────────────
// LAB TYPES
// ────────────────────────────────────────────────────────────────

async function loadLabTypesFromFirebase() {
  try {
    const doc = await db.collection('config').doc('lab_types').get();
    if (doc.exists) {
      labTypes = doc.data().types || [
        'Complete Blood Count (CBC)',
        'Urinalysis',
        'Blood Chemistry',
        'X-Ray',
        'ECG'
      ];
    }
    populateLabTypeSelect();
  } catch (error) {
    console.error('Error loading lab types:', error);
  }
}

async function saveLabTypesToFirebase() {
  try {
    await db.collection('config').doc('lab_types').set({
      types: labTypes,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving lab types:', error);
    throw error;
  }
}
