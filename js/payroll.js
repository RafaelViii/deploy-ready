// ═══════════════════════════════════════════════════════════════
// PAYROLL SYSTEM - FIXED
// ═══════════════════════════════════════════════════════════════

let payrollEmployees = [];
let currentPayrollPeriod = '1st'; // '1st' (15th) or '2nd' (30th)
let currentPayrollMonth = 'january';
let currentPayrollYear = '2026';
let approvedOTRecords = [];

// ────────────────────────────────────────────────────────────────
// PAYROLL PERIOD HELPERS
// ────────────────────────────────────────────────────────────────

function getPayrollPeriodDates(period, month, year) {
  const monthIndex = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  }[month.toLowerCase()];

  if (period === '1st') {
    // 1st to 15th
    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex, 15, 23, 59, 59)
    };
  } else {
    // 16th to end of month
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    return {
      start: new Date(year, monthIndex, 16),
      end: new Date(year, monthIndex, lastDay, 23, 59, 59)
    };
  }
}

function isDateInPeriod(dateStr, period, month, year) {
  const date = new Date(dateStr);
  const { start, end } = getPayrollPeriodDates(period, month, year);
  return date >= start && date <= end;
}

// ────────────────────────────────────────────────────────────────
// LOAD APPROVED OT FROM FIREBASE
// ────────────────────────────────────────────────────────────────

async function loadApprovedOT() {
  try {
    const snapshot = await db.collection('leave_requests')
      .where('type', '==', 'overtime')
      .where('status', '==', 'approved')
      .get();

    approvedOTRecords = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      approvedOTRecords.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        otDate: data.otDate,
        otHours: data.otHours,
        otTimeIn: data.otTimeIn,
        otTimeOut: data.otTimeOut,
        approvedAt: data.approvedAt?.toDate(),
        createdAt: data.createdAt?.toDate()
      });
    });

    console.log(`✅ Loaded ${approvedOTRecords.length} approved OT records`);
  } catch (error) {
    console.error('Error loading OT records:', error);
  }
}

// ────────────────────────────────────────────────────────────────
// EXCEL FILE PROCESSING
// ────────────────────────────────────────────────────────────────

async function handleAttendanceImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    await processAttendanceData(rows);
  } catch (error) {
    console.error('Error importing attendance:', error);
    alert('Error importing file: ' + error.message);
  }
}

async function processAttendanceData(rows) {
  if (rows.length < 2) {
    alert('File is empty or invalid');
    return;
  }

  // Find header row (skip date row if present)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(3, rows.length); i++) {
    const row = rows[i];
    if (row.some(cell => cell && cell.toString().toLowerCase().includes('name'))) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rows[headerRowIndex];
  const nameIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('name'));
  const deptIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('department'));

  if (nameIndex === -1) {
    alert('Could not find Name column in the file');
    return;
  }

  payrollEmployees = [];

  // Process each employee row
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[nameIndex]) continue;

    const employeeName = row[nameIndex].toString().trim();
    const department = deptIndex >= 0 ? (row[deptIndex] || 'N/A').toString().trim() : 'N/A';

    // Extract attendance data from the row
    const attendanceData = parseAttendanceRow(row, headers);

    // Match with user in Firebase to get userId
    const userId = await findUserIdByName(employeeName);

    // Get OT hours for this employee
    const otData = await getOTForEmployee(userId || employeeName, currentPayrollPeriod, currentPayrollMonth, currentPayrollYear);

    // Calculate total OT - THIS IS THE FIX!
    const totalOT = otData.reduce((sum, ot) => sum + parseFloat(ot.hours || 0), 0);

    payrollEmployees.push({
      name: employeeName,
      department: department,
      userId: userId,
      attendance: attendanceData,
      overtime: otData,
      totalOTHours: totalOT  // Use calculated value, not from Excel
    });

    console.log(`📊 ${employeeName}: ${otData.length} OT days, Total: ${totalOT}h`);
  }

  renderPayrollCards();
}

function parseAttendanceRow(row, headers) {
  // Extract worktime, late, early, overtime columns
  const attendance = {
    normalHours: 0,
    actualHours: 0,
    lateTimes: 0,
    lateMinutes: 0,
    earlyTimes: 0,
    earlyMinutes: 0,
    normalOT: 0,  // Don't use this for total OT!
    holidayOT: 0,  // Don't use this for total OT!
    workdays: 0,
    trip: 0,
    absence: 0,
    leave: 0
  };

  // Find column indices (adjust based on your Excel structure)
  headers.forEach((header, index) => {
    if (!header) return;
    const h = header.toString().toLowerCase();
    
    if (h.includes('actual') && h.includes('worktime')) {
      attendance.actualHours = parseFloat(row[index]) || 0;
    } else if (h.includes('normal') && h.includes('worktime')) {
      attendance.normalHours = parseFloat(row[index]) || 0;
    } else if (h.includes('late') && h.includes('times')) {
      attendance.lateTimes = parseInt(row[index]) || 0;
    } else if (h.includes('late') && h.includes('minute')) {
      attendance.lateMinutes = parseInt(row[index]) || 0;
    } else if (h.includes('early') && h.includes('times')) {
      attendance.earlyTimes = parseInt(row[index]) || 0;
    } else if (h.includes('early') && h.includes('minute')) {
      attendance.earlyMinutes = parseInt(row[index]) || 0;
    } else if (h.includes('normal') && h.includes('overtime')) {
      attendance.normalOT = parseFloat(row[index]) || 0;
    } else if (h.includes('holiday') && h.includes('overtime')) {
      attendance.holidayOT = parseFloat(row[index]) || 0;
    } else if (h.includes('workday')) {
      attendance.workdays = parseInt(row[index]) || 0;
    } else if (h.includes('trip')) {
      attendance.trip = parseInt(row[index]) || 0;
    } else if (h.includes('absence')) {
      attendance.absence = parseInt(row[index]) || 0;
    } else if (h.includes('leave')) {
      attendance.leave = parseInt(row[index]) || 0;
    }
  });

  return attendance;
}

async function findUserIdByName(name) {
  try {
    const snapshot = await db.collection('users')
      .where('name', '==', name)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    // Try case-insensitive search
    const allUsers = await db.collection('users').get();
    const user = allUsers.docs.find(doc => 
      doc.data().name?.toLowerCase() === name.toLowerCase()
    );

    return user ? user.id : null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

async function getOTForEmployee(userIdOrName, period, month, year) {
  const { start, end } = getPayrollPeriodDates(period, month, year);
  
  console.log(`🔍 Getting OT for "${userIdOrName}" from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`);
  
  const employeeOT = approvedOTRecords.filter(ot => {
    // Match by userId or userName
    const isUser = ot.userId === userIdOrName || 
                   ot.userName === userIdOrName ||
                   ot.userName?.toLowerCase() === userIdOrName?.toLowerCase();
    
    if (!isUser) return false;

    // Check if OT date is in the period
    const otDate = new Date(ot.otDate);
    const inPeriod = otDate >= start && otDate <= end;
    
    if (inPeriod) {
      console.log(`  ✓ ${ot.otDate}: ${ot.otHours}h`);
    }
    
    return inPeriod;
  });

  console.log(`  📊 Total OT records found: ${employeeOT.length}`);

  // Group by date and return
  return employeeOT.map(ot => ({
    date: ot.otDate,
    hours: ot.otHours,
    timeIn: ot.otTimeIn,
    timeOut: ot.otTimeOut
  }));
}

// ────────────────────────────────────────────────────────────────
// RENDER PAYROLL CARDS
// ────────────────────────────────────────────────────────────────

function renderPayrollCards() {
  const container = document.getElementById('payrollAttendanceContent');
  if (!container) return;

  if (payrollEmployees.length === 0) {
    container.innerHTML = `
      <div class="payroll-import-zone" id="payrollImportZone" 
           onclick="document.getElementById('attendanceFileInput').click()"
           ondragover="handleDragOver(event)"
           ondragenter="handleDragEnter(event)"
           ondragleave="handleDragLeave(event)"
           ondrop="handleFileDrop(event)">
        <input type="file" id="attendanceFileInput" accept=".xlsx,.xls,.csv" style="display: none;" onchange="handleAttendanceImport(event)">
        <div class="payroll-import-icon">📄</div>
        <div class="payroll-import-title">Import Attendance</div>
        <div class="payroll-import-subtitle">Click to browse or drag and drop your file here...</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="payroll-cards-grid">
      ${payrollEmployees.map(emp => createPayrollCard(emp)).join('')}
    </div>
  `;
}

function createPayrollCard(employee) {
  const { start, end } = getPayrollPeriodDates(currentPayrollPeriod, currentPayrollMonth, currentPayrollYear);
  
  // Generate date rows for the period
  const dateRows = [];
  const current = new Date(start);
  
  while (current <= end) {
    const dateStr = current.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
    const dayOT = employee.overtime.find(ot => {
      const otDate = new Date(ot.date);
      return otDate.toDateString() === current.toDateString();
    });

    dateRows.push(`
      <tr>
        <td class="date-cell">${dateStr}</td>
        <td><span class="time-badge">8↓</span></td>
        <td><span class="time-badge">12C</span></td>
        <td><span class="time-badge">1↓</span></td>
        <td><span class="time-badge ${dayOT ? 'time-badge-ot' : ''}">${dayOT ? dayOT.timeOut : '5:00C'}</span></td>
        <td>
          <select class="time-select">
            <option value="9:00am">9:00am</option>
            <option value="8:00am" selected>8:00am</option>
          </select>
        </td>
        <td class="duration-cell">8h</td>
        <td class="ot-cell">${dayOT ? dayOT.hours : 0}</td>
      </tr>
    `);

    current.setDate(current.getDate() + 1);
  }

  return `
    <div class="payroll-employee-card">
      <div class="payroll-card-header">
        <div class="employee-info">
          <div class="employee-name">${employee.name}</div>
          <div class="employee-department">${employee.department} Department</div>
        </div>
        <div class="employee-id">User ID: ${employee.userId || 'N/A'}</div>
      </div>
      
      <div class="payroll-card-table-wrapper">
        <table class="payroll-card-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th colspan="2">BEFORE NOON</th>
              <th colspan="2">AFTER NOON</th>
              <th>REQUIRED TIME</th>
              <th>DURATION</th>
              <th>TOTAL OT</th>
            </tr>
            <tr class="sub-header">
              <th></th>
              <th>IN</th>
              <th>OUT</th>
              <th>IN</th>
              <th>OUT</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${dateRows.join('')}
          </tbody>
        </table>
      </div>

      <div class="payroll-card-summary">
        <div class="summary-item">
          <span class="summary-label">Normal Hours:</span>
          <span class="summary-value">${employee.attendance.normalHours}h</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Actual Hours:</span>
          <span class="summary-value">${employee.attendance.actualHours}h</span>
        </div>
        <div class="summary-item highlight">
          <span class="summary-label">Total OT Hours:</span>
          <span class="summary-value">${employee.totalOTHours.toFixed(1)}h (${employee.overtime.length} days)</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Late (Times/Min):</span>
          <span class="summary-value">${employee.attendance.lateTimes} / ${employee.attendance.lateMinutes}m</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Workdays:</span>
          <span class="summary-value">${employee.attendance.workdays}</span>
        </div>
      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// DRAG AND DROP HANDLERS
// ────────────────────────────────────────────────────────────────

function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
}

function handleDragEnter(event) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.classList.remove('drag-over');
}

function handleFileDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.classList.remove('drag-over');

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const input = document.getElementById('attendanceFileInput');
    input.files = files;
    handleAttendanceImport({ target: input });
  }
}

// ────────────────────────────────────────────────────────────────
// PAYROLL CONTROLS
// ────────────────────────────────────────────────────────────────

function updatePayrollPeriod() {
  currentPayrollPeriod = document.getElementById('payrollPeriodSelect').value;
  if (payrollEmployees.length > 0) {
    // Re-process to get OT for new period
    const fileInput = document.getElementById('attendanceFileInput');
    if (fileInput.files[0]) {
      handleAttendanceImport({ target: fileInput });
    }
  }
}

async function savePayrollData() {
  if (payrollEmployees.length === 0) {
    alert('No payroll data to save');
    return;
  }

  try {
    const payrollId = `${currentPayrollMonth}_${currentPayrollYear}_${currentPayrollPeriod}`;
    
    await db.collection('payroll').doc(payrollId).set({
      period: currentPayrollPeriod,
      month: currentPayrollMonth,
      year: currentPayrollYear,
      employees: payrollEmployees,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: currentUser?.uid
    });

    alert('✅ Payroll data saved successfully!');
  } catch (error) {
    console.error('Error saving payroll:', error);
    alert('Error saving payroll: ' + error.message);
  }
}

function exportPayrollData() {
  if (payrollEmployees.length === 0) {
    alert('No payroll data to export');
    return;
  }

  // Create Excel export
  const exportData = payrollEmployees.map(emp => ({
    'Name': emp.name,
    'Department': emp.department,
    'User ID': emp.userId || 'N/A',
    'Normal Hours': emp.attendance.normalHours,
    'Actual Hours': emp.attendance.actualHours,
    'Total OT Hours': emp.totalOTHours,
    'Late Times': emp.attendance.lateTimes,
    'Late Minutes': emp.attendance.lateMinutes,
    'Workdays': emp.attendance.workdays,
    'Absence': emp.attendance.absence,
    'Leave': emp.attendance.leave
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payroll');

  const filename = `Payroll_${currentPayrollMonth}_${currentPayrollYear}_${currentPayrollPeriod}.xlsx`;
  XLSX.writeFile(wb, filename);

  alert(`✅ Exported payroll data to ${filename}`);
}

// ────────────────────────────────────────────────────────────────
// INITIALIZATION
// ────────────────────────────────────────────────────────────────

function initPayrollSystem() {
  // Load approved OT records
  loadApprovedOT();

  // Set current date
  const dateEl = document.getElementById('payrollCurrentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Initialize month and year selects to current
  const now = new Date();
  const monthSelect = document.getElementById('payrollMonthSelect');
  const yearSelect = document.getElementById('payrollYearSelect');
  
  if (monthSelect) {
    currentPayrollMonth = monthSelect.value;
  }
  
  if (yearSelect) {
    currentPayrollYear = yearSelect.value;
  }
}

// Initialize when user is loaded
setTimeout(() => {
  if (currentUser) {
    initPayrollSystem();
  }
}, 2000);