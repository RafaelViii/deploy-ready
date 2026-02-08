
    // === MAIN APPLICATION JAVASCRIPT ===
    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const navToggle = document.getElementById('navToggle');
    navToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    // User profile dropdown toggle
    const userProfileToggle = document.getElementById('userProfileToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    userProfileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userProfileToggle.classList.toggle('open');
      userDropdown.classList.toggle('open');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userProfileToggle.contains(e.target) && !userDropdown.contains(e.target)) {
        userProfileToggle.classList.remove('open');
        userDropdown.classList.remove('open');
      }
    });
    
    // Role management
    let currentRole = 'owner';
    const roleData = {
      owner: {
        name: 'John Doe',
        initials: 'JD',
        role: 'Owner',
        permissions: {
          canView: true,
          canWrite: true,
          canDelete: false,
          canMonitor: true
        }
      },
      admin: {
        name: 'Jane Smith',
        initials: 'JS',
        role: 'Admin',
        permissions: {
          canView: true,
          canWrite: true,
          canDelete: true,
          canMonitor: false
        }
      },
      nurse: {
        name: 'Maria Santos',
        initials: 'MS',
        role: 'Nurse',
        permissions: {
          canView: true,
          canWrite: false,
          canDelete: false,
          canMonitor: false
        }
      }
    };
    
    // Update UI based on role
    function updateUIForRole(role) {
      const data = roleData[role];
      currentRole = role;
      
      // Update user info
      document.getElementById('userName').textContent = data.name;
      document.getElementById('userRole').textContent = data.role;
      document.getElementById('userInitials').textContent = data.initials;
      
      // Update active role in dropdown
      document.querySelectorAll('.role-switch').forEach(btn => {
        if (btn.dataset.role === role) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Apply permission-based UI changes
      applyPermissions(data.permissions);
      
      // Close dropdown
      userProfileToggle.classList.remove('open');
      userDropdown.classList.remove('open');
    }
    
    // Apply permissions to UI elements
    function applyPermissions(permissions) {
      // Get all nav links
      const navLinks = {
        dashboard: document.querySelector('[data-page="dashboard"]'),
        inventory: document.querySelector('[data-page="inventory"]'),
        journals: document.querySelector('[data-page="journals"]'),
        accounts: document.querySelector('[data-page="accounts"]'),
        trial: document.querySelector('[data-page="trial"]'),
        financials: document.querySelector('[data-page="financials"]'),
        adjustments: document.querySelector('[data-page="adjustments"]'),
        reports: document.querySelector('[data-page="reports"]'),
        settings: document.querySelector('[data-page="settings"]')
      };
      
      // Nurse can only see: Accounts (Laboratory), Journals (Receipt), Adjustments, Reports, Settings
      if (!permissions.canWrite) {
        // Show only specific links for nurse
        const nursePages = ['accounts', 'journals', 'adjustments', 'reports', 'settings'];
        
        Object.keys(navLinks).forEach(key => {
          if (navLinks[key]) {
            if (nursePages.includes(key)) {
              navLinks[key].style.display = 'block';
            } else {
              navLinks[key].style.display = 'none';
            }
          }
        });
        
        // If currently on a hidden page, redirect to first available page (accounts/laboratory)
        const currentPage = document.querySelector('.page.active');
        if (currentPage && !nursePages.includes(currentPage.id)) {
          document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
          document.getElementById('accounts').classList.add('active');
          document.querySelectorAll('.sidebar nav a').forEach(l => l.classList.remove('active'));
          navLinks.accounts.classList.add('active');
        }
      } else {
        // Show all links for owner/admin
        Object.values(navLinks).forEach(link => {
          if (link) link.style.display = 'block';
        });
      }
      
      // Hide/show add product button based on write permission
      const addProductBtn = document.getElementById('addProductBtn');
      if (addProductBtn) {
        if (permissions.canWrite) {
          addProductBtn.style.display = 'block';
        } else {
          addProductBtn.style.display = 'none';
        }
      }
      
      // Hide/show category management for nurses
      const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
      if (manageCategoriesBtn) {
        if (permissions.canWrite) {
          manageCategoriesBtn.style.display = 'block';
        } else {
          manageCategoriesBtn.style.display = 'none';
        }
      }
      
      // Show notification about role change
      showRoleNotification(currentRole);
    }
    
    // Show role change notification
    function showRoleNotification(role) {
      const data = roleData[role];
      const permissions = [];
      
      if (data.permissions.canView) permissions.push('View');
      if (data.permissions.canWrite) permissions.push('Write');
      if (data.permissions.canDelete) permissions.push('Delete');
      if (data.permissions.canMonitor) permissions.push('Monitor');
      
      // Show in modal instead of alert
      stockDetailTitle.textContent = `Role Changed: ${data.role}`;
      stockDetailBody.innerHTML = `
        <div style="padding: 1rem 0;">
          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 1.1rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">
              Welcome, ${data.name}
            </div>
            <div style="color: #6b7280; font-size: 0.9rem;">
              You are now logged in as <strong>${data.role}</strong>
            </div>
          </div>
          
          <div class="stock-summary">
            <div class="stock-summary-title">Your Permissions</div>
            ${permissions.map(p => `
              <div style="padding: 0.5rem 0; color: #10b981; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">✓</span>
                <span>${p}</span>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 1rem; padding: 0.875rem; background: #f3f4f6; border-radius: 6px; font-size: 0.85rem; color: #6b7280;">
            <strong>Note:</strong> This is a simulation. Database integration pending.
          </div>
        </div>
      `;
      stockDetailModal.classList.add('active');
    }
    
    // Role switch handlers
    document.querySelectorAll('.role-switch').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        updateUIForRole(role);
      });
    });
    
    // Logout handler
    document.querySelector('.logout-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        alert('Logout functionality will be implemented with backend integration.');
      }
    });

    // Page navigation
    const pageLinks = document.querySelectorAll('.sidebar nav a');
    const pages = document.querySelectorAll('.page');

    pageLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.dataset.page;

        // Hide all main pages
        pages.forEach(p => p.classList.remove('active'));
        
        // Hide restock and manual update pages (defined later in code)
        const restockPageEl = document.getElementById('restockPage');
        const manualUpdatePageEl = document.getElementById('manualUpdatePage');
        if (restockPageEl) restockPageEl.style.display = 'none';
        if (manualUpdatePageEl) manualUpdatePageEl.style.display = 'none';
        
        // Show target page
        const targetPage = document.getElementById(target);
        if (targetPage) targetPage.classList.add('active');

        // Update active link
        pageLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Close sidebar on mobile after clicking
        if (window.innerWidth < 768) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Charts
    let revExpChart, cashFlowChart, profitMarginChart;
    
    // Sample dashboard data
    const dashboardData = {
      today: {
        assets: 500000,
        liabilities: 200000,
        revenue: 12000,
        expenses: 7500,
        netProfit: 4500,
        incomeExpenses: {
          labels: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
          income: [300, 280, 250, 230, 200, 350, 500, 700, 900, 1100, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 2700, 2400, 2100, 1800, 1500],
          expenses: [200, 190, 180, 170, 150, 250, 350, 500, 650, 850, 1000, 1150, 1300, 1450, 1600, 1750, 1900, 2000, 2100, 2000, 1800, 1600, 1400, 1200]
        },
        cashFlow: {
          labels: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
          data: [100, 90, 70, 60, 50, 100, 150, 200, 250, 250, 400, 450, 500, 550, 600, 650, 700, 800, 900, 700, 600, 500, 400, 300]
        },
        profitMargin: {
          labels: ['12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'],
          data: [33, 32, 28, 26, 25, 29, 30, 29, 28, 23, 29, 28, 28, 27, 27, 27, 27, 29, 30, 26, 25, 24, 22, 20]
        },
        transactions: [
          { date: '26-01-23 02:15', desc: 'Emergency #1028', amount: '₱3,500', status: 'Paid' },
          { date: '26-01-23 08:30', desc: 'Consultation #1030', amount: '₱2,000', status: 'Paid' },
          { date: '26-01-23 10:15', desc: 'Lab Test #1031', amount: '₱1,800', status: 'Paid' },
          { date: '26-01-23 14:20', desc: 'X-Ray #1032', amount: '₱2,500', status: 'Paid' },
          { date: '26-01-23 18:45', desc: 'Surgery #1033', amount: '₱15,000', status: 'Unpaid' },
          { date: '26-01-23 22:30', desc: 'Emergency #1034', amount: '₱4,200', status: 'Paid' }
        ],
        alerts: [
          { invoice: '#1033', dueDate: '26-01-23 20:00', status: 'Pending Payment' }
        ]
      },
      month: {
        assets: 500000,
        liabilities: 200000,
        revenue: 120000,
        expenses: 75500,
        netProfit: 44500,
        incomeExpenses: {
          labels: ['Day 1-5', 'Day 6-10', 'Day 11-15', 'Day 16-20', 'Day 21-25', 'Day 26-31'],
          income: [15000, 18000, 20000, 17000, 22000, 28000],
          expenses: [9000, 11000, 12000, 10500, 13000, 15000]
        },
        cashFlow: {
          labels: ['Day 1-5', 'Day 6-10', 'Day 11-15', 'Day 16-20', 'Day 21-25', 'Day 26-31'],
          data: [6000, 7000, 8000, 6500, 9000, 13000]
        },
        profitMargin: {
          labels: ['Day 1-5', 'Day 6-10', 'Day 11-15', 'Day 16-20', 'Day 21-25', 'Day 26-31'],
          data: [40, 39, 40, 38, 41, 46]
        },
        transactions: [
          { date: '26-01-10', desc: 'Invoice #1023', amount: '₱5,000', status: 'Paid' },
          { date: '26-01-11', desc: 'Invoice #1024', amount: '₱7,500', status: 'Unpaid' },
          { date: '26-01-12', desc: 'Invoice #1025', amount: '₱3,200', status: 'Paid' },
          { date: '26-01-15', desc: 'Invoice #1026', amount: '₱8,900', status: 'Paid' },
          { date: '26-01-18', desc: 'Invoice #1027', amount: '₱4,200', status: 'Paid' }
        ],
        alerts: [
          { invoice: '#1024', dueDate: '26-01-15', status: 'Overdue' }
        ]
      },
      year: {
        assets: 500000,
        liabilities: 200000,
        revenue: 1440000,
        expenses: 906000,
        netProfit: 534000,
        incomeExpenses: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          income: [15000, 18000, 20000, 17000, 22000, 28000, 24000, 26000, 23000, 25000, 27000, 30000],
          expenses: [9000, 11000, 12000, 10500, 13000, 15000, 14000, 15500, 13500, 14500, 16000, 17000]
        },
        cashFlow: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: [6000, 7000, 8000, 6500, 9000, 13000, 10000, 10500, 9500, 10500, 11000, 13000]
        },
        profitMargin: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: [40, 39, 40, 38, 41, 46, 42, 41, 41, 42, 41, 43]
        },
        transactions: [
          { date: '26-01-10', desc: 'Invoice #1023', amount: '₱5,000', status: 'Paid' },
          { date: '26-02-15', desc: 'Invoice #1024', amount: '₱7,500', status: 'Paid' },
          { date: '26-03-20', desc: 'Invoice #1025', amount: '₱8,200', status: 'Paid' },
          { date: '26-04-12', desc: 'Invoice #1026', amount: '₱6,500', status: 'Paid' },
          { date: '26-05-18', desc: 'Invoice #1027', amount: '₱9,200', status: 'Paid' }
        ],
        alerts: []
      }
    };
    
    function initializeCharts() {
      const data = dashboardData.month;
      
      revExpChart = new Chart(document.getElementById('revExp'), {
        type: 'line',
        data: {
          labels: data.incomeExpenses.labels,
          datasets: [
            { label: 'Income', data: data.incomeExpenses.income, borderColor:'#2563eb', tension:0.4, fill:false },
            { label: 'Expenses', data: data.incomeExpenses.expenses, borderColor:'#ef4444', tension:0.4, fill:false }
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: true,
          plugins: { legend: { position:'bottom' } },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false,
                font: {
                  size: 10
                }
              }
            }
          }
        }
      });

      cashFlowChart = new Chart(document.getElementById('cashFlow'), {
        type: 'bar',
        data: {
          labels: data.cashFlow.labels,
          datasets: [{ label: 'Cash Flow', data: data.cashFlow.data, backgroundColor:'#10b981' }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: true,
          plugins: { legend: { display:false } },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false,
                font: {
                  size: 10
                }
              }
            }
          }
        }
      });

      profitMarginChart = new Chart(document.getElementById('profitMargin'), {
        type: 'line',
        data: {
          labels: data.profitMargin.labels,
          datasets: [{ label: 'Profit Margin %', data: data.profitMargin.data, borderColor:'#f59e0b', tension:0.4, fill:false }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: true,
          plugins: { legend: { position:'bottom' } }, 
          scales: { 
            y: { beginAtZero:true, max:100 },
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: false,
                font: {
                  size: 10
                }
              }
            }
          } 
        }
      });
    }
    
    function updateDashboardData(period) {
      const data = dashboardData[period];
      
      // Update date display
      const today = new Date();
      const dashboardDateEl = document.getElementById('dashboardDate');
      
      if (period === 'today') {
        // Format: "January 23, 2026"
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dashboardDateEl.textContent = today.toLocaleDateString('en-US', options);
      } else if (period === 'month') {
        // Format: "January 2026"
        const options = { year: 'numeric', month: 'long' };
        dashboardDateEl.textContent = today.toLocaleDateString('en-US', options);
      } else if (period === 'year') {
        // Format: "2026"
        dashboardDateEl.textContent = today.getFullYear().toString();
      }
      
      // Update financial cards
      document.getElementById('totalAssets').textContent = `₱${data.assets.toLocaleString()}`;
      document.getElementById('totalLiabilities').textContent = `₱${data.liabilities.toLocaleString()}`;
      document.getElementById('totalRevenue').textContent = `₱${data.revenue.toLocaleString()}`;
      document.getElementById('totalExpenses').textContent = `₱${data.expenses.toLocaleString()}`;
      document.getElementById('netProfit').textContent = `₱${data.netProfit.toLocaleString()}`;
      
      // Update chart titles
      const titleSuffix = period === 'today' ? ' (Today)' : period === 'month' ? ' (This Month)' : ' (This Year)';
      document.getElementById('incomeExpensesTitle').textContent = 'Income vs Expenses' + titleSuffix;
      document.getElementById('cashFlowTitle').textContent = 'Cash Flow Trends' + titleSuffix;
      document.getElementById('profitMarginTitle').textContent = 'Profit Margins' + titleSuffix;
      
      // Update charts
      revExpChart.data.labels = data.incomeExpenses.labels;
      revExpChart.data.datasets[0].data = data.incomeExpenses.income;
      revExpChart.data.datasets[1].data = data.incomeExpenses.expenses;
      revExpChart.update();
      
      cashFlowChart.data.labels = data.cashFlow.labels;
      cashFlowChart.data.datasets[0].data = data.cashFlow.data;
      cashFlowChart.update();
      
      profitMarginChart.data.labels = data.profitMargin.labels;
      profitMarginChart.data.datasets[0].data = data.profitMargin.data;
      profitMarginChart.update();
      
      // Update transactions
      const transactionsBody = document.getElementById('transactionsBody');
      transactionsBody.innerHTML = data.transactions.map(t => `
        <tr>
          <td class="date" data-label="Date">${t.date}</td>
          <td data-label="Description">${t.desc}</td>
          <td data-label="Amount">${t.amount}</td>
          <td data-label="Status">${t.status}</td>
        </tr>
      `).join('');
      
      // Update alerts
      const alertsBody = document.getElementById('alertsBody');
      if (data.alerts.length === 0) {
        alertsBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No alerts</td></tr>';
      } else {
        alertsBody.innerHTML = data.alerts.map(a => `
          <tr>
            <td data-label="Invoice">${a.invoice}</td>
            <td class="date" data-label="Due Date">${a.dueDate}</td>
            <td data-label="Status">${a.status}</td>
          </tr>
        `).join('');
      }
    }
    
    initializeCharts();

    // === DASHBOARD PERIOD SELECTOR (Moved outside inventory block) ===
    let currentPeriod = 'today';
    const periodBtns = document.querySelectorAll('.period-btn');
    
    periodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentPeriod = btn.dataset.period;
        periodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (typeof updateDashboardOverview === 'function') updateDashboardOverview();
        if (typeof updateDashboardData === 'function') updateDashboardData(currentPeriod);
      });
    });
    
    // === MODAL CLOSE HANDLERS (Moved outside inventory block) ===
    const addProductModal = document.getElementById('addProductModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addProductForm = document.getElementById('addProductForm');
    const productDate = document.getElementById('productDate');
    const productCategory = document.getElementById('productCategory');
    
    // Categories array
    let categories = ['IV', 'TAB/CAPS', 'BY GALLON', 'BY BOX', 'BY PIECE'];
    
    // Populate category dropdown
    function populateCategoryDropdown() {
      if (productCategory) {
        productCategory.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat;
          option.textContent = cat;
          productCategory.appendChild(option);
        });
      }
    }
    
    // Category Management Modal
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const categoryModal = document.getElementById('categoryModal');
    const closeCategoryModal = document.getElementById('closeCategoryModal');
    const closeCategoryBtn = document.getElementById('closeCategoryBtn');
    const categoryList = document.getElementById('categoryList');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    
    // Render category list in management modal
    function renderCategoryList() {
      if (categoryList) {
        categoryList.innerHTML = categories.map((cat, index) => `
          <div class="category-item" data-index="${index}">
            <input type="text" class="category-name-input" value="${cat}" data-index="${index}" />
          </div>
        `).join('');
      }
    }
    
    // Save all category changes
    function saveAllCategories() {
      const inputs = document.querySelectorAll('.category-name-input');
      let hasChanges = false;
      
      inputs.forEach((input, index) => {
        const newName = input.value.trim();
        if (newName && newName !== categories[index]) {
          categories[index] = newName;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        // Disable button and show loading state
        const saveBtn = document.getElementById('saveCategoriesBtn');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.textContent = '💾 Saving...';
          saveBtn.style.opacity = '0.6';
        }
        
        // Simulate save with animation
        setTimeout(() => {
          populateCategoryDropdown();
          console.log('Updated categories:', categories);
          
          // Show success state
          if (saveBtn) {
            saveBtn.textContent = '✅ Saved!';
            saveBtn.style.background = '#10b981';
            saveBtn.style.opacity = '1';
          }
          
          // Close modal after short delay
          setTimeout(() => {
            if (categoryModal) {
              categoryModal.classList.remove('active');
            }
            
            // Reset button state
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = '💾 Save';
              saveBtn.style.background = '#2563eb';
            }
          }, 800);
          
        }, 600);
      } else {
        alert('ℹ️ No changes to save.');
      }
    }
    
    // Open category management modal
    if (manageCategoriesBtn && categoryModal) {
      manageCategoriesBtn.addEventListener('click', () => {
        categoryModal.classList.add('active');
        renderCategoryList();
      });
    }
    
    // Close category modal
    if (closeCategoryModal && categoryModal) {
      closeCategoryModal.addEventListener('click', () => {
        categoryModal.classList.remove('active');
      });
    }
    
    if (closeCategoryBtn && categoryModal) {
      closeCategoryBtn.addEventListener('click', () => {
        categoryModal.classList.remove('active');
      });
    }
    
    // Add new category
    const saveCategoriesBtn = document.getElementById('saveCategoriesBtn');
    
    if (saveCategoriesBtn) {
      saveCategoriesBtn.addEventListener('click', () => {
        saveAllCategories();
      });
    }
    
    if (addCategoryBtn && newCategoryInput) {
      addCategoryBtn.addEventListener('click', () => {
        const newCat = newCategoryInput.value.trim();
        if (newCat && !categories.includes(newCat)) {
          categories.push(newCat);
          newCategoryInput.value = '';
          renderCategoryList();
          populateCategoryDropdown();
          alert(`✅ Category "${newCat}" added successfully!`);
        } else if (categories.includes(newCat)) {
          alert('⚠️ This category already exists!');
        } else {
          alert('⚠️ Please enter a category name.');
        }
      });
    }
    
    // Initialize category dropdown
    populateCategoryDropdown();
    
    // Add Product Form Submit Handler
    console.log('=== SETTING UP ADD PRODUCT HANDLER ===');
    console.log('addProductForm:', addProductForm);
    
    if (addProductForm) {
      console.log('Adding submit event listener to form');
      
      // Try to attach to button directly as well
      const addProductBtn = addProductForm.querySelector('button[type="submit"]');
      console.log('Add Product Button:', addProductBtn);
      
      if (addProductBtn) {
        addProductBtn.addEventListener('click', (e) => {
          console.log('🔥 BUTTON CLICKED! 🔥');
          e.preventDefault(); // Prevent default form submission
          
          // Get form values
          const productDateVal = document.getElementById('productDate').value;
          const productCategoryVal = document.getElementById('productCategory').value;
          const productNameVal = document.getElementById('productName').value;
          const productExpiryVal = document.getElementById('productExpiry').value;
          const productQtyVal = document.getElementById('productQty').value;
          const productStatusVal = document.getElementById('productStatus').value;
          
          console.log('Form values:', {
            date: productDateVal,
            category: productCategoryVal,
            name: productNameVal,
            expiry: productExpiryVal,
            qty: productQtyVal,
            status: productStatusVal
          });
          
          // Validation
          if (!productCategoryVal) {
            alert('⚠️ Please select a category');
            return;
          }
          
          if (!productNameVal.trim()) {
            alert('⚠️ Please enter a product name');
            return;
          }
          
          if (!productExpiryVal) {
            alert('⚠️ Please select an expiry date');
            return;
          }
          
          const newProduct = {
            product: productNameVal.trim(),
            category: productCategoryVal,
            expiry: productExpiryVal,
            stock: parseInt(productQtyVal) || 0,  // Use 'stock' not 'qty'
            dateAdded: productDateVal
          };
          
          console.log('Adding product:', newProduct);
          
          // Add to productsMaster array
          productsMaster.push(newProduct);
          console.log('Product added! Total products:', productsMaster.length);
          
          // Show success animation
          addProductBtn.disabled = true;
          addProductBtn.textContent = '✓ Adding...';
          addProductBtn.style.background = '#6b7280';
          
          setTimeout(() => {
            // Success state
            addProductBtn.textContent = '✅ Added!';
            addProductBtn.style.background = '#10b981';
            
            // Re-render inventory if on inventory page
            if (typeof renderInventoryProducts === 'function') {
              renderInventoryProducts();
            }
            
            // Update dashboard if needed
            if (typeof updateDashboardOverview === 'function') {
              updateDashboardOverview();
            }
            
            // Close modal after delay
            setTimeout(() => {
              addProductModal.classList.remove('active');
              addProductForm.reset();
              if (productDate) productDate.value = new Date().toISOString().split('T')[0];
              
              // Reset button
              addProductBtn.disabled = false;
              addProductBtn.textContent = 'Add Product';
              addProductBtn.style.background = '#2563eb';
            }, 1000);
            
          }, 500);
        });
      }
      
      addProductForm.addEventListener('submit', (e) => {
        console.log('🔥 FORM SUBMITTED! 🔥');
        e.preventDefault();
        
        const productDateVal = document.getElementById('productDate').value;
        const productCategoryVal = document.getElementById('productCategory').value;
        const productNameVal = document.getElementById('productName').value;
        const productExpiryVal = document.getElementById('productExpiry').value;
        const productQtyVal = document.getElementById('productQty').value;
        const productStatusVal = document.getElementById('productStatus').value;
        
        if (!productCategoryVal) {
          alert('⚠️ Please select a category');
          return;
        }
        
        if (!productNameVal.trim()) {
          alert('⚠️ Please enter a product name');
          return;
        }
        
        const newProduct = {
          product: productNameVal.trim(),
          category: productCategoryVal,
          expiry: productExpiryVal,
          qty: parseInt(productQtyVal) || 0,
          status: productStatusVal,
          dateAdded: productDateVal
        };
        
        console.log('Adding product:', newProduct);
        
        // Add to productsMaster array
        productsMaster.push(newProduct);
        
        // Show success animation
        const submitBtn = addProductForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = '✓ Adding...';
          submitBtn.style.background = '#6b7280';
        }
        
        setTimeout(() => {
          // Success state
          if (submitBtn) {
            submitBtn.textContent = '✅ Added!';
            submitBtn.style.background = '#10b981';
          }
          
          // Re-render inventory if on inventory page
          if (typeof renderInventoryProducts === 'function') {
            renderInventoryProducts();
          }
          
          // Update dashboard if needed
          if (typeof updateDashboardOverview === 'function') {
            updateDashboardOverview();
          }
          
          console.log('Product added! Total products:', productsMaster.length);
          
          // Close modal after delay
          setTimeout(() => {
            addProductModal.classList.remove('active');
            addProductForm.reset();
            if (productDate) productDate.value = new Date().toISOString().split('T')[0];
            
            // Reset button
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Add Product';
              submitBtn.style.background = '#2563eb';
            }
          }, 1000);
          
        }, 500);
      });
    }
    
    if (closeModal && addProductModal) {
      closeModal.addEventListener('click', () => {
        addProductModal.classList.remove('active');
        if (addProductForm) addProductForm.reset();
        if (productDate) productDate.value = new Date().toISOString().split('T')[0];
      });
    }
    
    if (cancelBtn && addProductModal) {
      cancelBtn.addEventListener('click', () => {
        addProductModal.classList.remove('active');
        if (addProductForm) addProductForm.reset();
        if (productDate) productDate.value = new Date().toISOString().split('T')[0];
      });
    }

    // === DASHBOARD INITIALIZATION ===
    // Removed from here - moved to after productsMaster is defined

    // === INVENTORY SYSTEM === (OLD - DISABLED)
    // Wrap in check to prevent errors since we're using new system
    if (document.getElementById('calendarViewBtn')) {
    const inventoryBody = document.getElementById('inventoryBody');
    const monthSelect = document.getElementById('monthSelect');
    const yearInput = document.getElementById('yearInput');
    const goDateBtn = document.getElementById('goDate');
    const searchInput = document.getElementById('searchProduct');
    const calendarViewBtn = document.getElementById('calendarViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const detailedViewBtn = document.getElementById('detailedViewBtn');
    const calendarViewContainer = document.getElementById('calendarViewContainer');
    const listViewContainer = document.getElementById('listViewContainer');
    const detailedViewContainer = document.getElementById('detailedViewContainer');
    const detailedInventoryBody = document.getElementById('detailedInventoryBody');
    const calendarHeader = document.getElementById('calendarHeader');
    const calendarDays = document.getElementById('calendarDays');
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addProductForm = document.getElementById('addProductForm');
    const productDate = document.getElementById('productDate');
    const productCategory = document.getElementById('productCategory');
    
    // Date navigation controls
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    const dateValueDisplay = document.getElementById('dateValueDisplay');
    const prevDateBtn = document.getElementById('prevDateBtn');
    const nextDateBtn = document.getElementById('nextDateBtn');
    
    console.log('Button elements:', { prevDateBtn, nextDateBtn });
    
    if (!prevDateBtn || !nextDateBtn) {
      console.error('Navigation buttons not found in DOM!');
    }
    
    // Category Management
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const categoryModal = document.getElementById('categoryModal');
    const closeCategoryModal = document.getElementById('closeCategoryModal');
    const closeCategoryBtn = document.getElementById('closeCategoryBtn');
    const categoryList = document.getElementById('categoryList');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const addCategoryBtn = document.getElementById('addCategoryBtn');

    let currentMonth = new Date().getMonth(); // Current month
    let currentYear = new Date().getFullYear(); // Current year
    let currentView = 'calendar';
    let selectedDate = null;
    let viewingSpecificDate = false; // Track if viewing specific date or full month
    
    // Categories array
    let categories = ['IV', 'TABS/CAPS', 'GALLON', 'BOX', 'PIECE'];

    // Sample inventory data
    let inventoryData = [
      { date: '2026-01-21', category: 'BOX', product: 'Surgical Gloves', batch: 'A101/2027-06', qty: 50, status: 'Available' },
      { date: '2026-01-21', category: 'PIECE', product: 'Syringe 5ml', batch: 'B201/2027-12', qty: 30, status: 'Low Stock' },
      { date: '2026-01-22', category: 'IV', product: 'Saline Solution', batch: 'C301/2026-08', qty: 100, status: 'Available' },
      { date: '2026-01-23', category: 'BOX', product: 'Bandages', batch: 'D401/2027-03', qty: 75, status: 'Available' },
      { date: '2026-01-23', category: 'BOX', product: 'Alcohol Swabs', batch: 'E501/2026-11', qty: 15, status: 'Low Stock' },
      { date: '2026-01-25', category: 'PIECE', product: 'Face Masks', batch: 'F601/2027-01', qty: 200, status: 'Available' },
      { date: '2026-01-28', category: 'BOX', product: 'Cotton Balls', batch: 'G701/2027-05', qty: 5, status: 'Out of Stock' },
      { date: '2026-01-21', category: 'TABS/CAPS', product: 'Paracetamol 500mg', batch: 'H801/2027-09', qty: 120, status: 'Available' },
      { date: '2026-01-22', category: 'GALLON', product: 'Distilled Water', batch: 'I901/2026-12', qty: 25, status: 'Available' },
      { date: '2026-01-23', category: 'IV', product: 'Dextrose 5%', batch: 'J101/2027-04', qty: 45, status: 'Low Stock' },
    ];

    // Set today's date in modal by default
    const today = new Date().toISOString().split('T')[0];
    productDate.value = today;
    
    // Stock Detail Modal elements
    const stockDetailModal = document.getElementById('stockDetailModal');
    const closeStockDetailModal = document.getElementById('closeStockDetailModal');
    const closeStockDetailBtn = document.getElementById('closeStockDetailBtn');
    const stockDetailTitle = document.getElementById('stockDetailTitle');
    const stockDetailBody = document.getElementById('stockDetailBody');
    
    // Update dashboard inventory overview
    function updateDashboardOverview() {
      // Dashboard inventory overview is now updated by updateStatusCounts()
      // This function remains for compatibility with period buttons
      if (typeof updateStatusCounts === 'function') {
        updateStatusCounts();
      }
    }
    
    // Show stock detail modal
    function showStockDetail(status) {
      const today = new Date();
      let filteredItems = [];
      
      // Filter by period
      if (currentPeriod === 'today') {
        const todayStr = today.toISOString().split('T')[0];
        filteredItems = inventoryData.filter(item => item.date === todayStr);
      } else if (currentPeriod === 'month') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        filteredItems = inventoryData.filter(item => item.date >= monthStart && item.date <= monthEnd);
      } else if (currentPeriod === 'year') {
        const yearStart = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        const yearEnd = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        filteredItems = inventoryData.filter(item => item.date >= yearStart && item.date <= yearEnd);
      }
      
      let items;
      
      if (status === 'Expiring Soon') {
        // Get expiring items
        items = filteredItems.filter(item => {
          if (!item.batch) return false;
          const parts = item.batch.split('/');
          if (parts.length < 2) return false;
          const expiryParts = parts[1].split('-');
          if (expiryParts.length < 2) return false;
          
          const expiryYear = parseInt(expiryParts[0]);
          const expiryMonth = parseInt(expiryParts[1]) - 1;
          const expiryDate = new Date(expiryYear, expiryMonth, 1);
          
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return diffDays <= 30 && diffDays >= 0;
        });
      } else {
        items = filteredItems.filter(item => item.status === status);
      }
      
      const periodText = currentPeriod === 'today' ? 'Today' : 
                        currentPeriod === 'month' ? 'This Month' : 'This Year';
      
      if (items.length === 0) {
        stockDetailTitle.textContent = `${status} - ${periodText}`;
        stockDetailBody.innerHTML = `
          <div class="empty-state" style="padding: 2rem;">
            <div class="empty-state-icon">📦</div>
            <p>No items with "${status}" status in ${periodText.toLowerCase()}</p>
          </div>
        `;
      } else {
        stockDetailTitle.textContent = `${status} - ${periodText}`;
        
        // Group by category
        const grouped = {};
        items.forEach(item => {
          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push(item);
        });
        
        let html = '';
        Object.keys(grouped).sort().forEach(category => {
          html += `
            <div class="stock-detail-category">
              <div class="stock-category-header">${category}</div>
          `;
          
          grouped[category].forEach(item => {
            html += `
              <div class="stock-item">
                <div class="stock-item-name">${item.product}</div>
                <div class="stock-item-details">
                  <div class="stock-item-detail">
                    <strong>Date:</strong> <span>${item.date}</span>
                  </div>
                  <div class="stock-item-detail">
                    <strong>Batch:</strong> <span>${item.batch}</span>
                  </div>
                  <div class="stock-item-detail">
                    <strong>Qty:</strong> <span>${item.qty}</span>
                  </div>
                  <div class="stock-item-detail">
                    <strong>Status:</strong> <span>${item.status}</span>
                  </div>
                </div>
              </div>
            `;
          });
          
          html += `</div>`;
        });
        
        // Add summary
        const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
        html += `
          <div class="stock-summary">
            <div class="stock-summary-title">Summary</div>
            <div><span>Total Items</span><span>${items.length}</span></div>
            <div><span>Total Quantity</span><span>${totalQty}</span></div>
          </div>
        `;
        
        stockDetailBody.innerHTML = html;
      }
      
      stockDetailModal.classList.add('active');
    }
    
    // Close stock detail modal
    closeStockDetailModal.addEventListener('click', () => {
      stockDetailModal.classList.remove('active');
    });
    
    closeStockDetailBtn.addEventListener('click', () => {
      stockDetailModal.classList.remove('active');
    });
    
    // Add click/touch handlers to overview cards
    document.querySelectorAll('.overview-card').forEach(card => {
      let touchTimer;
      let touchStarted = false;
      
      // Desktop: Double-click
      card.addEventListener('dblclick', () => {
        const status = card.dataset.status;
        showStockDetail(status);
      });
      
      // Mobile: Touch and hold
      card.addEventListener('touchstart', (e) => {
        touchStarted = true;
        card.classList.add('pressing');
        touchTimer = setTimeout(() => {
          const status = card.dataset.status;
          card.classList.remove('pressing');
          showStockDetail(status);
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }, 500);
      });
      
      card.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
        card.classList.remove('pressing');
        setTimeout(() => { touchStarted = false; }, 100);
      });
      
      card.addEventListener('touchmove', () => {
        clearTimeout(touchTimer);
        card.classList.remove('pressing');
      });
    });
    
    // Update date display in list view
    function updateDateDisplay() {
      const dateValueEl = document.getElementById('dateValueDisplay');
      
      if (viewingSpecificDate && selectedDate) {
        const date = new Date(selectedDate + 'T00:00:00');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateValueEl.textContent = date.toLocaleDateString('en-US', options);
      } else {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        dateValueEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
      }
    }
    
    // Navigate to previous date
    window.handlePrevDate = function() {
      console.log('handlePrevDate called', { viewingSpecificDate, selectedDate, currentMonth, currentYear });
      
      if (viewingSpecificDate && selectedDate) {
        // Navigate to previous day
        const parts = selectedDate.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        const date = new Date(year, month, day);
        date.setDate(date.getDate() - 1);
        
        const newYear = date.getFullYear();
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newDay = String(date.getDate()).padStart(2, '0');
        selectedDate = `${newYear}-${newMonth}-${newDay}`;
        
        // Update month/year if crossing month boundary
        currentMonth = date.getMonth();
        currentYear = date.getFullYear();
        monthSelect.value = currentMonth;
        yearInput.value = currentYear;
        
        console.log('Moving to previous day:', selectedDate);
        updateDateDisplay();
        renderListViewForDate(selectedDate);
      } else {
        // Navigate to previous month
        if (currentMonth === 0) {
          currentMonth = 11;
          currentYear--;
        } else {
          currentMonth--;
        }
        
        monthSelect.value = currentMonth;
        yearInput.value = currentYear;
        
        console.log('Moving to previous month:', currentMonth, currentYear);
        updateDateDisplay();
        renderListView();
      }
    };
    
    // Navigate to next date
    window.handleNextDate = function() {
      console.log('handleNextDate called', { viewingSpecificDate, selectedDate, currentMonth, currentYear });
      
      if (viewingSpecificDate && selectedDate) {
        // Navigate to next day
        const parts = selectedDate.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        const date = new Date(year, month, day);
        date.setDate(date.getDate() + 1);
        
        const newYear = date.getFullYear();
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newDay = String(date.getDate()).padStart(2, '0');
        selectedDate = `${newYear}-${newMonth}-${newDay}`;
        
        // Update month/year if crossing month boundary
        currentMonth = date.getMonth();
        currentYear = date.getFullYear();
        monthSelect.value = currentMonth;
        yearInput.value = currentYear;
        
        console.log('Moving to next day:', selectedDate);
        updateDateDisplay();
        renderListViewForDate(selectedDate);
      } else {
        // Navigate to next month
        if (currentMonth === 11) {
          currentMonth = 0;
          currentYear++;
        } else {
          currentMonth++;
        }
        
        monthSelect.value = currentMonth;
        yearInput.value = currentYear;
        
        console.log('Moving to next month:', currentMonth, currentYear);
        updateDateDisplay();
        renderListView();
      }
    };
    
    // Populate category dropdown
    function populateCategoryDropdown() {
      productCategory.innerHTML = '<option value="">Select Category</option>';
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        productCategory.appendChild(option);
      });
    }
    
    // Render category list in management modal
    function renderCategoryList() {
      categoryList.innerHTML = categories.map((cat, index) => `
        <div class="category-item">
          <input type="text" value="${cat}" id="cat-${index}" disabled>
          <div class="category-item-actions">
            <button class="btn-icon edit" onclick="editCategory(${index})">✏️</button>
            <button class="btn-icon delete" onclick="deleteCategory(${index})">🗑️</button>
          </div>
        </div>
      `).join('');
    }
    
    // Edit category
    window.editCategory = function(index) {
      const input = document.getElementById(`cat-${index}`);
      const isDisabled = input.disabled;
      
      if (isDisabled) {
        input.disabled = false;
        input.focus();
        input.select();
      } else {
        const newName = input.value.trim();
        if (newName && newName !== categories[index]) {
          // Update category name in inventory data
          const oldName = categories[index];
          inventoryData.forEach(item => {
            if (item.category === oldName) {
              item.category = newName;
            }
          });
          categories[index] = newName;
          categories.sort();
          populateCategoryDropdown();
          renderCategoryList();
          
          // Refresh view if needed
          if (currentView === 'list') {
            renderListView();
          } else {
            renderCalendar();
          }
        }
        input.disabled = true;
      }
    };
    
    // Delete category
    window.deleteCategory = function(index) {
      const categoryToDelete = categories[index];
      const itemsInCategory = inventoryData.filter(item => item.category === categoryToDelete).length;
      
      if (itemsInCategory > 0) {
        if (!confirm(`There are ${itemsInCategory} product(s) in "${categoryToDelete}". Delete anyway?`)) {
          return;
        }
      }
      
      categories.splice(index, 1);
      populateCategoryDropdown();
      renderCategoryList();
      
      // Refresh view if needed
      if (currentView === 'list') {
        renderListView();
      }
    };
    
    // Add new category
    addCategoryBtn.addEventListener('click', () => {
      const newCategory = newCategoryInput.value.trim().toUpperCase();
      
      if (!newCategory) {
        alert('Please enter a category name');
        return;
      }
      
      if (categories.includes(newCategory)) {
        alert('Category already exists');
        return;
      }
      
      categories.push(newCategory);
      categories.sort();
      newCategoryInput.value = '';
      populateCategoryDropdown();
      renderCategoryList();
    });
    
    // Category modal controls
    manageCategoriesBtn.addEventListener('click', () => {
      renderCategoryList();
      categoryModal.classList.add('active');
    });
    
    closeCategoryModal.addEventListener('click', () => {
      categoryModal.classList.remove('active');
    });
    
    closeCategoryBtn.addEventListener('click', () => {
      categoryModal.classList.remove('active');
    });
    
    // Initialize category dropdown
    populateCategoryDropdown();

    // View Toggle
    calendarViewBtn.addEventListener('click', () => {
      currentView = 'calendar';
      viewingSpecificDate = false;
      calendarViewBtn.classList.add('active');
      listViewBtn.classList.remove('active');
      detailedViewBtn.classList.remove('active');
      calendarViewContainer.style.display = 'block';
      listViewContainer.classList.remove('active');
      detailedViewContainer.classList.remove('active');
      renderCalendar();
    });

    listViewBtn.addEventListener('click', () => {
      // Only switch if not already in list view
      if (currentView !== 'list') {
        currentView = 'list';
        listViewBtn.classList.add('active');
        calendarViewBtn.classList.remove('active');
        detailedViewBtn.classList.remove('active');
        calendarViewContainer.style.display = 'none';
        listViewContainer.classList.add('active');
        detailedViewContainer.classList.remove('active');
        
        // If a date was selected in calendar, show that specific date in list view
        if (selectedDate) {
          viewingSpecificDate = true;
          updateDateDisplay();
          renderListViewForDate(selectedDate);
        } else {
          // Otherwise show the full month
          viewingSpecificDate = false;
          updateDateDisplay();
          renderListView();
        }
      }
    });
    
    detailedViewBtn.addEventListener('click', () => {
      currentView = 'detailed';
      viewingSpecificDate = false;
      detailedViewBtn.classList.add('active');
      calendarViewBtn.classList.remove('active');
      listViewBtn.classList.remove('active');
      calendarViewContainer.style.display = 'none';
      listViewContainer.classList.remove('active');
      detailedViewContainer.classList.add('active');
      renderDetailedView();
    });

    // Month/Year Selection
    goDateBtn.addEventListener('click', () => {
      currentMonth = parseInt(monthSelect.value);
      currentYear = parseInt(yearInput.value) || 2026;
      
      // Reset to month view when using Go button - this shows entire month
      viewingSpecificDate = false;
      selectedDate = null;
      
      if (currentView === 'calendar') {
        renderCalendar();
      } else {
        // In list view, show entire month
        updateDateDisplay();
        renderListView();
      }
    });

    // Update calendar when month or year changes
    monthSelect.addEventListener('change', () => {
      currentMonth = parseInt(monthSelect.value);
      
      // When changing month dropdown, clear specific date and show month view
      viewingSpecificDate = false;
      selectedDate = null;
      
      if (currentView === 'calendar') {
        renderCalendar();
      } else {
        updateDateDisplay();
        renderListView();
      }
    });

    yearInput.addEventListener('change', () => {
      currentYear = parseInt(yearInput.value) || 2026;
      
      // When changing year, clear specific date and show month view
      viewingSpecificDate = false;
      selectedDate = null;
      
      if (currentView === 'calendar') {
        renderCalendar();
      } else {
        updateDateDisplay();
        renderListView();
      }
    });

    // Search
    searchInput.addEventListener('input', () => {
      if (currentView === 'list') {
        renderListView();
      }
    });

    // Modal Controls
    addProductBtn.addEventListener('click', () => {
      addProductModal.classList.add('active');
    });

    // Add Product Form Submit
    addProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newProduct = {
        date: document.getElementById('productDate').value,
        category: document.getElementById('productCategory').value,
        product: document.getElementById('productName').value,
        batch: document.getElementById('productBatch').value,
        qty: parseInt(document.getElementById('productQty').value),
        status: document.getElementById('productStatus').value
      };
      
      inventoryData.push(newProduct);
      inventoryData.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.category.localeCompare(b.category);
      });
      
      addProductModal.classList.remove('active');
      addProductForm.reset();
      productDate.value = today;
      
      // Update views
      if (currentView === 'calendar') {
        renderCalendar();
      } else {
        renderListView();
      }
      
      // Update dashboard overview
      updateDashboardOverview();
    });

    // Render Calendar View
    function renderCalendar() {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      
      calendarHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
      
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
      
      let html = '';
      
      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">
          <div class="day-number">${prevMonthDays - i}</div>
        </div>`;
      }
      
      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayItems = inventoryData.filter(item => item.date === dateStr);
        const isSelected = selectedDate === dateStr;
        
        html += `<div class="calendar-day ${isSelected ? 'selected' : ''}" data-date="${dateStr}">
          <div class="day-number">${day}</div>
          <div class="day-items">
            ${dayItems.length > 0 ? `<span class="day-badge">${dayItems.length} item${dayItems.length > 1 ? 's' : ''}</span>` : ''}
          </div>
        </div>`;
      }
      
      // Next month days
      const totalCells = firstDay + daysInMonth;
      const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let i = 1; i <= remainingCells; i++) {
        html += `<div class="calendar-day other-month">
          <div class="day-number">${i}</div>
        </div>`;
      }
      
      calendarDays.innerHTML = html;
      
      // Add click handlers to calendar days
      document.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
        let touchTimer;
        let touchStarted = false;
        
        // Single click - just select/highlight
        day.addEventListener('click', (e) => {
          if (!touchStarted) {
            selectedDate = day.dataset.date;
            renderCalendar();
          }
        });
        
        // Touch and hold for mobile
        day.addEventListener('touchstart', (e) => {
          touchStarted = true;
          day.classList.add('pressing');
          touchTimer = setTimeout(() => {
            selectedDate = day.dataset.date;
            day.classList.remove('pressing');
            renderCalendar();
            showDayDetails(selectedDate);
            // Haptic feedback if available
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
          }, 500); // Hold for 500ms
        });
        
        day.addEventListener('touchend', () => {
          clearTimeout(touchTimer);
          day.classList.remove('pressing');
          setTimeout(() => { touchStarted = false; }, 100);
        });
        
        day.addEventListener('touchmove', () => {
          clearTimeout(touchTimer);
          day.classList.remove('pressing');
        });
        
        // Double-click to go to list view for that date
        day.addEventListener('dblclick', () => {
          selectedDate = day.dataset.date;
          viewingSpecificDate = true;
          currentView = 'list';
          listViewBtn.classList.add('active');
          calendarViewBtn.classList.remove('active');
          calendarViewContainer.style.display = 'none';
          listViewContainer.classList.add('active');
          updateDateDisplay();
          renderListViewForDate(selectedDate);
        });
      });
    }

    // Show day details when Enter is pressed (Desktop)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && selectedDate && currentView === 'calendar') {
        showDayDetails(selectedDate);
      }
    });

    // Show day details when Enter is pressed (Low Stock and Out of Stock only)
    function showDayDetails(dateStr) {
      const items = inventoryData.filter(item => item.date === dateStr);
      
      // Filter only Low Stock and Out of Stock items
      const criticalItems = items.filter(item => 
        item.status === 'Low Stock' || item.status === 'Out of Stock'
      );
      
      // Format the date for display
      const dateObj = new Date(dateStr + 'T00:00:00');
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = dateObj.toLocaleDateString('en-US', options);
      
      if (criticalItems.length === 0) {
        stockDetailTitle.textContent = `Stock Alert - ${formattedDate}`;
        stockDetailBody.innerHTML = `
          <div class="empty-state" style="padding: 2rem;">
            <div class="empty-state-icon" style="font-size: 3rem;">✅</div>
            <h3>All Good!</h3>
            <p>All inventory items are in good stock on this date</p>
          </div>
        `;
        stockDetailModal.classList.add('active');
        return;
      }
      
      // Group by category
      const grouped = {};
      criticalItems.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      });
      
      let lowStockCount = 0;
      let outOfStockCount = 0;
      
      let html = '';
      Object.keys(grouped).sort().forEach(category => {
        html += `
          <div class="stock-detail-category">
            <div class="stock-category-header">${category}</div>
        `;
        
        grouped[category].forEach(item => {
          const icon = item.status === 'Out of Stock' ? '🔴' : '🟡';
          
          html += `
            <div class="stock-item">
              <div class="stock-item-name">${icon} ${item.product}</div>
              <div class="stock-item-details">
                <div class="stock-item-detail">
                  <strong>Batch:</strong> <span>${item.batch}</span>
                </div>
                <div class="stock-item-detail">
                  <strong>Qty:</strong> <span>${item.qty}</span>
                </div>
                <div class="stock-item-detail">
                  <strong>Status:</strong> <span style="color: ${item.status === 'Out of Stock' ? '#ef4444' : '#f59e0b'};">${item.status}</span>
                </div>
              </div>
            </div>
          `;
          
          if (item.status === 'Low Stock') lowStockCount++;
          if (item.status === 'Out of Stock') outOfStockCount++;
        });
        
        html += `</div>`;
      });
      
      // Add summary
      html += `
        <div class="stock-summary">
          <div class="stock-summary-title">Summary</div>
          ${lowStockCount > 0 ? `<div><span>🟡 Low Stock</span><span>${lowStockCount} item(s)</span></div>` : ''}
          ${outOfStockCount > 0 ? `<div><span>🔴 Out of Stock</span><span>${outOfStockCount} item(s)</span></div>` : ''}
        </div>
      `;
      
      stockDetailTitle.textContent = `⚠️ Stock Alert - ${formattedDate}`;
      stockDetailBody.innerHTML = html;
      stockDetailModal.classList.add('active');
    }

    // Render List View
    function renderListView() {
      const search = searchInput.value.toLowerCase();
      
      // Update display to show "Results" if searching
      if (search) {
        const dateValueEl = document.getElementById('dateValueDisplay');
        dateValueEl.textContent = 'Search Results';
      } else {
        updateDateDisplay();
      }
      
      const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const monthEnd = `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-01`;
      
      let filtered = inventoryData.filter(item => {
        const itemDate = item.date;
        return itemDate >= monthStart && itemDate < monthEnd;
      });
      
      if (search) {
        filtered = filtered.filter(item => 
          item.product.toLowerCase().includes(search) ||
          item.batch.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search)
        );
      }
      
      if (filtered.length === 0) {
        inventoryBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h3>No inventory found</h3>
            <p>Try adjusting your filters or add new products</p>
          </div>
        `;
        return;
      }
      
      // Group by category
      const groupedByCategory = {};
      filtered.forEach(item => {
        if (!groupedByCategory[item.category]) {
          groupedByCategory[item.category] = [];
        }
        groupedByCategory[item.category].push(item);
      });
      
      // Sort categories
      const categories = Object.keys(groupedByCategory).sort();
      
      let html = '';
      categories.forEach(category => {
        const items = groupedByCategory[category];
        html += `
          <div class="category-section">
            <div class="category-title">
              <span>${category}</span>
              <span class="category-count">${items.length} item${items.length > 1 ? 's' : ''}</span>
            </div>
            <div class="category-items">
        `;
        
        items.forEach(item => {
          const statusClass = item.status === 'Available' ? 'status-available' : 
                             item.status === 'Low Stock' ? 'status-low' : 'status-out';
          html += `
            <div class="inventory-card">
              <div class="card-field">
                <div class="card-label">Product Name</div>
                <div class="card-value product-name">${item.product}</div>
              </div>
              <div class="card-field">
                <div class="card-label">Batch / Expiry</div>
                <div class="card-value">${item.batch}</div>
              </div>
              <div class="card-field">
                <div class="card-label">Quantity</div>
                <div class="card-value">${item.qty}</div>
              </div>
              <div class="card-field">
                <div class="card-label">Status</div>
                <div class="status-badge ${statusClass}">${item.status}</div>
              </div>
            </div>
          `;
        });
        
        html += `
            </div>
          </div>
        `;
      });
      
      inventoryBody.innerHTML = html;
    }

    // Render List View for specific date
    function renderListViewForDate(dateStr) {
      const search = searchInput.value.toLowerCase();
      
      // Update display to show "Results" if searching
      if (search) {
        const dateValueEl = document.getElementById('dateValueDisplay');
        dateValueEl.textContent = 'Search Results';
      } else {
        updateDateDisplay();
      }
      
      let filtered = inventoryData.filter(item => item.date === dateStr);
      
      if (search) {
        filtered = filtered.filter(item => 
          item.product.toLowerCase().includes(search) ||
          item.batch.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search)
        );
      }
      
      if (filtered.length === 0) {
        inventoryBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h3>No inventory for ${dateStr}</h3>
            <p>No products found for this date</p>
          </div>
        `;
        return;
      }
      
      // Group by category
      const groupedByCategory = {};
      filtered.forEach(item => {
        if (!groupedByCategory[item.category]) {
          groupedByCategory[item.category] = [];
        }
        groupedByCategory[item.category].push(item);
      });
      
      // Sort categories
      const categories = Object.keys(groupedByCategory).sort();
      
      let html = '';
      categories.forEach(category => {
        const items = groupedByCategory[category];
        html += `
          <div class="category-section">
            <div class="category-title">
              <span>${category}</span>
              <span class="category-count">${items.length} item${items.length > 1 ? 's' : ''}</span>
            </div>
            <div class="category-items">
        `;
        
        items.forEach(item => {
          const statusClass = item.status === 'Available' ? 'status-available' : 
                             item.status === 'Low Stock' ? 'status-low' : 'status-out';
          html += `
            <div class="inventory-card">
              <div class="card-field">
                <div class="card-label">Product Name</div>
                <div class="card-value product-name">${item.product}</div>
              </div>
              <div class="card-field">
                <div class="card-label">Batch / Expiry</div>
                <div class="card-value">${item.batch}</div>
              </div>
              <div class="card-field">
                <div class="card-label">Quantity</div>
                <div class="card-value">${item.qty}</div>
              </div>
              <div class="card-field">
                <div class="card-label">Status</div>
                <div class="status-badge ${statusClass}">${item.status}</div>
              </div>
            </div>
          `;
        });
        
        html += `
            </div>
          </div>
        `;
      });
      
      inventoryBody.innerHTML = html;
    }
    
    // Render Detailed View
    function renderDetailedView() {
      // Get all inventory data sorted by date (newest first)
      const sortedData = [...inventoryData].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (sortedData.length === 0) {
        detailedInventoryBody.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📦</div>
            <h3>No inventory data</h3>
            <p>Add products to see detailed information</p>
          </div>
        `;
        return;
      }
      
      let html = `
        <table>
          <thead>
            <tr>
              <th data-short="Date"><div>Date</div></th>
              <th data-short="Product"><div>Product</div></th>
              <th data-short="Cat."><div>Category</div></th>
              <th data-short="Batch"><div>Batch</div></th>
              <th data-short="Qty"><div>Quantity</div></th>
              <th data-short="Status"><div>Status</div></th>
            </tr>
          </thead>
          <tbody>
      `;
      
      sortedData.forEach(item => {
        // Determine status class
        let statusClass = 'available';
        if (item.status === 'Low Stock') statusClass = 'low';
        else if (item.status === 'Out of Stock') statusClass = 'out';
        else if (item.status === 'Expiring Soon') statusClass = 'expiring';
        
        html += `
          <tr>
            <td data-label="Date">${item.date}</td>
            <td data-label="Product">${item.product}</td>
            <td data-label="Category"><span class="category-tag">${item.category}</span></td>
            <td data-label="Batch">${item.batch}</td>
            <td data-label="Quantity">${item.qty}</td>
            <td data-label="Status"><span class="status-badge ${statusClass}">${item.status}</span></td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
      
      detailedInventoryBody.innerHTML = html;
    }

    // Initialize
    monthSelect.value = currentMonth;
    yearInput.value = currentYear;
    renderCalendar();
    updateDashboardOverview();
    updateDashboardData('today');
    
    // Initialize role after everything else is set up
    setTimeout(() => {
      updateUIForRole('owner');
    }, 100);

    // === JOURNALS PAGE FUNCTIONALITY ===
    
    // Product Database
    const journalProductDatabase = {
      'Medicine': [
        { name: 'Paracetamol', price: 5 },
        { name: 'Ibuprofen', price: 8 },
        { name: 'Amoxicillin', price: 15 },
        { name: 'Cetirizine', price: 6 },
        { name: 'Vitamin C', price: 10 },
        { name: 'Cough Syrup', price: 25 }
      ],
      'PPE': [
        { name: 'Face Mask', price: 10 },
        { name: 'N95 Mask', price: 50 },
        { name: 'Gloves', price: 5 },
        { name: 'Face Shield', price: 30 },
        { name: 'Gown', price: 100 },
        { name: 'Hair Cap', price: 3 }
      ],
      'Supplies': [
        { name: 'Syringe', price: 8 },
        { name: 'Bandage', price: 15 },
        { name: 'Cotton', price: 20 },
        { name: 'Gauze', price: 25 },
        { name: 'Tape', price: 12 },
        { name: 'IV Catheter', price: 40 }
      ],
      'Equipment': [
        { name: 'Thermometer', price: 200 },
        { name: 'BP Monitor', price: 1500 },
        { name: 'Stethoscope', price: 800 },
        { name: 'Oximeter', price: 500 },
        { name: 'Nebulizer', price: 2000 }
      ],
      'Hygiene': [
        { name: 'Alcohol', price: 100 },
        { name: 'Hand Soap', price: 50 },
        { name: 'Sanitizer', price: 80 },
        { name: 'Wet Wipes', price: 60 },
        { name: 'Tissue', price: 30 }
      ],
      'Other': [
        { name: 'Water Bottle', price: 20 },
        { name: 'Bedpan', price: 150 },
        { name: 'Urinal', price: 120 },
        { name: 'Ice Pack', price: 50 },
        { name: 'Hot Pack', price: 50 }
      ]
    };

    // Journal State
    let journalCurrentItems = [];
    let journalCurrentQuantity = 1;
    let journalSelectedCategory = null;
    let journalSelectedProduct = null;
    let journalRecentReceipts = [];

    // Journal Elements
    const journalNurseName = document.getElementById('journalNurseName');
    const journalCurrentTime = document.getElementById('journalCurrentTime');
    const journalPatientNameInput = document.getElementById('journalPatientName');
    const journalItemsList = document.getElementById('journalItemsList');
    const journalSelectionTitle = document.getElementById('journalSelectionTitle');
    const journalCategoryGrid = document.getElementById('journalCategoryGrid');
    const journalProductGrid = document.getElementById('journalProductGrid');
    const journalQtyDisplay = document.getElementById('journalQtyDisplay');
    const journalDecreaseQtyBtn = document.getElementById('journalDecreaseQty');
    const journalIncreaseQtyBtn = document.getElementById('journalIncreaseQty');
    const journalAddItemBtn = document.getElementById('journalAddItemBtn');
    const journalOkBtn = document.getElementById('journalOkBtn');
    const journalRecentBtn = document.getElementById('journalRecentBtn');
    const journalRecentModal = document.getElementById('journalRecentModal');
    const closeJournalRecentModal = document.getElementById('closeJournalRecentModal');
    const journalRecentModalBody = document.getElementById('journalRecentModalBody');
    const journalPreviewModal = document.getElementById('journalPreviewModal');
    const closeJournalPreviewModal = document.getElementById('closeJournalPreviewModal');
    const journalPreviewModalBody = document.getElementById('journalPreviewModalBody');

    // Update Journal Time
    function updateJournalTime() {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      journalCurrentTime.textContent = `${month}/${day}/${year} - ${hours}:${minutes}`;
    }
    
    // Update nurse name from current user
    function updateJournalNurseName() {
      const currentUserName = document.getElementById('userName').textContent;
      journalNurseName.textContent = currentUserName;
    }

    updateJournalTime();
    updateJournalNurseName();
    setInterval(updateJournalTime, 60000);

    // Category Selection
    journalCategoryGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.journal-grid-btn');
      if (!btn) return;

      journalSelectedCategory = btn.dataset.category;
      showJournalProducts(journalSelectedCategory);
    });

    // Show Products
    function showJournalProducts(category) {
      journalCategoryGrid.classList.add('journal-hidden');
      journalProductGrid.classList.remove('journal-hidden');
      journalSelectionTitle.textContent = `Select ${category}`;

      const products = journalProductDatabase[category] || [];
      let html = '<button class="journal-back-to-category">← Back to Categories</button>';

      products.forEach(product => {
        html += `
          <button class="journal-grid-btn" data-product='${JSON.stringify(product)}'>
            <span class="journal-product-name">${product.name}</span>
            <span class="journal-product-price">₱${product.price}</span>
          </button>
        `;
      });

      journalProductGrid.innerHTML = html;

      // Back button
      journalProductGrid.querySelector('.journal-back-to-category').addEventListener('click', backToJournalCategories);

      // Product selection
      journalProductGrid.querySelectorAll('.journal-grid-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          journalProductGrid.querySelectorAll('.journal-grid-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          journalSelectedProduct = JSON.parse(btn.dataset.product);
          journalAddItemBtn.disabled = false;
        });
      });
    }

    // Back to Categories
    function backToJournalCategories() {
      journalProductGrid.classList.add('journal-hidden');
      journalCategoryGrid.classList.remove('journal-hidden');
      journalSelectionTitle.textContent = 'Select Category';
      journalSelectedProduct = null;
      journalAddItemBtn.disabled = true;
    }

    // Quantity Controls
    journalDecreaseQtyBtn.addEventListener('click', () => {
      if (journalCurrentQuantity > 1) {
        journalCurrentQuantity--;
        journalQtyDisplay.textContent = journalCurrentQuantity;
      }
    });

    journalIncreaseQtyBtn.addEventListener('click', () => {
      journalCurrentQuantity++;
      journalQtyDisplay.textContent = journalCurrentQuantity;
    });

    // Add Item
    journalAddItemBtn.addEventListener('click', () => {
      if (!journalSelectedProduct) return;

      const item = {
        name: journalSelectedProduct.name,
        price: journalSelectedProduct.price,
        quantity: journalCurrentQuantity,
        total: journalSelectedProduct.price * journalCurrentQuantity
      };

      journalCurrentItems.push(item);
      renderJournalItems();
      
      // Reset selection
      journalCurrentQuantity = 1;
      journalQtyDisplay.textContent = journalCurrentQuantity;
      journalSelectedProduct = null;
      journalAddItemBtn.disabled = true;
      backToJournalCategories();
      
      // Enable OK button
      journalOkBtn.disabled = false;

      // Animation
      journalItemsList.classList.add('journal-success-animation');
      setTimeout(() => journalItemsList.classList.remove('journal-success-animation'), 300);
    });

    // Render Items
    function renderJournalItems() {
      if (journalCurrentItems.length === 0) {
        journalItemsList.innerHTML = '<div class="journal-empty-inline">No items • Tap category to start</div>';
        return;
      }

      let html = '';
      let grandTotal = 0;

      journalCurrentItems.forEach(item => {
        html += `
          <div class="journal-item-compact">
            <div class="journal-item-left">
              <div class="journal-item-name">${item.name}</div>
              <div class="journal-item-details">${item.quantity} × ₱${item.price}</div>
            </div>
            <div class="journal-item-total">₱${item.total}</div>
          </div>
        `;
        grandTotal += item.total;
      });

      html += `
        <div class="journal-item-compact" style="border-top: 2px solid #e5e7eb; margin-top: 0.5rem; padding-top: 0.5rem;">
          <div class="journal-item-left">
            <div class="journal-item-name" style="font-weight: 700;">TOTAL</div>
          </div>
          <div class="journal-item-total" style="font-size: 1rem;">₱${grandTotal}</div>
        </div>
      `;

      journalItemsList.innerHTML = html;
    }

    // Save Receipt
    journalOkBtn.addEventListener('click', () => {
      const patientName = journalPatientNameInput.value.trim();
      
      if (!patientName) {
        alert('Please enter patient name');
        journalPatientNameInput.focus();
        return;
      }

      if (journalCurrentItems.length === 0) {
        alert('Please add at least one item');
        return;
      }

      const totalAmount = journalCurrentItems.reduce((sum, item) => sum + item.total, 0);
      const currentNurseName = document.getElementById('userName').textContent;

      const receipt = {
        id: Date.now(),
        nurse: currentNurseName,
        patient: patientName,
        items: [...journalCurrentItems],
        total: totalAmount,
        timestamp: new Date().toLocaleString()
      };

      journalRecentReceipts.unshift(receipt);
      
      // **NEW: Add to sales records**
      const salesRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        patient: patientName,
        nurse: currentNurseName,
        items: journalCurrentItems.map(item => ({
          name: item.name,
          category: 'Medicine', // You can enhance this by tracking category
          quantity: item.quantity,
          price: item.price
        })),
        total: totalAmount
      };
      
      if (typeof salesRecords !== 'undefined') {
        salesRecords.unshift(salesRecord);
      }
      
      // Clear form
      journalPatientNameInput.value = '';
      journalCurrentItems = [];
      renderJournalItems();
      journalOkBtn.disabled = true;

      // Show success
      alert('Receipt saved and queued for printing!');
      
      // Show recent modal
      showJournalRecentModal();
    });

    // Recent Button
    journalRecentBtn.addEventListener('click', showJournalRecentModal);

    // Show Recent Modal
    function showJournalRecentModal() {
      if (journalRecentReceipts.length === 0) {
        journalRecentModalBody.innerHTML = '<div class="journal-empty">No receipts in queue</div>';
      } else {
        let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
        journalRecentReceipts.forEach(receipt => {
          const itemsText = receipt.items.map(item => `${item.name} (${item.quantity})`).join(', ');
          html += `
            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; border: 2px solid #e5e7eb; cursor: pointer;" onclick="showJournalReceiptPreview(${receipt.id})">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-weight: 600; color: #111827;">${receipt.patient}</span>
                <span style="font-size: 0.8rem; color: #6b7280;">${receipt.timestamp}</span>
              </div>
              <div style="font-size: 0.85rem; color: #6b7280;">${itemsText}</div>
              <div style="font-weight: 600; color: #111827; margin-top: 0.5rem;">Total: ₱${receipt.total}</div>
              <button onclick="event.stopPropagation(); printJournalReceipt(${receipt.id})" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; width: 100%;">🖨️ Print Receipt</button>
            </div>
          `;
        });
        html += '</div>';
        journalRecentModalBody.innerHTML = html;
      }
      journalRecentModal.classList.add('active');
    }

    // Show Receipt Preview
    window.showJournalReceiptPreview = function(receiptId) {
      const receipt = journalRecentReceipts.find(r => r.id === receiptId);
      if (!receipt) return;

      let html = '<div style="background: white; padding: 1.5rem; border: 2px dashed #d1d5db; border-radius: 8px; font-family: \'Courier New\', monospace; font-size: 0.85rem;">';
      html += '<div style="text-align: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px dashed #d1d5db;">';
      html += '<div style="font-weight: bold; font-size: 1.1rem;">HOSPITAL RECEIPT</div>';
      html += `<div>Nurse: ${receipt.nurse}</div>`;
      html += `<div>Date: ${receipt.timestamp}</div>`;
      html += `<div>Patient: ${receipt.patient}</div>`;
      html += '</div>';
      
      html += '<div style="margin-bottom: 1rem;">';
      receipt.items.forEach(item => {
        html += `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">`;
        html += `<span>${item.name} x${item.quantity}</span>`;
        html += `<span>₱${item.total}</span>`;
        html += `</div>`;
      });
      html += '</div>';
      
      html += '<div style="padding-top: 1rem; border-top: 1px dashed #d1d5db; font-weight: bold;">';
      html += `<div style="display: flex; justify-content: space-between;">`;
      html += `<span>TOTAL</span>`;
      html += `<span>₱${receipt.total}</span>`;
      html += `</div>`;
      html += '</div>';
      
      html += '</div>';
      
      html += `<button onclick="printJournalReceipt(${receipt.id})" style="margin-top: 1rem; padding: 0.75rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; width: 100%;">🖨️ Print Receipt</button>`;
      
      journalPreviewModalBody.innerHTML = html;
      journalPreviewModal.classList.add('active');
    };

    // Print Receipt
    window.printJournalReceipt = function(receiptId) {
      const receipt = journalRecentReceipts.find(r => r.id === receiptId);
      if (!receipt) return;

      // In real implementation, this would send to server/printer
      console.log('Printing receipt:', receipt);
      alert('Sending to printer...\n(In production, this will print to the server printer)');
      
      // Remove from queue after printing
      journalRecentReceipts = journalRecentReceipts.filter(r => r.id !== receiptId);
      showJournalRecentModal();
    };

    // Close Modals
    closeJournalRecentModal.addEventListener('click', () => {
      journalRecentModal.classList.remove('active');
    });

    closeJournalPreviewModal.addEventListener('click', () => {
      journalPreviewModal.classList.remove('active');
    });

    // Close on background click
    journalRecentModal.addEventListener('click', (e) => {
      if (e.target === journalRecentModal) {
        journalRecentModal.classList.remove('active');
      }
    });

    journalPreviewModal.addEventListener('click', (e) => {
      if (e.target === journalPreviewModal) {
        journalPreviewModal.classList.remove('active');
      }
    });
    } // End of OLD inventory system check

    // === NEW INVENTORY SYSTEM ===
    // New Inventory Elements
    const inventoryCurrentDate = document.getElementById('inventoryCurrentDate');
    const inventorySearchInput = document.getElementById('inventorySearchInput');
    const datePickerInput = document.getElementById('datePickerInput');
    const inventoryProductsBody = document.getElementById('inventoryProductsBody');
    const statusBoxes = document.querySelectorAll('.status-box[data-status]');
    const addNewProductBox = document.getElementById('addNewProductBox');
    const allCountEl = document.getElementById('allCount');
    const lowCountEl = document.getElementById('lowCount');
    const outCountEl = document.getElementById('outCount');
    
    // Current filter status
    let currentStockFilter = 'all'; // 'all', 'low', 'out'
    
    // Current selected date (default to today)
    let currentSelectedDate = new Date();
    
    // Product master list - all products
    let productsMaster = [
      // Temporary test products
      { product: 'Surgical Gloves', category: 'BY BOX', expiry: '2027-06-15', stock: 150 },
      { product: 'Syringe 5ml', category: 'BY PIECE', expiry: '2027-12-20', stock: 300 },
      { product: 'Saline Solution', category: 'IV', expiry: '2026-08-10', stock: 85 },
      { product: 'Bandages', category: 'BY BOX', expiry: '2027-03-25', stock: 120 },
      { product: 'Alcohol Swabs', category: 'BY BOX', expiry: '2026-11-30', stock: 200 },
      { product: 'Face Masks', category: 'BY BOX', expiry: '2027-01-15', stock: 450 },
      { product: 'Cotton Balls', category: 'BY PIECE', expiry: '2027-05-20', stock: 180 },
      { product: 'Paracetamol 500mg', category: 'TAB/CAPS', expiry: '2027-09-10', stock: 95 },
      { product: 'Distilled Water', category: 'BY GALLON', expiry: '2026-12-15', stock: 60 },
      { product: 'Dextrose 5%', category: 'IV', expiry: '2027-04-22', stock: 110 },
      { product: 'Amoxicillin 500mg', category: 'TAB/CAPS', expiry: '2026-02-10', stock: 8 },
      { product: 'Normal Saline', category: 'IV', expiry: '2026-09-05', stock: 140 },
      
      // IV
      { product: 'D50 50ML', category: 'IV', expiry: '2026-12-31', stock: 75 },
      { product: 'DIPENHYDRAMINE', category: 'IV', expiry: '2027-03-15', stock: 50 },
      { product: 'EPOETIN ALFA', category: 'IV', expiry: '2026-09-20', stock: 25 },
      { product: 'EPINEPHRINE', category: 'IV', expiry: '2027-01-10', stock: 90 },
      { product: 'EPOETIN BETA', category: 'IV', expiry: '2026-08-25', stock: 30 },
      { product: 'GENTAMYCIN', category: 'IV', expiry: '2027-05-18', stock: 65 },
      { product: 'HEPARIN', category: 'IV', expiry: '2026-11-30', stock: 45 },
      { product: 'HYDROCORTISONE', category: 'IV', expiry: '2027-02-14', stock: 55 },
      { product: 'IV IRON', category: 'IV', expiry: '2027-04-22', stock: 40 },
      { product: 'IV PARACETAMOL', category: 'IV', expiry: '2026-10-15', stock: 80 },
      { product: 'PNSS IL', category: 'IV', expiry: '2027-06-30', stock: 200 },
      { product: 'SALBUTAMOL', category: 'IV', expiry: '2026-12-20', stock: 70 },
      
      // TAB/CAPS
      { product: 'CLONIDINE', category: 'TAB/CAPS', expiry: '2027-01-25', stock: 120 },
      { product: 'DUO GESIC', category: 'TAB/CAPS', expiry: '2026-09-10', stock: 5 },
      { product: 'FLUGARD', category: 'TAB/CAPS', expiry: '2027-03-05', stock: 95 },
      { product: 'MEFENAMIC ACID', category: 'TAB/CAPS', expiry: '2026-11-18', stock: 150 },
      { product: 'TRAMADOL OPIODEX', category: 'TAB/CAPS', expiry: '2027-02-28', stock: 60 },
      { product: 'TRAMADOL ROUNOX', category: 'TAB/CAPS', expiry: '2026-10-22', stock: 3 },
      { product: 'TRAMADOL IV', category: 'TAB/CAPS', expiry: '2027-04-15', stock: 85 },
      
      // BY GALLON
      { product: 'ALCOHOL', category: 'BY GALLON', expiry: '2027-12-31', stock: 45 },
      
      // BY BOX
      { product: 'FACEMASK', category: 'BY BOX', expiry: '2028-01-30', stock: 250 },
      { product: 'GLOVES', category: 'BY BOX', expiry: '2027-08-15', stock: 180 },
      { product: 'STERILE GLOVES', category: 'BY BOX', expiry: '2027-09-20', stock: 95 },
      { product: 'ALCOHOL PREP PAD', category: 'BY BOX', expiry: '2027-06-10', stock: 140 },
      
      // BY PIECE
      { product: 'BLANKET', category: 'BY PIECE', expiry: '2029-01-01', stock: 75 },
      { product: 'BLOODLINES', category: 'BY PIECE', expiry: '2027-05-20', stock: 120 },
      { product: 'CBG TESTING LANCET', category: 'BY PIECE', expiry: '2026-12-15', stock: 200 },
      { product: 'CBG TESTING TEST STRIP', category: 'BY PIECE', expiry: '2026-11-28', stock: 180 },
      { product: 'DISPOSABLE SYRINGE', category: 'BY PIECE', expiry: '2027-07-30', stock: 300 },
      { product: 'FISTULA KIT', category: 'BY PIECE', expiry: '2027-03-18', stock: 50 },
      { product: 'FISTULA NEEDLE SET', category: 'BY PIECE', expiry: '2027-04-25', stock: 60 },
      { product: 'HIFLUX DIALYZER', category: 'BY PIECE', expiry: '2026-10-31', stock: 0 },
      { product: 'LINEN', category: 'BY PIECE', expiry: '2029-01-01', stock: 100 },
      { product: 'MICROPORE', category: 'BY PIECE', expiry: '2027-08-22', stock: 150 },
      { product: 'MUPIROCIN', category: 'BY PIECE', expiry: '2026-09-14', stock: 8 },
      { product: 'NASAL CANNULA', category: 'BY PIECE', expiry: '2027-11-05', stock: 90 },
      { product: 'NEBU KIT', category: 'BY PIECE', expiry: '2027-02-10', stock: 110 },
      { product: 'NECK PILLOW', category: 'BY PIECE', expiry: '2029-01-01', stock: 40 },
      { product: 'OXYGEN MASK', category: 'BY PIECE', expiry: '2027-06-18', stock: 85 },
      { product: 'SUBCLAVIAN KIT', category: 'BY PIECE', expiry: '2027-01-28', stock: 2 },
      { product: 'TISSUE', category: 'BY PIECE', expiry: '2028-12-31', stock: 220 },
      { product: 'TUMBLER', category: 'BY PIECE', expiry: '2029-01-01', stock: 65 },
    ];
    
    // Sales data by date - keyed by date string "YYYY-MM-DD" -> { productName: salesCount }
    let salesByDate = {};
    
    // Initialize with random sales for demonstration
    function initializeSalesData() {
      const today = new Date();
      for (let i = -30; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        salesByDate[dateStr] = {};
        productsMaster.forEach(product => {
          salesByDate[dateStr][product.product] = Math.floor(Math.random() * 20);
        });
      }
    }
    
    initializeSalesData();
    
    // Update date display
    function updateInventoryDateDisplay() {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      inventoryCurrentDate.textContent = currentSelectedDate.toLocaleDateString('en-US', options);
    }
    
    // Render products table
    function renderInventoryProducts() {
      console.log('=== RENDERING PRODUCTS ===');
      console.log('inventorySearchInput:', inventorySearchInput);
      console.log('inventoryProductsBody:', inventoryProductsBody);
      
      if (!inventorySearchInput || !inventoryProductsBody) {
        console.error('Missing required elements!');
        return;
      }
      
      const searchTerm = inventorySearchInput.value.toLowerCase();
      const currentDateStr = currentSelectedDate.toISOString().split('T')[0];
      
      console.log('searchTerm:', searchTerm);
      console.log('currentDateStr:', currentDateStr);
      console.log('productsMaster:', productsMaster.length, 'products');
      
      // Filter products
      let filtered = productsMaster.filter(p => {
        const matchesSearch = p.product.toLowerCase().includes(searchTerm) || 
                             p.category.toLowerCase().includes(searchTerm);
        
        // Filter by stock status
        let matchesStockFilter = true;
        if (currentStockFilter === 'all') {
          matchesStockFilter = true; // Show all items
        } else if (currentStockFilter === 'low') {
          matchesStockFilter = (p.stock || 0) > 0 && (p.stock || 0) < 20;
        } else if (currentStockFilter === 'out') {
          matchesStockFilter = (p.stock || 0) === 0;
        }
        
        return matchesSearch && matchesStockFilter;
      });
      
      console.log('filtered:', filtered.length, 'products');
      
      // Sort by category, then by name
      filtered.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.product.localeCompare(b.product);
      });
      
      // Build table HTML
      let html = '';
      let lastCategory = '';
      
      filtered.forEach((product, index) => {
        // Add separator row when category changes (except for first item)
        if (product.category !== lastCategory && lastCategory !== '') {
          html += `
            <tr class="category-separator">
              <td colspan="5" style="background: #f3f4f6; height: 8px; padding: 0; border: none;"></td>
            </tr>
          `;
        }
        lastCategory = product.category;
        
        // Get sales for today
        const salesToday = (salesByDate[currentDateStr] && salesByDate[currentDateStr][product.product]) || 0;
        const currentStock = product.stock || 0;
        
        // Determine stock status color
        let stockColor = '#10b981'; // Green for good stock
        if (currentStock === 0) {
          stockColor = '#dc2626'; // Red for out of stock
        } else if (currentStock < 20) {
          stockColor = '#f59e0b'; // Orange for low stock
        }
        
        html += `
          <tr>
            <td data-label="Category">${product.category}</td>
            <td data-label="Product">${product.product}</td>
            <td data-label="Current Stock"><span style="color: ${stockColor}; font-weight: 600;">${currentStock}</span></td>
            <td data-label="Expiry Date">${formatDate(product.expiry)}</td>
            <td data-label="Sales">${salesToday}</td>
          </tr>
        `;
      });
      
      console.log('Generated HTML length:', html.length);
      
      inventoryProductsBody.innerHTML = html || '<tr><td colspan="4" style="text-align:center; padding:2rem; color:#9ca3af;">No products found</td></tr>';
      
      console.log('Products rendered to table');
      
      // Update counts
      updateStatusCounts();
    }
    
    // Format date
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    // Update status counts
    function updateStatusCounts() {
      // Calculate real counts based on stock levels
      let allCount = productsMaster.length; // Total items
      let lowCount = 0;
      let outCount = 0;
      let availableCount = 0;
      let expiringCount = 0;
      
      const today = new Date();
      
      productsMaster.forEach(product => {
        const stock = product.stock || 0;
        
        // Count by stock status
        if (stock === 0) {
          outCount++;
        } else if (stock < 20) {
          lowCount++;
        } else {
          availableCount++;
        }
        
        // Check if expiring soon (within 90 days)
        if (product.expiry) {
          const expiryDate = new Date(product.expiry);
          const diffTime = expiryDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Expiring within 90 days
          if (diffDays <= 90 && diffDays >= 0) {
            expiringCount++;
          }
        }
      });
      
      // Update inventory page status boxes
      if (allCountEl) allCountEl.textContent = allCount;
      if (lowCountEl) lowCountEl.textContent = lowCount;
      if (outCountEl) outCountEl.textContent = outCount;
      
      // Update dashboard inventory overview
      const dashAvailableEl = document.getElementById('dashAvailableCount');
      const dashLowStockEl = document.getElementById('dashLowStockCount');
      const dashOutStockEl = document.getElementById('dashOutStockCount');
      const dashExpiringEl = document.getElementById('dashExpiringCount');
      
      if (dashAvailableEl) dashAvailableEl.textContent = availableCount;
      if (dashLowStockEl) dashLowStockEl.textContent = lowCount;
      if (dashOutStockEl) dashOutStockEl.textContent = outCount;
      if (dashExpiringEl) dashExpiringEl.textContent = expiringCount;
      
      console.log('Status counts updated (Inventory + Dashboard):', {
        all: allCount,
        available: availableCount,
        lowStock: lowCount,
        outStock: outCount,
        expiring: expiringCount
      });
    }
    
    // Status box click handlers
    statusBoxes.forEach(box => {
      box.addEventListener('click', () => {
        const status = box.dataset.status;
        
        // Update active state
        statusBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        
        // Update filter
        currentStockFilter = status;
        
        console.log('Filter changed to:', status);
        
        // Re-render products with new filter
        renderInventoryProducts();
      });
    });
    
    // Event listeners
    if (inventorySearchInput) {
      inventorySearchInput.addEventListener('input', renderInventoryProducts);
    }
    
    // Previous day button
    const prevDayBtn = document.getElementById('prevDayBtn');
    if (prevDayBtn) {
      prevDayBtn.addEventListener('click', () => {
        currentSelectedDate.setDate(currentSelectedDate.getDate() - 1);
        updateInventoryDateDisplay();
        if (datePickerInput) {
          datePickerInput.value = currentSelectedDate.toISOString().split('T')[0];
        }
        renderInventoryProducts();
      });
    }
    
    // Next day button
    const nextDayBtn = document.getElementById('nextDayBtn');
    if (nextDayBtn) {
      nextDayBtn.addEventListener('click', () => {
        currentSelectedDate.setDate(currentSelectedDate.getDate() + 1);
        updateInventoryDateDisplay();
        if (datePickerInput) {
          datePickerInput.value = currentSelectedDate.toISOString().split('T')[0];
        }
        renderInventoryProducts();
      });
    }
    
    // Calendar picker button
    const visibleDatePicker = document.getElementById('visibleDatePicker');
    
    // Setup visible date picker
    if (visibleDatePicker) {
      visibleDatePicker.value = currentSelectedDate.toISOString().split('T')[0];
      
      visibleDatePicker.addEventListener('change', (e) => {
        console.log('Date picker changed:', e.target.value);
        currentSelectedDate = new Date(e.target.value + 'T00:00:00');
        updateInventoryDateDisplay();
        renderInventoryProducts();
      });
    }
    
    // Date picker change
    if (datePickerInput) {
      datePickerInput.addEventListener('change', (e) => {
        console.log('Date changed:', e.target.value);
        currentSelectedDate = new Date(e.target.value + 'T00:00:00');
        updateInventoryDateDisplay();
        renderInventoryProducts();
        
        // Hide the date picker again
        datePickerInput.style.position = 'fixed';
        datePickerInput.style.top = '-9999px';
        datePickerInput.style.left = '-9999px';
        datePickerInput.style.width = '1px';
        datePickerInput.style.height = '1px';
        datePickerInput.style.zIndex = '-1';
      });
      
      // Also hide on blur (when calendar closes)
      datePickerInput.addEventListener('blur', () => {
        setTimeout(() => {
          datePickerInput.style.position = 'fixed';
          datePickerInput.style.top = '-9999px';
          datePickerInput.style.left = '-9999px';
          datePickerInput.style.width = '1px';
          datePickerInput.style.height = '1px';
          datePickerInput.style.zIndex = '-1';
        }, 200);
      });
    }
    
    // Status box click handlers
    statusBoxes.forEach(box => {
      box.addEventListener('click', () => {
        statusBoxes.forEach(b => b.classList.remove('active'));
        box.classList.add('active');
        // TODO: Filter by status
        renderInventoryProducts();
      });
    });
    
    // Add product box
    if (addNewProductBox) {
      addNewProductBox.addEventListener('click', () => {
        if (addProductModal) addProductModal.classList.add('active');
      });
    }
    
    // Initialize inventory system
    function initInventorySystem() {
      console.log('=== INITIALIZING INVENTORY ===');
      console.log('datePickerInput:', datePickerInput);
      console.log('inventoryProductsBody:', inventoryProductsBody);
      console.log('productsMaster length:', productsMaster.length);
      console.log('currentSelectedDate:', currentSelectedDate);
      
      if (datePickerInput) {
        datePickerInput.value = currentSelectedDate.toISOString().split('T')[0];
      }
      updateInventoryDateDisplay();
      renderInventoryProducts();
      console.log('=== INITIALIZATION COMPLETE ===');
    }
    
    // === RESTOCK SYSTEM ===
    const goToRestockBtn = document.getElementById('goToRestockBtn');
    const backFromRestockBtn = document.getElementById('backFromRestockBtn');
    const restockPage = document.getElementById('restockPage');
    const inventoryPage = document.getElementById('inventory');
    const restockItemsList = document.getElementById('restockItemsList');
    const restockFilterBtns = document.querySelectorAll('.restock-filter-btn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const updateStocksBtn = document.getElementById('updateStocksBtn');
    const updateCounter = document.getElementById('updateCounter');
    const restockSearchInput = document.getElementById('restockSearchInput');
    const restockCategoryFilter = document.getElementById('restockCategoryFilter');
    
    // Delete password
    const DELETE_PASSWORD = 'admin123'; // Change this to your desired password
    const MANUAL_UPDATE_PASSWORD = 'admin123'; // Password for manual inventory update access
    
    let currentRestockFilter = 'all';
    let currentRestockSearch = '';
    let currentRestockCategory = 'all';
    let restockData = [];
    
    // Initialize restock data from products
    function initializeRestockData() {
      restockData = productsMaster.map(product => ({
        product: product.product,
        category: product.category,
        status: Math.random() > 0.7 ? 'low' : (Math.random() > 0.9 ? 'out' : 'normal'),
        monthlySold: Math.floor(Math.random() * 300) + 50,
        currentStock: Math.floor(Math.random() * 100),
        previousCost: (Math.random() * 500 + 50).toFixed(2),
        newCost: '',
        newStockQty: 0,
        checked: false
      }));
      
      // Populate category filter
      populateRestockCategoryFilter();
    }
    
    // Populate category filter dropdown
    function populateRestockCategoryFilter() {
      if (!restockCategoryFilter) return;
      
      // Get unique categories from restockData
      const categories = [...new Set(restockData.map(item => item.category))].sort();
      
      restockCategoryFilter.innerHTML = '<option value="all">All Categories</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        restockCategoryFilter.appendChild(option);
      });
    }
    
    // Navigate to restock page
    if (goToRestockBtn) {
      goToRestockBtn.addEventListener('click', () => {
        inventoryPage.classList.remove('active');
        restockPage.style.display = 'block';
        initializeRestockData();
        renderRestockItems();
        setupDeleteButton(); // Setup delete button when page opens

        // Scroll to top
        window.scrollTo(0, 0);
      });
    }
    
    // Navigate back to inventory
    if (backFromRestockBtn) {
      backFromRestockBtn.addEventListener('click', () => {
        restockPage.style.display = 'none';
        inventoryPage.classList.add('active');
      });
    }
    
    // Filter buttons
    restockFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentRestockFilter = btn.dataset.filter;
        restockFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderRestockItems();
      });
    });
    
    // Search input
    if (restockSearchInput) {
      restockSearchInput.addEventListener('input', (e) => {
        currentRestockSearch = e.target.value;
        renderRestockItems();
      });
    }
    
    // Category filter
    if (restockCategoryFilter) {
      restockCategoryFilter.addEventListener('change', (e) => {
        currentRestockCategory = e.target.value;
        renderRestockItems();
      });
    }
    
    // Render restock items
    function renderRestockItems() {
      let filtered = restockData;
      
      // Apply stock status filter
      if (currentRestockFilter === 'low') {
        filtered = filtered.filter(item => item.status === 'low');
      } else if (currentRestockFilter === 'out') {
        filtered = filtered.filter(item => item.status === 'out');
      }
      
      // Apply search filter
      if (currentRestockSearch) {
        filtered = filtered.filter(item => 
          item.product.toLowerCase().includes(currentRestockSearch.toLowerCase())
        );
      }
      
      // Apply category filter
      if (currentRestockCategory !== 'all') {
        filtered = filtered.filter(item => item.category === currentRestockCategory);
      }
      
      let html = '';
      
      if (filtered.length === 0) {
        html = '<div style="text-align: center; padding: 3rem; color: #9ca3af;">No items found matching your filters.</div>';
      } else {
        filtered.forEach((item, index) => {
        const actualIndex = restockData.indexOf(item);
        const statusClass = item.status === 'low' ? 'low' : item.status === 'out' ? 'out' : '';
        const statusText = item.status === 'low' ? 'Low Stock' : item.status === 'out' ? 'Out of Stock' : 'Normal';
        
        html += `
          <div class="restock-card ${item.checked ? 'selected' : ''}" data-index="${actualIndex}">
            <div class="restock-card-header">
              <div class="restock-card-title">
                <div class="restock-product-name">${item.product}</div>
                <div class="restock-category-status">
                  <span class="restock-category">${item.category}</span>
                  ${statusClass ? `<span class="restock-status ${statusClass}">${statusText}</span>` : ''}
                </div>
              </div>
              <div class="restock-checkbox-delete">
                <input type="checkbox" class="restock-checkbox" data-index="${actualIndex}" ${item.checked ? 'checked' : ''}>
              </div>
            </div>
            
            <div class="restock-card-body">
              <div class="restock-field">
                <div class="restock-field-label">Monthly Sold</div>
                <div class="restock-field-value">${item.monthlySold}</div>
              </div>
              
              <div class="restock-field">
                <div class="restock-field-label">Current Stock</div>
                <div class="restock-field-value">${item.currentStock}</div>
              </div>
              
              <div class="restock-field">
                <div class="restock-field-label">Previous Cost</div>
                <div class="restock-field-value">₱${item.previousCost}</div>
              </div>
            </div>
            
            <div class="restock-card-footer">
              <div class="restock-inputs-row">
                <div class="restock-input-group">
                  <div class="restock-input-label">New Cost (Per Item)</div>
                  <input type="number" class="new-cost-input" data-index="${actualIndex}" 
                         placeholder="₱0.00" value="${item.newCost}" step="0.01">
                </div>
                
                <div class="restock-input-group">
                  <div class="restock-input-label">New Stocks (Qty)</div>
                  <input type="number" class="new-stock-input" data-index="${actualIndex}" 
                         placeholder="0" value="${item.newStockQty || ''}" min="0">
                </div>
              </div>
              
              <button class="btn-add-cost" data-index="${actualIndex}">+ New Cost</button>
            </div>
          </div>
        `;
        });
      }
      
      restockItemsList.innerHTML = html;
      
      // Add event listeners
      attachRestockEventListeners();
      updateRestockCounter();
    }
    
    // Attach event listeners to restock cards
    function attachRestockEventListeners() {
      // Checkboxes
      document.querySelectorAll('.restock-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const index = parseInt(e.target.dataset.index);
          restockData[index].checked = e.target.checked;
          renderRestockItems();
        });
      });
      
      // New cost inputs
      document.querySelectorAll('.new-cost-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const index = parseInt(e.target.dataset.index);
          restockData[index].newCost = e.target.value;
        });
      });
      
      // New stock inputs - auto-check when value added
      document.querySelectorAll('.new-stock-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const index = parseInt(e.target.dataset.index);
          const value = parseInt(e.target.value) || 0;
          restockData[index].newStockQty = value;
          
          // Auto-check if value > 0
          if (value > 0 && !restockData[index].checked) {
            restockData[index].checked = true;
            renderRestockItems();
          }
          updateRestockCounter();
        });
      });
      
      // Add cost buttons
      document.querySelectorAll('.btn-add-cost').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          const input = document.querySelector(`.new-cost-input[data-index="${index}"]`);
          if (input) input.focus();
        });
      });
    }
    
    // Update restock counter
    function updateRestockCounter() {
      const checkedCount = restockData.filter(item => item.checked && item.newStockQty > 0).length;
      updateCounter.textContent = `(${checkedCount})`;
      
      if (checkedCount > 0) {
        updateStocksBtn.classList.add('active');
        updateStocksBtn.style.cursor = 'pointer';
      } else {
        updateStocksBtn.classList.remove('active');
        updateStocksBtn.style.cursor = 'not-allowed';
      }
    }
    
    // Setup delete button handler
    function setupDeleteButton() {
      const btn = document.getElementById('deleteSelectedBtn');
      if (!btn) {
        console.error('Delete button NOT found!');
        return;
      }
      
      console.log('Setting up delete button handler');
      
      // Remove any existing listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', () => {
        console.log('✕ Delete button clicked!');
        const toDelete = restockData.filter(item => item.checked);
        console.log('Items to delete:', toDelete.length);
        
        if (toDelete.length === 0) {
          alert('⚠️ No items selected. Please check items first.');
          return;
        }
        
        // Request password
        const password = prompt(`🔒 Enter password to delete ${toDelete.length} item(s):`);
        
        if (password === null) {
          // User cancelled
          console.log('User cancelled password prompt');
          return;
        }
        
        if (password !== DELETE_PASSWORD) {
          alert('❌ Incorrect password! Deletion cancelled.');
          console.log('Wrong password entered');
          return;
        }
        
        // Password correct, confirm deletion
        if (confirm(`✅ Password accepted. Delete ${toDelete.length} selected item(s)?`)) {
          restockData = restockData.filter(item => !item.checked);
          renderRestockItems();
          alert(`✓ ${toDelete.length} item(s) deleted successfully!`);
          console.log('Items deleted successfully');
        }
      });
      
      console.log('Delete button handler attached successfully');
    }
    
    // Update stocks
    if (updateStocksBtn) {
      updateStocksBtn.addEventListener('click', () => {
        const toUpdate = restockData.filter(item => item.checked && item.newStockQty > 0);
        
        if (toUpdate.length === 0) {
          alert('No items to update. Add stock quantities first.');
          return;
        }
        
        // Process updates
        toUpdate.forEach(item => {
          item.currentStock += item.newStockQty;
          if (item.newCost) {
            item.previousCost = item.newCost;
          }
          item.newStockQty = 0;
          item.newCost = '';
          item.checked = false;
        });
        
        alert(`Successfully updated ${toUpdate.length} item(s)!`);
        renderRestockItems();
      });
    }
    
    // END RESTOCK SYSTEM
    
    // === MANUAL INVENTORY UPDATE SYSTEM ===
    const goToManualUpdateBtn = document.getElementById('goToManualUpdateBtn');
    const backFromManualUpdateBtn = document.getElementById('backFromManualUpdateBtn');
    const manualUpdatePage = document.getElementById('manualUpdatePage');
    const manualUpdateList = document.getElementById('manualUpdateList');
    const manualUpdateDateDisplay = document.getElementById('manualUpdateDateDisplay');
    const saveManualUpdatesBtn = document.getElementById('saveManualUpdatesBtn');
    const manualUpdateSearchInput = document.getElementById('manualUpdateSearchInput');
    const manualUpdateCategoryFilter = document.getElementById('manualUpdateCategoryFilter');

    // Filter state
    let currentManualUpdateSearch = '';
    let currentManualUpdateCategory = 'all';

    // Search input for manual update
    if (manualUpdateSearchInput) {
      manualUpdateSearchInput.addEventListener('input', (e) => {
        currentManualUpdateSearch = e.target.value;
        renderManualUpdateList();
      });
    }

    // Category filter for manual update
    if (manualUpdateCategoryFilter) {
      manualUpdateCategoryFilter.addEventListener('change', (e) => {
        currentManualUpdateCategory = e.target.value;
        renderManualUpdateList();
      });
    }
    
    // Navigate to manual update page
    if (goToManualUpdateBtn) {
      goToManualUpdateBtn.addEventListener('click', () => {
        // Request password before opening
        const password = prompt('🔒 Enter password to access Manual Inventory Update:\n\n(This action will be logged for tracking purposes)');
        
        if (password === null) {
          // User cancelled
          console.log('Manual update access cancelled by user');
          return;
        }
        
        if (password !== MANUAL_UPDATE_PASSWORD) {
          alert('❌ Incorrect password! Access denied.');
          console.log('Failed manual update access attempt - wrong password');
          return;
        }
        
        // Password correct - log and open
        const timestamp = new Date().toLocaleString();
        console.log(`✅ Manual Inventory Update accessed at ${timestamp}`);
        console.log('User authenticated successfully');
        
        inventoryPage.classList.remove('active');
        manualUpdatePage.style.display = 'block';
        renderManualUpdateList();
        
        // Scroll to top
        window.scrollTo(0, 0);
      });
    }
    
    // Navigate back to inventory
    if (backFromManualUpdateBtn) {
      backFromManualUpdateBtn.addEventListener('click', () => {
        manualUpdatePage.style.display = 'none';
        inventoryPage.classList.add('active');
      });
    }

    // Populate manual update category filter
    function populateManualUpdateCategoryFilter() {
      if (!manualUpdateCategoryFilter) return;
      
      // Get unique categories from productsMaster
      const categories = [...new Set(productsMaster.map(item => item.category))].sort();
      
      manualUpdateCategoryFilter.innerHTML = '<option value="all">All Categories</option>';
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        manualUpdateCategoryFilter.appendChild(option);
      });
    }
    
    // Render manual update list
    function renderManualUpdateList() {
      const currentDateStr = currentSelectedDate.toISOString().split('T')[0];
      
      // Update date display
      if (manualUpdateDateDisplay) {
        manualUpdateDateDisplay.textContent = currentSelectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (!manualUpdateList) return;
      
      let html = '';
      
      // Filter products
      let filtered = [...productsMaster];
      
      // Apply search filter
      if (currentManualUpdateSearch) {
        filtered = filtered.filter(item => 
          item.product.toLowerCase().includes(currentManualUpdateSearch.toLowerCase())
        );
      }
      
      // Apply category filter
      if (currentManualUpdateCategory !== 'all') {
        filtered = filtered.filter(item => item.category === currentManualUpdateCategory);
      }
      
      // Sort products by category then name
      const sortedProducts = filtered.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.product.localeCompare(b.product);
      });
      
      sortedProducts.forEach((product, index) => {
        const currentSales = (salesByDate[currentDateStr] && salesByDate[currentDateStr][product.product]) || 0;
        const currentStock = product.stock || 0;
        
        // Determine stock status color
        let stockColor = '#10b981'; // Green for good stock
        let stockStatus = 'Good';
        if (currentStock === 0) {
          stockColor = '#dc2626'; // Red for out of stock
          stockStatus = 'Out of Stock';
        } else if (currentStock < 20) {
          stockColor = '#f59e0b'; // Orange for low stock
          stockStatus = 'Low Stock';
        }
        
        html += `
          <div class="manual-update-item">
            <div class="manual-update-item-info">
              <div class="manual-update-item-name">${product.product}</div>
              <span class="manual-update-item-category">${product.category}</span>
            </div>
            
            <div class="manual-update-field">
              <div class="manual-update-field-label">Expiry Date</div>
              <div class="manual-update-field-value">${formatDate(product.expiry)}</div>
            </div>
            
            <div class="manual-update-field">
              <div class="manual-update-field-label">Current Stock</div>
              <div class="manual-update-field-value" style="color: ${stockColor}; font-weight: 700;">${currentStock}</div>
            </div>
            
            <div class="manual-update-field">
              <div class="manual-update-field-label">Sales (Edit)</div>
              <input type="number" 
                     class="manual-sales-input" 
                     data-product="${product.product}" 
                     value="${currentSales}" 
                     min="0">
            </div>
          </div>
        `;
      });
      
      manualUpdateList.innerHTML = html || '<p style="text-align:center; padding:2rem; color:#9ca3af;">No products found</p>';
    }
    
    // Save manual updates
    if (saveManualUpdatesBtn) {
      saveManualUpdatesBtn.addEventListener('click', () => {
        const currentDateStr = currentSelectedDate.toISOString().split('T')[0];
        const inputs = document.querySelectorAll('.manual-sales-input');
        let changesMade = false;
        
        // Ensure date exists in salesByDate
        if (!salesByDate[currentDateStr]) {
          salesByDate[currentDateStr] = {};
        }
        
        inputs.forEach(input => {
          const productName = input.dataset.product;
          const newValue = parseInt(input.value) || 0;
          const oldValue = salesByDate[currentDateStr][productName] || 0;
          
          if (newValue !== oldValue) {
            salesByDate[currentDateStr][productName] = newValue;
            changesMade = true;
          }
        });
        
        if (changesMade) {
          // Show saving animation
          saveManualUpdatesBtn.disabled = true;
          saveManualUpdatesBtn.textContent = '💾 Saving...';
          saveManualUpdatesBtn.style.opacity = '0.6';
          
          setTimeout(() => {
            // Success state
            saveManualUpdatesBtn.textContent = '✅ Saved!';
            saveManualUpdatesBtn.style.background = '#10b981';
            saveManualUpdatesBtn.style.opacity = '1';
            
            // Update inventory view if needed
            if (typeof renderInventoryProducts === 'function') {
              renderInventoryProducts();
            }
            
            console.log('Manual sales updates saved for:', currentDateStr);
            
            // Close and return after delay
            setTimeout(() => {
              manualUpdatePage.style.display = 'none';
              inventoryPage.style.display = 'block';
              
              // Reset button
              saveManualUpdatesBtn.disabled = false;
              saveManualUpdatesBtn.textContent = '💾 Save All Changes';
              saveManualUpdatesBtn.style.background = '#2563eb';
            }, 1000);
            
          }, 600);
        } else {
          alert('ℹ️ No changes to save.');
        }
      });
    }
    
    // END MANUAL INVENTORY UPDATE SYSTEM
    
    // === PATIENT LIST / LABORATORY LOGBOOK SYSTEM ===
    const patientNameInput = document.getElementById('patientNameInput');
    const labTypeSelect = document.getElementById('labTypeSelect');
    const addPatientBtn = document.getElementById('addPatientBtn');
    const patientRecordsBody = document.getElementById('patientRecordsBody');
    const manageLabTypesBtn = document.getElementById('manageLabTypesBtn');
    const labTypesModal = document.getElementById('labTypesModal');
    const closeLabTypesModal = document.getElementById('closeLabTypesModal');
    const labTypesList = document.getElementById('labTypesList');
    const newLabTypeInput = document.getElementById('newLabTypeInput');
    const addLabTypeBtn = document.getElementById('addLabTypeBtn');
    
    // Current nurse (from user profile - you can update this based on your auth system)
    let currentNurse = 'Mark Cruz'; // This should come from your login system
    
    // Lab types preset (can be modified)
    let labTypes = [
      'Complete Blood Count (CBC)',
      'Urinalysis',
      'Fecalysis',
      'Blood Chemistry',
      'Lipid Profile',
      'Blood Typing',
      'Pregnancy Test',
      'Drug Test',
      'X-Ray',
      'ECG',
      'Ultrasound',
      'CT Scan',
      'MRI'
    ];
    
    // Patient records storage
    let patientRecords = [];
    
    // Initialize lab types dropdown
    function populateLabTypeSelect() {
      if (labTypeSelect) {
        labTypeSelect.innerHTML = '<option value="">Select Lab Type</option>';
        labTypes.forEach(type => {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          labTypeSelect.appendChild(option);
        });
      }
    }
    
    // Render lab types in management modal
    function renderLabTypesList() {
      if (labTypesList) {
        labTypesList.innerHTML = labTypes.map((type, index) => `
          <div class="lab-type-item">
            <span class="lab-type-name">${type}</span>
            <button class="btn-delete-lab-type" data-index="${index}">🗑️ Delete</button>
          </div>
        `).join('');
        
        // Add delete handlers
        document.querySelectorAll('.btn-delete-lab-type').forEach(btn => {
          btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            if (confirm(`Delete "${labTypes[index]}"?`)) {
              labTypes.splice(index, 1);
              renderLabTypesList();
              populateLabTypeSelect();
            }
          });
        });
      }
    }
    
    // Add new lab type
    if (addLabTypeBtn && newLabTypeInput) {
      addLabTypeBtn.addEventListener('click', () => {
        const newType = newLabTypeInput.value.trim();
        if (newType && !labTypes.includes(newType)) {
          labTypes.push(newType);
          newLabTypeInput.value = '';
          renderLabTypesList();
          populateLabTypeSelect();
        } else if (labTypes.includes(newType)) {
          alert('⚠️ This lab type already exists!');
        } else {
          alert('⚠️ Please enter a lab type name.');
        }
      });
    }
    
    // Open lab types management modal
    if (manageLabTypesBtn && labTypesModal) {
      manageLabTypesBtn.addEventListener('click', () => {
        labTypesModal.classList.add('active');
        renderLabTypesList();
      });
    }
    
    // Close lab types modal
    if (closeLabTypesModal && labTypesModal) {
      closeLabTypesModal.addEventListener('click', () => {
        labTypesModal.classList.remove('active');
      });
    }
    
    // Add patient record
    if (addPatientBtn) {
      addPatientBtn.addEventListener('click', () => {
        const patientName = patientNameInput.value.trim();
        const labType = labTypeSelect.value;
        
        // Validation
        if (!patientName) {
          alert('⚠️ Please enter patient name');
          return;
        }
        
        if (!labType) {
          alert('⚠️ Please select laboratory type');
          return;
        }
        
        // Create timestamp
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true 
        });
        const date = now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        // Create record
        const record = {
          timestamp: timestamp,
          date: date,
          patientName: patientName,
          labType: labType,
          nurseOnDuty: currentNurse,
          assigned: '' // Empty for now
        };
        
        // Add to records
        patientRecords.unshift(record); // Add to beginning (newest first)
        
        // Clear form
        patientNameInput.value = '';
        labTypeSelect.value = '';
        
        // Render records
        renderPatientRecords();
        
        // Success feedback
        addPatientBtn.textContent = '✓ Added!';
        addPatientBtn.style.background = '#10b981';
        setTimeout(() => {
          addPatientBtn.textContent = '+ Add Patient';
          addPatientBtn.style.background = '#10b981';
        }, 2000);
      });
    }
    
    // Render patient records
    function renderPatientRecords() {
      if (patientRecordsBody) {
        if (patientRecords.length === 0) {
          patientRecordsBody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 2rem; color: #9ca3af;">
                No patient records yet. Add your first patient above.
              </td>
            </tr>
          `;
        } else {
          patientRecordsBody.innerHTML = patientRecords.map(record => `
            <tr>
              <td>${record.timestamp}</td>
              <td>${record.date}</td>
              <td style="font-weight: 600; color: #111827;">${record.patientName}</td>
              <td>${record.labType}</td>
              <td>${record.nurseOnDuty}</td>
              <td style="color: #9ca3af; font-style: italic;">${record.assigned || 'Pending'}</td>
            </tr>
          `).join('');
        }
      }
    }
    
    // Initialize patient list system
    populateLabTypeSelect();
    renderPatientRecords();
    
    // END PATIENT LIST / LABORATORY LOGBOOK SYSTEM
    
    // === SALES PAGE SYSTEM ===
    const salesTableBody = document.getElementById('salesTableBody');
    const salesTotalRevenue = document.getElementById('salesTotalRevenue');
    const salesTotalTransactions = document.getElementById('salesTotalTransactions');
    const salesTotalItems = document.getElementById('salesTotalItems');
    const salesAverageSale = document.getElementById('salesAverageSale');
    const salesSearchInput = document.getElementById('salesSearchInput');
    const exportSalesBtn = document.getElementById('exportSalesBtn');
    const salesPeriodBtns = document.querySelectorAll('.sales-period-btn');
    const categoryBreakdownGrid = document.getElementById('categoryBreakdownGrid');

    let currentSalesPeriod = 'today';
    let currentSalesSearch = '';

    // Check if mobile device
    function isMobileDevice() {
      return window.innerWidth <= 768;
    }

    // Format mobile-friendly item breakdown
    function formatItemsForMobile(items, total) {
      const itemsHtml = items.map(item => {
        const subtotal = item.quantity * item.price;
        return `
          <div class="sales-item-row">
            <span class="sales-item-name">${item.name}</span>
            <span class="sales-item-calculation">${item.quantity} × ₱${item.price.toLocaleString()}</span>
            <span class="sales-item-subtotal">= ₱${subtotal.toLocaleString()}</span>
          </div>
        `;
      }).join('');
      
      return `
        <div class="sales-items-breakdown">
          ${itemsHtml}
          <div class="sales-breakdown-total">
            <span class="sales-breakdown-total-label">TOTAL:</span>
            <span class="sales-breakdown-total-value">₱${total.toLocaleString()}</span>
          </div>
        </div>
      `;
    }

    // Sample sales data - in production, this would come from your database
    let salesRecords = [
      {
        id: 1,
        timestamp: '2026-01-26 09:30:00',
        patient: 'John Doe',
        nurse: 'Mark Cruz',
        items: [
          { name: 'Paracetamol', category: 'Medicine', quantity: 2, price: 5 },
          { name: 'Face Mask', category: 'PPE', quantity: 5, price: 10 }
        ],
        total: 60
      },
      {
        id: 2,
        timestamp: '2026-01-26 10:15:00',
        patient: 'Jane Smith',
        nurse: 'Maria Santos',
        items: [
          { name: 'Syringe', category: 'Supplies', quantity: 3, price: 8 },
          { name: 'Bandage', category: 'Supplies', quantity: 2, price: 15 }
        ],
        total: 54
      },
      {
        id: 3,
        timestamp: '2026-01-26 11:00:00',
        patient: 'Robert Johnson',
        nurse: 'Mark Cruz',
        items: [
          { name: 'Alcohol', category: 'Hygiene', quantity: 1, price: 100 },
          { name: 'Cotton', category: 'Supplies', quantity: 1, price: 20 }
        ],
        total: 120
      },
      {
        id: 4,
        timestamp: '2026-01-26 14:30:00',
        patient: 'Mary Williams',
        nurse: 'Jane Smith',
        items: [
          { name: 'Ibuprofen', category: 'Medicine', quantity: 3, price: 8 },
          { name: 'Vitamin C', category: 'Medicine', quantity: 2, price: 10 }
        ],
        total: 44
      },
      {
        id: 5,
        timestamp: '2026-01-25 15:45:00',
        patient: 'David Brown',
        nurse: 'Mark Cruz',
        items: [
          { name: 'N95 Mask', category: 'PPE', quantity: 10, price: 50 },
          { name: 'Gloves', category: 'PPE', quantity: 5, price: 5 }
        ],
        total: 525
      },
      {
        id: 6,
        timestamp: '2026-01-20 09:00:00',
        patient: 'Sarah Davis',
        nurse: 'Maria Santos',
        items: [
          { name: 'Thermometer', category: 'Equipment', quantity: 1, price: 200 },
          { name: 'Alcohol', category: 'Hygiene', quantity: 2, price: 100 }
        ],
        total: 400
      },
      {
        id: 7,
        timestamp: '2026-01-15 11:30:00',
        patient: 'Michael Wilson',
        nurse: 'Mark Cruz',
        items: [
          { name: 'Amoxicillin', category: 'Medicine', quantity: 1, price: 15 },
          { name: 'Face Shield', category: 'PPE', quantity: 2, price: 30 }
        ],
        total: 75
      },
      {
        id: 8,
        timestamp: '2025-12-28 16:20:00',
        patient: 'Lisa Martinez',
        nurse: 'Jane Smith',
        items: [
          { name: 'BP Monitor', category: 'Equipment', quantity: 1, price: 1500 },
          { name: 'Sanitizer', category: 'Hygiene', quantity: 3, price: 80 }
        ],
        total: 1740
      }
    ];

    // Period selector
    salesPeriodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentSalesPeriod = btn.dataset.period;
        salesPeriodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSalesRecords();
      });
    });

    // Search input
    if (salesSearchInput) {
      salesSearchInput.addEventListener('input', (e) => {
        currentSalesSearch = e.target.value.toLowerCase();
        renderSalesRecords();
      });
    }

    // Filter sales by period
    function filterSalesByPeriod(records) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);
      
      return records.filter(record => {
        const recordDate = new Date(record.timestamp);
        
        if (currentSalesPeriod === 'today') {
          return recordDate >= today;
        } else if (currentSalesPeriod === 'month') {
          return recordDate >= monthStart;
        } else if (currentSalesPeriod === 'year') {
          return recordDate >= yearStart;
        }
        
        return true;
      });
    }

    // Render sales records
    function renderSalesRecords() {
      let filtered = [...salesRecords];
      
      // Filter by period
      filtered = filterSalesByPeriod(filtered);
      
      // Filter by search
      if (currentSalesSearch) {
        filtered = filtered.filter(record => {
          const searchableText = `
            ${record.patient}
            ${record.nurse}
            ${record.items.map(item => item.name).join(' ')}
          `.toLowerCase();
          
          return searchableText.includes(currentSalesSearch);
        });
      }
      
      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Calculate summary
      const totalRevenue = filtered.reduce((sum, record) => sum + record.total, 0);
      const totalTransactions = filtered.length;
      const totalItems = filtered.reduce((sum, record) => {
        return sum + record.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);
      const averageSale = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      
      // Update summary cards
      if (salesTotalRevenue) salesTotalRevenue.textContent = `₱${totalRevenue.toLocaleString()}`;
      if (salesTotalTransactions) salesTotalTransactions.textContent = totalTransactions.toLocaleString();
      if (salesTotalItems) salesTotalItems.textContent = totalItems.toLocaleString();
      if (salesAverageSale) salesAverageSale.textContent = `₱${Math.round(averageSale).toLocaleString()}`;
      
      // Render table
      if (salesTableBody) {
        if (filtered.length === 0) {
          salesTableBody.innerHTML = `
            <tr>
              <td colspan="6">
                <div class="sales-empty-state">
                  <div class="sales-empty-icon">📊</div>
                  <h3>No sales records found</h3>
                  <p>No sales match your current filters</p>
                </div>
              </td>
            </tr>
          `;
        } else {
                salesTableBody.innerHTML = filtered.map(record => {
                const date = new Date(record.timestamp);
                const formattedDate = date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                });
                const formattedTime = date.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                });
                
                // Build detailed items breakdown
                const breakdownWithTotal = formatItemsForMobile(record.items, record.total);
                
                return `
                <tr>
                  <td class="sales-date" data-label="Date & Time">${formattedDate}<br><small>${formattedTime}</small></td>
                  <td class="sales-patient" data-label="Patient">${record.patient}</td>
                  <td class="sales-nurse" data-label="Nurse">${record.nurse}</td>
                  <td data-label="Items Breakdown">${breakdownWithTotal}</td>
                  <td class="sales-total" data-label="Total">₱${record.total.toLocaleString()}</td>
                </tr>
              `;
                    }).join('');
      
          // Make items collapsible on mobile
          setTimeout(makeItemsCollapsible, 100);
        }
      }
      
      // Render category breakdown
      renderCategoryBreakdown(filtered);
    }

    // Render category breakdown
    function renderCategoryBreakdown(records) {
      const categoryTotals = {};
      
      records.forEach(record => {
        record.items.forEach(item => {
          if (!categoryTotals[item.category]) {
            categoryTotals[item.category] = 0;
          }
          categoryTotals[item.category] += item.quantity * item.price;
        });
      });
      
      if (categoryBreakdownGrid) {
        const categories = Object.keys(categoryTotals).sort();
        
        if (categories.length === 0) {
          categoryBreakdownGrid.innerHTML = '<p style="color: #9ca3af; text-align: center;">No data available</p>';
        } else {
          categoryBreakdownGrid.innerHTML = categories.map(category => `
            <div class="category-breakdown-item">
              <div class="category-breakdown-name">${category}</div>
              <div class="category-breakdown-value">₱${categoryTotals[category].toLocaleString()}</div>
            </div>
          `).join('');
        }
      }
    }

    // Export to Excel (CSV format)
    if (exportSalesBtn) {
      exportSalesBtn.addEventListener('click', () => {
        let filtered = filterSalesByPeriod([...salesRecords]);
        
        if (currentSalesSearch) {
          filtered = filtered.filter(record => {
            const searchableText = `
              ${record.patient}
              ${record.nurse}
              ${record.items.map(item => item.name).join(' ')}
            `.toLowerCase();
            
            return searchableText.includes(currentSalesSearch);
          });
        }
        
        if (filtered.length === 0) {
          alert('No data to export');
          return;
        }
        
           // Create CSV content
            let csv = 'Date,Time,Patient Name,Nurse,Item Name,Quantity,Unit Price,Subtotal,Transaction Total\n';
            
            filtered.forEach(record => {
              const date = new Date(record.timestamp);
              const formattedDate = date.toLocaleDateString('en-US');
              const formattedTime = date.toLocaleTimeString('en-US');
              
              // Add a row for each item
              record.items.forEach((item, index) => {
                const subtotal = item.quantity * item.price;
                const transactionTotal = index === 0 ? record.total : ''; // Only show total on first item
                
                csv += `"${formattedDate}","${formattedTime}","${record.patient}","${record.nurse}","${item.name}",${item.quantity},${item.price},${subtotal},${transactionTotal}\n`;
              });
              
              // Add empty row between transactions for readability
              csv += '\n';
            });
        
        // Create download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const periodText = currentSalesPeriod === 'today' ? 'Today' : 
                          currentSalesPeriod === 'month' ? 'This_Month' : 'This_Year';
        
        link.setAttribute('href', url);
        link.setAttribute('download', `Sales_Report_${periodText}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        exportSalesBtn.textContent = '✓ Exported!';
        exportSalesBtn.style.background = '#10b981';
        setTimeout(() => {
          exportSalesBtn.textContent = '📊 Export to Excel';
          exportSalesBtn.style.background = '#10b981';
        }, 2000);
      });
    }


    // Make sales items collapsible on mobile
    function makeItemsCollapsible() {
      if (window.innerWidth <= 768) {
        document.querySelectorAll('.sales-items-breakdown').forEach((breakdown, index) => {
          const items = breakdown.querySelectorAll('.sales-item-row').length;
          const total = breakdown.querySelector('.sales-breakdown-total-value').textContent;
          
          const summary = document.createElement('div');
          summary.className = 'sales-items-summary sales-item-toggle';
          summary.textContent = `${items} item${items > 1 ? 's' : ''} • ${total}`;
          summary.onclick = function() {
            breakdown.classList.toggle('collapsed');
            this.classList.toggle('collapsed');
          };
          
          breakdown.parentElement.insertBefore(summary, breakdown);
          breakdown.classList.add('collapsed');
          summary.classList.add('collapsed');
        });
      }
    }

    // Call after rendering on mobile
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        renderSalesRecords();
      }
    });

    // Initialize sales page
    renderSalesRecords();

    // END SALES PAGE SYSTEM
    
    // === INITIALIZE DASHBOARD WITH REAL INVENTORY DATA ===
    console.log('=== INITIALIZING DASHBOARD WITH REAL DATA ===');
    
    if (typeof updateDashboardOverview === 'function') {
      console.log('Loading dashboard inventory overview...');
      updateDashboardOverview();
    }
    
    if (typeof updateDashboardData === 'function') {
      console.log('Loading dashboard data for: today');
      updateDashboardData('today');
    }
    
    console.log('Dashboard initialized with real inventory counts');
    
    // Run initialization immediately
    initInventorySystem();
    
    // Also run when inventory page becomes visible
    if (inventoryPage) {
      // Check if page is already active
      if (inventoryPage.classList.contains('active')) {
        initInventorySystem();
      }
      
      // Watch for when page becomes active
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (inventoryPage.classList.contains('active')) {
              initInventorySystem();
            }
          }
        });
      });
      
      observer.observe(inventoryPage, { attributes: true });
    }


// Smooth scroll to top when changing filters on mobile
salesPeriodBtns.forEach(btn => {
  const originalHandler = btn.onclick;
  btn.addEventListener('click', () => {
    if (isMobileDevice()) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  });
});

// Optimize mobile performance - lazy load if many records
function optimizeMobileRendering() {
  if (isMobileDevice() && salesRecords.length > 20) {
    // Show loading state
    const loadingHtml = `
      <tr>
        <td colspan="5">
          <div style="text-align: center; padding: 2rem; color: #6b7280;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
            <div>Loading sales records...</div>
          </div>
        </td>
      </tr>
    `;
    
    if (salesTableBody) {
      salesTableBody.innerHTML = loadingHtml;
    }
    
    // Render after a brief delay to show loading state
    setTimeout(renderSalesRecords, 100);
  } else {
    renderSalesRecords();
  }
}

// Use optimized rendering when opening sales page
const salesPageLink = document.querySelector('[data-page="accounts"]');
if (salesPageLink) {
  salesPageLink.addEventListener('click', () => {
    setTimeout(optimizeMobileRendering, 50);
  });
}
    

    // === LEAVE MANAGEMENT SYSTEM ===
    
    // Employee data (integrate with your employee masterlist)
    const employees = [
      { id: 'LRCI-001', name: 'Golloso, Cristina Gahita', position: 'Chief Operating Officer', department: 'Executive', vlEntitled: 15, slEntitled: 15, vlUsed: 0, slUsed: 0 },
      { id: 'LRCI-002', name: 'Santiago, Diana Bagual', position: 'Administrative Manager', department: 'Administrative', vlEntitled: 7, slEntitled: 7, vlUsed: 0, slUsed: 0 },
      { id: 'LRCI-003', name: 'Cabigas, Karen Sumagit', position: 'Medical Director', department: 'Executive', vlEntitled: 15, slEntitled: 15, vlUsed: 0, slUsed: 0 }
    ];

    // Current user (from your auth system)
    let currentUser = { id: 'LRCI-002', name: 'Santiago, Diana Bagual', role: 'owner', position: 'Administrative Manager', department: 'Administrative' };

    // Leave applications storage
    let leaveApplications = [];
    let otApplications = [];


    // Initialize Leave System
    function initializeLeaveSystem() {
      updateLeaveStats();
      renderLeaveRequests('pending');
      setupLeaveEventListeners();
    }

    // Setup Event Listeners
    function setupLeaveEventListeners() {
      const applyBtn = document.getElementById('applyLeaveBtn');
      const closeApply = document.getElementById('closeApplyLeaveModal');
      const cancelApply = document.getElementById('cancelApplyLeave');
      const form = document.getElementById('applyLeaveForm');
      const closeView = document.getElementById('closeViewLeaveModal');
      const startDate = document.getElementById('leaveStartDate');
      const endDate = document.getElementById('leaveEndDate');
      const leaveType = document.getElementById('leaveType');
      const leaveTabs = document.querySelectorAll('.leave-tab');

      // Apply Leave Button
      if (applyBtn) applyBtn.addEventListener('click', () => {
        document.getElementById('applyLeaveModal').classList.add('active');
        updateLeaveBalance();
      });

      // Apply OT Button
      const applyOTBtn = document.getElementById('applyOTBtn');
      const closeApplyOT = document.getElementById('closeApplyOTModal');
      const cancelApplyOT = document.getElementById('cancelApplyOT');
      const otForm = document.getElementById('applyOTForm');

      if (applyOTBtn) applyOTBtn.addEventListener('click', () => {
        document.getElementById('applyOTModal').classList.add('active');
      });

      if (closeApplyOT) closeApplyOT.addEventListener('click', () => {
        document.getElementById('applyOTModal').classList.remove('active');
        if (otForm) otForm.reset();
        const hoursDisplay = document.querySelector('.hours-value');
        if (hoursDisplay) hoursDisplay.textContent = '0.0';
      });

      if (cancelApplyOT) cancelApplyOT.addEventListener('click', () => {
        document.getElementById('applyOTModal').classList.remove('active');
        if (otForm) otForm.reset();
        const hoursDisplay = document.querySelector('.hours-value');
        if (hoursDisplay) hoursDisplay.textContent = '0.0';
      });

      if (otForm) otForm.addEventListener('submit', handleOTApplication);

      // OT Time Calculation
      const otTimeIn = document.getElementById('otTimeIn');
      const otTimeOut = document.getElementById('otTimeOut');
      
      if (otTimeIn && otTimeOut) {
        otTimeIn.addEventListener('change', calculateOTHours);
        otTimeOut.addEventListener('change', calculateOTHours);
      }

      if (closeApply) closeApply.addEventListener('click', () => {
        document.getElementById('applyLeaveModal').classList.remove('active');
        form.reset();
      });

      if (cancelApply) cancelApply.addEventListener('click', () => {
        document.getElementById('applyLeaveModal').classList.remove('active');
        form.reset();
      });

      if (closeView) closeView.addEventListener('click', () => {
        document.getElementById('viewLeaveModal').classList.remove('active');
      });

      if (startDate) startDate.addEventListener('change', calculateLeaveDays);
      if (endDate) endDate.addEventListener('change', calculateLeaveDays);
      if (leaveType) leaveType.addEventListener('change', updateLeaveBalance);

      if (form) form.addEventListener('submit', handleLeaveApplication);

      leaveTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const filter = tab.dataset.filter;
          leaveTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          renderLeaveRequests(filter);
        });
      });
    }

    // Calculate OT Hours from Time In/Out
    function calculateOTHours() {
      const timeIn = document.getElementById('otTimeIn').value;
      const timeOut = document.getElementById('otTimeOut').value;
      const display = document.querySelector('.hours-value');

      if (!timeIn || !timeOut) {
        if (display) display.textContent = '0.0';
        return;
      }

      // Parse time strings
      const [inHour, inMin] = timeIn.split(':').map(Number);
      const [outHour, outMin] = timeOut.split(':').map(Number);

      // Convert to minutes
      let inMinutes = inHour * 60 + inMin;
      let outMinutes = outHour * 60 + outMin;

      // If time out is before time in, assume next day
      if (outMinutes < inMinutes) {
        outMinutes += 24 * 60;
      }

      // Calculate difference in hours
      const totalMinutes = outMinutes - inMinutes;
      const hours = (totalMinutes / 60).toFixed(1);

      if (display) display.textContent = hours;
    }

    // Calculate Leave Days
    function calculateLeaveDays() {
      const start = document.getElementById('leaveStartDate').value;
      const end = document.getElementById('leaveEndDate').value;
      const daysInput = document.getElementById('leaveDays');

      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (endDate >= startDate) {
          const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
          daysInput.value = days;
          updateLeaveBalance();
        } else {
          daysInput.value = 0;
          alert('End date must be after start date!');
        }
      }
    }

    // Update Leave Balance
    function updateLeaveBalance() {
      const leaveType = document.getElementById('leaveType').value;
      const days = parseInt(document.getElementById('leaveDays').value) || 0;
      const balanceInfo = document.getElementById('leaveBalanceInfo');

      if (!leaveType || days === 0) {
        balanceInfo.innerHTML = '';
        return;
      }

      const employee = employees.find(e => e.id === currentUser.id);
      if (!employee) return;

      let entitled, used, balance, remaining;
      
      if (leaveType === 'Vacation Leave') {
        entitled = employee.vlEntitled;
        used = employee.vlUsed;
      } else {
        entitled = employee.slEntitled;
        used = employee.slUsed;
      }

      balance = entitled - used;
      remaining = balance - days;
      const sufficient = remaining >= 0;

      balanceInfo.innerHTML = `
        <div class="balance-row">
          <span class="balance-label">${leaveType} Entitled:</span>
          <span class="balance-value">${entitled} days</span>
        </div>
        <div class="balance-row">
          <span class="balance-label">Used:</span>
          <span class="balance-value">${used} days</span>
        </div>
        <div class="balance-row">
          <span class="balance-label">Current Balance:</span>
          <span class="balance-value ${sufficient ? 'sufficient' : 'insufficient'}">${balance} days</span>
        </div>
        <div class="balance-row" style="border-top: 2px solid #e5e7eb; margin-top: 0.5rem; padding-top: 0.5rem;">
          <span class="balance-label">After This Leave:</span>
          <span class="balance-value ${sufficient ? 'sufficient' : 'insufficient'}">${remaining} days</span>
        </div>
        ${!sufficient ? '<p style="color: #ef4444; margin-top: 0.5rem; font-weight: 600;">⚠️ Insufficient leave balance!</p>' : ''}
      `;
    }

    // Handle Leave Application
    function handleLeaveApplication(e) {
      e.preventDefault();

      const leaveType = document.getElementById('leaveType').value;
      const startDate = document.getElementById('leaveStartDate').value;
      const endDate = document.getElementById('leaveEndDate').value;
      const days = parseInt(document.getElementById('leaveDays').value);
      const reason = document.getElementById('leaveReason').value;

      const employee = employees.find(e => e.id === currentUser.id);
      let balance = leaveType === 'Vacation Leave' ? (employee.vlEntitled - employee.vlUsed) : (employee.slEntitled - employee.slUsed);

      if (days > balance) {
        alert('⚠️ Insufficient leave balance!');
        return;
      }

      const newApp = {
        id: `LV-${new Date().getFullYear()}-${String(leaveApplications.length + 1).padStart(3, '0')}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        position: currentUser.position,
        department: currentUser.department,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        days: days,
        reason: reason,
        appliedDate: new Date().toISOString(),
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        remarks: null
      };

      leaveApplications.unshift(newApp);

      document.getElementById('applyLeaveModal').classList.remove('active');
      document.getElementById('applyLeaveForm').reset();

      updateLeaveStats();
      renderLeaveRequests('pending');

      alert('✅ Leave application submitted successfully!');
    }

    // Handle OT Application
    function handleOTApplication(e) {
      e.preventDefault();

      const otDate = document.getElementById('otDate').value;
      const otTimeIn = document.getElementById('otTimeIn').value;
      const otTimeOut = document.getElementById('otTimeOut').value;
      const otReason = document.getElementById('otReason').value;

      // Calculate hours
      const [inHour, inMin] = otTimeIn.split(':').map(Number);
      const [outHour, outMin] = otTimeOut.split(':').map(Number);
      let inMinutes = inHour * 60 + inMin;
      let outMinutes = outHour * 60 + outMin;
      if (outMinutes < inMinutes) outMinutes += 24 * 60;
      const otHours = parseFloat(((outMinutes - inMinutes) / 60).toFixed(1));

      if (otHours <= 0) {
        alert('⚠️ Invalid time range! Time Out must be after Time In.');
        return;
      }

      if (!otApplications) {
        window.otApplications = [];
      }

      const newOTApp = {
        id: `OT-${new Date().getFullYear()}-${String(otApplications.length + 1).padStart(3, '0')}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        position: currentUser.position,
        department: currentUser.department,
        date: otDate,
        timeIn: otTimeIn,
        timeOut: otTimeOut,
        hours: otHours,
        reason: otReason,
        appliedDate: new Date().toISOString(),
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        remarks: null
      };

      otApplications.unshift(newOTApp);

      document.getElementById('applyOTModal').classList.remove('active');
      const form = document.getElementById('applyOTForm');
      form.reset();
      document.querySelector('.hours-value').textContent = '0.0';

      // Update the display and show in pending tab
      updateLeaveStats();
      renderLeaveRequests('pending');

      alert('✅ Overtime application submitted successfully!\n\nYour OT request will be reviewed by management.');
    }

    // Render Leave Requests (including OT requests)
    function renderLeaveRequests(filter) {
      const list = document.getElementById('leaveRequestsList');
      if (!list) return;

      let filtered = [];
      const today = new Date().toISOString().split('T')[0];

      if (filter === 'pending') {
        // Show both pending leave and pending OT
        filtered = [
          ...leaveApplications.filter(a => a.status === 'pending'),
          ...otApplications.filter(a => a.status === 'pending')
        ];
      } else if (filter === 'active') {
        // Only leave can be "active" (currently on leave)
        filtered = leaveApplications.filter(a => a.status === 'approved' && a.startDate <= today && a.endDate >= today);
      } else if (filter === 'approved') {
        // Only approved leaves (not OT)
        filtered = leaveApplications.filter(a => a.status === 'approved');
      } else if (filter === 'approved-ot') {
        // Only approved OT
        filtered = otApplications.filter(a => a.status === 'approved');
      } else if (filter === 'rejected') {
        // Show both rejected leave and rejected OT
        filtered = [
          ...leaveApplications.filter(a => a.status === 'rejected'),
          ...otApplications.filter(a => a.status === 'rejected')
        ];
      } else {
        // All requests
        filtered = [...leaveApplications, ...otApplications];
      }

      // Sort by applied date (newest first)
      filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

      if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No ' + (filter === 'all' ? '' : filter) + ' requests</div></div>';
        return;
      }

      let html = '';
      filtered.forEach(app => {
        const isOT = app.id.startsWith('OT-');
        const isActive = !isOT && app.status === 'approved' && new Date(app.startDate) <= new Date() && new Date(app.endDate) >= new Date();
        
        if (isOT) {
          // Render OT Request Card
          html += `
            <div class="leave-request-card ot-request-card" onclick="showOTDetails('${app.id}')">
              <div class="leave-request-header">
                <div class="leave-request-info">
                  <div class="employee-name">${app.employeeName} <span style="background: #3b82f6; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">OT</span></div>
                  <div class="employee-position">${app.position} • ${app.department}</div>
                </div>
                <div class="leave-status-badge status-${app.status}">
                  ${app.status.toUpperCase()}
                </div>
              </div>
              <div class="leave-request-details">
                <div class="detail-item">
                  <div class="detail-label">Date</div>
                  <div class="detail-value">${formatDate(app.date)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Time</div>
                  <div class="detail-value">${formatTime(app.timeIn)} - ${formatTime(app.timeOut)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Hours</div>
                  <div class="detail-value" style="color: #2563eb; font-weight: 700;">${app.hours} hr${app.hours > 1 ? 's' : ''}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Applied</div>
                  <div class="detail-value">${formatDateTime(app.appliedDate)}</div>
                </div>
              </div>
            </div>
          `;
        } else {
          // Render Leave Request Card
          html += `
            <div class="leave-request-card" onclick="showLeaveDetails('${app.id}')">
              <div class="leave-request-header">
                <div class="leave-request-info">
                  <div class="employee-name">${app.employeeName}</div>
                  <div class="employee-position">${app.position} • ${app.department}</div>
                </div>
                <div class="leave-status-badge status-${isActive ? 'active' : app.status}">
                  ${isActive ? 'On Leave' : app.status.toUpperCase()}
                </div>
              </div>
              <div class="leave-request-details">
                <div class="detail-item">
                  <div class="detail-label">Leave Type</div>
                  <div class="detail-value">${app.leaveType}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Start Date</div>
                  <div class="detail-value">${formatDate(app.startDate)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">End Date</div>
                  <div class="detail-value">${formatDate(app.endDate)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Duration</div>
                  <div class="detail-value">${app.days} day${app.days > 1 ? 's' : ''}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Applied</div>
                  <div class="detail-value">${formatDateTime(app.appliedDate)}</div>
                </div>
              </div>
            </div>
          `;
        }
      });

      list.innerHTML = html;
    }

    // Show Leave Details
    window.showLeaveDetails = function(leaveId) {
      const app = leaveApplications.find(a => a.id === leaveId);
      if (!app) return;

      const content = document.getElementById('leaveDetailsContent');
      const actions = document.getElementById('leaveActionButtons');
      const isActive = app.status === 'approved' && new Date(app.startDate) <= new Date() && new Date(app.endDate) >= new Date();

      content.innerHTML = `
        <div class="leave-status-badge status-${isActive ? 'active' : app.status}" style="margin-bottom: 1.5rem;">
          ${isActive ? 'CURRENTLY ON LEAVE' : app.status.toUpperCase()}
        </div>

        <div class="leave-details-grid">
          <div class="detail-group">
            <div class="detail-group-label">Employee</div>
            <div class="detail-group-value">${app.employeeName}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Position</div>
            <div class="detail-group-value">${app.position}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Department</div>
            <div class="detail-group-value">${app.department}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Leave Type</div>
            <div class="detail-group-value">${app.leaveType}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Start Date</div>
            <div class="detail-group-value">${formatDate(app.startDate)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">End Date</div>
            <div class="detail-group-value">${formatDate(app.endDate)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Duration</div>
            <div class="detail-group-value">${app.days} day${app.days > 1 ? 's' : ''}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Applied On</div>
            <div class="detail-group-value">${formatDateTime(app.appliedDate)}</div>
          </div>
        </div>

        <div class="leave-reason-section">
          <h4>Reason for Leave:</h4>
          <div class="leave-reason-text">${app.reason}</div>
        </div>

        ${app.approvedBy ? `
          <div class="leave-reason-section">
            <h4>Approval Details:</h4>
            <div class="leave-details-grid">
              <div class="detail-group">
                <div class="detail-group-label">Approved By</div>
                <div class="detail-group-value">${app.approvedBy}</div>
              </div>
              <div class="detail-group">
                <div class="detail-group-label">Approved On</div>
                <div class="detail-group-value">${formatDateTime(app.approvedDate)}</div>
              </div>
            </div>
            ${app.remarks ? `<div class="leave-reason-text" style="margin-top: 1rem;">${app.remarks}</div>` : ''}
          </div>
        ` : ''}
      `;

      if ((currentUser.role === 'owner' || currentUser.role === 'admin') && app.status === 'pending') {
        actions.innerHTML = `
          <button type="button" class="btn-secondary" onclick="rejectLeave('${app.id}')">❌ Reject</button>
          <button type="button" class="btn-primary" onclick="approveLeave('${app.id}')">✅ Approve</button>
        `;
      } else {
        actions.innerHTML = `
          <button type="button" class="btn-secondary" onclick="document.getElementById('viewLeaveModal').classList.remove('active')">Close</button>
        `;
      }

      document.getElementById('viewLeaveModal').classList.add('active');
    };

    // Show OT Details
    window.showOTDetails = function(otId) {
      const app = otApplications.find(a => a.id === otId);
      if (!app) return;

      const content = document.getElementById('leaveDetailsContent');
      const actions = document.getElementById('leaveActionButtons');

      content.innerHTML = `
        <div class="leave-status-badge status-${app.status}" style="margin-bottom: 1.5rem;">
          ${app.status.toUpperCase()} <span style="background: #3b82f6; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">OT</span>
        </div>

        <div class="leave-details-grid">
          <div class="detail-group">
            <div class="detail-group-label">Employee</div>
            <div class="detail-group-value">${app.employeeName}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Position</div>
            <div class="detail-group-value">${app.position}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Department</div>
            <div class="detail-group-value">${app.department}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">OT Date</div>
            <div class="detail-group-value">${formatDate(app.date)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Time In</div>
            <div class="detail-group-value">${formatTime(app.timeIn)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Time Out</div>
            <div class="detail-group-value">${formatTime(app.timeOut)}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Total OT Hours</div>
            <div class="detail-group-value" style="color: #2563eb; font-size: 1.2rem;">${app.hours} hour${app.hours > 1 ? 's' : ''}</div>
          </div>
          <div class="detail-group">
            <div class="detail-group-label">Applied On</div>
            <div class="detail-group-value">${formatDateTime(app.appliedDate)}</div>
          </div>
        </div>

        <div class="leave-reason-section">
          <h4>Reason for Overtime:</h4>
          <div class="leave-reason-text">${app.reason}</div>
        </div>

        ${app.approvedBy ? `
          <div class="leave-reason-section">
            <h4>Approval Details:</h4>
            <div class="leave-details-grid">
              <div class="detail-group">
                <div class="detail-group-label">Approved By</div>
                <div class="detail-group-value">${app.approvedBy}</div>
              </div>
              <div class="detail-group">
                <div class="detail-group-label">Approved On</div>
                <div class="detail-group-value">${formatDateTime(app.approvedDate)}</div>
              </div>
            </div>
            ${app.remarks ? `<div class="leave-reason-text" style="margin-top: 1rem;">${app.remarks}</div>` : ''}
          </div>
        ` : ''}
      `;

      if ((currentUser.role === 'owner' || currentUser.role === 'admin') && app.status === 'pending') {
        actions.innerHTML = `
          <button type="button" class="btn-secondary" onclick="rejectOT('${app.id}')">❌ Reject</button>
          <button type="button" class="btn-primary" onclick="approveOT('${app.id}')">✅ Approve</button>
        `;
      } else {
        actions.innerHTML = `
          <button type="button" class="btn-secondary" onclick="document.getElementById('viewLeaveModal').classList.remove('active')">Close</button>
        `;
      }

      document.getElementById('viewLeaveModal').classList.add('active');
    };

    // Approve Leave
    window.approveLeave = function(leaveId) {
      const password = prompt('🔒 Enter password to approve leave:\n\n(This action will be logged)');
      
      if (password === null) return;
      
      if (password !== 'admin123') {
        alert('❌ Incorrect password!');
        return;
      }

      const app = leaveApplications.find(a => a.id === leaveId);
      if (!app) return;

      app.status = 'approved';
      app.approvedBy = currentUser.name;
      app.approvedDate = new Date().toISOString();

      const employee = employees.find(e => e.id === app.employeeId);
      if (employee) {
        if (app.leaveType === 'Vacation Leave') employee.vlUsed += app.days;
        else employee.slUsed += app.days;
      }

      console.log(`✅ Leave approved: ${leaveId} by ${currentUser.name} at ${new Date().toLocaleString()}`);

      document.getElementById('viewLeaveModal').classList.remove('active');
      updateLeaveStats();
      renderLeaveRequests('pending');

      alert('✅ Leave application approved!');
    };

    // Reject Leave
    window.rejectLeave = function(leaveId) {
      const password = prompt('🔒 Enter password to reject leave:\n\n(This action will be logged)');
      
      if (password === null) return;
      
      if (password !== 'admin123') {
        alert('❌ Incorrect password!');
        return;
      }

      const remarks = prompt('Reason for rejection (optional):');

      const app = leaveApplications.find(a => a.id === leaveId);
      if (!app) return;

      app.status = 'rejected';
      app.approvedBy = currentUser.name;
      app.approvedDate = new Date().toISOString();
      app.remarks = remarks || 'No remarks provided';

      console.log(`❌ Leave rejected: ${leaveId} by ${currentUser.name} at ${new Date().toLocaleString()}`);

      document.getElementById('viewLeaveModal').classList.remove('active');
      updateLeaveStats();
      renderLeaveRequests('pending');

      alert('Leave application rejected.');
    };

    // Approve OT
    window.approveOT = function(otId) {
      const password = prompt('🔒 Enter password to approve overtime:\n\n(This action will be logged)');
      
      if (password === null) return;
      
      if (password !== 'admin123') {
        alert('❌ Incorrect password!');
        return;
      }

      const app = otApplications.find(a => a.id === otId);
      if (!app) return;

      app.status = 'approved';
      app.approvedBy = currentUser.name;
      app.approvedDate = new Date().toISOString();

      console.log(`✅ OT approved: ${otId} - ${app.hours} hours for ${app.employeeName} by ${currentUser.name} at ${new Date().toLocaleString()}`);

      document.getElementById('viewLeaveModal').classList.remove('active');
      updateLeaveStats();
      renderLeaveRequests('approved-ot');

      alert(`✅ Overtime approved!\n\n${app.hours} hours approved for ${app.employeeName}`);
    };

    // Reject OT
    window.rejectOT = function(otId) {
      const password = prompt('🔒 Enter password to reject overtime:\n\n(This action will be logged)');
      
      if (password === null) return;
      
      if (password !== 'admin123') {
        alert('❌ Incorrect password!');
        return;
      }

      const remarks = prompt('Reason for rejection (optional):');

      const app = otApplications.find(a => a.id === otId);
      if (!app) return;

      app.status = 'rejected';
      app.approvedBy = currentUser.name;
      app.approvedDate = new Date().toISOString();
      app.remarks = remarks || 'No remarks provided';

      console.log(`❌ OT rejected: ${otId} by ${currentUser.name} at ${new Date().toLocaleString()}`);

      document.getElementById('viewLeaveModal').classList.remove('active');
      updateLeaveStats();
      renderLeaveRequests('rejected');

      alert('Overtime application rejected.');
    };

    // Update Statistics
    function updateLeaveStats() {
      const today = new Date().toISOString().split('T')[0];
      const month = new Date().getMonth();
      const year = new Date().getFullYear();

      // Include OT in pending count
      const pendingLeave = leaveApplications.filter(a => a.status === 'pending').length;
      const pendingOT = otApplications.filter(a => a.status === 'pending').length;
      const pending = pendingLeave + pendingOT;
      
      const active = leaveApplications.filter(a => a.status === 'approved' && a.startDate <= today && a.endDate >= today).length;
      const approved = leaveApplications.filter(a => {
        if (a.status !== 'approved') return false;
        const d = new Date(a.approvedDate);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;
      const rejected = leaveApplications.filter(a => {
        if (a.status !== 'rejected') return false;
        const d = new Date(a.approvedDate);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;

      const pendingEl = document.getElementById('pendingCount');
      const activeEl = document.getElementById('activeLeaveCount');
      const approvedEl = document.getElementById('approvedCount');
      const rejectedEl = document.getElementById('rejectedCount');

      if (pendingEl) pendingEl.textContent = pending;
      if (activeEl) activeEl.textContent = active;
      if (approvedEl) approvedEl.textContent = approved;
      if (rejectedEl) rejectedEl.textContent = rejected;
    }

    // Format Date
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Format DateTime
    function formatDateTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // Format Time (24h to 12h with AM/PM)
    function formatTime(timeString) {
      if (!timeString) return 'N/A';
      const [hour, minute] = timeString.split(':').map(Number);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    // Initialize Leave System when page opens
    setTimeout(() => {
      if (document.getElementById('financials')) {
        initializeLeaveSystem();
      }
    }, 500);

    // ===== PAYROLL SYSTEM =====
    
    // Sample employee data
    const payrollEmployees = [
      { id: 1001, name: 'Dian Santiago', department: 'LRCI Department' },
      { id: 1002, name: 'Alexander Dolencio', department: 'LRCI Department' },
      { id: 1003, name: 'Lara Mae Petilo', department: 'LRCI Department' },
      { id: 1004, name: 'Angelo Binondo', department: 'LRCI Department' },
      { id: 1005, name: 'Hannah Ortoyo', department: 'LRCI Department' },
      { id: 1006, name: 'Bernadeth Lagdamen', department: 'LRCI Department' },
      { id: 1007, name: 'John Jerc Reyes', department: 'LRCI Department' },
      { id: 1008, name: 'Michael Callangan', department: 'LRCI Department' },
      { id: 1009, name: 'Carol Diola', department: 'LRCI Department' }
    ];

    // OT Data storage - organized by period (matching actual Excel data)
    let overtimeData = {
      '1st': {
        // December 1-15 (sample data)
        'Dian Santiago': [
          { date: '12/12/25', time: '6:00pm-9:00pm', hours: 3 },
          { date: '12/14/25', time: '6:00pm-7:00pm', hours: 1 }
        ]
      },
      '2nd': {
        // December 16-31 (actual data from Excel)
        'Dian Santiago': [],  // 0 hours
        'Lara Mae Petilo': [],  // 0 hours
        'John Jerc Reyes': [],  // 0 hours
        'Carol Diola': [
          { date: '12/19/25', time: '6:00pm-9:00pm', hours: 3 }
        ],  // Total: 3.0 hours
        'Hannah Ortoyo': [
          { date: '12/20/25', time: '6:00pm-10:00pm', hours: 4 },
          { date: '12/22/25', time: '6:00pm-10:07pm', hours: 4.07 }
        ],  // Total: 8.07 hours
        'Bernadeth Lagdamen': [
          { date: '12/18/25', time: '6:00pm-8:25pm', hours: 2.42 },
          { date: '12/21/25', time: '6:00pm-8:00pm', hours: 2 }
        ],  // Total: 4.42 hours
        'Alexander Dolencio': [
          { date: '12/16/25', time: '6:00pm-11:00pm', hours: 5 },
          { date: '12/18/25', time: '6:00pm-10:25pm', hours: 4.41 },
          { date: '12/22/25', time: '6:00pm-10:00pm', hours: 4 }
        ],  // Total: 13.41 hours
        'Michael Callangan': [
          { date: '12/16/25', time: '6:00pm-2:00am', hours: 8 },
          { date: '12/17/25', time: '6:00pm-2:00am', hours: 8 },
          { date: '12/18/25', time: '6:00pm-2:06am', hours: 8.1 },
          { date: '12/19/25', time: '6:00pm-2:00am', hours: 8 },
          { date: '12/20/25', time: '6:00pm-2:00am', hours: 8 },
          { date: '12/21/25', time: '6:00pm-1:00am', hours: 7 }
        ],  // Total: 47.1 hours
        'Angelo Binondo': [
          { date: '12/16/25', time: '6:00pm-1:30am', hours: 7.5 },
          { date: '12/17/25', time: '6:00pm-1:30am', hours: 7.5 },
          { date: '12/18/25', time: '6:00pm-1:24am', hours: 7.4 },
          { date: '12/19/25', time: '6:00pm-1:30am', hours: 7.5 },
          { date: '12/20/25', time: '6:00pm-1:30am', hours: 7.5 },
          { date: '12/21/25', time: '6:00pm-1:30am', hours: 7.5 },
          { date: '12/22/25', time: '6:00pm-7:00pm', hours: 1 }
        ]  // Total: 46.4 hours
      }
    };

    // Attendance data storage
    let attendanceData = {};

    // Current payroll period
    let currentPayrollPeriod = '1st';

    // Required time presets
    let requiredTimePresets = ['9:00am', '8:30am'];

    // Track modifications
    let hasModifications = false;

    // Initialize payroll on page load
    function initializePayroll() {
      updatePayrollDate();
      renderOvertimeCards();
      
      // Ensure save button is not highlighted on init
      hasModifications = false;
      const saveBtn = document.getElementById('payrollSaveBtn');
      if (saveBtn) {
        saveBtn.classList.remove('modified');
      }
    }

    // Update current date
    function updatePayrollDate() {
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateEl = document.getElementById('payrollCurrentDate');
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-US', options);
      }
    }

    // Switch payroll tabs
    window.switchPayrollTab = function(tabName) {
      // Hide all tabs
      document.querySelectorAll('.payroll-tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      // Remove active class from all buttons
      document.querySelectorAll('.payroll-tab').forEach(btn => {
        btn.classList.remove('active');
      });

      // Show selected tab
      document.getElementById('payroll' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab').classList.add('active');

      // Add active class to clicked button
      event.target.classList.add('active');
    };

    // Handle drag and drop events
    window.handleDragOver = function(event) {
      event.preventDefault();
      event.stopPropagation();
    };

    window.handleDragEnter = function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.classList.add('drag-over');
    };

    window.handleDragLeave = function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.classList.remove('drag-over');
    };

    window.handleFileDrop = function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.classList.remove('drag-over');

      const files = event.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      
      // Check file type
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        alert('❌ Invalid file type!\n\nPlease upload an Excel file (.xlsx, .xls) or CSV file (.csv)');
        return;
      }

      // Process the dropped file
      processAttendanceFile(file);
    };

    // Process attendance file
    function processAttendanceFile(file) {
      alert('📁 File dropped: ' + file.name + '\n\nProcessing attendance data...');

      // Simulate file processing
      setTimeout(() => {
        // Generate sample attendance data
        generateSampleAttendance();
        renderAttendanceCards();
        alert('✅ Attendance data imported successfully!');
      }, 1000);
    }

    // Handle attendance file import (from file input)
    window.handleAttendanceImport = function(event) {
      const file = event.target.files[0];
      if (!file) return;

      processAttendanceFile(file);
    };

    // Generate sample attendance data
    function generateSampleAttendance() {
      const period = document.getElementById('payrollPeriodSelect').value;
      const startDay = period === '1st' ? 1 : 16;
      const endDay = period === '1st' ? 15 : 30;

      payrollEmployees.forEach(emp => {
        attendanceData[emp.name] = [];
        
        for (let day = startDay; day <= endDay; day++) {
          attendanceData[emp.name].push({
            date: `01/${String(day).padStart(2, '0')}/26`,
            beforeNoonIn: day % 2 === 0 ? '8:00am' : '8:30am',
            beforeNoonOut: '12:00pm',
            afterNoonIn: '1:00pm',
            afterNoonOut: day % 3 === 0 ? '6:00pm' : '5:00pm',
            requiredTime: requiredTimePresets[0],
            duration: '8h',
            totalOT: 0
          });
        }
      });
      
      // Update current period
      currentPayrollPeriod = period;
    }

    // Render attendance cards
    function renderAttendanceCards() {
      const content = document.getElementById('payrollAttendanceContent');
      const period = document.getElementById('payrollPeriodSelect').value;
      
      // If no attendance data, show import zone
      if (Object.keys(attendanceData).length === 0) {
        content.innerHTML = `
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
      
      let html = '<div class="employee-cards-grid">';
      
      payrollEmployees.forEach(emp => {
        const empAttendance = attendanceData[emp.name] || [];
        // Get OT data for current period only
        const periodOT = overtimeData[period] || {};
        const empOT = periodOT[emp.name] || [];
        const totalOT = empOT.reduce((sum, ot) => sum + ot.hours, 0);
        
        html += `
          <div class="employee-time-card">
            <div class="employee-card-header">
              <div class="employee-card-info">
                <h3>${emp.name}</h3>
                <div class="employee-card-meta">${emp.department}</div>
              </div>
              <div class="employee-card-id">User ID: ${emp.id}</div>
            </div>
            <table class="attendance-time-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th colspan="2">Before Noon</th>
                  <th colspan="2">After Noon</th>
                  <th>Required Time</th>
                  <th>Duration</th>
                  <th>Total OT</th>
                </tr>
                <tr>
                  <th></th>
                  <th>In</th>
                  <th>Out</th>
                  <th>In</th>
                  <th>Out</th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
        `;
        
        if (empAttendance.length > 0) {
          empAttendance.forEach((att, idx) => {
            html += `
              <tr>
                <td>${att.date}</td>
                <td><input type="text" value="${att.beforeNoonIn}" class="time-in-cell" onchange="markModified()" data-employee="${emp.name}" data-index="${idx}" data-field="beforeNoonIn"></td>
                <td><input type="text" value="${att.beforeNoonOut}" class="time-out-cell" onchange="markModified()" data-employee="${emp.name}" data-index="${idx}" data-field="beforeNoonOut"></td>
                <td><input type="text" value="${att.afterNoonIn}" class="time-in-cell" onchange="markModified()" data-employee="${emp.name}" data-index="${idx}" data-field="afterNoonIn"></td>
                <td><input type="text" value="${att.afterNoonOut}" class="time-out-cell" onchange="markModified()" data-employee="${emp.name}" data-index="${idx}" data-field="afterNoonOut"></td>
                <td>
                  <select onchange="markModified()" data-employee="${emp.name}" data-index="${idx}" data-field="requiredTime">
                    ${requiredTimePresets.map(preset => 
                      `<option value="${preset}" ${att.requiredTime === preset ? 'selected' : ''}>${preset}</option>`
                    ).join('')}
                  </select>
                </td>
                <td><input type="text" value="${att.duration}" onchange="markModified()" data-employee="${emp.name}" data-index="${idx}" data-field="duration"></td>
                <td class="ot-cell">${totalOT}</td>
              </tr>
            `;
          });
        } else {
          html += `
            <tr>
              <td colspan="8" style="text-align: center; color: #9ca3af; padding: 1.5rem;">No attendance data</td>
            </tr>
          `;
        }
        
        html += `
              </tbody>
            </table>
          </div>
        `;
      });
      
      html += '</div>';
      content.innerHTML = html;
    }

    // Render overtime cards
    function renderOvertimeCards() {
      const content = document.getElementById('payrollOvertimeContent');
      const period = document.getElementById('payrollPeriodSelect').value;
      const periodOT = overtimeData[period] || {};
      
      let html = '';
      
      payrollEmployees.forEach(emp => {
        const otRecords = periodOT[emp.name] || [];
        const totalHours = otRecords.reduce((sum, record) => sum + record.hours, 0);
        
        html += `
          <div class="ot-employee-card">
            <div class="ot-card-header">
              <div class="employee-card-info">
                <h3>${emp.name}</h3>
                <div class="employee-card-meta">${emp.department} | User ID: ${emp.id}</div>
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
                      <div class="ot-record-time">${record.time}</div>
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
                <span class="ot-total-value">${totalHours}</span>
              </div>
            ` : `
              <div class="empty-ot-message">
                No overtime records
              </div>
            `}
          </div>
        `;
      });
      
      content.innerHTML = html;
    }

    // Mark as modified
    window.markModified = function() {
      hasModifications = true;
      const saveBtn = document.getElementById('payrollSaveBtn');
      if (saveBtn) {
        saveBtn.classList.add('modified');
      }
      event.target.classList.add('modified');
      
      // Update attendance data
      const employee = event.target.dataset.employee;
      const index = parseInt(event.target.dataset.index);
      const field = event.target.dataset.field;
      const value = event.target.value;
      
      if (attendanceData[employee] && attendanceData[employee][index]) {
        attendanceData[employee][index][field] = value;
      }
    };

    // Save payroll data
    window.savePayrollData = function() {
      if (!hasModifications) {
        alert('ℹ️ No changes to save.');
        return;
      }

      alert('💾 Saving payroll data...');
      
      setTimeout(() => {
        hasModifications = false;
        const saveBtn = document.getElementById('payrollSaveBtn');
        if (saveBtn) {
          saveBtn.classList.remove('modified');
        }
        
        // Remove modified class from all inputs
        document.querySelectorAll('.attendance-time-table input.modified').forEach(input => {
          input.classList.remove('modified');
        });
        
        alert('✅ Payroll data saved successfully!');
      }, 500);
    };

    // Export payroll data
    // Export payroll data to Excel
    window.exportPayrollData = function() {
      // Check if there's data to export
      if (Object.keys(attendanceData).length === 0) {
        alert('⚠️ No attendance data to export!\n\nPlease import attendance data first.');
        return;
      }

      const period = document.getElementById('payrollPeriodSelect').value;
      const month = document.getElementById('payrollMonthSelect').value;
      const year = document.getElementById('payrollYearSelect').value;
      const periodOT = overtimeData[period] || {};
      
      try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // === ATTENDANCE SHEET ===
        const attendanceRows = [];
        
        // Add header row
        const headerRow = ['Employee Name', 'Department', 'User ID', 'Date', 'Before Noon - In', 'Before Noon - Out', 'After Noon - In', 'After Noon - Out', 'Required Time', 'Duration'];
        attendanceRows.push(headerRow);
        
        // Add attendance data
        payrollEmployees.forEach(emp => {
          const empAttendance = attendanceData[emp.name] || [];
          empAttendance.forEach(att => {
            attendanceRows.push([
              emp.name,
              emp.department,
              emp.id,
              att.date,
              att.beforeNoonIn,
              att.beforeNoonOut,
              att.afterNoonIn,
              att.afterNoonOut,
              att.requiredTime,
              att.duration
            ]);
          });
        });
        
        const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceRows);
        
        // Set column widths
        attendanceSheet['!cols'] = [
          { wch: 20 }, // Employee Name
          { wch: 18 }, // Department
          { wch: 10 }, // User ID
          { wch: 12 }, // Date
          { wch: 15 }, // Before Noon In
          { wch: 15 }, // Before Noon Out
          { wch: 15 }, // After Noon In
          { wch: 15 }, // After Noon Out
          { wch: 14 }, // Required Time
          { wch: 10 }  // Duration
        ];
        
        XLSX.utils.book_append_sheet(wb, attendanceSheet, 'ATTENDANCE');
        
        // === OVERTIME SHEET ===
        const overtimeRows = [];
        
        // Add header row
        overtimeRows.push(['Employee Name', 'Department', 'User ID', 'Date', 'Time', 'Hours', 'Total OT Hours']);
        
        // Add overtime data
        payrollEmployees.forEach(emp => {
          const empOT = periodOT[emp.name] || [];
          const totalOT = empOT.reduce((sum, ot) => sum + ot.hours, 0);
          
          if (empOT.length > 0) {
            empOT.forEach((ot, idx) => {
              overtimeRows.push([
                emp.name,
                emp.department,
                emp.id,
                ot.date,
                ot.time,
                ot.hours,
                idx === empOT.length - 1 ? totalOT : '' // Show total only on last row
              ]);
            });
          } else {
            // Add employee with 0 OT
            overtimeRows.push([
              emp.name,
              emp.department,
              emp.id,
              '',
              '',
              0,
              0
            ]);
          }
        });
        
        const overtimeSheet = XLSX.utils.aoa_to_sheet(overtimeRows);
        
        // Set column widths
        overtimeSheet['!cols'] = [
          { wch: 20 }, // Employee Name
          { wch: 18 }, // Department
          { wch: 10 }, // User ID
          { wch: 12 }, // Date
          { wch: 18 }, // Time
          { wch: 10 }, // Hours
          { wch: 15 }  // Total OT Hours
        ];
        
        XLSX.utils.book_append_sheet(wb, overtimeSheet, 'OVERTIME');
        
        // === PAYROLL SUMMARY SHEET ===
        const payrollRows = [];
        
        // Add header
        payrollRows.push(['Employee Name', 'Position', 'Daily Rate', 'Hourly Rate', 'Basic Salary', 'Allowance', 'Holiday 30%', 'Double Pay', 'OT Hours', 'OT Pay', 'Gross Pay', 'SSS', 'HDMF', 'PhilHealth', 'HMO', 'Loans', 'Total Deductions', 'Net Pay']);
        
        // Add employee payroll data
        payrollEmployees.forEach(emp => {
          const payrollData = employeePayrollData[emp.name];
          if (!payrollData) return;
          
          const empOT = periodOT[emp.name] || [];
          const otHours = empOT.reduce((sum, ot) => sum + ot.hours, 0);
          
          // OT Pay = hourly rate × total OT hours
          const otPay = payrollData.hourlyRate * otHours;
          
          // Holiday 30% (for 2 holidays)
          const holiday30 = payrollData.dailyRate * 0.30 * 2;
          
          // Double Pay (for 2 holidays)
          const doublePay = payrollData.dailyRate * 2;
          
          // Gross Pay includes all earnings
          const grossPay = payrollData.basicSalary + payrollData.allowance + holiday30 + doublePay + otPay;
          
          const sss = payrollData.sss || 0;
          const hdmf = payrollData.hdmf || 0;
          const philhealth = payrollData.philhealth || 0;
          const hmo = payrollData.hmo || 0;
          const loans = payrollData.loans || 0;
          
          const totalDeductions = sss + hdmf + philhealth + hmo + loans;
          const netPay = grossPay - totalDeductions;
          
          payrollRows.push([
            emp.name,
            payrollData.position,
            payrollData.dailyRate,
            payrollData.hourlyRate,
            payrollData.basicSalary,
            payrollData.allowance,
            holiday30,
            doublePay,
            otHours,
            otPay,
            grossPay,
            sss,
            hdmf,
            philhealth,
            hmo,
            loans,
            totalDeductions,
            netPay
          ]);
        });
        
        const payrollSheet = XLSX.utils.aoa_to_sheet(payrollRows);
        
        // Set column widths
        payrollSheet['!cols'] = [
          { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
          { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
          { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, 
          { wch: 8 }, { wch: 12 }, { wch: 8 }, { wch: 8 },
          { wch: 16 }, { wch: 12 }
        ];
        
        XLSX.utils.book_append_sheet(wb, payrollSheet, 'PAYROLL SUMMARY');
        
        // Generate filename
        const filename = `Payroll_${month}_${year}_${period}.xlsx`;
        
        // Write and download file
        XLSX.writeFile(wb, filename);
        
        alert('✅ Export completed!\n\nFile downloaded: ' + filename);
        
      } catch (error) {
        console.error('Export error:', error);
        alert('❌ Error exporting data!\n\n' + error.message);
      }
    };

    // Track department modifications
    let hasDepartmentChanges = false;
    let currentManageTab = 'departments';

    // Available departments (constant list)
    const availableDepartments = [
      'LRCI Department',
      'Admin Department',
      'Nursing Department',
      'Hemodialysis Department',
      'Maintenance Department',
      'Laboratory Department',
      'Accounting Department'
    ];

    // Open manage settings
    window.openManageSettings = function() {
      currentManageTab = 'departments';
      switchManageTab('departments');
      renderEmployeeDepartmentList();
      renderPresetList();
      document.getElementById('payrollManageModal').classList.add('active');
    };

    // Close manage settings
    window.closeManageSettings = function() {
      if (hasDepartmentChanges) {
        const confirm = window.confirm('⚠️ You have unsaved changes. Close anyway?');
        if (!confirm) return;
      }
      document.getElementById('payrollManageModal').classList.remove('active');
      hasDepartmentChanges = false;
    };

    // Switch manage tab
    window.switchManageTab = function(tabName) {
      currentManageTab = tabName;
      
      // Update tab buttons
      document.querySelectorAll('.manage-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Update tab content
      document.getElementById('manageDepartmentsTab').style.display = tabName === 'departments' ? 'block' : 'none';
      document.getElementById('managePresetsTab').style.display = tabName === 'presets' ? 'block' : 'none';
    };

    // Render employee department list
    function renderEmployeeDepartmentList() {
      const container = document.getElementById('employeeDepartmentList');
      
      let html = '';
      payrollEmployees.forEach(emp => {
        html += `
          <div class="employee-dept-item">
            <div class="employee-dept-info">
              <div class="employee-dept-name">${emp.name}</div>
              <div class="employee-dept-id">ID: ${emp.id}</div>
            </div>
            <select class="employee-dept-select" 
                    data-employee-id="${emp.id}" 
                    onchange="markDepartmentModified(${emp.id})">
              ${availableDepartments.map(dept => 
                `<option value="${dept}" ${emp.department === dept ? 'selected' : ''}>${dept}</option>`
              ).join('')}
            </select>
          </div>
        `;
      });
      
      html += `
        <button class="save-dept-changes-btn" 
                id="saveDeptChangesBtn" 
                onclick="saveDepartmentChanges()" 
                disabled>
          💾 Save Department Changes
        </button>
      `;
      
      container.innerHTML = html;
    }

    // Mark department as modified
    window.markDepartmentModified = function(employeeId) {
      hasDepartmentChanges = true;
      
      // Highlight the select that changed
      const select = document.querySelector(`select[data-employee-id="${employeeId}"]`);
      if (select) {
        select.classList.add('modified');
      }
      
      // Enable save button
      const saveBtn = document.getElementById('saveDeptChangesBtn');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.style.background = '#f59e0b';
        saveBtn.innerHTML = '⚠️ Save Department Changes (Unsaved)';
      }
    };

    // Save department changes
    window.saveDepartmentChanges = function() {
      // Update employee departments
      document.querySelectorAll('.employee-dept-select').forEach(select => {
        const employeeId = parseInt(select.getAttribute('data-employee-id'));
        const newDepartment = select.value;
        
        // Find and update employee
        const employee = payrollEmployees.find(emp => emp.id === employeeId);
        if (employee) {
          employee.department = newDepartment;
        }
        
        // Remove modified styling
        select.classList.remove('modified');
      });
      
      // Reset modifications flag
      hasDepartmentChanges = false;
      
      // Update save button
      const saveBtn = document.getElementById('saveDeptChangesBtn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.background = '#10b981';
        saveBtn.innerHTML = '💾 Save Department Changes';
      }
      
      // Re-render attendance and overtime cards to reflect changes
      if (Object.keys(attendanceData).length > 0) {
        renderAttendanceCards();
      }
      renderOvertimeCards();
      
      alert('✅ Department changes saved successfully!\n\nAll employees have been updated with their new departments.');
    };

    // Render preset list
    function renderPresetList() {
      const list = document.getElementById('presetList');
      
      let html = '';
      requiredTimePresets.forEach((preset, index) => {
        html += `
          <div class="preset-item">
            <input type="text" value="${preset}" onchange="updatePreset(${index}, this.value)">
            <button class="btn-preset-remove" onclick="removePreset(${index})">Remove</button>
          </div>
        `;
      });
      
      list.innerHTML = html;
    }

    // Update preset
    window.updatePreset = function(index, value) {
      requiredTimePresets[index] = value;
      alert('✅ Preset updated! Changes will apply to new attendance imports.');
    };

    // Remove preset
    window.removePreset = function(index) {
      if (requiredTimePresets.length <= 1) {
        alert('❌ You must have at least one preset.');
        return;
      }
      
      requiredTimePresets.splice(index, 1);
      renderPresetList();
      alert('✅ Preset removed!');
    };

    // Add new preset
    window.addNewPreset = function() {
      const time = prompt('Enter new time preset (e.g., 8:00am):');
      if (time) {
        requiredTimePresets.push(time);
        renderPresetList();
        alert('✅ New preset added!');
      }
    };

    // Sort employees
    window.sortPayrollEmployees = function() {
      const sortBy = document.getElementById('payrollSortSelect').value;
      
      if (sortBy === 'name') {
        payrollEmployees.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'department') {
        payrollEmployees.sort((a, b) => a.department.localeCompare(b.department));
      } else if (sortBy === 'id') {
        payrollEmployees.sort((a, b) => a.id - b.id);
      }
      
      renderAttendanceCards();
      renderOvertimeCards();
    };

    // Update payroll period
    window.updatePayrollPeriod = function() {
      const newPeriod = document.getElementById('payrollPeriodSelect').value;
      
      // If there's attendance data and period is changing, warn user
      if (Object.keys(attendanceData).length > 0 && currentPayrollPeriod !== newPeriod) {
        const confirmChange = window.confirm('⚠️ Changing the payroll period will clear current attendance data. Continue?');
        if (!confirmChange) {
          // Revert the select back to current period
          document.getElementById('payrollPeriodSelect').value = currentPayrollPeriod;
          return;
        }
      }
      
      // Update current period
      currentPayrollPeriod = newPeriod;
      
      // Clear attendance data
      attendanceData = {};
      
      // Re-render both attendance (shows import zone) and overtime (shows period-specific OT)
      renderAttendanceCards();
      renderOvertimeCards();
    };

    // Handle payroll file drop
    window.handlePayrollFileDrop = function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.classList.remove('drag-over');

      const files = event.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      
      // Check file type
      const validTypes = ['.xlsx', '.xls'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        alert('❌ Invalid file type!\n\nPlease upload an Excel file (.xlsx, .xls)');
        return;
      }

      // Process the dropped file
      processPayrollFile(file);
    };

    // Handle payroll file import
    window.handlePayrollImport = function(event) {
      const file = event.target.files[0];
      if (!file) return;

      processPayrollFile(file);
    };

    // Process payroll file
    function processPayrollFile(file) {
      alert('📁 Processing payroll file: ' + file.name + '\n\nCalculating payroll...');

      // Simulate file processing and payroll calculation
      setTimeout(() => {
        generatePayrollCalculation();
        alert('✅ Payroll calculated successfully!');
      }, 1500);
    }

    // Sample employee payroll data matching actual payroll structure
    const employeePayrollData = {
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

    // Generate payroll calculation
    function generatePayrollCalculation() {
      const content = document.getElementById('payrollPayrollContent');
      const period = document.getElementById('payrollPeriodSelect').value;
      const periodOT = overtimeData[period] || {};
      
      let html = '<div class="payroll-computation-container">';
      html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">';
      html += '<h3 style="margin: 0; color: #111827;">Payroll Computation</h3>';
      html += '<div style="font-size: 0.85rem; color: #6b7280; display: flex; align-items: center; gap: 0.5rem;">';
      html += '<span style="font-size: 1rem;">↔️</span> Scroll horizontally to view all columns';
      html += '</div>';
      html += '</div>';
      html += '<div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px;">';
      html += '<table class="payroll-table">';
      html += `
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
      `;
      
      let totalNetPay = 0;
      
      payrollEmployees.forEach(emp => {
        const payrollData = employeePayrollData[emp.name];
        if (!payrollData) return;
        
        const otRecords = periodOT[emp.name] || [];
        const otHours = otRecords.reduce((sum, record) => sum + record.hours, 0);
        
        // OT Pay = hourly rate × total OT hours
        const otPay = payrollData.hourlyRate * otHours;
        
        // Holiday 30% (for 2 holidays in Dec 16-31: 24, 31)
        const holiday30 = payrollData.dailyRate * 0.30 * 2;
        
        // Double Pay (for holidays 25, 30)
        const doublePay = payrollData.dailyRate * 2;
        
        // Individual deductions from employee data
        const sss = payrollData.sss || 0;
        const hdmf = payrollData.hdmf || 0;
        const philhealth = payrollData.philhealth || 0;
        const hmo = payrollData.hmo || 0;
        const loans = payrollData.loans || 0;
        
        const totalDeductions = sss + hdmf + philhealth + hmo + loans;
        
        // Gross Pay = Basic + Allowance + Holiday 30% + Double Pay + OT Pay
        const grossPay = payrollData.basicSalary + payrollData.allowance + holiday30 + doublePay + otPay;
        const netPay = grossPay - totalDeductions;
        totalNetPay += netPay;
        
        html += `
          <tr>
            <td class="employee-name">${emp.name}</td>
            <td>${payrollData.position}</td>
            <td class="amount">₱${payrollData.dailyRate.toFixed(2)}</td>
            <td class="amount">₱${payrollData.hourlyRate.toFixed(2)}</td>
            <td class="amount">₱${payrollData.basicSalary.toFixed(2)}</td>
            <td class="amount">₱${payrollData.allowance.toFixed(2)}</td>
            <td class="amount">₱${holiday30.toFixed(2)}</td>
            <td class="amount">₱${doublePay.toFixed(2)}</td>
            <td class="amount">${otHours.toFixed(2)}</td>
            <td class="amount">₱${otPay.toFixed(2)}</td>
            <td class="amount">₱${sss.toFixed(2)}</td>
            <td class="amount">₱${hdmf.toFixed(2)}</td>
            <td class="amount">₱${philhealth.toFixed(2)}</td>
            <td class="amount">₱${hmo.toFixed(2)}</td>
            <td class="amount">₱${loans.toFixed(2)}</td>
            <td class="amount">₱${totalDeductions.toFixed(2)}</td>
            <td class="amount" style="font-weight: 700; color: #10b981;">₱${netPay.toFixed(2)}</td>
          </tr>
        `;
      });
      
      html += `
          <tr class="total-row">
            <td colspan="16" style="text-align: right; font-size: 0.9rem;">TOTAL NET PAY:</td>
            <td class="amount" style="color: #10b981; font-size: 1.1rem; font-weight: 700;">₱${totalNetPay.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      </div>
      `;
      
      html += `
        <div class="payroll-actions">
          <button class="btn-export-payslip" onclick="exportPayslips()">📥 Export Payslips</button>
        </div>
      </div>
      `;
      
      content.innerHTML = html;
    }

    // Export payslips for printing
    window.exportPayslips = function() {
      const period = document.getElementById('payrollPeriodSelect').value;
      const month = document.getElementById('payrollMonthSelect').value;
      const year = document.getElementById('payrollYearSelect').value;
      const periodOT = overtimeData[period] || {};
      
      try {
        // Create workbook for payslips
        const wb = XLSX.utils.book_new();
        
        // Create payslip data
        const payslipRows = [];
        
        // Header
        payslipRows.push(['EMPLOYEE PAYSLIPS - ' + month.toUpperCase() + ' ' + year + ' (' + period + ')']);
        payslipRows.push([]);
        
        // For each employee, create their payslip section
        payrollEmployees.forEach((emp, index) => {
          const payrollData = employeePayrollData[emp.name];
          if (!payrollData) return;
          
          const otRecords = periodOT[emp.name] || [];
          const otHours = otRecords.reduce((sum, record) => sum + record.hours, 0);
          const otPay = payrollData.hourlyRate * otHours;
          const holiday30 = payrollData.dailyRate * 0.30 * 2;
          const doublePay = payrollData.dailyRate * 2;
          
          const grossPay = payrollData.basicSalary + payrollData.allowance + holiday30 + doublePay + otPay;
          
          const sss = payrollData.sss || 0;
          const hdmf = payrollData.hdmf || 0;
          const philhealth = payrollData.philhealth || 0;
          const hmo = payrollData.hmo || 0;
          const loans = payrollData.loans || 0;
          const totalDeductions = sss + hdmf + philhealth + hmo + loans;
          const netPay = grossPay - totalDeductions;
          
          // Employee header
          payslipRows.push(['EMPLOYEE: ' + emp.name.toUpperCase()]);
          payslipRows.push(['Position:', payrollData.position]);
          payslipRows.push(['Employee ID:', emp.id]);
          payslipRows.push([]);
          
          // Earnings
          payslipRows.push(['EARNINGS', 'AMOUNT']);
          payslipRows.push(['Basic Salary', payrollData.basicSalary.toFixed(2)]);
          payslipRows.push(['Allowance', payrollData.allowance.toFixed(2)]);
          payslipRows.push(['Holiday 30%', holiday30.toFixed(2)]);
          payslipRows.push(['Double Pay', doublePay.toFixed(2)]);
          payslipRows.push(['OT Pay (' + otHours.toFixed(2) + ' hrs)', otPay.toFixed(2)]);
          payslipRows.push(['GROSS PAY', grossPay.toFixed(2)]);
          payslipRows.push([]);
          
          // Deductions
          payslipRows.push(['DEDUCTIONS', 'AMOUNT']);
          if (sss > 0) payslipRows.push(['SSS', sss.toFixed(2)]);
          if (hdmf > 0) payslipRows.push(['HDMF/Pag-ibig', hdmf.toFixed(2)]);
          if (philhealth > 0) payslipRows.push(['PhilHealth', philhealth.toFixed(2)]);
          if (hmo > 0) payslipRows.push(['HMO', hmo.toFixed(2)]);
          if (loans > 0) payslipRows.push(['Loans', loans.toFixed(2)]);
          payslipRows.push(['TOTAL DEDUCTIONS', totalDeductions.toFixed(2)]);
          payslipRows.push([]);
          
          // Net Pay
          payslipRows.push(['NET PAY', netPay.toFixed(2)]);
          payslipRows.push([]);
          payslipRows.push(['_______________________________________']);
          payslipRows.push([]);
        });
        
        const payslipSheet = XLSX.utils.aoa_to_sheet(payslipRows);
        
        // Set column widths
        payslipSheet['!cols'] = [
          { wch: 30 },
          { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, payslipSheet, 'Payslips');
        
        // Generate filename
        const filename = `Payslips_${month}_${year}_${period}.xlsx`;
        
        // Write and download file
        XLSX.writeFile(wb, filename);
        
        alert('✅ Payslips exported!\n\nFile downloaded: ' + filename + '\n\nYou can now import this file to your printing area.');
        
      } catch (error) {
        console.error('Export error:', error);
        alert('❌ Error exporting payslips!\n\n' + error.message);
      }
    };

    // Initialize payroll when page loads
    setTimeout(() => {
      if (document.getElementById('adjustments')) {
        initializePayroll();
      }
    }, 500);

// === PRINT PAGE SYSTEM ===
let isPrinterConnected = false;

// Toggle printer connection
window.togglePrinterConnection = function() {
  const btn = document.getElementById('printerConnectionBtn');
  const icon = document.getElementById('connectionIcon');
  const text = document.getElementById('connectionText');
  
  if (!isPrinterConnected) {
    // Simulate connecting
    btn.disabled = true;
    text.textContent = 'Connecting...';
    icon.textContent = '🟡';
    
    setTimeout(() => {
      isPrinterConnected = true;
      btn.classList.add('connected');
      icon.textContent = '🟢';
      text.textContent = 'Connected';
      btn.disabled = false;
      
      alert('✅ Printer connected successfully!');
    }, 1500);
  } else {
    // Disconnect
    isPrinterConnected = false;
    btn.classList.remove('connected');
    icon.textContent = '🔴';
    text.textContent = 'Not Connected';
    
    alert('Printer disconnected.');
  }
};

// Update print date
function updatePrintDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById('printCurrentDate');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

// Drag and drop handlers for print zone
window.handlePrintDragOver = function(event) {
  event.preventDefault();
  event.stopPropagation();
};

window.handlePrintDragEnter = function(event) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.classList.add('drag-over');
};

window.handlePrintDragLeave = function(event) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.classList.remove('drag-over');
};

window.handlePrintFileDrop = function(event) {
  event.preventDefault();
  event.stopPropagation();
  event.currentTarget.classList.remove('drag-over');
  
  const files = event.dataTransfer.files;
  if (files.length === 0) return;
  
  handlePrintFiles(files);
};

window.handlePrintFileImport = function(event) {
  const files = event.target.files;
  if (files.length === 0) return;
  
  handlePrintFiles(files);
};

// Handle print files
function handlePrintFiles(files) {
  if (!isPrinterConnected) {
    alert('⚠️ Please connect to a printer first!');
    return;
  }
  
  const validTypes = ['.xlsx', '.xls', '.pdf'];
  const fileArray = Array.from(files);
  
  fileArray.forEach(file => {
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      alert(`❌ Invalid file type: ${file.name}\n\nSupported formats: ${validTypes.join(', ')}`);
      return;
    }
    
    addToPrintQueue(file);
  });
}

// Print queue array
let printQueue = [];

// Add file to print queue
function addToPrintQueue(file) {
  printQueue.push({
    id: Date.now(),
    name: file.name,
    size: formatFileSize(file.size),
    file: file
  });
  
  renderPrintQueue();
}

// Render print queue
function renderPrintQueue() {
  const queueSection = document.getElementById('printQueueSection');
  const queueList = document.getElementById('printQueueList');
  
  if (printQueue.length === 0) {
    queueSection.style.display = 'none';
    return;
  }
  
  queueSection.style.display = 'block';
  
  let html = '';
  printQueue.forEach(item => {
    html += `
      <div class="queue-item" data-id="${item.id}">
        <div class="queue-item-info">
          <div class="queue-item-name">📄 ${item.name}</div>
          <div class="queue-item-size">${item.size}</div>
        </div>
        <button class="btn-remove-queue" onclick="removeFromQueue(${item.id})">✕</button>
      </div>
    `;
  });
  
  queueList.innerHTML = html;
}

// Remove from queue
window.removeFromQueue = function(id) {
  printQueue = printQueue.filter(item => item.id !== id);
  renderPrintQueue();
};

// Clear queue
window.clearPrintQueue = function() {
  if (confirm('Clear all files from print queue?')) {
    printQueue = [];
    renderPrintQueue();
  }
};

// Print all documents
window.printAllDocuments = function() {
  if (printQueue.length === 0) {
    alert('⚠️ No files in queue!');
    return;
  }
  
  if (!isPrinterConnected) {
    alert('⚠️ Please connect to a printer first!');
    return;
  }
  
  alert(`🖨️ Printing ${printQueue.length} document(s)...\n\n(In production, files will be sent to the server printer)`);
  
  // Simulate printing
  setTimeout(() => {
    alert('✅ All documents printed successfully!');
    printQueue = [];
    renderPrintQueue();
  }, 1500);
};

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize print page
setTimeout(() => {
  if (document.getElementById('payslip')) {
    updatePrintDate();
  }
}, 500);

// === PATIENT ASSIGNMENT SYSTEM ===

// Assignment data storage
let patientAssignments = [];
let currentAssignmentFilter = 'pending';

// Initialize assignment system
function initializeAssignmentSystem() {
  console.log('🔧 Initializing Assignment System');
  
  // Sync with patient records from Laboratory Logbook
  syncPatientRecordsToAssignments();
  
  updateAssignmentDate();
  renderAssignments();
  
  // Setup search
  const searchInput = document.getElementById('assignmentSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderAssignments);
  }
  
  console.log('✅ Assignment System Initialized');
  console.log('Current assignments:', patientAssignments);
}

// Generate Demo Assignment Data
function generateDemoAssignmentData() {
  const demoAssignments = [
    {
      id: 1001,
      patientName: 'Maria Santos',
      labType: 'Complete Blood Count (CBC)',
      timestamp: '09:15 AM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: null,
      assignedAt: null,
      status: 'pending',
      completed: false
    },
    {
      id: 1002,
      patientName: 'Juan Dela Cruz',
      labType: 'Urinalysis',
      timestamp: '10:30 AM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: null,
      assignedAt: null,
      status: 'pending',
      completed: false
    },
    {
      id: 1003,
      patientName: 'Rosa Reyes',
      labType: 'Blood Chemistry',
      timestamp: '11:45 AM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: null,
      assignedAt: null,
      status: 'pending',
      completed: false
    },
    {
      id: 1004,
      patientName: 'Pedro Garcia',
      labType: 'X-Ray',
      timestamp: '01:20 PM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: null,
      assignedAt: null,
      status: 'pending',
      completed: false
    },
    {
      id: 1005,
      patientName: 'Ana Lopez',
      labType: 'ECG',
      timestamp: '02:45 PM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: null,
      assignedAt: null,
      status: 'pending',
      completed: false
    },
    // Assigned 2 minutes ago (can still unassign)
    {
      id: 1006,
      patientName: 'Carlos Fernandez',
      labType: 'Fecalysis',
      timestamp: '08:30 AM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: 'John Doe',
      assignedAt: Date.now() - (2 * 60 * 1000),
      status: 'assigned',
      completed: false
    },
    // Assigned 7 minutes ago (CANNOT unassign)
    {
      id: 1007,
      patientName: 'Elena Martinez',
      labType: 'Pregnancy Test',
      timestamp: '09:00 AM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: 'John Doe',
      assignedAt: Date.now() - (7 * 60 * 1000),
      status: 'assigned',
      completed: false
    },
    // Completed
    {
      id: 1008,
      patientName: 'Roberto Cruz',
      labType: 'Drug Test',
      timestamp: '07:15 AM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: 'John Doe',
      assignedAt: Date.now() - (30 * 60 * 1000),
      status: 'assigned',
      completed: true
    },
    {
      id: 1009,
      patientName: 'Sofia Gonzales',
      labType: 'Blood Typing',
      timestamp: '08:00 AM',
      date: '01/30/26',
      nurseOnDuty: 'Diana Santiago',
      assignedTo: 'John Doe',
      assignedAt: Date.now() - (45 * 60 * 1000),
      status: 'assigned',
      completed: true
    }
  ];
  
  // Clear existing and add demo data
  patientAssignments = [...demoAssignments];
  
  console.log('✅ Demo assignment data generated:', patientAssignments.length, 'assignments');
  console.log('Demo data:', patientAssignments);
}

// Update current date
function updateAssignmentDate() {
  const dateEl = document.getElementById('assignmentCurrentDate');
  if (dateEl) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

// Sync patient records to assignments
function syncPatientRecordsToAssignments() {
  if (typeof patientRecords !== 'undefined' && patientRecords.length > 0) {
    patientRecords.forEach(record => {
      const existingAssignment = patientAssignments.find(a => 
        a.patientName === record.patientName && 
        a.timestamp === record.timestamp
      );
      
      if (!existingAssignment) {
        patientAssignments.push({
          id: Date.now() + Math.random(),
          patientName: record.patientName,
          labType: record.labType,
          timestamp: record.timestamp,
          date: record.date,
          nurseOnDuty: record.nurseOnDuty,
          assignedTo: record.assigned || null,
          assignedAt: record.assigned ? Date.now() : null,
          status: record.assigned ? 'assigned' : 'pending',
          completed: false
        });
      }
    });
  }
}

// Switch assignment tabs
window.switchAssignmentTab = function(filter) {
  console.log('Switching to tab:', filter);
  currentAssignmentFilter = filter;
  
  document.querySelectorAll('.assignment-tab').forEach(tab => {
    if (tab.dataset.filter === filter) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  renderAssignments();
};

// Render assignments
function renderAssignments() {
  console.log('📋 Rendering assignments, filter:', currentAssignmentFilter);
  
  const listEl = document.getElementById('assignmentList');
  const searchInput = document.getElementById('assignmentSearchInput');
  
  if (!listEl) {
    console.error('❌ assignmentList element not found!');
    return;
  }
  
  const currentMedtech = document.getElementById('userName').textContent;
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  
  console.log('Current user:', currentMedtech);
  console.log('Total assignments:', patientAssignments.length);
  
  // Filter assignments
  let filtered = patientAssignments.filter(assignment => {
    const matchesSearch = searchTerm === '' || 
      assignment.patientName.toLowerCase().includes(searchTerm) ||
      assignment.labType.toLowerCase().includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    if (currentAssignmentFilter === 'pending') {
      return assignment.status === 'pending';
    } else if (currentAssignmentFilter === 'assigned') {
      return assignment.assignedTo === currentMedtech && !assignment.completed;
    } else if (currentAssignmentFilter === 'completed') {
      return assignment.assignedTo === currentMedtech && assignment.completed;
    }
    
    return true;
  });
  
  console.log('Filtered assignments:', filtered.length);
  
  // Update counts
  const pendingCount = patientAssignments.filter(a => a.status === 'pending').length;
  const myAssignedCount = patientAssignments.filter(a => a.assignedTo === currentMedtech && !a.completed).length;
  const completedCount = patientAssignments.filter(a => a.assignedTo === currentMedtech && a.completed).length;
  
  const pendingCountEl = document.getElementById('pendingAssignmentCount');
  const myCountEl = document.getElementById('myAssignmentCount');
  const completedCountEl = document.getElementById('completedAssignmentCount');
  
  if (pendingCountEl) pendingCountEl.textContent = pendingCount;
  if (myCountEl) myCountEl.textContent = myAssignedCount;
  if (completedCountEl) completedCountEl.textContent = completedCount;
  
  // Render list
  if (filtered.length === 0) {
    let emptyMessage = '';
    if (currentAssignmentFilter === 'pending') {
      emptyMessage = '<div class="assignment-empty-text">No pending assignments</div><div class="assignment-empty-subtext">All patients have been assigned</div>';
    } else if (currentAssignmentFilter === 'assigned') {
      emptyMessage = '<div class="assignment-empty-text">No active assignments</div><div class="assignment-empty-subtext">Assign yourself to pending patients to see them here</div>';
    } else {
      emptyMessage = '<div class="assignment-empty-text">No completed assignments</div><div class="assignment-empty-subtext">Mark your assignments as done to see them here</div>';
    }
    
    listEl.innerHTML = `
      <div class="assignment-empty">
        <div class="assignment-empty-icon">📋</div>
        ${emptyMessage}
      </div>
    `;
    return;
  }
  
  let html = '';
  
  filtered.forEach(assignment => {
    const statusClass = assignment.completed ? 'completed' : (assignment.status === 'assigned' ? 'assigned' : 'pending');
    const statusText = assignment.completed ? 'Completed' : (assignment.status === 'assigned' ? 'Assigned' : 'Pending');
    
    // Calculate time elapsed if assigned
    let timeInfo = '';
    let canUnassign = true;
    
    if (assignment.assignedAt) {
      const timeElapsed = Date.now() - assignment.assignedAt;
      const FIVE_MINUTES = 5 * 60 * 1000;
      const minutesElapsed = Math.floor(timeElapsed / 60000);
      const secondsElapsed = Math.floor((timeElapsed % 60000) / 1000);
      
      canUnassign = timeElapsed <= FIVE_MINUTES;
      
      if (canUnassign) {
        const timeRemaining = FIVE_MINUTES - timeElapsed;
        const minutesRemaining = Math.floor(timeRemaining / 60000);
        const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);
        timeInfo = `<div class="assignment-time-info" style="color: #10b981; font-size: 0.85rem; margin-top: 0.5rem; padding: 0.5rem; background: #f0fdf4; border-radius: 6px;">⏱️ Assigned ${minutesElapsed}m ${secondsElapsed}s ago • Can unassign for ${minutesRemaining}m ${secondsRemaining}s</div>`;
      } else {
        timeInfo = `<div class="assignment-time-info" style="color: #6b7280; font-size: 0.85rem; margin-top: 0.5rem; padding: 0.5rem; background: #f9fafb; border-radius: 6px;">🔒 Assigned ${minutesElapsed}m ${secondsElapsed}s ago • Cannot unassign (5min limit passed)</div>`;
      }
    }
    
    html += `
      <div class="assignment-card">
        <div class="assignment-card-header">
          <div class="assignment-patient-info">
            <div class="assignment-patient-name">${assignment.patientName}</div>
            <div class="assignment-lab-type">${assignment.labType}</div>
          </div>
          <div class="assignment-status-badge ${statusClass}">${statusText}</div>
        </div>
        
        <div class="assignment-card-body">
          <div class="assignment-detail">
            <div class="assignment-detail-label">Date & Time</div>
            <div class="assignment-detail-value">${assignment.date} • ${assignment.timestamp}</div>
          </div>
          
          <div class="assignment-detail">
            <div class="assignment-detail-label">Nurse on Duty</div>
            <div class="assignment-detail-value">${assignment.nurseOnDuty}</div>
          </div>
          
          ${assignment.assignedTo ? `
            <div class="assignment-detail">
              <div class="assignment-detail-label">Assigned To</div>
              <div class="assignment-detail-value">${assignment.assignedTo}</div>
            </div>
          ` : ''}
        </div>
        
        ${timeInfo}
        
        <div class="assignment-card-footer">
          ${currentAssignmentFilter === 'pending' ? `
            <button class="btn-assign-me" data-id="${assignment.id}">
              ✅ Assign to Me
            </button>
          ` : ''}
          
          ${currentAssignmentFilter === 'assigned' ? `
            <button class="btn-unassign ${!canUnassign ? 'disabled' : ''}" data-id="${assignment.id}" ${!canUnassign ? 'disabled' : ''}>
              ${canUnassign ? '❌ Unassign' : '🔒 Locked'}
            </button>
            <button class="btn-mark-done" data-id="${assignment.id}">
              ✓ Mark as Done
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  listEl.innerHTML = html;
  
  // Attach event listeners to buttons
  attachAssignmentEventListeners();
}

// Attach event listeners to assignment buttons
function attachAssignmentEventListeners() {
  // Assign buttons
  document.querySelectorAll('.btn-assign-me').forEach(btn => {
    btn.addEventListener('click', function() {
      const assignmentId = parseInt(this.dataset.id);
      console.log('Assign button clicked, ID:', assignmentId);
      assignToMe(assignmentId);
    });
  });
  
  // Unassign buttons
  document.querySelectorAll('.btn-unassign:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', function() {
      const assignmentId = parseInt(this.dataset.id);
      console.log('Unassign button clicked, ID:', assignmentId);
      unassignPatient(assignmentId);
    });
  });
  
  // Mark done buttons
  document.querySelectorAll('.btn-mark-done').forEach(btn => {
    btn.addEventListener('click', function() {
      const assignmentId = parseInt(this.dataset.id);
      console.log('Mark done button clicked, ID:', assignmentId);
      markAsDone(assignmentId);
    });
  });
}

// Assign to me
function assignToMe(assignmentId) {
  console.log('📌 Assigning to me, ID:', assignmentId);
  
  const assignment = patientAssignments.find(a => a.id === assignmentId);
  
  if (!assignment) {
    console.error('❌ Assignment not found!');
    alert('❌ Assignment not found!');
    return;
  }
  
  const currentMedtech = document.getElementById('userName').textContent;
  
  assignment.assignedTo = currentMedtech;
  assignment.assignedAt = Date.now();
  assignment.status = 'assigned';
  
  console.log('✅ Assignment updated:', assignment);
  
  // Update patient record if exists
  if (typeof patientRecords !== 'undefined') {
    const patientRecord = patientRecords.find(p => 
      p.patientName === assignment.patientName && 
      p.timestamp === assignment.timestamp
    );
    
    if (patientRecord) {
      patientRecord.assigned = currentMedtech;
    }
    
    if (typeof renderPatientRecords === 'function') {
      renderPatientRecords();
    }
  }
  
  renderAssignments();
  
  alert(`✅ You have been assigned to ${assignment.patientName}`);
}

// Unassign patient
function unassignPatient(assignmentId) {
  console.log('🔄 Unassigning patient, ID:', assignmentId);
  
  const assignment = patientAssignments.find(a => a.id === assignmentId);
  
  if (!assignment) {
    console.error('❌ Assignment not found!');
    alert('❌ Assignment not found!');
    return;
  }
  
  console.log('Found assignment:', assignment);
  
  // Check if 5 minutes have passed
  const FIVE_MINUTES = 5 * 60 * 1000;
  const timeElapsed = Date.now() - assignment.assignedAt;
  const minutesElapsed = Math.floor(timeElapsed / 60000);
  const secondsElapsed = Math.floor((timeElapsed % 60000) / 1000);
  
  console.log('Time elapsed:', timeElapsed, 'ms (', minutesElapsed, 'm', secondsElapsed, 's)');
  console.log('Can unassign:', timeElapsed <= FIVE_MINUTES);
  
  if (timeElapsed > FIVE_MINUTES) {
    alert(`❌ Cannot unassign!\n\nYou can only unassign within 5 minutes of assignment.\n\nTime elapsed: ${minutesElapsed} minutes and ${secondsElapsed} seconds\n\nPlease contact your supervisor if you need to transfer this assignment.`);
    return;
  }
  
  // Show confirmation with time info
  const timeRemaining = FIVE_MINUTES - timeElapsed;
  const minutesRemaining = Math.floor(timeRemaining / 60000);
  const secondsRemaining = Math.floor((timeRemaining % 60000) / 1000);
  
  if (!confirm(`⏱️ Unassign Confirmation\n\nPatient: ${assignment.patientName}\nLab: ${assignment.labType}\n\nAssigned: ${minutesElapsed}m ${secondsElapsed}s ago\nTime remaining: ${minutesRemaining}m ${secondsRemaining}s\n\nReturn this assignment to pending queue?`)) {
    console.log('User cancelled unassign');
    return;
  }
  
  // Unassign
  assignment.assignedTo = null;
  assignment.assignedAt = null;
  assignment.status = 'pending';
  
  console.log('✅ Assignment unassigned:', assignment);
  
  // Update patient record if exists
  if (typeof patientRecords !== 'undefined') {
    const patientRecord = patientRecords.find(p => 
      p.patientName === assignment.patientName && 
      p.timestamp === assignment.timestamp
    );
    
    if (patientRecord) {
      patientRecord.assigned = '';
    }
    
    if (typeof renderPatientRecords === 'function') {
      renderPatientRecords();
    }
  }
  
  renderAssignments();
  
  alert(`✅ Assignment returned to pending!\n\n${assignment.patientName} is now available for other medical technologists.`);
}

// Mark as done
function markAsDone(assignmentId) {
  console.log('✓ Marking as done, ID:', assignmentId);
  
  const assignment = patientAssignments.find(a => a.id === assignmentId);
  
  if (!assignment) {
    console.error('❌ Assignment not found!');
    return;
  }
  
  assignment.completed = true;
  
  console.log('✅ Assignment completed:', assignment);
  
  renderAssignments();
  
  alert(`✅ ${assignment.patientName}'s ${assignment.labType} has been marked as completed!`);
}

// Initialize when pagae loads
setTimeout(() => {
  if (document.getElementById('reports')) {
    console.log('🚀 Initializing Patient Assignment System');
    generateDemoAssignmentData();
    initializeAssignmentSystem();
  }
}, 1000);

// Re-sync when switching to assignment page
document.querySelectorAll('[data-page="reports"]').forEach(link => {
  link.addEventListener('click', () => {
    setTimeout(() => {
      console.log('📄 Assignment page opened');
      if (patientAssignments.length === 0) {
        generateDemoAssignmentData();
      }
      initializeAssignmentSystem();
    }, 100);
  });
});