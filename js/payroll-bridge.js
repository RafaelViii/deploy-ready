// ═══════════════════════════════════════════════════════════════
// PAYROLL BRIDGE - Connects payroll-system.js with payroll-calculation.js
// Add this script in your HTML between payroll-system.js and payroll-calculation.js
// ═══════════════════════════════════════════════════════════════

(function() {
  console.log('🌉 Payroll Bridge initializing...');

  // Make sure payrollEmployees is globally accessible
  let _payrollEmployees = [];

  Object.defineProperty(window, 'payrollEmployees', {
    get: function() {
      return _payrollEmployees;
    },
    set: function(value) {
      _payrollEmployees = value;
      console.log('✅ Payroll employees updated:', value.length, 'employees');
    },
    enumerable: true,
    configurable: true
  });

  // Initialize empty array
  if (!window.payrollEmployees) {
    window.payrollEmployees = [];
  }

  console.log('✅ Payroll Bridge ready');
})();