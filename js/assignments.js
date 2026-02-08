// ═══════════════════════════════════════════════════════════════
// PATIENT ASSIGNMENT SYSTEM - WITH 5-MINUTE UNASSIGN RESTRICTION
// ═══════════════════════════════════════════════════════════════

async function loadPatientAssignments() {
  try {
    const patientsSnapshot = await db.collection('patients')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
      
    allPatientAssignments = [];
    
    patientsSnapshot.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      const assignedAt = data.assignedAt?.toDate();
      
      allPatientAssignments.push({
        id: doc.id,
        patientName: data.name || data.patientName,
        labType: data.labType,
        nurseOnDuty: data.nurseOnDuty,
        assignedTo: data.assignedTo || null,
        assignedBy: data.assignedBy || null,
        assignedAt: assignedAt,
        status: data.status || 'pending',
        date: createdAt ? createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }) : '',
        time: createdAt ? createdAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : ''
      });
    });
    
    renderAssignmentList();
    updateAssignmentCounts();
  } catch (error) {
    console.error('Error loading assignments:', error);
  }
}

// Check if patient can be unassigned (within 5 minutes)
function canUnassignPatient(patient) {
  if (!patient.assignedAt) return false;
  
  const now = new Date();
  const assignedTime = patient.assignedAt;
  const minutesPassed = (now - assignedTime) / 1000 / 60;
  
  return minutesPassed < 5;
}

// Get time remaining to unassign
function getUnassignTimeLeft(patient) {
  if (!patient.assignedAt) return '0:00';
  
  const now = new Date();
  const fiveMinutesLater = new Date(patient.assignedAt.getTime() + 5 * 60 * 1000);
  const msLeft = fiveMinutesLater - now;
  
  if (msLeft <= 0) return '0:00';
  
  const minutesLeft = Math.floor(msLeft / 1000 / 60);
  const secondsLeft = Math.floor((msLeft / 1000) % 60);
  
  return `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
}

function renderAssignmentList() {
  console.log('🟢 renderAssignmentList called');
  const container = document.getElementById('assignmentList');
  console.log('🟢 Container found?', container);
  
  if (!container) {
    console.error('❌ assignmentList element NOT FOUND');
    return;
  }
  
  const searchTerm = document.getElementById('assignmentSearchInput')?.value.toLowerCase() || '';
  
  let filtered = allPatientAssignments.filter(patient => {
    const matchesSearch = !searchTerm || 
      patient.patientName.toLowerCase().includes(searchTerm) ||
      patient.labType.toLowerCase().includes(searchTerm);
    
    if (currentAssignmentFilter === 'pending') {
      return (!patient.assignedTo || patient.status === 'pending') && matchesSearch;
    } else if (currentAssignmentFilter === 'assigned') {
      return (patient.assignedBy === currentUser?.uid && patient.status !== 'completed') && matchesSearch;
    } else if (currentAssignmentFilter === 'completed') {
      return (patient.status === 'completed') && matchesSearch;
    }
    return matchesSearch;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>📋</p><p>No patients found</p></div>';
    return;
  }
  
  container.innerHTML = filtered.map(patient => {
    const canUnassign = canUnassignPatient(patient);
    const timeLeft = canUnassign ? getUnassignTimeLeft(patient) : null;
    
    // Calculate time since assignment
    let timeSinceAssignment = '';
    if (patient.assignedAt) {
      const now = new Date();
      const secondsPassed = Math.floor((now - patient.assignedAt) / 1000);
      const minutesPassed = Math.floor(secondsPassed / 60);
      const secondsRemainder = secondsPassed % 60;
      timeSinceAssignment = `${minutesPassed}m ${secondsRemainder}s`;
    }
    
    // Determine status class and text
    let statusClass = 'pending';
    let statusText = 'Pending';
    
    if (patient.status === 'completed') {
      statusClass = 'completed';
      statusText = 'Completed';
    } else if (patient.assignedTo) {
      statusClass = 'assigned';
      statusText = 'Assigned';
    }
    
    return `
      <div class="assignment-card">
        <div class="assignment-card-header">
          <div class="assignment-patient-info">
            <div class="assignment-patient-name">${patient.patientName}</div>
            <div class="assignment-lab-type">${patient.labType}</div>
          </div>
          <div class="assignment-status-badge ${statusClass}">${statusText}</div>
        </div>
        
        <div class="assignment-card-body">
          <div class="assignment-detail">
            <div class="assignment-detail-label">Date & Time</div>
            <div class="assignment-detail-value">${patient.date} • ${patient.time}</div>
          </div>
          
          <div class="assignment-detail">
            <div class="assignment-detail-label">Nurse on Duty</div>
            <div class="assignment-detail-value">${patient.nurseOnDuty}</div>
          </div>
          
          ${patient.assignedTo ? `
            <div class="assignment-detail">
              <div class="assignment-detail-label">Assigned To</div>
              <div class="assignment-detail-value">${patient.assignedTo}</div>
            </div>
          ` : ''}
        </div>
        
        ${currentAssignmentFilter === 'assigned' && patient.assignedAt ? `
          <div class="assignment-time-info" style="color: ${canUnassign ? '#10b981' : '#ef4444'}; font-size: 0.85rem; margin-top: 0.5rem; padding: 0.5rem; background: ${canUnassign ? '#f0fdf4' : '#fef2f2'}; border-radius: 6px;">
            ${canUnassign ? 
              `⏱️ Assigned ${timeSinceAssignment} ago • Can unassign for ${timeLeft}` : 
              `🔒 Assigned ${timeSinceAssignment} ago • Unassign window closed`
            }
          </div>
        ` : ''}
        
        <div class="assignment-card-footer">
          ${currentAssignmentFilter === 'pending' ? `
            <button class="btn-assign-me" data-id="${patient.id}">
              ✅ Assign to Me
            </button>
          ` : currentAssignmentFilter === 'assigned' ? `
            <button class="btn-unassign ${canUnassign ? '' : 'disabled'}" data-id="${patient.id}" ${!canUnassign ? 'disabled' : ''}>
              ❌ Unassign
            </button>
            <button class="btn-mark-done" data-id="${patient.id}">
              ✓ Mark as Done
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  // Attach event listeners after rendering
  attachAssignmentListeners();
}

function attachAssignmentListeners() {
  // Assign to Me buttons
  document.querySelectorAll('.btn-assign-me').forEach(btn => {
    btn.addEventListener('click', () => {
      const patientId = btn.dataset.id;
      const patient = allPatientAssignments.find(p => p.id === patientId);
      if (patient) assignPatientToMe(patientId, patient.patientName);
    });
  });
  
  // Mark as Done buttons
  document.querySelectorAll('.btn-mark-done').forEach(btn => {
    btn.addEventListener('click', () => {
      const patientId = btn.dataset.id;
      const patient = allPatientAssignments.find(p => p.id === patientId);
      if (patient) markPatientDone(patientId, patient.patientName);
    });
  });
  
  // Unassign buttons
  document.querySelectorAll('.btn-unassign').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return; // Don't do anything if disabled
      
      const patientId = btn.dataset.id;
      const patient = allPatientAssignments.find(p => p.id === patientId);
      if (patient) unassignPatient(patientId, patient.patientName);
    });
  });
}
  

function updateAssignmentCounts() {
  const pending = allPatientAssignments.filter(p => 
    !p.assignedTo || p.status === 'pending'
  ).length;
  
  const assigned = allPatientAssignments.filter(p => 
    p.assignedBy === currentUser?.uid && p.status !== 'completed'
  ).length;
  
  const completed = allPatientAssignments.filter(p => 
    p.status === 'completed'
  ).length;
  
  if (document.getElementById('pendingAssignmentCount'))
    document.getElementById('pendingAssignmentCount').textContent = pending;
  if (document.getElementById('myAssignmentCount'))
    document.getElementById('myAssignmentCount').textContent = assigned;
  if (document.getElementById('completedAssignmentCount'))
    document.getElementById('completedAssignmentCount').textContent = completed;
}

window.switchAssignmentTab = function(filter) {
  currentAssignmentFilter = filter;
  document.querySelectorAll('.assignment-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.filter === filter) tab.classList.add('active');
  });
  renderAssignmentList();
};

async function assignPatientToMe(patientId, patientName) {
  if (!currentUser) {
    alert('Please refresh the page.');
    return;
  }
  
  if (!confirm(`Assign ${patientName} to yourself?`)) return;
  
  try {
    await db.collection('patients').doc(patientId).update({
      assignedTo: currentUser.name || currentUser.email,
      assignedBy: currentUser.uid,
      assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'assigned'
    });
    
    alert('✅ Assigned! You have 5 minutes to unassign if needed.');
    await loadPatientAssignments();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Unassign patient - WITH 5-MINUTE TIME RESTRICTION
async function unassignPatient(patientId, patientName) {
  if (!currentUser) {
    alert('Please refresh the page.');
    return;
  }
  
  // Find the patient to check time
  const patient = allPatientAssignments.find(p => p.id === patientId);
  
  if (!canUnassignPatient(patient)) {
    alert('⚠️ Cannot unassign: 5-minute window has passed');
    return;
  }
  
  if (!confirm(`Unassign ${patientName}? This will move it back to pending.`)) return;
  
  try {
    await db.collection('patients').doc(patientId).update({
      assignedTo: null,
      assignedBy: null,
      assignedAt: null,
      status: 'pending'
    });
    
    alert('✅ Patient unassigned successfully!');
    await loadPatientAssignments();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function markPatientDone(patientId, patientName) {
  if (!confirm(`Mark ${patientName} as completed?`)) return;
  
  try {
    await db.collection('patients').doc(patientId).update({
      status: 'completed',
      completedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert('✅ Completed!');
    await loadPatientAssignments();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Auto-refresh to update countdown timers
let assignmentRefreshInterval;

function startAssignmentRefresh() {
  if (assignmentRefreshInterval) {
    clearInterval(assignmentRefreshInterval);
  }
  
  assignmentRefreshInterval = setInterval(() => {
    const container = document.getElementById('assignmentList');
    if (container && container.offsetParent !== null) {
      renderAssignmentList();
    }
  }, 10000); // Refresh every 10 seconds
}

function stopAssignmentRefresh() {
  if (assignmentRefreshInterval) {
    clearInterval(assignmentRefreshInterval);
    assignmentRefreshInterval = null;
  }
}

function initAssignmentListeners() {
  // Search input
  document.getElementById('assignmentSearchInput')?.addEventListener('input', renderAssignmentList);
  
  // Start auto-refresh for timers
  startAssignmentRefresh();
}