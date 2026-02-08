// ═══════════════════════════════════════════════════════════════
// PATIENT / LABORATORY SYSTEM - READ ONLY TABLE VIEW
// ═══════════════════════════════════════════════════════════════

function renderPatientRecords() {
  const tbody = document.getElementById('patientRecordsBody');
  if (!tbody) return;
  
  tbody.innerHTML = patientRecords.map((r, index) => {
    return `
      <tr>
        <td>${r.timestamp}</td>
        <td>${r.date}</td>
        <td>${r.patientName}</td>
        <td>${r.labType}</td>
        <td>${r.nurseOnDuty}</td>
        <td>
          ${r.assigned ? `
            <span style="
              background: #10b981;
              color: white;
              padding: 0.25rem 0.75rem;
              border-radius: 4px;
              font-size: 0.75rem;
            ">
              ✓ ${r.assigned}
            </span>
          ` : `
            <span style="
              background: #f59e0b;
              color: white;
              padding: 0.25rem 0.75rem;
              border-radius: 4px;
              font-size: 0.75rem;
            ">
              Pending
            </span>
          `}
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="6">No records</td></tr>';
}

function populateLabTypeSelect() {
  const select = document.getElementById('labTypeSelect');
  if (select) {
    select.innerHTML = '<option value="">Select Lab Type</option>' +
      labTypes.map(l => `<option value="${l}">${l}</option>`).join('');
  }
}

function renderLabTypesList() {
  const container = document.getElementById('labTypesList');
  if (!container) return;
  
  container.innerHTML = labTypes.map((type, index) => `
    <div class="lab-type-item">
      <span>${type}</span>
      <button class="btn-delete-lab-type" data-index="${index}">🗑️ Delete</button>
    </div>
  `).join('');
  
  // Attach delete listeners
  document.querySelectorAll('.btn-delete-lab-type').forEach(btn => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.dataset.index);
      const labTypeName = labTypes[index];
      
      if (!confirm(`Delete "${labTypeName}"?`)) return;
      
      try {
        labTypes.splice(index, 1);
        await saveLabTypesToFirebase();
        renderLabTypesList();
        populateLabTypeSelect();
        alert(`✅ Deleted "${labTypeName}"`);
      } catch (error) {
        alert('Error deleting lab type: ' + error.message);
      }
    });
  });
}

function initPatientListeners() {
  // Add patient button
  document.getElementById('addPatientBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('patientNameInput').value.trim();
    const labType = document.getElementById('labTypeSelect').value;
    
    if (!name || !labType) {
      return alert('⚠️ Fill all fields');
    }
    
    const date = new Date();
    const record = {
      name: name, // Changed from patientName to name
      patientName: name, // Keep both for compatibility
      labType: labType,
      nurseOnDuty: currentUser?.name || 'Unknown',
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      timestamp: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    };
    
    try {
      // Save to Firebase 'patients' collection
      const docRef = await db.collection('patients').add(record);
      
      // Add to local array with the ID
      record.id = docRef.id;
      patientRecords.unshift(record);
      
      // Clear inputs
      document.getElementById('patientNameInput').value = '';
      document.getElementById('labTypeSelect').value = '';
      
      renderPatientRecords();
      
      alert('✅ Patient added! Go to Assignment tab to assign.');
      
      // Reload assignments if that function exists
      if (typeof loadPatientAssignments === 'function') {
        await loadPatientAssignments();
      }
    } catch (e) {
      alert('Error: ' + e.message);
      console.error('Firebase error:', e);
    }
  });
  
  // Add lab type button
  document.getElementById('addLabTypeBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('newLabTypeInput');
    const newType = input?.value.trim();
    
    if (!newType) {
      alert('Please enter a lab type name');
      return;
    }
    
    if (labTypes.includes(newType)) {
      alert('This lab type already exists');
      return;
    }
    
    try {
      labTypes.push(newType);
      await saveLabTypesToFirebase();
      renderLabTypesList();
      populateLabTypeSelect();
      input.value = '';
      alert(`✅ Added "${newType}"`);
    } catch (error) {
      alert('Error adding lab type: ' + error.message);
      labTypes.pop();
    }
  });
  
  // Enter key for new lab type
  document.getElementById('newLabTypeInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('addLabTypeBtn')?.click();
    }
  });
}

// ════════════════════════════════════════════════════════════════
// FIREBASE HELPER FUNCTIONS - FIXED TO ACTUALLY SAVE
// ════════════════════════════════════════════════════════════════

async function saveLabTypesToFirebase() {
  try {
    await db.collection('settings').doc('lab_types').set({ 
      types: labTypes,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Saved lab types:', labTypes);
    return true;
  } catch (error) {
    console.error('Error saving lab types to Firebase:', error);
    throw error;
  }
}

// Load lab types from Firebase
async function loadLabTypesFromFirebase() {
  try {
    const doc = await db.collection('settings').doc('lab_types').get();
    if (doc.exists) {
      labTypes = doc.data().types || [];
    } else {
      // Initialize with default lab types
      labTypes = ['Blood Test', 'Urine Test', 'X-Ray', 'CT Scan', 'MRI'];
      await saveLabTypesToFirebase();
    }
    populateLabTypeSelect();
    renderLabTypesList();
  } catch (error) {
    console.error('Error loading lab types:', error);
  }
}

// Load patient records from Firebase
async function loadPatientRecordsFromFirebase() {
  try {
    const snapshot = await db.collection('patients')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    patientRecords = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      
      patientRecords.push({
        id: doc.id,
        patientName: data.name || data.patientName,
        labType: data.labType,
        nurseOnDuty: data.nurseOnDuty,
        assigned: data.assignedTo || '',
        assignedTimestamp: data.assignedAt?.toDate(),
        assignedBy: data.assignedBy,
        status: data.status,
        date: createdAt ? createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : '',
        timestamp: createdAt ? createdAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }) : ''
      });
    });
    
    renderPatientRecords();
  } catch (error) {
    console.error('Error loading patient records:', error);
  }
}