// ═══════════════════════════════════════════════════════════════
// PAYROLL CALCULATION SYSTEM
// ═══════════════════════════════════════════════════════════════

let payrollCalculationData = [];
let employeePayrollRates = {};

// ────────────────────────────────────────────────────────────────
// SWITCH PAYROLL TAB
// ────────────────────────────────────────────────────────────────

window.switchPayrollTab = function(tabName) {
  console.log('Switching to payroll tab:', tabName);
  
  // Hide all tab contents
  document.querySelectorAll('.payroll-tab-content').forEach(tab => {
    tab.classList.remove('active');
    tab.style.display = 'none';
  });

  // Remove active class from all tab buttons
  document.querySelectorAll('.payroll-tab').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const targetTab = document.getElementById('payroll' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab');
  if (targetTab) {
    targetTab.classList.add('active');
    targetTab.style.display = 'block';
  }

  // Add active class to clicked button
  const activeBtn = document.querySelector(`.payroll-tab[onclick*="${tabName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  // Refresh overtime tab content when switched to
  if (tabName === 'overtime') {
    renderApprovedOvertimeTab();
  }

  // Refresh payroll tab content when switched to
  if (tabName === 'payroll' && payrollCalculationData.length > 0) {
    renderPayrollCalculation();
  }
};

// ────────────────────────────────────────────────────────────────
// EMPLOYEE PAYROLL RATES (Sample - should come from Firebase)
// ────────────────────────────────────────────────────────────────

const defaultPayrollRates = {
  'Dian Santiago': { 
    position: 'Admin Manager', 
    dailyRate: 919.54, 
    hourlyRate: 114.94, 
    basicSalary: 10000, 
    allowance: 4500,
    sss: 900,
    hdmf: 897.18,
    philhealth: 0,
    hmo: 625,
    loans: 1000
  },
  'Lara Mae Petilo': { 
    position: 'HD Head Nurse', 
    dailyRate: 1195.40, 
    hourlyRate: 149.40, 
    basicSalary: 13000, 
    allowance: 2000,
    sss: 1300,
    hdmf: 0,
    philhealth: 0,
    hmo: 625,
    loans: 0
  },
  'John Jerc Reyes': { 
    position: 'HD Staff Nurse', 
    dailyRate: 1057.47, 
    hourlyRate: 132.18, 
    basicSalary: 11500, 
    allowance: 1000,
    sss: 1150,
    hdmf: 0,
    philhealth: 0,
    hmo: 0,
    loans: 0
  },
  'Carol Diola': { 
    position: 'HD Staff Nurse', 
    dailyRate: 1057.47, 
    hourlyRate: 132.18, 
    basicSalary: 11500, 
    allowance: 1000,
    sss: 1150,
    hdmf: 0,
    philhealth: 0,
    hmo: 625,
    loans: 0
  },
  'Hannah Ortoyo': { 
    position: 'HD Staff Nurse', 
    dailyRate: 827.58, 
    hourlyRate: 103.44, 
    basicSalary: 9000, 
    allowance: 0,
    sss: 800,
    hdmf: 0,
    philhealth: 0,
    hmo: 625,
    loans: 0
  },
  'Bernadeth Lagdamen': { 
    position: 'HD Staff Nurse', 
    dailyRate: 827.58, 
    hourlyRate: 103.44, 
    basicSalary: 9000, 
    allowance: 0,
    sss: 800,
    hdmf: 0,
    philhealth: 0,
    hmo: 625,
    loans: 0
  },
  'Alexander Dolencio': { 
    position: 'HD Technician', 
    dailyRate: 1057.47, 
    hourlyRate: 132.18, 
    basicSalary: 11500, 
    allowance: 1000,
    sss: 1150,
    hdmf: 0,
    philhealth: 0,
    hmo: 0,
    loans: 0
  },
  'Michael Callangan': { 
    position: 'HD Re-use Tech', 
    dailyRate: 735.63, 
    hourlyRate: 91.95, 
    basicSalary: 8000, 
    allowance: 1000,
    sss: 800,
    hdmf: 0,
    philhealth: 0,
    hmo: 0,
    loans: 0
  },
  'Angelo Binondo': { 
    position: 'Utility/Orderly', 
    dailyRate: 459.77, 
    hourlyRate: 57.47, 
    basicSalary: 5000, 
    allowance: 0,
    sss: 500,
    hdmf: 0,
    philhealth: 0,
    hmo: 0,
    loans: 500
  }
};

// ────────────────────────────────────────────────────────────────
// LOAD EMPLOYEE RATES FROM FIREBASE
// ────────────────────────────────────────────────────────────────

async function loadEmployeePayrollRates() {
  try {
    console.log('📊 Loading employee payroll rates from Firebase...');
    
    const snapshot = await db.collection('employee_rates').get();
    
    if (snapshot.empty) {
      console.log('⚠️ No rates found in Firebase, using defaults');
      employeePayrollRates = { ...defaultPayrollRates };
    } else {
      snapshot.forEach(doc => {
        employeePayrollRates[doc.id] = doc.data();
      });
      console.log(`✅ Loaded ${snapshot.size} employee rates from Firebase`);
    }
  } catch (error) {
    console.error('❌ Error loading payroll rates:', error);
    employeePayrollRates = { ...defaultPayrollRates };
  }
}

// ────────────────────────────────────────────────────────────────
// CALCULATE PAYROLL FROM ATTENDANCE + OT
// ────────────────────────────────────────────────────────────────

async function calculatePayroll() {
  if (!window.payrollEmployees || payrollEmployees.length === 0) {
    alert('⚠️ Please import attendance data first!');
    return;
  }

  console.log('💰 Calculating payroll...');
  console.log('Employees:', payrollEmployees.length);

  payrollCalculationData = [];

  for (const employee of payrollEmployees) {
    const rates = employeePayrollRates[employee.name] || defaultPayrollRates[employee.name];
    
    if (!rates) {
      console.warn(`⚠️ No payroll rates found for ${employee.name}`);
      continue;
    }

    // Calculate OT Pay
    const otHours = employee.totalOTHours || 0;
    const otPay = rates.hourlyRate * otHours;

    // Holiday calculations (2 holidays @ 30%, 2 @ 200%)
    const holiday30 = rates.dailyRate * 0.30 * 2;
    const doublePay = rates.dailyRate * 2;

    // Gross Pay
    const grossPay = rates.basicSalary + rates.allowance + holiday30 + doublePay + otPay;

    // Deductions
    const sss = rates.sss || 0;
    const hdmf = rates.hdmf || 0;
    const philhealth = rates.philhealth || 0;
    const hmo = rates.hmo || 0;
    const loans = rates.loans || 0;
    const totalDeductions = sss + hdmf + philhealth + hmo + loans;

    // Net Pay
    const netPay = grossPay - totalDeductions;

    payrollCalculationData.push({
      name: employee.name,
      department: employee.department,
      userId: employee.userId,
      position: rates.position,
      dailyRate: rates.dailyRate,
      hourlyRate: rates.hourlyRate,
      basicSalary: rates.basicSalary,
      allowance: rates.allowance,
      holiday30: holiday30,
      doublePay: doublePay,
      otHours: otHours,
      otPay: otPay,
      grossPay: grossPay,
      sss: sss,
      hdmf: hdmf,
      philhealth: philhealth,
      hmo: hmo,
      loans: loans,
      totalDeductions: totalDeductions,
      netPay: netPay,
      attendance: employee.attendance,
      overtime: employee.overtime
    });
  }

  console.log('✅ Payroll calculated for', payrollCalculationData.length, 'employees');
  renderPayrollCalculation();
}

// ────────────────────────────────────────────────────────────────
// RENDER PAYROLL CALCULATION TABLE
// ────────────────────────────────────────────────────────────────

function renderPayrollCalculation() {
  const container = document.getElementById('payrollPayrollContent');
  if (!container) return;

  if (payrollCalculationData.length === 0) {
    container.innerHTML = `
      <div class="payroll-import-zone">
        <div class="payroll-import-icon">💰</div>
        <div class="payroll-import-title">No Payroll Data</div>
        <div class="payroll-import-subtitle">Import attendance data first, then calculate payroll</div>
        <button class="payroll-btn payroll-btn-primary" onclick="calculatePayroll()" style="margin-top: 1.5rem;">
          Calculate Payroll
        </button>
      </div>
    `;
    return;
  }

  let totalNetPay = 0;
  let totalGrossPay = 0;
  let totalOTPay = 0;
  let totalDeductions = 0;

  const rows = payrollCalculationData.map(emp => {
    totalNetPay += emp.netPay;
    totalGrossPay += emp.grossPay;
    totalOTPay += emp.otPay;
    totalDeductions += emp.totalDeductions;

    return `
      <tr>
        <td class="employee-name">${emp.name}</td>
        <td>${emp.position}</td>
        <td class="amount">₱${emp.dailyRate.toFixed(2)}</td>
        <td class="amount">₱${emp.hourlyRate.toFixed(2)}</td>
        <td class="amount">₱${emp.basicSalary.toFixed(2)}</td>
        <td class="amount">₱${emp.allowance.toFixed(2)}</td>
        <td class="amount">₱${emp.holiday30.toFixed(2)}</td>
        <td class="amount">₱${emp.doublePay.toFixed(2)}</td>
        <td class="amount">${emp.otHours.toFixed(1)}</td>
        <td class="amount">₱${emp.otPay.toFixed(2)}</td>
        <td class="amount">₱${emp.sss.toFixed(2)}</td>
        <td class="amount">₱${emp.hdmf.toFixed(2)}</td>
        <td class="amount">₱${emp.philhealth.toFixed(2)}</td>
        <td class="amount">₱${emp.hmo.toFixed(2)}</td>
        <td class="amount">₱${emp.loans.toFixed(2)}</td>
        <td class="amount">₱${emp.totalDeductions.toFixed(2)}</td>
        <td class="amount net-pay">₱${emp.netPay.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="payroll-summary-stats">
      <div class="summary-stat-card">
        <div class="stat-label">Total Gross Pay</div>
        <div class="stat-value">₱${totalGrossPay.toFixed(2)}</div>
      </div>
      <div class="summary-stat-card">
        <div class="stat-label">Total OT Pay</div>
        <div class="stat-value">₱${totalOTPay.toFixed(2)}</div>
      </div>
      <div class="summary-stat-card">
        <div class="stat-label">Total Deductions</div>
        <div class="stat-value">₱${totalDeductions.toFixed(2)}</div>
      </div>
      <div class="summary-stat-card highlight">
        <div class="stat-label">Total Net Pay</div>
        <div class="stat-value">₱${totalNetPay.toFixed(2)}</div>
      </div>
    </div>

    <div class="payroll-computation-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0; color: #111827;">Payroll Computation</h3>
        <div style="display: flex; gap: 0.5rem;">
          <button class="payroll-btn payroll-btn-secondary" onclick="exportPayslips()">
            📥 Export Payslips
          </button>
          <button class="payroll-btn payroll-btn-export" onclick="exportPayrollToExcel()">
            📊 Export to Excel
          </button>
        </div>
      </div>
      <div style="font-size: 0.85rem; color: #6b7280; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
        <span style="font-size: 1rem;">↔️</span> Scroll horizontally to view all columns
      </div>
      <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <table class="payroll-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Position</th>
              <th>Daily Rate</th>
              <th>Hourly Rate</th>
              <th>Basic Salary</th>
              <th>Allowance</th>
              <th>Holiday 30%</th>
              <th>Double Pay</th>
              <th>OT Hours</th>
              <th>OT Pay</th>
              <th>SSS</th>
              <th>HDMF</th>
              <th>PhilHealth</th>
              <th>HMO</th>
              <th>Loans</th>
              <th>Total Deductions</th>
              <th>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="16" style="text-align: right; font-weight: 700;">TOTAL NET PAY:</td>
              <td class="amount net-pay" style="font-size: 1.1rem;">₱${totalNetPay.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// EXPORT PAYSLIPS
// ────────────────────────────────────────────────────────────────

function exportPayslips() {
  if (payrollCalculationData.length === 0) {
    alert('No payroll data to export');
    return;
  }

  const period = document.getElementById('payrollPeriodSelect').value;
  const month = document.getElementById('payrollMonthSelect').value;
  const year = document.getElementById('payrollYearSelect').value;

  try {
    const wb = XLSX.utils.book_new();
    const payslipRows = [];

    // Header
    payslipRows.push(['EMPLOYEE PAYSLIPS - ' + month.toUpperCase() + ' ' + year + ' (' + period + ')']);
    payslipRows.push([]);

    // For each employee
    payrollCalculationData.forEach((emp, index) => {
      // Employee header
      payslipRows.push(['EMPLOYEE: ' + emp.name.toUpperCase()]);
      payslipRows.push(['Position:', emp.position]);
      payslipRows.push(['Employee ID:', emp.userId || 'N/A']);
      payslipRows.push([]);

      // Earnings
      payslipRows.push(['EARNINGS', 'AMOUNT']);
      payslipRows.push(['Basic Salary', emp.basicSalary.toFixed(2)]);
      payslipRows.push(['Allowance', emp.allowance.toFixed(2)]);
      payslipRows.push(['Holiday 30%', emp.holiday30.toFixed(2)]);
      payslipRows.push(['Double Pay', emp.doublePay.toFixed(2)]);
      payslipRows.push(['OT Pay (' + emp.otHours.toFixed(1) + ' hrs)', emp.otPay.toFixed(2)]);
      payslipRows.push(['GROSS PAY', emp.grossPay.toFixed(2)]);
      payslipRows.push([]);

      // Deductions
      payslipRows.push(['DEDUCTIONS', 'AMOUNT']);
      if (emp.sss > 0) payslipRows.push(['SSS', emp.sss.toFixed(2)]);
      if (emp.hdmf > 0) payslipRows.push(['HDMF/Pag-ibig', emp.hdmf.toFixed(2)]);
      if (emp.philhealth > 0) payslipRows.push(['PhilHealth', emp.philhealth.toFixed(2)]);
      if (emp.hmo > 0) payslipRows.push(['HMO', emp.hmo.toFixed(2)]);
      if (emp.loans > 0) payslipRows.push(['Loans', emp.loans.toFixed(2)]);
      payslipRows.push(['TOTAL DEDUCTIONS', emp.totalDeductions.toFixed(2)]);
      payslipRows.push([]);

      // Net Pay
      payslipRows.push(['NET PAY', emp.netPay.toFixed(2)]);
      payslipRows.push([]);
      payslipRows.push(['_______________________________________']);
      payslipRows.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(payslipRows);
    ws['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Payslips');

    const filename = `Payslips_${month}_${year}_${period}.xlsx`;
    XLSX.writeFile(wb, filename);

    alert('✅ Payslips exported!\n\nFile: ' + filename);
  } catch (error) {
    console.error('Export error:', error);
    alert('❌ Error exporting payslips: ' + error.message);
  }
}

// ────────────────────────────────────────────────────────────────
// EXPORT PAYROLL TO EXCEL
// ────────────────────────────────────────────────────────────────

function exportPayrollToExcel() {
  if (payrollCalculationData.length === 0) {
    alert('No payroll data to export');
    return;
  }

  const period = document.getElementById('payrollPeriodSelect').value;
  const month = document.getElementById('payrollMonthSelect').value;
  const year = document.getElementById('payrollYearSelect').value;

  try {
    const exportData = payrollCalculationData.map(emp => ({
      'Employee Name': emp.name,
      'Position': emp.position,
      'Department': emp.department,
      'User ID': emp.userId || 'N/A',
      'Daily Rate': emp.dailyRate,
      'Hourly Rate': emp.hourlyRate,
      'Basic Salary': emp.basicSalary,
      'Allowance': emp.allowance,
      'Holiday 30%': emp.holiday30,
      'Double Pay': emp.doublePay,
      'OT Hours': emp.otHours,
      'OT Pay': emp.otPay,
      'Gross Pay': emp.grossPay,
      'SSS': emp.sss,
      'HDMF': emp.hdmf,
      'PhilHealth': emp.philhealth,
      'HMO': emp.hmo,
      'Loans': emp.loans,
      'Total Deductions': emp.totalDeductions,
      'Net Pay': emp.netPay
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 12 },
      { wch: 8 }, { wch: 8 }, { wch: 16 }, { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');

    const filename = `Payroll_${month}_${year}_${period}.xlsx`;
    XLSX.writeFile(wb, filename);

    alert('✅ Payroll exported to ' + filename);
  } catch (error) {
    console.error('Export error:', error);
    alert('❌ Error exporting: ' + error.message);
  }
}

// ────────────────────────────────────────────────────────────────
// RENDER APPROVED OVERTIME TAB
// ────────────────────────────────────────────────────────────────

function renderApprovedOvertimeTab() {
  const container = document.getElementById('payrollOvertimeContent');
  if (!container) return;

  if (!window.payrollEmployees || payrollEmployees.length === 0) {
    container.innerHTML = `
      <div class="ot-empty-state">
        <div class="ot-empty-icon">⏰</div>
        <div class="ot-empty-title">No Overtime Data</div>
        <div class="ot-empty-message">Import attendance data to view overtime records</div>
      </div>
    `;
    return;
  }

  let html = '<div class="ot-cards-grid">';

  payrollEmployees.forEach(emp => {
    const otRecords = emp.overtime || [];
    const totalHours = emp.totalOTHours || 0;

    html += `
      <div class="ot-employee-card">
        <div class="ot-card-header">
          <div class="employee-card-info">
            <h3>${emp.name}</h3>
            <div class="employee-card-meta">${emp.department} | User ID: ${emp.userId || 'N/A'}</div>
          </div>
        </div>
        ${otRecords.length > 0 ? `
          <div class="ot-records-list">
            ${otRecords.map(record => `
              <div class="ot-record-item">
                <div>
                  <div class="ot-record-date">Approved OT</div>
                  <div class="ot-record-time">${record.date}</div>
                </div>
                <div>
                  <div class="ot-record-time">${record.timeIn} - ${record.timeOut}</div>
                </div>
                <div>
                  <div class="ot-record-hours">${record.hours}</div>
                  <div class="ot-record-time" style="text-align: center;">hrs</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="ot-total-row">
            <span class="ot-total-label">Total OT Hours:</span>
            <span class="ot-total-value">${totalHours.toFixed(1)}</span>
          </div>
        ` : `
          <div class="empty-ot-message">
            No overtime records
          </div>
        `}
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// ────────────────────────────────────────────────────────────────
// INITIALIZE
// ────────────────────────────────────────────────────────────────

async function initializePayrollCalculation() {
  console.log('🔧 Initializing Payroll Calculation System');
  
  await loadEmployeePayrollRates();
  
  console.log('✅ Payroll Calculation System Ready');
}

// ────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ────────────────────────────────────────────────────────────────

// Sort employees (if not already defined)
window.sortPayrollEmployees = function() {
  const sortBy = document.getElementById('payrollSortSelect')?.value;
  
  if (!window.payrollEmployees || payrollEmployees.length === 0) {
    return;
  }
  
  if (sortBy === 'name') {
    payrollEmployees.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'department') {
    payrollEmployees.sort((a, b) => a.department.localeCompare(b.department));
  } else if (sortBy === 'id') {
    payrollEmployees.sort((a, b) => (a.userId || '').localeCompare(b.userId || ''));
  }
  
  // Re-render current tab
  const activeTab = document.querySelector('.payroll-tab.active');
  if (activeTab) {
    const tabName = activeTab.textContent.toLowerCase().replace(/\s+/g, '');
    if (tabName.includes('overtime')) {
      renderApprovedOvertimeTab();
    } else if (tabName.includes('payroll')) {
      if (payrollCalculationData.length > 0) {
        renderPayrollCalculation();
      }
    }
  }
};

// Handle drag and drop events (if not already defined globally)
if (typeof window.handleDragOver === 'undefined') {
  window.handleDragOver = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };
}

if (typeof window.handleDragEnter === 'undefined') {
  window.handleDragEnter = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
  };
}

if (typeof window.handleDragLeave === 'undefined') {
  window.handleDragLeave = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
  };
}

if (typeof window.handleFileDrop === 'undefined') {
  window.handleFileDrop = function(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const input = document.getElementById('attendanceFileInput');
      if (input) {
        input.files = files;
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
      }
    }
  };
}

// Initialize when page loads
setTimeout(() => {
  if (typeof currentUser !== 'undefined' && currentUser) {
    initializePayrollCalculation();
  }
}, 2000);