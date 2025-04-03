// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize page loader
  initPageLoader();
  
  // Setup page transitions
  setupPageTransitions();
  
  // Add form entrance animations
  addFormEntranceAnimations();
  
  // Setup forgot password form
  setupForgotPasswordForm();
});

// Initialize page loader
function initPageLoader() {
  const pageLoader = document.getElementById('pageLoader');
  if (!pageLoader) return;
  
  // Simulate loading progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 70;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // Hide loader with animation
      setTimeout(() => {
        pageLoader.style.opacity = '0';
        setTimeout(() => {
          pageLoader.style.display = 'none';
          
          // Add class to body when page is loaded
          document.body.classList.add('page-loaded');
          
          // Add entrance animation for auth form
          const authForm = document.querySelector('.auth-form');
          if (authForm) {
            authForm.classList.add('animate-entrance');
          }
        }, 500);
      }, 500);
    }
  }, 200);
}

// Setup page transitions
function setupPageTransitions() {
  // Create page transition overlay if it doesn't exist
  if (!document.getElementById('pageTransitionOverlay')) {
    createPageTransitionOverlay();
  }
  
  // Add event listeners to all links that should have page transitions
  document.addEventListener('click', function(e) {
    // Check if clicked element is a link with page-transition-link class or a form submit button
    const isTransitionLink = e.target.classList.contains('page-transition-link') || 
                             e.target.closest('.page-transition-link');
    const isRedirectBtn = e.target.classList.contains('redirect-btn') || 
                          e.target.closest('.redirect-btn');
    
    if (isTransitionLink || isRedirectBtn) {
      e.preventDefault();
      const link = isTransitionLink ? (e.target.tagName === 'A' ? e.target : e.target.closest('a')) : 
                                     e.target.closest('.redirect-btn');
      const href = isRedirectBtn ? link.getAttribute('data-redirect') : link.getAttribute('href');
      
      if (href && href !== '#' && !href.startsWith('javascript:')) {
        // Show page transition animation
        const overlay = document.getElementById('pageTransitionOverlay');
        overlay.classList.add('active');
        
        // Navigate after animation
        setTimeout(() => {
          window.location.href = href;
        }, 1000);
      }
    }
  });
  
  // Add event listeners to forms
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      const action = this.getAttribute('action');
      if (action && action !== '#') {
        e.preventDefault();
        
        // Validate form
        if (validateForm(this)) {
          // Show page transition animation
          const overlay = document.getElementById('pageTransitionOverlay');
          overlay.classList.add('active');
          
          // For forgot password form, show success modal instead of redirecting
          if (this.id === 'forgotPasswordForm') {
            setTimeout(() => {
              overlay.classList.remove('active');
              const successModal = document.getElementById('successModal');
              if (successModal) {
                openModal(successModal);
              }
            }, 1000);
          } else {
            // Navigate after animation
            setTimeout(() => {
              window.location.href = action;
            }, 1000);
          }
        }
      }
    });
  });
}

// Create page transition overlay
function createPageTransitionOverlay() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'pageTransitionOverlay';
  overlay.className = 'page-transition-overlay';
  
  // Create loading animation container
  const loadingContainer = document.createElement('div');
  loadingContainer.className = 'loading-container';
  
  // Create growing plant animation
  const plantContainer = document.createElement('div');
  plantContainer.className = 'plant-container';
  
  // Create soil
  const soil = document.createElement('div');
  soil.className = 'soil';
  
  // Create plant stem
  const stem = document.createElement('div');
  stem.className = 'stem';
  
  // Create leaves
  for (let i = 0; i < 5; i++) {
    const leaf = document.createElement('div');
    leaf.className = `growing-leaf growing-leaf-${i+1}`;
    stem.appendChild(leaf);
  }
  
  // Create loading text
  const loadingText = document.createElement('div');
  loadingText.className = 'loading-text';
  loadingText.textContent = 'Growing...';
  
  // Assemble the elements
  plantContainer.appendChild(soil);
  plantContainer.appendChild(stem);
  loadingContainer.appendChild(plantContainer);
  loadingContainer.appendChild(loadingText);
  overlay.appendChild(loadingContainer);
  
  // Add to body
  document.body.appendChild(overlay);
}

// Add form entrance animations
function addFormEntranceAnimations() {
  // Add a class to body when page is loaded
  document.body.classList.add('page-loaded');
  
  // Add entrance animation for auth form
  const authForm = document.querySelector('.auth-form');
  if (authForm) {
    authForm.classList.add('animate-entrance');
  }
}

// Setup forgot password form
function setupForgotPasswordForm() {
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (!forgotPasswordForm) return;
  
  forgotPasswordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate form
    if (validateForm(this)) {
      // Show loading animation
      const overlay = document.getElementById('pageTransitionOverlay');
      overlay.classList.add('active');
      
      // Show success modal after animation
      setTimeout(() => {
        overlay.classList.remove('active');
        const successModal = document.getElementById('successModal');
        if (successModal) {
          openModal(successModal);
        }
      }, 1000);
    }
  });
}

// Validate form
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      const inputBox = input.closest('.input-box');
      inputBox.classList.add('error');
      
      // Create error message if it doesn't exist
      let errorMessage = inputBox.querySelector('.error-message');
      if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        inputBox.appendChild(errorMessage);
      }
      errorMessage.textContent = 'This field is required';
      
      // Shake animation for invalid fields
      input.style.animation = 'shake 0.5s ease';
      setTimeout(() => {
        input.style.animation = '';
      }, 500);
    } else {
      // Clear error
      const inputBox = input.closest('.input-box');
      inputBox.classList.remove('error');
      const errorMessage = inputBox.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.textContent = '';
      }
    }
    
    // Email validation
    if (input.type === 'email' && input.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        const inputBox = input.closest('.input-box');
        inputBox.classList.add('error');
        
        // Create error message if it doesn't exist
        let errorMessage = inputBox.querySelector('.error-message');
        if (!errorMessage) {
          errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          inputBox.appendChild(errorMessage);
        }
        errorMessage.textContent = 'Please enter a valid email address';
      }
    }
  });
  
  return isValid;
}

// Open modal
function openModal(modal) {
  if (!modal) return;
  
  const overlay = document.getElementById('overlay');
  
  modal.style.display = 'block';
  if (overlay) overlay.style.display = 'block';
  
  // Trigger reflow
  modal.offsetHeight;
  
  modal.classList.add('show');
  if (overlay) overlay.classList.add('show');
}

// Close modal
function closeModal(modal) {
  if (!modal) return;
  
  const overlay = document.getElementById('overlay');
  
  modal.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
  
  setTimeout(() => {
    modal.style.display = 'none';
    
    // Only hide overlay if no other modals are open
    const openModals = document.querySelectorAll('.modal.show');
    if (overlay && openModals.length === 0) {
      overlay.style.display = 'none';
    }
  }, 300);
}