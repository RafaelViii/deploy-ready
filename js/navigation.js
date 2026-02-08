// ═══════════════════════════════════════════════════════════════
// SIDEBAR & NAVIGATION & USER PROFILE
// ═══════════════════════════════════════════════════════════════

function initNavigation() {
  // Sidebar toggle
  document.getElementById('navToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Page navigation
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      
      // Hide all pages
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      // Show selected page
      document.getElementById(link.dataset.page).classList.add('active');
      
      // Update active link
      document.querySelectorAll('.sidebar nav a').forEach(x => {
        x.classList.remove('active');
      });
      link.classList.add('active');
      
      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });

  // User profile toggle
  document.getElementById('userProfileToggle')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('userProfileToggle').classList.toggle('open');
    document.getElementById('userDropdown').classList.toggle('open');
  });

  // Close user dropdown when clicking outside
  document.addEventListener('click', e => {
    if (!document.getElementById('userProfileToggle')?.contains(e.target) &&
        !document.getElementById('userDropdown')?.contains(e.target)) {
      document.getElementById('userProfileToggle')?.classList.remove('open');
      document.getElementById('userDropdown')?.classList.remove('open');
    }
  });
}



function initRestockNavigation() {
  // Go to Restock page
  document.getElementById('goToRestockBtn')?.addEventListener('click', () => {
    document.getElementById('inventory').style.display = 'none';
    document.getElementById('restockPage').style.display = 'block';
  });

  // Back from Restock page
  document.getElementById('backFromRestockBtn')?.addEventListener('click', () => {
    document.getElementById('restockPage').style.display = 'none';
    document.getElementById('inventory').style.display = 'block';
  });
}

function initLabTypesModal() {
  // Open lab types modal
  document.getElementById('manageLabTypesBtn')?.addEventListener('click', () => {
    document.getElementById('labTypesModal')?.classList.add('active');
    renderLabTypesList();
  });

  // Close lab types modal
  document.getElementById('closeLabTypesModal')?.addEventListener('click', () => {
    document.getElementById('labTypesModal')?.classList.remove('active');
  });
}
