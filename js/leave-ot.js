// ═══════════════════════════════════════════════════════════════
// LEAVE & OT MANAGEMENT
// ═══════════════════════════════════════════════════════════════

async function loadLeaveRequests() {
  try {
    let snapshot;
    if (currentUser?.role === 'admin') {
      snapshot = await db.collection('leave_requests').orderBy('createdAt', 'desc').get();
    } else {
      snapshot = await db.collection('leave_requests').where('userId', '==', currentUser.uid).get();
    }
    
    allLeaveRequests = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const request = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()
      };
      
      // Only add startDate/endDate for leave requests, not OT
      if (data.type === 'leave') {
        request.startDate = data.startDate?.toDate?.() || new Date(data.startDate);
        request.endDate = data.endDate?.toDate?.() || new Date(data.endDate);
      }
      
      allLeaveRequests.push(request);
    });
    
    if (currentUser?.role !== 'admin') {
      allLeaveRequests.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    renderLeaveRequests();
    updateLeaveStats();
  } catch (error) {
    console.error('Error loading leave requests:', error);
  }
}

function renderLeaveRequests() {
  const container = document.getElementById('leaveRequestsList');
  if (!container) return;
  
  let filtered = allLeaveRequests.filter(req => {
    if (currentLeaveFilter === 'pending') return req.status === 'pending';
    if (currentLeaveFilter === 'active') return req.status === 'approved' && req.type === 'leave';
    if (currentLeaveFilter === 'approved') return req.status === 'approved' && req.type === 'leave';
    if (currentLeaveFilter === 'approved-ot') return req.status === 'approved' && req.type === 'overtime';
    if (currentLeaveFilter === 'rejected') return req.status === 'rejected';
    if (currentLeaveFilter === 'all') return true;
    return true;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>📋</p><p>No requests found</p></div>';
    return;
  }
  
  container.innerHTML = filtered.map(req => {
    const statusColor = req.status === 'approved' ? '#10b981' : 
                        req.status === 'rejected' ? '#ef4444' : '#f59e0b';
    const statusBg = req.status === 'approved' ? '#d1fae5' : 
                     req.status === 'rejected' ? '#fee2e2' : '#fef3c7';
    
    return `
      <div class="leave-request-card">
        <h3>${req.type === 'overtime' ? '⏰ Overtime Request' : '🏖️ Leave Request'}</h3>
        <p><strong>${req.userName || req.userEmail}</strong></p>
        <span class="status-badge" style="background: ${statusBg}; color: ${statusColor};">
          ${req.status.toUpperCase()}
        </span>
        
        ${req.type === 'leave' ? `
          <div class="info-row">
            <span>Leave Type</span>
            <strong>${req.leaveType}</strong>
          </div>
          <div class="info-row">
            <span>Duration</span>
            <strong>${req.days} day(s)</strong>
          </div>
          <div class="info-row">
            <span>Start Date</span>
            <strong>${req.startDate.toLocaleDateString('en-US')}</strong>
          </div>
          <div class="info-row">
            <span>End Date</span>
            <strong>${req.endDate.toLocaleDateString('en-US')}</strong>
          </div>
        ` : `
          <div class="info-row">
            <span>Date</span>
            <strong>${req.otDate}</strong>
          </div>
          <div class="info-row">
            <span>Hours</span>
            <strong>${req.otHours} hour(s)</strong>
          </div>
          <div class="info-row">
            <span>Time</span>
            <strong>${req.otTimeIn} - ${req.otTimeOut}</strong>
          </div>
        `}
        
        <div class="info-row">
          <span>Reason</span>
          <p>${req.reason}</p>
        </div>
        
        ${currentUser?.role === 'admin' && req.status === 'pending' ? `
          <div class="action-buttons">
            <button class="btn-reject-request" data-id="${req.id}">❌ Reject</button>
            <button class="btn-approve-request" data-id="${req.id}" data-type="${req.type}">✅ Approve</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  attachLeaveHandlers();
}

function updateLeaveStats() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const pending = allLeaveRequests.filter(r => r.status === 'pending').length;
  const active = allLeaveRequests.filter(r => r.status === 'approved' && r.type === 'leave').length;
  const approved = allLeaveRequests.filter(r => {
    const createdDate = r.createdAt;
    return r.status === 'approved' && 
           createdDate?.getMonth() === currentMonth && 
           createdDate?.getFullYear() === currentYear;
  }).length;
  const rejected = allLeaveRequests.filter(r => {
    const createdDate = r.createdAt;
    return r.status === 'rejected' && 
           createdDate?.getMonth() === currentMonth && 
           createdDate?.getFullYear() === currentYear;
  }).length;
  
  if (document.getElementById('pendingCount')) 
    document.getElementById('pendingCount').textContent = pending;
  if (document.getElementById('activeLeaveCount')) 
    document.getElementById('activeLeaveCount').textContent = active;
  if (document.getElementById('approvedCount')) 
    document.getElementById('approvedCount').textContent = approved;
  if (document.getElementById('rejectedCount')) 
    document.getElementById('rejectedCount').textContent = rejected;
}

function attachLeaveHandlers() {
  document.querySelectorAll('.btn-approve-request').forEach(btn => {
    btn.addEventListener('click', async () => {
      const requestId = btn.dataset.id;
      const requestType = btn.dataset.type;
      
      if (!confirm('Approve this request?')) return;
      
      try {
        console.log('Approving request:', requestId, 'Type:', requestType);
        
        await db.collection('leave_requests').doc(requestId).update({
          status: 'approved',
          approvedBy: currentUser.uid,
          approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Request approved successfully');
        
        if (requestType === 'overtime') {
          if (document.getElementById('payrollOvertimeTab')?.classList.contains('active')) {
            renderOvertimeCards();
          }
        }
        
        alert('✅ Request approved!');
        await loadLeaveRequests();
        
        console.log('Leave requests reloaded. Total:', allLeaveRequests.length);
      } catch (error) {
        console.error('Approval error:', error);
        alert('Error: ' + error.message);
      }
    });
  });
  
  document.querySelectorAll('.btn-reject-request').forEach(btn => {
    btn.addEventListener('click', async () => {
      const requestId = btn.dataset.id;
      
      if (!confirm('Reject this request?')) return;
      
      try {
        await db.collection('leave_requests').doc(requestId).update({
          status: 'rejected',
          rejectedBy: currentUser.uid,
          rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('✅ Request rejected!');
        await loadLeaveRequests();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  });
}

function updateOTHours() {
  const timeIn = document.getElementById('otTimeIn').value;
  const timeOut = document.getElementById('otTimeOut').value;
  
  if (timeIn && timeOut) {
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    
    let hours = outH - inH;
    let minutes = outM - inM;
    
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    
    const totalHours = hours + (minutes / 60);
    const display = document.querySelector('#otHoursDisplay .hours-value');
    if (display) display.textContent = totalHours.toFixed(1);
  }
}

function initLeaveListeners() {
  // Tab filters
  document.querySelectorAll('.leave-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentLeaveFilter = tab.dataset.filter;
      document.querySelectorAll('.leave-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLeaveRequests();
    });
  });
  
  // Apply leave modal
  document.getElementById('applyLeaveBtn')?.addEventListener('click', () => {
    document.getElementById('applyLeaveModal')?.classList.add('active');
  });
  
  // Apply OT modal
  document.getElementById('applyOTBtn')?.addEventListener('click', () => {
    document.getElementById('applyOTModal')?.classList.add('active');
  });
  
  // Close modals
  document.getElementById('closeApplyLeaveModal')?.addEventListener('click', () => {
    document.getElementById('applyLeaveModal')?.classList.remove('active');
  });
  
  document.getElementById('closeApplyOTModal')?.addEventListener('click', () => {
    document.getElementById('applyOTModal')?.classList.remove('active');
  });
  
  // OT time calculations
  document.getElementById('otTimeIn')?.addEventListener('change', updateOTHours);
  document.getElementById('otTimeOut')?.addEventListener('change', updateOTHours);
  
  // OT form submission
  document.getElementById('applyOTForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const timeIn = document.getElementById('otTimeIn').value;
    const timeOut = document.getElementById('otTimeOut').value;
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    
    let hours = outH - inH;
    let minutes = outM - inM;
    if (minutes < 0) {
      hours--;
      minutes += 60;
    }
    const totalHours = hours + (minutes / 60);
    
    const otData = {
      type: 'overtime',
      otDate: document.getElementById('otDate').value,
      otTimeIn: timeIn,
      otTimeOut: timeOut,
      otHours: parseFloat(totalHours.toFixed(1)),
      reason: document.getElementById('otReason').value,
      status: 'pending',
      userId: currentUser.uid,
      userName: currentUser.name,
      userEmail: currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
      await db.collection('leave_requests').add(otData);
      alert('✅ Overtime application submitted!');
      document.getElementById('applyOTModal').classList.remove('active');
      await loadLeaveRequests();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
}