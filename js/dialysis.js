// ═══════════════════════════════════════════════════════════════
// DIALYSIS MANAGEMENT SYSTEM - FULL FEATURED
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════

let dialysisPatients = [];
let dialysisMachines = [];
let dialysisSessions = [];
let currentDialysisFilter = 'active'; // active, scheduled, completed
let currentDialysisView = 'sessions'; // sessions, patients, machines, schedule, reports

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function initDialysisSystem() {
  console.log('🏥 Initializing Dialysis Management System');
  
  // Load initial data
  loadDialysisData();
  
  // Initialize listeners
  initDialysisListeners();
  
  console.log('✅ Dialysis system initialized');
}

async function loadDialysisData() {
  try {
    await Promise.all([
      loadDialysisPatients(),
      loadDialysisMachines(),
      loadDialysisSessions()
    ]);
    
    renderDialysisView();
  } catch (error) {
    console.error('Error loading dialysis data:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// LOAD DATA FROM FIREBASE
// ═══════════════════════════════════════════════════════════════

async function loadDialysisPatients() {
  try {
    const snapshot = await db.collection('dialysisPatients')
      .orderBy('createdAt', 'desc')
      .get();
    
    dialysisPatients = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      dialysisPatients.push({
        id: doc.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        dialysisSchedule: data.dialysisSchedule, // e.g., "MWF", "TTS"
        dryWeight: data.dryWeight,
        accessType: data.accessType, // AVF, AVG, Catheter
        diagnosis: data.diagnosis,
        notes: data.notes,
        status: data.status || 'active', // active, inactive
        createdAt: data.createdAt?.toDate(),
        lastSession: data.lastSession?.toDate()
      });
    });
    
    console.log('✅ Loaded', dialysisPatients.length, 'dialysis patients');
  } catch (error) {
    console.error('Error loading dialysis patients:', error);
  }
}

async function loadDialysisMachines() {
  try {
    const snapshot = await db.collection('dialysisMachines').get();
    
    dialysisMachines = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      dialysisMachines.push({
        id: doc.id,
        machineNumber: data.machineNumber,
        brand: data.brand,
        model: data.model,
        status: data.status || 'available', // available, in-use, maintenance
        currentPatient: data.currentPatient || null,
        lastMaintenance: data.lastMaintenance?.toDate(),
        nextMaintenance: data.nextMaintenance?.toDate()
      });
    });
    
    console.log('✅ Loaded', dialysisMachines.length, 'dialysis machines');
  } catch (error) {
    console.error('Error loading dialysis machines:', error);
  }
}

async function loadDialysisSessions() {
  try {
    // Load ALL sessions (no date filter since we have mixed string/Timestamp dates)
    const snapshot = await db.collection('dialysisSessions')
      .orderBy('createdAt', 'desc')
      .get();
    
    dialysisSessions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Handle sessionDate - can be Timestamp OR string
      let sessionDate;
      try {
        if (data.sessionDate?.toDate) {
          // It's a Firestore Timestamp
          sessionDate = data.sessionDate.toDate();
        } else if (typeof data.sessionDate === 'string') {
          // It's a string like "2026-02-08"
          const [year, month, day] = data.sessionDate.split('-');
          const [hours, minutes] = (data.scheduledTime || '00:00').split(':');
          sessionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        } else {
          // Fallback to now
          console.warn('Invalid sessionDate for', doc.id, data.sessionDate);
          sessionDate = new Date();
        }
      } catch (err) {
        console.error('Error parsing date for session', doc.id, err);
        sessionDate = new Date();
      }
      
      dialysisSessions.push({
        id: doc.id,
        patientId: data.patientId,
        patientName: data.patientName,
        machineId: data.machineId,
        machineNumber: data.machineNumber,
        sessionDate: sessionDate,
        scheduledTime: data.scheduledTime,
        status: data.status, // scheduled, active, completed, cancelled
        
        // Times
        startTime: data.startTime?.toDate?.(),
        endTime: data.endTime?.toDate?.(),
        duration: data.duration,
        
        // Pre-dialysis vitals
        preVitals: data.preVitals || {},
        
        // Treatment parameters
        treatment: data.treatment || {},
        
        // During dialysis (hourly checks)
        duringVitals: data.duringVitals || [],
        
        // Post-dialysis vitals
        postVitals: data.postVitals || {},
        
        // Notes
        complications: data.complications || '',
        notes: data.notes || '',
        
        createdAt: data.createdAt?.toDate?.(),
        createdBy: data.createdBy
      });
    });
    
    console.log('✅ Loaded', dialysisSessions.length, 'dialysis sessions');
  } catch (error) {
    console.error('Error loading dialysis sessions:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// RENDER MAIN VIEW
// ═══════════════════════════════════════════════════════════════

function renderDialysisView() {
  switch (currentDialysisView) {
    case 'sessions':
      renderSessionsView();
      break;
    case 'patients':
      renderPatientsView();
      break;
    case 'machines':
      renderMachinesView();
      break;
    case 'schedule':
      renderScheduleView();
      break;
    case 'reports':
      renderReportsView();
      break;
  }
  
  updateDialysisStats();
}

function updateDialysisStats() {
  const activeSessions = dialysisSessions.filter(s => s.status === 'active').length;
  const scheduledSessions = dialysisSessions.filter(s => s.status === 'scheduled').length;
  const activePatients = dialysisPatients.filter(p => p.status === 'active').length;
  const availableMachines = dialysisMachines.filter(m => m.status === 'available').length;
  
  document.getElementById('activeSessionsCount').textContent = activeSessions;
  document.getElementById('scheduledSessionsCount').textContent = scheduledSessions;
  document.getElementById('dialysisPatientsCount').textContent = activePatients;
  document.getElementById('availableMachinesCount').textContent = availableMachines;
}

// ═══════════════════════════════════════════════════════════════
// SESSIONS VIEW
// ═══════════════════════════════════════════════════════════════

function renderSessionsView() {
  const container = document.getElementById('dialysisMainContent');
  if (!container) return;
  
  let filtered = dialysisSessions;
  
  if (currentDialysisFilter === 'active') {
    filtered = dialysisSessions.filter(s => s.status === 'active');
  } else if (currentDialysisFilter === 'scheduled') {
    filtered = dialysisSessions.filter(s => s.status === 'scheduled');
  } else if (currentDialysisFilter === 'completed') {
    filtered = dialysisSessions.filter(s => s.status === 'completed');
  }
  
  // Add search and filter bar
  let html = `
    <div class="search-filter-bar">
      <div class="search-box">
        <input type="text" 
               id="dialysisSearch" 
               placeholder="🔍 Search patients, machines..." 
               value="${searchTerm}"
               oninput="handleSearch(this.value)">
      </div>
      <div class="filter-controls">
        <select id="filterDateRange" onchange="handleDateFilter(this.value)">
          <option value="all" ${filterDateRange === 'all' ? 'selected' : ''}>All Time</option>
          <option value="today" ${filterDateRange === 'today' ? 'selected' : ''}>Today</option>
          <option value="week" ${filterDateRange === 'week' ? 'selected' : ''}>This Week</option>
          <option value="month" ${filterDateRange === 'month' ? 'selected' : ''}>This Month</option>
        </select>
        ${searchTerm || filterDateRange !== 'all' ? `
          <button class="btn-clear-filters" onclick="clearAllFilters()">✕ Clear</button>
        ` : ''}
      </div>
    </div>
  `;
  
  // Apply additional filters
  if (searchTerm) {
    filtered = filtered.filter(s => 
      s.patientName?.toLowerCase().includes(searchTerm) ||
      s.machineNumber?.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filterDateRange !== 'all') {
    const now = new Date();
    filtered = filtered.filter(s => {
      const sessionDate = s.sessionDate?.toDate ? s.sessionDate.toDate() : new Date(s.sessionDate);
      
      switch(filterDateRange) {
        case 'today':
          return isSameDay(sessionDate, now);
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
  }
  
  if (filtered.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-state-icon">💉</div>
        <p>No sessions found</p>
        ${searchTerm || filterDateRange !== 'all' ? '<p class="empty-hint">Try adjusting your filters</p>' : ''}
      </div>
    `;
    container.innerHTML = html;
    return;
  }
  
  html += '<div class="dialysis-sessions-grid" id="dialysisSessionsContainer">';
  
  filtered.forEach(session => {
    const statusClass = session.status === 'active' ? 'status-active' : 
                       session.status === 'scheduled' ? 'status-scheduled' : 
                       session.status === 'completed' ? 'status-completed' : '';
    
    const duration = session.startTime && session.endTime ? 
      Math.round((session.endTime - session.startTime) / (1000 * 60)) : 
      session.duration || 0;
    
    html += `
      <div class="dialysis-session-card ${statusClass}">
        <div class="session-header">
          <div class="session-patient-info">
            <h3>${session.patientName}</h3>
            <span class="session-machine">Machine ${session.machineNumber}</span>
          </div>
          <span class="session-status-badge ${statusClass}">${session.status.toUpperCase()}</span>
        </div>
        
        <div class="session-body">
          <div class="session-detail">
            <span class="label">Date</span>
            <span class="value">${session.sessionDate.toLocaleDateString()}</span>
          </div>
          
          ${session.scheduledTime ? `
            <div class="session-detail">
              <span class="label">Scheduled Time</span>
              <span class="value">${session.scheduledTime}</span>
            </div>
          ` : ''}
          
          ${session.startTime ? `
            <div class="session-detail">
              <span class="label">Start Time</span>
              <span class="value">${session.startTime.toLocaleTimeString()}</span>
            </div>
          ` : ''}
          
          ${session.status === 'active' ? `
            <div class="session-detail">
              <span class="label">Duration</span>
              <span class="value">${duration} min</span>
            </div>
          ` : ''}
          
          ${session.endTime ? `
            <div class="session-detail">
              <span class="label">End Time</span>
              <span class="value">${session.endTime.toLocaleTimeString()}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="session-actions">
          ${session.status === 'scheduled' ? `
            <button class="btn-start-session" data-id="${session.id}">▶ Start Session</button>
          ` : ''}
          
          ${session.status === 'active' ? `
            <button class="btn-monitor-session" data-id="${session.id}">📊 Monitor</button>
            <button class="btn-end-session" data-id="${session.id}">⏹ End Session</button>
          ` : ''}
          
          ${session.status === 'completed' ? `
            <button class="btn-view-session" data-id="${session.id}">👁 View Details</button>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
  
  attachSessionListeners();
}

function attachSessionListeners() {
  // Start session
  document.querySelectorAll('.btn-start-session').forEach(btn => {
    btn.addEventListener('click', () => startDialysisSession(btn.dataset.id));
  });
  
  // Monitor session
  document.querySelectorAll('.btn-monitor-session').forEach(btn => {
    btn.addEventListener('click', () => openMonitorModal(btn.dataset.id));
  });
  
  // End session
  document.querySelectorAll('.btn-end-session').forEach(btn => {
    btn.addEventListener('click', () => endDialysisSession(btn.dataset.id));
  });
  
  // View session
  document.querySelectorAll('.btn-view-session').forEach(btn => {
    btn.addEventListener('click', () => viewSessionDetails(btn.dataset.id));
  });
}

// ═══════════════════════════════════════════════════════════════
// PATIENTS VIEW
// ═══════════════════════════════════════════════════════════════

function renderPatientsView() {
  const container = document.getElementById('dialysisMainContent');
  if (!container) return;
  
  if (dialysisPatients.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👤</div>
        <p>No dialysis patients registered</p>
        <button class="btn-primary" onclick="openAddPatientModal()">+ Add Patient</button>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="view-header">
      <h2>Dialysis Patients</h2>
      <button class="btn-primary" onclick="openAddPatientModal()">+ Add Patient</button>
    </div>
    <div class="dialysis-patients-grid">`;
  
  dialysisPatients.forEach(patient => {
    html += `
      <div class="dialysis-patient-card">
        <div class="patient-header">
          <h3>${patient.name}</h3>
          <span class="patient-status ${patient.status}">${patient.status}</span>
        </div>
        
        <div class="patient-body">
          <div class="patient-detail">
            <span class="label">Age/Gender</span>
            <span class="value">${patient.age} / ${patient.gender}</span>
          </div>
          
          <div class="patient-detail">
            <span class="label">Schedule</span>
            <span class="value">${patient.dialysisSchedule}</span>
          </div>
          
          <div class="patient-detail">
            <span class="label">Dry Weight</span>
            <span class="value">${patient.dryWeight} kg</span>
          </div>
          
          <div class="patient-detail">
            <span class="label">Access Type</span>
            <span class="value">${patient.accessType}</span>
          </div>
          
          ${patient.lastSession ? `
            <div class="patient-detail">
              <span class="label">Last Session</span>
              <span class="value">${patient.lastSession.toLocaleDateString()}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="patient-actions">
          <button class="btn-schedule-session" data-id="${patient.id}">📅 Schedule</button>
          <button class="btn-view-history" data-id="${patient.id}">📊 History</button>
          <button class="btn-edit-patient" data-id="${patient.id}">✏️ Edit</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
  
  attachPatientListeners();
}

function attachPatientListeners() {
  document.querySelectorAll('.btn-schedule-session').forEach(btn => {
    btn.addEventListener('click', () => openScheduleModal(btn.dataset.id));
  });
  
  document.querySelectorAll('.btn-view-history').forEach(btn => {
    btn.addEventListener('click', () => viewPatientHistory(btn.dataset.id));
  });
  
  document.querySelectorAll('.btn-edit-patient').forEach(btn => {
    btn.addEventListener('click', () => openEditPatientModal(btn.dataset.id));
  });
}

// ═══════════════════════════════════════════════════════════════
// MACHINES VIEW
// ═══════════════════════════════════════════════════════════════

function renderMachinesView() {
  const container = document.getElementById('dialysisMainContent');
  if (!container) return;
  
  if (dialysisMachines.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏥</div>
        <p>No dialysis machines registered</p>
        <button class="btn-primary" onclick="openAddMachineModal()">+ Add Machine</button>
      </div>
    `;
    return;
  }
  
  let html = `
    <div class="view-header">
      <h2>Dialysis Machines</h2>
      <button class="btn-primary" onclick="openAddMachineModal()">+ Add Machine</button>
    </div>
    <div class="dialysis-machines-grid">`;
  
  dialysisMachines.forEach(machine => {
    const statusClass = machine.status === 'available' ? 'status-available' : 
                       machine.status === 'in-use' ? 'status-in-use' : 
                       'status-maintenance';
    
    html += `
      <div class="dialysis-machine-card ${statusClass}">
        <div class="machine-header">
          <h3>Machine ${machine.machineNumber}</h3>
          <span class="machine-status-badge ${statusClass}">${machine.status.toUpperCase()}</span>
        </div>
        
        <div class="machine-body">
          <div class="machine-detail">
            <span class="label">Brand</span>
            <span class="value">${machine.brand}</span>
          </div>
          
          <div class="machine-detail">
            <span class="label">Model</span>
            <span class="value">${machine.model}</span>
          </div>
          
          ${machine.currentPatient ? `
            <div class="machine-detail">
              <span class="label">Current Patient</span>
              <span class="value">${machine.currentPatient}</span>
            </div>
          ` : ''}
          
          ${machine.lastMaintenance ? `
            <div class="machine-detail">
              <span class="label">Last Maintenance</span>
              <span class="value">${machine.lastMaintenance.toLocaleDateString()}</span>
            </div>
          ` : ''}
          
          ${machine.nextMaintenance ? `
            <div class="machine-detail">
              <span class="label">Next Maintenance</span>
              <span class="value">${machine.nextMaintenance.toLocaleDateString()}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="machine-actions">
          ${machine.status === 'maintenance' ? `
            <button class="btn-mark-available" data-id="${machine.id}">✓ Mark Available</button>
          ` : ''}
          
          ${machine.status === 'available' ? `
            <button class="btn-mark-maintenance" data-id="${machine.id}">🔧 Maintenance</button>
          ` : ''}
          
          <button class="btn-edit-machine" data-id="${machine.id}">✏️ Edit</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
  
  attachMachineListeners();
}

function attachMachineListeners() {
  document.querySelectorAll('.btn-mark-available').forEach(btn => {
    btn.addEventListener('click', () => updateMachineStatus(btn.dataset.id, 'available'));
  });
  
  document.querySelectorAll('.btn-mark-maintenance').forEach(btn => {
    btn.addEventListener('click', () => updateMachineStatus(btn.dataset.id, 'maintenance'));
  });
  
  document.querySelectorAll('.btn-edit-machine').forEach(btn => {
    btn.addEventListener('click', () => openEditMachineModal(btn.dataset.id));
  });
}

// ═══════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

async function startDialysisSession(sessionId) {
  const session = dialysisSessions.find(s => s.id === sessionId);
  if (!session) return;
  
  // Open pre-vitals modal
  openPreVitalsModal(session);
}

function openPreVitalsModal(session) {
  const modal = document.getElementById('preVitalsModal');
  if (!modal) return;
  
  // Populate modal with session info
  document.getElementById('preVitalsPatientName').textContent = session.patientName;
  document.getElementById('preVitalsMachine').textContent = `Machine ${session.machineNumber}`;
  
  // Store session ID
  modal.dataset.sessionId = session.id;
  
  // Clear previous values
  document.getElementById('preWeight').value = '';
  document.getElementById('preTemp').value = '';
  document.getElementById('prePulse').value = '';
  document.getElementById('preBPSystolic').value = '';
  document.getElementById('preBPDiastolic').value = '';
  
  modal.classList.add('active');
}

async function savePreVitalsAndStart() {
  const modal = document.getElementById('preVitalsModal');
  const sessionId = modal.dataset.sessionId;
  
  const preVitals = {
    weight: parseFloat(document.getElementById('preWeight').value),
    temp: parseFloat(document.getElementById('preTemp').value),
    pulse: parseInt(document.getElementById('prePulse').value),
    bpSystolic: parseInt(document.getElementById('preBPSystolic').value),
    bpDiastolic: parseInt(document.getElementById('preBPDiastolic').value),
    recordedAt: new Date()
  };
  
  try {
    await db.collection('dialysisSessions').doc(sessionId).update({
      status: 'active',
      startTime: firebase.firestore.FieldValue.serverTimestamp(),
      preVitals: preVitals
    });
    
    // Update machine status
    const session = dialysisSessions.find(s => s.id === sessionId);
    if (session && session.machineId) {
      await db.collection('dialysisMachines').doc(session.machineId).update({
        status: 'in-use',
        currentPatient: session.patientName
      });
    }
    
    alert('✅ Session started successfully!');
    modal.classList.remove('active');
    
    await loadDialysisData();
  } catch (error) {
    console.error('Error starting session:', error);
    alert('Error starting session: ' + error.message);
  }
}

async function endDialysisSession(sessionId) {
  const session = dialysisSessions.find(s => s.id === sessionId);
  if (!session) return;
  
  // Open post-vitals modal
  openPostVitalsModal(session);
}

function openPostVitalsModal(session) {
  const modal = document.getElementById('postVitalsModal');
  if (!modal) return;
  
  document.getElementById('postVitalsPatientName').textContent = session.patientName;
  document.getElementById('postVitalsMachine').textContent = `Machine ${session.machineNumber}`;
  
  modal.dataset.sessionId = session.id;
  
  // Clear fields
  document.getElementById('postWeight').value = '';
  document.getElementById('postTemp').value = '';
  document.getElementById('postPulse').value = '';
  document.getElementById('postBPSystolic').value = '';
  document.getElementById('postBPDiastolic').value = '';
  document.getElementById('sessionComplications').value = '';
  document.getElementById('sessionNotes').value = '';
  
  modal.classList.add('active');
}

async function savePostVitalsAndEnd() {
  const modal = document.getElementById('postVitalsModal');
  const sessionId = modal.dataset.sessionId;
  
  const postVitals = {
    weight: parseFloat(document.getElementById('postWeight').value),
    temp: parseFloat(document.getElementById('postTemp').value),
    pulse: parseInt(document.getElementById('postPulse').value),
    bpSystolic: parseInt(document.getElementById('postBPSystolic').value),
    bpDiastolic: parseInt(document.getElementById('postBPDiastolic').value),
    recordedAt: new Date()
  };
  
  const complications = document.getElementById('sessionComplications').value;
  const notes = document.getElementById('sessionNotes').value;
  
  try {
    const session = dialysisSessions.find(s => s.id === sessionId);
    const duration = Math.round((new Date() - session.startTime) / (1000 * 60));
    
    await db.collection('dialysisSessions').doc(sessionId).update({
      status: 'completed',
      endTime: firebase.firestore.FieldValue.serverTimestamp(),
      duration: duration,
      postVitals: postVitals,
      complications: complications,
      notes: notes
    });
    
    // Free up machine
    if (session.machineId) {
      await db.collection('dialysisMachines').doc(session.machineId).update({
        status: 'available',
        currentPatient: null
      });
    }
    
    // Update patient's last session
    await db.collection('dialysisPatients').doc(session.patientId).update({
      lastSession: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert('✅ Session completed successfully!');
    modal.classList.remove('active');
    
    await loadDialysisData();
  } catch (error) {
    console.error('Error ending session:', error);
    alert('Error ending session: ' + error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

function initDialysisListeners() {
  // View switcher
  document.querySelectorAll('.dialysis-view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentDialysisView = tab.dataset.view;
      document.querySelectorAll('.dialysis-view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderDialysisView();
    });
  });
  
  // Session filter
  document.querySelectorAll('.dialysis-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentDialysisFilter = tab.dataset.filter;
      document.querySelectorAll('.dialysis-filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderSessionsView();
    });
  });
  
  // Pre-vitals save button
  document.getElementById('savePreVitalsBtn')?.addEventListener('click', savePreVitalsAndStart);
  
  // Post-vitals save button
  document.getElementById('savePostVitalsBtn')?.addEventListener('click', savePostVitalsAndEnd);
  
  // Close modals
  document.querySelectorAll('.close-dialysis-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').classList.remove('active');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// DURING-SESSION MONITORING
// ═══════════════════════════════════════════════════════════════

function openMonitorModal(sessionId) {
  const session = dialysisSessions.find(s => s.id === sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return;
  }
  
  const modal = document.getElementById('monitorSessionModal');
  if (!modal) {
    console.error('Monitor Session Modal not found');
    return;
  }
  
  modal.dataset.sessionId = sessionId;
  
  // Set session info
  document.getElementById('monitorPatientName').textContent = session.patientName;
  document.getElementById('monitorMachineNumber').textContent = session.machineNumber;
  document.getElementById('monitorSessionTime').textContent = session.scheduledTime || 'N/A';
  
  // Load existing monitoring records
  loadMonitoringRecords(sessionId);
  
  modal.classList.add('active');
}

function closeMonitorModal() {
  const modal = document.getElementById('monitorSessionModal');
  modal.classList.remove('active');
  delete modal.dataset.sessionId;
}

async function loadMonitoringRecords(sessionId) {
  try {
    const recordsSnapshot = await db.collection('dialysisMonitoring')
      .where('sessionId', '==', sessionId)
      .orderBy('checkTime', 'asc')
      .get();
    
    const records = recordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const listHtml = records.length > 0 ? records.map(r => {
      const checkTime = r.checkTime?.toDate ? r.checkTime.toDate() : new Date(r.checkTime);
      return `
        <div class="monitoring-record">
          <div class="record-time">${checkTime.toLocaleTimeString()}</div>
          <div class="record-vitals">
            <div class="vital-item">
              <span class="vital-label">BP:</span>
              <span class="vital-value">${r.bloodPressure}</span>
            </div>
            <div class="vital-item">
              <span class="vital-label">Pulse:</span>
              <span class="vital-value">${r.pulse} bpm</span>
            </div>
            <div class="vital-item">
              <span class="vital-label">Temp:</span>
              <span class="vital-value">${r.temperature}°C</span>
            </div>
            <div class="vital-item">
              <span class="vital-label">UFR:</span>
              <span class="vital-value">${r.ultrafiltrationRate || 'N/A'}</span>
            </div>
          </div>
          ${r.notes ? `<div class="record-notes">${r.notes}</div>` : ''}
          ${r.complications ? `<div class="record-complications">⚠️ ${r.complications}</div>` : ''}
        </div>
      `;
    }).join('') : '<p class="empty-message">No monitoring records yet. Add hourly checks below.</p>';
    
    document.getElementById('monitoringRecordsList').innerHTML = listHtml;
  } catch (error) {
    console.error('Error loading monitoring records:', error);
  }
}

async function saveMonitoringCheck(e) {
  e.preventDefault();
  
  const modal = document.getElementById('monitorSessionModal');
  const sessionId = modal.dataset.sessionId;
  
  const monitoringData = {
    sessionId: sessionId,
    checkTime: firebase.firestore.FieldValue.serverTimestamp(),
    bloodPressure: document.getElementById('monitorBloodPressure').value.trim(),
    pulse: parseInt(document.getElementById('monitorPulse').value),
    temperature: parseFloat(document.getElementById('monitorTemperature').value),
    ultrafiltrationRate: document.getElementById('monitorUFR').value.trim(),
    complications: document.getElementById('monitorComplications').value.trim(),
    notes: document.getElementById('monitorNotes').value.trim(),
    recordedBy: currentUser?.email || 'System'
  };
  
  try {
    await db.collection('dialysisMonitoring').add(monitoringData);
    alert('✅ Monitoring check recorded!');
    document.getElementById('addMonitoringForm').reset();
    await loadMonitoringRecords(sessionId);
  } catch (error) {
    console.error('Error saving monitoring check:', error);
    alert('❌ Error saving monitoring check. Please try again.');
  }
}

// ═══════════════════════════════════════════════════════════════
// PATIENT MEDICAL HISTORY
// ═══════════════════════════════════════════════════════════════

function viewPatientHistory(patientId) {
  const patient = dialysisPatients.find(p => p.id === patientId);
  if (!patient) {
    console.error('Patient not found:', patientId);
    return;
  }
  
  const modal = document.getElementById('patientHistoryModal');
  if (!modal) {
    console.error('Patient History Modal not found');
    return;
  }
  
  modal.dataset.patientId = patientId;
  
  // Set patient info
  document.getElementById('historyPatientName').textContent = patient.name;
  document.getElementById('historyPatientAge').textContent = `${patient.age} years old`;
  document.getElementById('historyPatientGender').textContent = patient.gender;
  document.getElementById('historyPatientSchedule').textContent = patient.dialysisSchedule;
  document.getElementById('historyPatientDryWeight').textContent = `${patient.dryWeight} kg`;
  document.getElementById('historyPatientAccessType').textContent = patient.accessType;
  document.getElementById('historyPatientDiagnosis').textContent = patient.diagnosis || 'N/A';
  
  // Load patient sessions
  const patientSessions = dialysisSessions.filter(s => s.patientId === patientId);
  const sessionsHtml = patientSessions.length > 0 ? patientSessions
    .sort((a, b) => {
      const dateA = a.sessionDate?.toDate ? a.sessionDate.toDate() : new Date(a.sessionDate);
      const dateB = b.sessionDate?.toDate ? b.sessionDate.toDate() : new Date(b.sessionDate);
      return dateB - dateA;
    })
    .slice(0, 10) // Show last 10 sessions
    .map(s => {
      const date = s.sessionDate?.toDate ? s.sessionDate.toDate() : new Date(s.sessionDate);
      return `
        <div class="history-session-item ${s.status}">
          <div class="history-session-date">
            <span class="date">${date.toLocaleDateString()}</span>
            <span class="time">${s.scheduledTime || 'N/A'}</span>
          </div>
          <div class="history-session-info">
            <div class="info-row">
              <span class="label">Machine:</span>
              <span class="value">HD-${s.machineNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Duration:</span>
              <span class="value">${s.duration || 240} mins</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value status-badge ${s.status}">${s.status}</span>
            </div>
          </div>
          ${s.preVitals ? `
            <div class="vitals-summary">
              <strong>Pre:</strong> 
              BP: ${s.preVitals.bloodPressure} | 
              Pulse: ${s.preVitals.pulse} | 
              Weight: ${s.preVitals.weight}kg
            </div>
          ` : ''}
          ${s.postVitals ? `
            <div class="vitals-summary">
              <strong>Post:</strong> 
              BP: ${s.postVitals.bloodPressure} | 
              Pulse: ${s.postVitals.pulse} | 
              Weight: ${s.postVitals.weight}kg
            </div>
          ` : ''}
        </div>
      `;
    }).join('') : '<p class="empty-message">No session history available</p>';
  
  document.getElementById('historySessionsList').innerHTML = sessionsHtml;
  
  // Display basic patient info (patient already declared above)
  document.getElementById('historyAllergies').innerHTML = patient.allergies 
    ? `<span class="allergy-tag">${patient.allergies}</span>`
    : '<span class="empty-text">No known allergies</span>';
  
  document.getElementById('historyMedications').innerHTML = patient.medications
    ? `<div class="medication-item">${patient.medications}</div>`
    : '<span class="empty-text">No current medications on file</span>';
  
  modal.classList.add('active');
}

function closePatientHistoryModal() {
  document.getElementById('patientHistoryModal').classList.remove('active');
}

function viewSessionDetails(sessionId) {
  const session = dialysisSessions.find(s => s.id === sessionId);
  if (!session) {
    console.error('Session not found:', sessionId);
    return;
  }
  
  const modal = document.getElementById('sessionDetailsModal');
  if (!modal) {
    console.error('Session Details Modal not found');
    return;
  }
  
  // Populate session details
  document.getElementById('detailsPatientName').textContent = session.patientName;
  document.getElementById('detailsMachineNumber').textContent = session.machineNumber;
  const date = session.sessionDate?.toDate ? session.sessionDate.toDate() : new Date(session.sessionDate);
  document.getElementById('detailsSessionDate').textContent = date.toLocaleDateString();
  document.getElementById('detailsSessionTime').textContent = session.scheduledTime || 'N/A';
  document.getElementById('detailsDuration').textContent = `${session.duration || 240} minutes`;
  document.getElementById('detailsStatus').textContent = session.status;
  document.getElementById('detailsStatus').className = `status-badge ${session.status}`;
  
  // Pre-vitals
  if (session.preVitals) {
    document.getElementById('detailsPreVitals').innerHTML = `
      <div class="vitals-grid">
        <div class="vital-box"><strong>BP:</strong> ${session.preVitals.bloodPressure}</div>
        <div class="vital-box"><strong>Pulse:</strong> ${session.preVitals.pulse} bpm</div>
        <div class="vital-box"><strong>Temp:</strong> ${session.preVitals.temperature}°C</div>
        <div class="vital-box"><strong>Weight:</strong> ${session.preVitals.weight} kg</div>
      </div>
    `;
  } else {
    document.getElementById('detailsPreVitals').innerHTML = '<p class="empty-text">No pre-vitals recorded</p>';
  }
  
  // Post-vitals
  if (session.postVitals) {
    document.getElementById('detailsPostVitals').innerHTML = `
      <div class="vitals-grid">
        <div class="vital-box"><strong>BP:</strong> ${session.postVitals.bloodPressure}</div>
        <div class="vital-box"><strong>Pulse:</strong> ${session.postVitals.pulse} bpm</div>
        <div class="vital-box"><strong>Temp:</strong> ${session.postVitals.temperature}°C</div>
        <div class="vital-box"><strong>Weight:</strong> ${session.postVitals.weight} kg</div>
      </div>
    `;
  } else {
    document.getElementById('detailsPostVitals').innerHTML = '<p class="empty-text">No post-vitals recorded</p>';
  }
  
  // Notes
  document.getElementById('detailsNotes').textContent = session.notes || 'No notes recorded';
  
  modal.classList.add('active');
}

function closeSessionDetailsModal() {
  document.getElementById('sessionDetailsModal').classList.remove('active');
}

function openScheduleModal(patientId) {
  openScheduleSessionModal(formatDateForComparison(new Date()), '08:00');
  
  // Pre-select the patient if modal opened from patient card
  if (patientId) {
    setTimeout(() => {
      const patientSelect = document.getElementById('scheduleSessionPatient');
      if (patientSelect) {
        patientSelect.value = patientId;
      }
    }, 100);
  }
}

function openEditPatientModal(patientId) {
  const patient = dialysisPatients.find(p => p.id === patientId);
  if (!patient) {
    console.error('Patient not found:', patientId);
    return;
  }
  
  const modal = document.getElementById('editPatientModal');
  if (!modal) {
    console.error('Edit Patient Modal not found');
    return;
  }
  
  // Store current patient ID
  modal.dataset.patientId = patientId;
  
  // Fill form with current data
  document.getElementById('editPatientName').value = patient.name || '';
  document.getElementById('editPatientAge').value = patient.age || '';
  document.getElementById('editPatientGender').value = patient.gender || '';
  document.getElementById('editPatientSchedule').value = patient.dialysisSchedule || '';
  document.getElementById('editPatientDryWeight').value = patient.dryWeight || '';
  document.getElementById('editPatientAccessType').value = patient.accessType || '';
  document.getElementById('editPatientDiagnosis').value = patient.diagnosis || '';
  document.getElementById('editPatientContact').value = patient.contactNumber || '';
  document.getElementById('editPatientEmergency').value = patient.emergencyContact || '';
  document.getElementById('editPatientBloodType').value = patient.bloodType || '';
  document.getElementById('editPatientNotes').value = patient.notes || '';
  document.getElementById('editPatientStatus').value = patient.status || 'active';
  
  modal.classList.add('active');
}

function openAddPatientModal() {
  const modal = document.getElementById('addPatientModal');
  if (!modal) {
    console.error('Add Patient Modal not found');
    return;
  }
  
  // Reset form
  document.getElementById('addPatientForm').reset();
  modal.classList.add('active');
}

function updateMachineStatus(machineId, status) {
  // TODO: Implement machine status update
  alert(`Update machine ${machineId} status to ${status}`);
}

function openEditMachineModal(machineId) {
  const machine = dialysisMachines.find(m => m.id === machineId);
  if (!machine) {
    console.error('Machine not found:', machineId);
    return;
  }
  
  const modal = document.getElementById('editMachineModal');
  if (!modal) {
    console.error('Edit Machine Modal not found');
    return;
  }
  
  // Store current machine ID
  modal.dataset.machineId = machineId;
  
  // Fill form with current data
  document.getElementById('editMachineNumber').value = machine.machineNumber || '';
  document.getElementById('editMachineBrand').value = machine.brand || '';
  document.getElementById('editMachineModel').value = machine.model || '';
  document.getElementById('editMachineSerial').value = machine.serialNumber || '';
  document.getElementById('editMachineLocation').value = machine.location || '';
  document.getElementById('editMachinePurchaseDate').value = machine.purchaseDate || '';
  document.getElementById('editMachineLastMaintenance').value = machine.lastMaintenance || '';
  document.getElementById('editMachineNextMaintenance').value = machine.nextMaintenance || '';
  document.getElementById('editMachineNotes').value = machine.notes || '';
  document.getElementById('editMachineStatus').value = machine.status || 'available';
  
  modal.classList.add('active');
}

function openAddMachineModal() {
  const modal = document.getElementById('addMachineModal');
  if (!modal) {
    console.error('Add Machine Modal not found');
    return;
  }
  
  // Reset form
  document.getElementById('addMachineForm').reset();
  modal.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE/CALENDAR VIEW
// ═══════════════════════════════════════════════════════════════

let currentCalendarDate = new Date();
let calendarViewMode = 'week'; // 'week' or 'month'

function renderScheduleView() {
  const container = document.getElementById('dialysisMainContent');
  if (!container) return;
  
  const html = `
    <div class="schedule-container">
      <div class="schedule-header">
        <div class="schedule-navigation">
          <button class="btn-nav" id="calendarPrevBtn">◀</button>
          <h2 id="calendarTitle">${getCalendarTitle()}</h2>
          <button class="btn-nav" id="calendarNextBtn">▶</button>
        </div>
        
        <div class="schedule-controls">
          <button class="btn-view ${calendarViewMode === 'week' ? 'active' : ''}" id="weekViewBtn">Week</button>
          <button class="btn-view ${calendarViewMode === 'month' ? 'active' : ''}" id="monthViewBtn">Month</button>
          <button class="btn-today" id="todayBtn">Today</button>
        </div>
      </div>
      
      <div id="calendarGrid" class="calendar-grid">
        ${renderCalendarGrid()}
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Attach event listeners using event delegation
  attachScheduleEventListeners();
}

function attachScheduleEventListeners() {
  // Navigation buttons
  document.getElementById('calendarPrevBtn')?.addEventListener('click', () => navigateCalendar(-1));
  document.getElementById('calendarNextBtn')?.addEventListener('click', () => navigateCalendar(1));
  document.getElementById('todayBtn')?.addEventListener('click', goToToday);
  document.getElementById('weekViewBtn')?.addEventListener('click', () => switchCalendarView('week'));
  document.getElementById('monthViewBtn')?.addEventListener('click', () => switchCalendarView('month'));
  
  // Time slot clicks (event delegation on parent)
  const calendarGrid = document.getElementById('calendarGrid');
  if (calendarGrid) {
    calendarGrid.addEventListener('click', function(e) {
      // Time slot click
      const timeSlot = e.target.closest('.time-slot');
      if (timeSlot && !e.target.closest('.session-pill')) {
        const dateStr = timeSlot.dataset.date;
        const time = timeSlot.dataset.time;
        if (dateStr && time) {
          console.log('Opening schedule modal for:', dateStr, time);
          openScheduleSessionModal(dateStr, time);
        }
        return;
      }
      
      // Month day click
      const monthDay = e.target.closest('.month-day:not(.empty)');
      if (monthDay) {
        const dateStr = monthDay.dataset.date;
        if (dateStr) {
          console.log('Opening day modal for:', dateStr);
          openDayScheduleModal(dateStr);
        }
        return;
      }
      
      // Session pill click
      const sessionPill = e.target.closest('.session-pill');
      if (sessionPill) {
        const sessionId = sessionPill.dataset.sessionId;
        if (sessionId) {
          console.log('Viewing session:', sessionId);
          viewSessionDetails(sessionId);
        }
        return;
      }
    });
  }
}

function getCalendarTitle() {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[currentCalendarDate.getMonth()];
  const year = currentCalendarDate.getFullYear();
  
  if (calendarViewMode === 'week') {
    const weekStart = getWeekStart(currentCalendarDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${month} ${weekStart.getDate()}-${weekEnd.getDate()}, ${year}`;
    } else {
      return `${months[weekStart.getMonth()]} ${weekStart.getDate()} - ${months[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${year}`;
    }
  } else {
    return `${month} ${year}`;
  }
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust to Sunday
  return new Date(d.setDate(diff));
}

function renderCalendarGrid() {
  if (calendarViewMode === 'week') {
    return renderWeekView();
  } else {
    return renderMonthView();
  }
}

function renderWeekView() {
  const weekStart = getWeekStart(currentCalendarDate);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  
  let html = '<div class="week-view">';
  
  // Header row with dates
  html += '<div class="week-header">';
  html += '<div class="time-column-header">Time</div>';
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const isToday = isSameDay(date, new Date());
    
    html += `
      <div class="day-header ${isToday ? 'today' : ''}">
        <div class="day-name">${days[i]}</div>
        <div class="day-number">${date.getDate()}</div>
      </div>
    `;
  }
  html += '</div>';
  
  // Time slots - using data attributes instead of onclick
  timeSlots.forEach(time => {
    html += '<div class="time-row">';
    html += `<div class="time-label">${time}</div>`;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = formatDateForComparison(date);
      const sessionsAtTime = getSessionsForDateTime(dateStr, time);
      
      html += `
        <div class="time-slot" data-date="${dateStr}" data-time="${time}">
          ${sessionsAtTime.map(s => `
            <div class="session-pill ${s.status}" data-session-id="${s.id}">
              <span class="session-patient">${s.patientName}</span>
              <span class="session-machine">M${s.machineNumber}</span>
            </div>
          `).join('')}
          ${sessionsAtTime.length === 0 ? '<div class="empty-slot">+</div>' : ''}
        </div>
      `;
    }
    
    html += '</div>';
  });
  
  html += '</div>';
  return html;
}

function renderMonthView() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  let html = '<div class="month-view">';
  
  // Day headers
  html += '<div class="month-header">';
  days.forEach(day => {
    html += `<div class="month-day-header">${day}</div>`;
  });
  html += '</div>';
  
  // Calendar days
  html += '<div class="month-grid">';
  
  // Empty cells before month starts
  for (let i = 0; i < startDay; i++) {
    html += '<div class="month-day empty"></div>';
  }
  
  // Days of the month - using data attributes instead of onclick
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateForComparison(date);
    const isToday = isSameDay(date, new Date());
    const sessionsOnDay = getSessionsForDate(dateStr);
    
    html += `
      <div class="month-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <div class="day-number">${day}</div>
        <div class="day-sessions">
          ${sessionsOnDay.slice(0, 3).map(s => `
            <div class="session-dot ${s.status}" title="${s.patientName} - ${s.scheduledTime}"></div>
          `).join('')}
          ${sessionsOnDay.length > 3 ? `<div class="more-sessions">+${sessionsOnDay.length - 3}</div>` : ''}
        </div>
      </div>
    `;
  }
  
  html += '</div></div>';
  return html;
}

function formatDateForComparison(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDay(date1, date2) {
  return formatDateForComparison(date1) === formatDateForComparison(date2);
}

function getSessionsForDate(dateStr) {
  return dialysisSessions.filter(session => {
    if (!session.sessionDate) return false;
    let sessionDateStr;
    
    if (session.sessionDate.toDate) {
      sessionDateStr = formatDateForComparison(session.sessionDate.toDate());
    } else if (session.sessionDate instanceof Date) {
      sessionDateStr = formatDateForComparison(session.sessionDate);
    } else {
      sessionDateStr = session.sessionDate;
    }
    
    return sessionDateStr === dateStr;
  });
}

function getSessionsForDateTime(dateStr, time) {
  return dialysisSessions.filter(session => {
    if (!session.sessionDate) return false;
    let sessionDateStr;
    
    if (session.sessionDate.toDate) {
      sessionDateStr = formatDateForComparison(session.sessionDate.toDate());
    } else if (session.sessionDate instanceof Date) {
      sessionDateStr = formatDateForComparison(session.sessionDate);
    } else {
      sessionDateStr = session.sessionDate;
    }
    
    return sessionDateStr === dateStr && session.scheduledTime === time;
  });
}

function navigateCalendar(direction) {
  if (calendarViewMode === 'week') {
    currentCalendarDate.setDate(currentCalendarDate.getDate() + (direction * 7));
  } else {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
  }
  
  // Update calendar title
  document.getElementById('calendarTitle').textContent = getCalendarTitle();
  
  // Re-render calendar grid
  document.getElementById('calendarGrid').innerHTML = renderCalendarGrid();
  
  // Re-attach event listeners
  attachScheduleEventListeners();
}

function switchCalendarView(mode) {
  calendarViewMode = mode;
  
  // Update button states
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.classList.remove('active');
  });
  if (mode === 'week') {
    document.getElementById('weekViewBtn')?.classList.add('active');
  } else {
    document.getElementById('monthViewBtn')?.classList.add('active');
  }
  
  // Update calendar title and grid
  document.getElementById('calendarTitle').textContent = getCalendarTitle();
  document.getElementById('calendarGrid').innerHTML = renderCalendarGrid();
  
  // Re-attach event listeners
  attachScheduleEventListeners();
}

function goToToday() {
  currentCalendarDate = new Date();
  
  // Update calendar title
  document.getElementById('calendarTitle').textContent = getCalendarTitle();
  
  // Re-render calendar grid
  document.getElementById('calendarGrid').innerHTML = renderCalendarGrid();
  
  // Re-attach event listeners
  attachScheduleEventListeners();
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULE SESSION MODAL
// ═══════════════════════════════════════════════════════════════

function openScheduleSessionModal(dateStr, time) {
  const modal = document.getElementById('scheduleSessionModal');
  if (!modal) {
    console.error('Schedule Session Modal not found');
    return;
  }
  
  // Set date and time in form
  document.getElementById('scheduleSessionDate').value = dateStr;
  document.getElementById('scheduleSessionTime').value = time || '08:00';
  
  // Populate patient dropdown
  const patientSelect = document.getElementById('scheduleSessionPatient');
  patientSelect.innerHTML = '<option value="">Select Patient</option>';
  dialysisPatients
    .filter(p => p.status === 'active')
    .forEach(patient => {
      patientSelect.innerHTML += `<option value="${patient.id}">${patient.name} (${patient.dialysisSchedule})</option>`;
    });
  
  // Populate machine dropdown
  updateAvailableMachines(dateStr, time);
  
  modal.classList.add('active');
}

function closeScheduleSessionModal() {
  const modal = document.getElementById('scheduleSessionModal');
  modal.classList.remove('active');
  document.getElementById('scheduleSessionForm').reset();
}

function updateAvailableMachines(dateStr, time) {
  const machineSelect = document.getElementById('scheduleSessionMachine');
  const bookedMachines = getSessionsForDateTime(dateStr, time).map(s => s.machineId);
  
  machineSelect.innerHTML = '<option value="">Select Machine</option>';
  dialysisMachines
    .filter(m => m.status === 'available' || m.status === 'in-use')
    .forEach(machine => {
      const isBooked = bookedMachines.includes(machine.id);
      machineSelect.innerHTML += `
        <option value="${machine.id}" ${isBooked ? 'disabled' : ''}>
          Machine ${machine.machineNumber} ${isBooked ? '(Booked)' : ''}
        </option>
      `;
    });
}

async function saveScheduledSession(e) {
  e.preventDefault();
  
  const patientId = document.getElementById('scheduleSessionPatient').value;
  const machineId = document.getElementById('scheduleSessionMachine').value;
  const dateStr = document.getElementById('scheduleSessionDate').value;
  const time = document.getElementById('scheduleSessionTime').value;
  const duration = parseInt(document.getElementById('scheduleSessionDuration').value);
  const notes = document.getElementById('scheduleSessionNotes').value.trim();
  
  if (!patientId || !machineId) {
    alert('Please select both patient and machine');
    return;
  }
  
  if (!dateStr) {
    alert('Please select a date');
    return;
  }
  
  const patient = dialysisPatients.find(p => p.id === patientId);
  const machine = dialysisMachines.find(m => m.id === machineId);
  
  if (!patient || !machine) {
    alert('Invalid patient or machine selected');
    return;
  }
  
  // Convert date string to Firestore Timestamp
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = time.split(':');
  const sessionDateTime = new Date(year, month - 1, day, hours, minutes);
  
  const sessionData = {
    patientId: patientId,
    patientName: patient.name,
    machineId: machineId,
    machineNumber: machine.machineNumber,
    sessionDate: firebase.firestore.Timestamp.fromDate(sessionDateTime), // ✅ Fixed: Save as Timestamp
    scheduledTime: time,
    duration: duration,
    status: 'scheduled',
    notes: notes,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('dialysisSessions').add(sessionData);
    alert('✅ Session scheduled successfully!');
    closeScheduleSessionModal();
    await loadDialysisData();
  } catch (error) {
    console.error('Error scheduling session:', error);
    alert('❌ Error scheduling session. Please try again.');
  }
}

function openDayScheduleModal(dateStr) {
  // Show all sessions for the day
  const sessions = getSessionsForDate(dateStr);
  
  if (sessions.length === 0) {
    openScheduleSessionModal(dateStr, '08:00');
    return;
  }
  
  const modal = document.getElementById('dayScheduleModal');
  if (!modal) {
    openScheduleSessionModal(dateStr, '08:00');
    return;
  }
  
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  document.getElementById('dayScheduleDate').textContent = formattedDate;
  
  const listHtml = sessions.length > 0 ? sessions.map(s => `
    <div class="day-session-item ${s.status}">
      <div class="session-time">${s.scheduledTime}</div>
      <div class="session-details">
        <div class="session-patient-name">${s.patientName}</div>
        <div class="session-machine-info">Machine ${s.machineNumber} • ${s.duration || 240} mins</div>
      </div>
      <div class="session-actions-mini">
        ${s.status === 'scheduled' ? `<button class="btn-mini" onclick="startDialysisSession('${s.id}')">▶ Start</button>` : ''}
        ${s.status === 'active' ? `<button class="btn-mini" onclick="endDialysisSession('${s.id}')">⏹ End</button>` : ''}
        <button class="btn-mini" onclick="viewSessionDetails('${s.id}')">👁 View</button>
      </div>
    </div>
  `).join('') : '<p class="empty-message">No sessions scheduled for this day</p>';
  
  document.getElementById('daySessionsList').innerHTML = listHtml;
  
  modal.classList.add('active');
  modal.dataset.currentDate = dateStr;
}

function closeDayScheduleModal() {
  document.getElementById('dayScheduleModal').classList.remove('active');
}

function addSessionFromDayModal() {
  const dateStr = document.getElementById('dayScheduleModal').dataset.currentDate;
  closeDayScheduleModal();
  openScheduleSessionModal(dateStr, '08:00');
}

function renderReportsView() {
  const container = document.getElementById('dialysisMainContent');
  if (!container) return;
  
  // Calculate statistics
  const totalSessions = dialysisSessions.length;
  const completedSessions = dialysisSessions.filter(s => s.status === 'completed').length;
  const activeSessions = dialysisSessions.filter(s => s.status === 'active').length;
  const scheduledSessions = dialysisSessions.filter(s => s.status === 'scheduled').length;
  
  const totalPatients = dialysisPatients.length;
  const activePatients = dialysisPatients.filter(p => p.status === 'active').length;
  
  const totalMachines = dialysisMachines.length;
  const availableMachines = dialysisMachines.filter(m => m.status === 'available').length;
  const machinesInUse = dialysisMachines.filter(m => m.status === 'in-use').length;
  
  // Calculate this month's sessions
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSessions = dialysisSessions.filter(s => {
    const sessionDate = s.sessionDate?.toDate ? s.sessionDate.toDate() : new Date(s.sessionDate);
    return sessionDate >= firstDayOfMonth;
  });
  
  // Calculate machine utilization
  const machineUtilization = totalMachines > 0 
    ? ((machinesInUse / totalMachines) * 100).toFixed(1)
    : 0;
  
  // Sessions by patient (top 5)
  const sessionsByPatient = {};
  dialysisSessions.forEach(s => {
    if (s.patientName) {
      sessionsByPatient[s.patientName] = (sessionsByPatient[s.patientName] || 0) + 1;
    }
  });
  
  const topPatients = Object.entries(sessionsByPatient)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Sessions by machine (top 5)
  const sessionsByMachine = {};
  dialysisSessions.forEach(s => {
    if (s.machineNumber) {
      const key = `HD-${s.machineNumber}`;
      sessionsByMachine[key] = (sessionsByMachine[key] || 0) + 1;
    }
  });
  
  const topMachines = Object.entries(sessionsByMachine)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const html = `
    <div class="reports-container">
      <div class="reports-header">
        <h2>📊 Reports & Analytics</h2>
        <div class="report-controls">
          <button class="btn-secondary" onclick="printReport()">🖨️ Print Report</button>
          <button class="btn-primary" onclick="exportReport()">📥 Export to Excel</button>
        </div>
      </div>
      
      <div class="reports-grid">
        <!-- Overall Statistics -->
        <div class="report-section">
          <h3>Overall Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${totalSessions}</div>
              <div class="stat-label">Total Sessions</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${completedSessions}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${activeSessions}</div>
              <div class="stat-label">Active Now</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${scheduledSessions}</div>
              <div class="stat-label">Scheduled</div>
            </div>
          </div>
        </div>
        
        <!-- Patient Statistics -->
        <div class="report-section">
          <h3>Patient Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${totalPatients}</div>
              <div class="stat-label">Total Patients</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${activePatients}</div>
              <div class="stat-label">Active Patients</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${monthSessions.length}</div>
              <div class="stat-label">Sessions This Month</div>
            </div>
          </div>
        </div>
        
        <!-- Machine Statistics -->
        <div class="report-section">
          <h3>Machine Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${totalMachines}</div>
              <div class="stat-label">Total Machines</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${availableMachines}</div>
              <div class="stat-label">Available</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${machinesInUse}</div>
              <div class="stat-label">In Use</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${machineUtilization}%</div>
              <div class="stat-label">Utilization</div>
            </div>
          </div>
        </div>
        
        <!-- Top Patients by Sessions -->
        <div class="report-section">
          <h3>Top Patients by Sessions</h3>
          <div class="ranking-list">
            ${topPatients.length > 0 ? topPatients.map((p, i) => `
              <div class="ranking-item">
                <span class="rank">#${i + 1}</span>
                <span class="name">${p[0]}</span>
                <span class="count">${p[1]} sessions</span>
              </div>
            `).join('') : '<p class="empty-text">No data available</p>'}
          </div>
        </div>
        
        <!-- Top Machines by Usage -->
        <div class="report-section">
          <h3>Top Machines by Usage</h3>
          <div class="ranking-list">
            ${topMachines.length > 0 ? topMachines.map((m, i) => `
              <div class="ranking-item">
                <span class="rank">#${i + 1}</span>
                <span class="name">${m[0]}</span>
                <span class="count">${m[1]} sessions</span>
              </div>
            `).join('') : '<p class="empty-text">No data available</p>'}
          </div>
        </div>
        
        <!-- Monthly Attendance -->
        <div class="report-section full-width">
          <h3>Monthly Session Summary</h3>
          <div class="monthly-summary">
            <div class="summary-stat">
              <strong>This Month:</strong> ${monthSessions.length} total sessions
            </div>
            <div class="summary-stat">
              <strong>Completed:</strong> ${monthSessions.filter(s => s.status === 'completed').length}
            </div>
            <div class="summary-stat">
              <strong>Scheduled:</strong> ${monthSessions.filter(s => s.status === 'scheduled').length}
            </div>
            <div class="summary-stat">
              <strong>Completion Rate:</strong> ${monthSessions.length > 0 ? ((monthSessions.filter(s => s.status === 'completed').length / monthSessions.length) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

function printReport() {
  window.print();
}

function exportReport() {
  alert('📥 Export to Excel functionality coming soon!\n\nThis will generate an Excel file with:\n- Session statistics\n- Patient attendance\n- Machine utilization\n- Financial summary');
}

// ═══════════════════════════════════════════════════════════════
// SEARCH & FILTER SYSTEM
// ═══════════════════════════════════════════════════════════════

let searchTerm = '';
let filterStatus = 'all';
let filterDateRange = 'all';

function initSearchAndFilters() {
  // Add search input to sessions view
  const searchHtml = `
    <div class="search-filter-bar">
      <div class="search-box">
        <input type="text" 
               id="dialysisSearch" 
               placeholder="🔍 Search patients, machines..." 
               oninput="handleSearch(this.value)">
      </div>
      <div class="filter-controls">
        <select id="filterStatus" onchange="handleStatusFilter(this.value)">
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <select id="filterDateRange" onchange="handleDateFilter(this.value)">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <button class="btn-clear-filters" onclick="clearAllFilters()">Clear Filters</button>
      </div>
    </div>
  `;
  
  return searchHtml;
}

function handleSearch(term) {
  searchTerm = term.toLowerCase();
  applyFilters();
}

function handleStatusFilter(status) {
  filterStatus = status;
  applyFilters();
}

function handleDateFilter(range) {
  filterDateRange = range;
  applyFilters();
}

function clearAllFilters() {
  searchTerm = '';
  filterStatus = 'all';
  filterDateRange = 'all';
  
  document.getElementById('dialysisSearch').value = '';
  document.getElementById('filterStatus').value = 'all';
  document.getElementById('filterDateRange').value = 'all';
  
  applyFilters();
}

function applyFilters() {
  // Filter sessions based on search and filters
  let filtered = [...dialysisSessions];
  
  // Apply search
  if (searchTerm) {
    filtered = filtered.filter(s => 
      s.patientName?.toLowerCase().includes(searchTerm) ||
      s.machineNumber?.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply status filter
  if (filterStatus !== 'all') {
    filtered = filtered.filter(s => s.status === filterStatus);
  }
  
  // Apply date filter
  if (filterDateRange !== 'all') {
    const now = new Date();
    filtered = filtered.filter(s => {
      const sessionDate = s.sessionDate?.toDate ? s.sessionDate.toDate() : new Date(s.sessionDate);
      
      switch(filterDateRange) {
        case 'today':
          return isSameDay(sessionDate, now);
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return sessionDate >= monthAgo;
        default:
          return true;
      }
    });
  }
  
  // Re-render with filtered data
  renderFilteredSessions(filtered);
}

function renderFilteredSessions(sessions) {
  const container = document.getElementById('dialysisSessionsContainer');
  if (!container) return;
  
  if (sessions.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No sessions match your filters</p></div>';
    return;
  }
  
  let html = '';
  
  sessions.forEach(session => {
    const statusClass = session.status === 'scheduled' ? 'status-scheduled' : 
                       session.status === 'active' ? 'status-active' : 
                       'status-completed';
    
    const sessionDate = session.sessionDate?.toDate ? session.sessionDate.toDate() : new Date(session.sessionDate);
    
    html += `
      <div class="dialysis-session-card ${statusClass}">
        <div class="session-header">
          <div class="session-patient">
            <h3>${session.patientName}</h3>
            <span class="session-date">${sessionDate.toLocaleDateString()} at ${session.scheduledTime}</span>
          </div>
          <span class="session-status-badge ${statusClass}">${session.status.toUpperCase()}</span>
        </div>
        
        <div class="session-body">
          <div class="session-detail">
            <span class="label">Machine</span>
            <span class="value">HD-${session.machineNumber}</span>
          </div>
          
          <div class="session-detail">
            <span class="label">Duration</span>
            <span class="value">${session.duration || 240} mins</span>
          </div>
          
          ${session.preVitals ? `
            <div class="session-detail">
              <span class="label">Pre-Weight</span>
              <span class="value">${session.preVitals.weight} kg</span>
            </div>
          ` : ''}
          
          ${session.postVitals ? `
            <div class="session-detail">
              <span class="label">Post-Weight</span>
              <span class="value">${session.postVitals.weight} kg</span>
            </div>
          ` : ''}
        </div>
        
        <div class="session-actions">
          ${session.status === 'scheduled' ? `
            <button class="btn-start-session" data-id="${session.id}">▶ Start</button>
          ` : ''}
          
          ${session.status === 'active' ? `
            <button class="btn-monitor-session" data-id="${session.id}">📊 Monitor</button>
            <button class="btn-end-session" data-id="${session.id}">⏹ End</button>
          ` : ''}
          
          <button class="btn-view-session" data-id="${session.id}">👁 View</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  attachSessionListeners();
}

// ═══════════════════════════════════════════════════════════════
// PATIENT CRUD - SAVE & DELETE
// ═══════════════════════════════════════════════════════════════

function closeAddPatientModal() {
  const modal = document.getElementById('addPatientModal');
  modal.classList.remove('active');
}

async function saveNewPatient(e) {
  e.preventDefault();
  
  const patientData = {
    name: document.getElementById('newPatientName').value.trim(),
    age: parseInt(document.getElementById('newPatientAge').value),
    gender: document.getElementById('newPatientGender').value,
    dialysisSchedule: document.getElementById('newPatientSchedule').value,
    dryWeight: parseFloat(document.getElementById('newPatientDryWeight').value),
    accessType: document.getElementById('newPatientAccessType').value,
    diagnosis: document.getElementById('newPatientDiagnosis').value.trim(),
    contactNumber: document.getElementById('newPatientContact').value.trim(),
    emergencyContact: document.getElementById('newPatientEmergency').value.trim(),
    bloodType: document.getElementById('newPatientBloodType').value,
    notes: document.getElementById('newPatientNotes').value.trim(),
    status: 'active',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('dialysisPatients').add(patientData);
    alert('✅ Patient added successfully!');
    closeAddPatientModal();
    await loadDialysisData();
  } catch (error) {
    console.error('Error adding patient:', error);
    alert('❌ Error adding patient. Please try again.');
  }
}

function closeEditPatientModal() {
  const modal = document.getElementById('editPatientModal');
  modal.classList.remove('active');
  delete modal.dataset.patientId;
}

async function saveEditedPatient(e) {
  e.preventDefault();
  
  const modal = document.getElementById('editPatientModal');
  const patientId = modal.dataset.patientId;
  
  if (!patientId) {
    alert('Error: Patient ID not found');
    return;
  }
  
  const updatedData = {
    name: document.getElementById('editPatientName').value.trim(),
    age: parseInt(document.getElementById('editPatientAge').value),
    gender: document.getElementById('editPatientGender').value,
    dialysisSchedule: document.getElementById('editPatientSchedule').value,
    dryWeight: parseFloat(document.getElementById('editPatientDryWeight').value),
    accessType: document.getElementById('editPatientAccessType').value,
    diagnosis: document.getElementById('editPatientDiagnosis').value.trim(),
    contactNumber: document.getElementById('editPatientContact').value.trim(),
    emergencyContact: document.getElementById('editPatientEmergency').value.trim(),
    bloodType: document.getElementById('editPatientBloodType').value,
    notes: document.getElementById('editPatientNotes').value.trim(),
    status: document.getElementById('editPatientStatus').value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('dialysisPatients').doc(patientId).update(updatedData);
    alert('✅ Patient updated successfully!');
    closeEditPatientModal();
    await loadDialysisData();
  } catch (error) {
    console.error('Error updating patient:', error);
    alert('❌ Error updating patient. Please try again.');
  }
}

async function deletePatient(patientId) {
  const patient = dialysisPatients.find(p => p.id === patientId);
  if (!patient) return;
  
  const confirmed = confirm(`Are you sure you want to delete patient "${patient.name}"?\n\nThis action cannot be undone.`);
  if (!confirmed) return;
  
  try {
    await db.collection('dialysisPatients').doc(patientId).delete();
    alert('✅ Patient deleted successfully!');
    await loadDialysisData();
  } catch (error) {
    console.error('Error deleting patient:', error);
    alert('❌ Error deleting patient. Please try again.');
  }
}

// ═══════════════════════════════════════════════════════════════
// MACHINE CRUD - SAVE & DELETE
// ═══════════════════════════════════════════════════════════════

function closeAddMachineModal() {
  const modal = document.getElementById('addMachineModal');
  modal.classList.remove('active');
}

async function saveNewMachine(e) {
  e.preventDefault();
  
  const machineData = {
    machineNumber: document.getElementById('newMachineNumber').value.trim(),
    brand: document.getElementById('newMachineBrand').value.trim(),
    model: document.getElementById('newMachineModel').value.trim(),
    serialNumber: document.getElementById('newMachineSerial').value.trim(),
    location: document.getElementById('newMachineLocation').value.trim(),
    purchaseDate: document.getElementById('newMachinePurchaseDate').value,
    lastMaintenance: document.getElementById('newMachineLastMaintenance').value,
    nextMaintenance: document.getElementById('newMachineNextMaintenance').value,
    notes: document.getElementById('newMachineNotes').value.trim(),
    status: 'available',
    currentPatient: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('dialysisMachines').add(machineData);
    alert('✅ Machine added successfully!');
    closeAddMachineModal();
    await loadDialysisData();
  } catch (error) {
    console.error('Error adding machine:', error);
    alert('❌ Error adding machine. Please try again.');
  }
}

function closeEditMachineModal() {
  const modal = document.getElementById('editMachineModal');
  modal.classList.remove('active');
  delete modal.dataset.machineId;
}

async function saveEditedMachine(e) {
  e.preventDefault();
  
  const modal = document.getElementById('editMachineModal');
  const machineId = modal.dataset.machineId;
  
  if (!machineId) {
    alert('Error: Machine ID not found');
    return;
  }
  
  const updatedData = {
    machineNumber: document.getElementById('editMachineNumber').value.trim(),
    brand: document.getElementById('editMachineBrand').value.trim(),
    model: document.getElementById('editMachineModel').value.trim(),
    serialNumber: document.getElementById('editMachineSerial').value.trim(),
    location: document.getElementById('editMachineLocation').value.trim(),
    purchaseDate: document.getElementById('editMachinePurchaseDate').value,
    lastMaintenance: document.getElementById('editMachineLastMaintenance').value,
    nextMaintenance: document.getElementById('editMachineNextMaintenance').value,
    notes: document.getElementById('editMachineNotes').value.trim(),
    status: document.getElementById('editMachineStatus').value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('dialysisMachines').doc(machineId).update(updatedData);
    alert('✅ Machine updated successfully!');
    closeEditMachineModal();
    await loadDialysisData();
  } catch (error) {
    console.error('Error updating machine:', error);
    alert('❌ Error updating machine. Please try again.');
  }
}

async function deleteMachine(machineId) {
  const machine = dialysisMachines.find(m => m.id === machineId);
  if (!machine) return;
  
  const confirmed = confirm(`Are you sure you want to delete machine "${machine.machineNumber}"?\n\nThis action cannot be undone.`);
  if (!confirmed) return;
  
  try {
    await db.collection('dialysisMachines').doc(machineId).delete();
    alert('✅ Machine deleted successfully!');
    await loadDialysisData();
  } catch (error) {
    console.error('Error deleting machine:', error);
    alert('❌ Error deleting machine. Please try again.');
  }
}