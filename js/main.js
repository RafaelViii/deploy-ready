// ═══════════════════════════════════════════════════════════════
// PASSWORDS CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DELETE_PASSWORD = 'admin123';
const MANUAL_UPDATE_PASSWORD = 'admin123';

// ═══════════════════════════════════════════════════════════════
// PASSWORD MODAL SYSTEM
// ═══════════════════════════════════════════════════════════════

let pendingPasswordAction = null;
let currentPasswordType = null;

function showPasswordModal(type, message, onSuccess) {
  console.log('🔐 showPasswordModal called');
  console.log('Type:', type);
  console.log('Message:', message);
  console.log('Callback function:', typeof onSuccess);
  
  currentPasswordType = type;
  pendingPasswordAction = onSuccess;
  
  console.log('pendingPasswordAction stored:', typeof pendingPasswordAction);
  
  const messageEl = document.querySelector('#manualUpdatePasswordModal p');
  if (messageEl && message) {
    messageEl.textContent = message;
    console.log('✅ Message updated');
  }
  
  const input = document.getElementById('manualUpdatePassword');
  const errorEl = document.getElementById('passwordError');
  
  if (input) {
    input.value = '';
    input.classList.remove('error');
    console.log('✅ Input cleared');
  }
  
  if (errorEl) {
    errorEl.style.display = 'none';
  }
  
  const modal = document.getElementById('manualUpdatePasswordModal');
  console.log('Modal element:', modal);
  
  if (modal) {
    modal.classList.add('active');
    console.log('✅ Modal active class added');
    console.log('Modal classes:', modal.className);
    
    setTimeout(() => {
      if (input) {
        input.focus();
        console.log('✅ Input focused');
      }
    }, 100);
  } else {
    console.error('❌ Modal element not found!');
  }
}

function closePasswordModal() {
  const modal = document.getElementById('manualUpdatePasswordModal');
  if (modal) {
    modal.classList.remove('active');
  }
  
  const input = document.getElementById('manualUpdatePassword');
  if (input) {
    input.value = '';
  }
  
  pendingPasswordAction = null;
  currentPasswordType = null;
}

function verifyPassword() {
  console.log('🔑 verifyPassword called');
  console.log('currentPasswordType:', currentPasswordType);
  console.log('pendingPasswordAction:', typeof pendingPasswordAction);
  
  const input = document.getElementById('manualUpdatePassword');
  const errorEl = document.getElementById('passwordError');
  const password = input?.value;
  
  console.log('Password entered:', password ? '***' : '(empty)');
  
  if (!password) {
    console.log('⚠️ No password entered');
    if (errorEl) {
      errorEl.textContent = '⚠️ Please enter a password';
      errorEl.style.display = 'block';
    }
    if (input) {
      input.classList.add('error');
      input.focus();
    }
    return;
  }
  
  let correctPassword = '';
  
  if (currentPasswordType === 'delete') {
    correctPassword = DELETE_PASSWORD;
    console.log('Checking against DELETE_PASSWORD');
  } else if (currentPasswordType === 'manual-update') {
    correctPassword = MANUAL_UPDATE_PASSWORD;
    console.log('Checking against MANUAL_UPDATE_PASSWORD');
  }
  
  console.log('Correct password:', correctPassword);
  console.log('Password match:', password === correctPassword);
  
  if (password === correctPassword) {
    console.log('✅ Password CORRECT!');
    
    // ✅ SAVE CALLBACK BEFORE CLOSING MODAL (THIS IS THE FIX!)
    const savedCallback = pendingPasswordAction;
    const savedType = currentPasswordType;
    
    console.log('Saved callback type:', typeof savedCallback);
    
    // NOW close modal (which sets pendingPasswordAction to null)
    closePasswordModal();
    
    console.log('About to execute saved callback...');
    console.log('Saved callback type:', typeof savedCallback);
    
    if (savedCallback && typeof savedCallback === 'function') {
      console.log('🚀 Executing callback now...');
      try {
        savedCallback();
        console.log('✅ Callback executed successfully');
      } catch (error) {
        console.error('❌ Error executing callback:', error);
      }
    } else {
      console.error('❌ No valid callback function!');
      console.error('Saved callback is:', savedCallback);
    }
  } else {
    console.log('❌ Password INCORRECT');
    if (errorEl) {
      errorEl.textContent = '❌ Incorrect password. Please try again.';
      errorEl.style.display = 'block';
    }
    if (input) {
      input.value = '';
      input.classList.add('error');
      input.focus();
    }
  }
}

function initPasswordModal() {
  console.log('🔐 Initializing password modal');
  
  const confirmBtn = document.getElementById('confirmPasswordBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', verifyPassword);
  }
  
  const cancelBtn = document.getElementById('cancelPasswordBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closePasswordModal);
  }
  
  const closeBtn = document.getElementById('closePasswordModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePasswordModal);
  }
  
  const input = document.getElementById('manualUpdatePassword');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        verifyPassword();
      }
    });
    
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorEl = document.getElementById('passwordError');
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    });
  }
  
  const modal = document.getElementById('manualUpdatePasswordModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePasswordModal();
      }
    });
  }
  
  console.log('✅ Password modal initialized');
}

// ═══════════════════════════════════════════════════════════════
// MAIN APPLICATION INITIALIZATION
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM Content Loaded');
  
  // Initialize basic UI components (no Firebase needed)
  if (typeof initNavigation === 'function') initNavigation();
  initPasswordModal(); // ✅ Initialize password modal
  if (typeof initRestockNavigation === 'function') initRestockNavigation();
  if (typeof initLabTypesModal === 'function') initLabTypesModal();
  if (typeof initCharts === 'function') initCharts();
  
  // Initialize listeners (these just set up event handlers)
  if (typeof initInventoryListeners === 'function') initInventoryListeners();
  if (typeof initPatientListeners === 'function') initPatientListeners();
  if (typeof initLeaveListeners === 'function') initLeaveListeners();
  if (typeof initJournalListeners === 'function') initJournalListeners();
  if (typeof initSalesListeners === 'function') initSalesListeners();
  if (typeof initAssignmentListeners === 'function') initAssignmentListeners();
  if (typeof initRestockListeners === 'function') initRestockListeners();
  if (typeof initManualUpdateListeners === 'function') initManualUpdateListeners();
  if (typeof initManualUpdateNavigation === 'function') initManualUpdateNavigation(); 
  if (typeof initDialysisSystem === 'function') initDialysisSystem();
  
});

// ═══════════════════════════════════════════════════════════════
// FIREBASE AUTHENTICATION & DATA LOADING
// ═══════════════════════════════════════════════════════════════

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    // Set current user globally
    window.currentUser = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email
    };
    
    console.log('✅ User authenticated:', window.currentUser.email);
    
    try {
      console.log('📥 Loading data from Firebase...');
      
      // Load all Firebase data in parallel
      await Promise.all([
        loadProductsFromFirebase(),
        loadLabTypesFromFirebase(),
        loadPatientsFromFirebase(),
        loadPatientAssignments()
      ]);
      
      console.log('✅ All Firebase data loaded');
      
      // Populate dropdowns after data is loaded
      if (typeof populateCategoryDropdown === 'function') {
        populateCategoryDropdown();
      }
      if (typeof populateLabTypeSelect === 'function') {
        populateLabTypeSelect();
      }
      if (typeof populateManualUpdateCategoryFilter === 'function') {
        populateManualUpdateCategoryFilter();
      }
      
      // Render initial data
      if (typeof renderPatientRecords === 'function') {
        renderPatientRecords();
      }
      if (typeof renderRestockItems === 'function') {
        renderRestockItems();
      }
      if (typeof renderManualUpdateList === 'function') {
        renderManualUpdateList();
      }
      if (typeof renderAssignmentList === 'function') {
        renderAssignmentList();
      }
      
      // Update dashboard displays
      if (typeof updateManualUpdateDate === 'function') {
        updateManualUpdateDate();
      }
      if (typeof updateDashboardInventoryCounts === 'function') {
        updateDashboardInventoryCounts();
      }
      if (typeof updateDashboardDate === 'function') {
        updateDashboardDate();
      }
      
      // Load user-specific data
      if (typeof loadLeaveRequests === 'function') {
        loadLeaveRequests();
      }
      if (typeof loadSalesRecords === 'function') {
        loadSalesRecords();
      }
      
      // Start auto-refresh if available
      if (typeof startAssignmentRefresh === 'function') {
        startAssignmentRefresh();
      }
      
      // Disable update button initially
      const updateBtn = document.getElementById('updateStocksBtn');
      if (updateBtn) {
        updateBtn.disabled = true;
      }
      
      console.log('✅ Application initialized successfully');
      
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      alert('Error loading data from Firebase. Please refresh the page.\n\nError: ' + error.message);
    }
    
  } else {
    console.log('⚠️ No user authenticated - redirecting to login...');
    // Optionally redirect to login page
    // window.location.href = '/login.html';
  }
});

// ═══════════════════════════════════════════════════════════════
// PERIODIC UPDATES
// ═══════════════════════════════════════════════════════════════

// Update dashboard every 30 seconds
setInterval(() => {
  if (window.currentUser) {
    if (typeof updateDashboardInventoryCounts === 'function') {
      updateDashboardInventoryCounts();
    }
    if (typeof updateDashboardDate === 'function') {
      updateDashboardDate();
    }
  }
}, 30000);

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});