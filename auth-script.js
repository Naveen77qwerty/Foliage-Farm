// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize form elements
  initializeFormElements();
  
  // Add form validation
  setupFormValidation();
  
  // Add password toggle functionality
  setupPasswordToggle();
  
  // Add password strength meter
  setupPasswordStrength();
  
  // Add form submission handling
  setupFormSubmission();
  
  // Add floating leaves animation
  animateFloatingLeaves();
  
  // Setup modal functionality
  setupModals();
  
  // Setup social login buttons
  setupSocialLogin();
});

// Initialize form elements with animations
function initializeFormElements() {
  // Set custom properties for leaf animations
  const leaves = document.querySelectorAll('.leaf');
  leaves.forEach((leaf, index) => {
    const rotation = Math.random() * 90 - 45;
    const scale = 0.6 + Math.random() * 0.5;
    leaf.style.setProperty('--rotation', `${rotation}deg`);
    leaf.style.setProperty('--scale', scale);
  });
  
  // Focus first input field with animation
  setTimeout(() => {
    const firstInput = document.querySelector('.input-box input');
    if (firstInput) {
      firstInput.focus();
    }
  }, 1500);
}

// Setup form validation
function setupFormValidation() {
  const form = document.querySelector('.auth-form');
  if (!form) return;
  
  const inputs = form.querySelectorAll('input[required]');
  
  inputs.forEach(input => {
    // Add blur event to validate when user leaves the field
    input.addEventListener('blur', function() {
      validateInput(this);
    });
    
    // Add input event to validate in real-time
    input.addEventListener('input', function() {
      validateInput(this, true);
    });
  });
  
  // Special validation for confirm password
  const confirmPassword = document.getElementById('confirm-password');
  if (confirmPassword) {
    confirmPassword.addEventListener('input', function() {
      const password = document.getElementById('password');
      if (password && this.value !== password.value) {
        setInputError(this, 'Passwords do not match');
      } else {
        clearInputError(this);
      }
    });
  }
}

// Validate individual input field
function validateInput(input, isTyping = false) {
  // Skip validation while typing for better UX
  if (isTyping && input.type !== 'password') return;
  
  const inputBox = input.closest('.input-box');
  
  // Check if input is empty
  if (input.value.trim() === '') {
    setInputError(input, 'This field is required');
    return false;
  }
  
  // Email validation
  if (input.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      setInputError(input, 'Please enter a valid email address');
      return false;
    }
  }
  
  // Password validation
  if (input.type === 'password' && input.id === 'password') {
    if (input.value.length < 6) {
      setInputError(input, 'Password must be at least 6 characters');
      return false;
    }
  }
  
  // Clear error if validation passes
  clearInputError(input);
  return true;
}

// Set error state for input
function setInputError(input, message) {
  const inputBox = input.closest('.input-box');
  inputBox.classList.add('error');
  
  // Create or update error message
  let errorMessage = inputBox.querySelector('.error-message');
  if (!errorMessage) {
    errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    inputBox.appendChild(errorMessage);
  }
  errorMessage.textContent = message;
}

// Clear error state for input
function clearInputError(input) {
  const inputBox = input.closest('.input-box');
  inputBox.classList.remove('error');
  
  const errorMessage = inputBox.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.textContent = '';
  }
}

// Setup password toggle functionality
function setupPasswordToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-password');
  if (!toggleBtns.length) return;
  
  toggleBtns.forEach(toggleBtn => {
    toggleBtn.addEventListener('click', function() {
      const passwordInput = this.parentElement.querySelector('input');
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icon
      const icon = this.querySelector('i');
      if (type === 'text') {
        icon.classList.remove('bxs-show');
        icon.classList.add('bxs-hide');
      } else {
        icon.classList.remove('bxs-hide');
        icon.classList.add('bxs-show');
      }
    });
  });
}

// Setup password strength meter
function setupPasswordStrength() {
  const passwordInput = document.getElementById('password');
  const strengthBar = document.querySelector('.strength-bar');
  
  if (!passwordInput || !strengthBar) return;
  
  passwordInput.addEventListener('input', function() {
    const value = this.value;
    let strength = 0;
    
    // Calculate password strength
    if (value.length >= 6) strength += 20;
    if (value.length >= 10) strength += 20;
    if (/[A-Z]/.test(value)) strength += 20;
    if (/[0-9]/.test(value)) strength += 20;
    if (/[^A-Za-z0-9]/.test(value)) strength += 20;
    
    // Update strength bar
    strengthBar.style.width = `${strength}%`;
    
    // Update color based on strength
    if (strength <= 40) {
      strengthBar.style.background = '#ff4d4d'; // Weak
    } else if (strength <= 80) {
      strengthBar.style.background = '#ffb84d'; // Medium
    } else {
      strengthBar.style.background = '#4dff4d'; // Strong
    }
  });
}

// Setup form submission with loading animation
function setupFormSubmission() {
  const form = document.querySelector('.auth-form');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all required fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!validateInput(input)) {
        isValid = false;
      }
    });
    
    // Check if passwords match for signup form
    const confirmPassword = document.getElementById('confirm-password');
    const password = document.getElementById('password');
    if (confirmPassword && password && confirmPassword.value !== password.value) {
      setInputError(confirmPassword, 'Passwords do not match');
      isValid = false;
    }
    
    // If form is valid, show loading animation and redirect
    if (isValid) {
      // Create loading overlay if it doesn't exist
      createLoadingAnimation();
      
      // Show loading animation
      document.getElementById('pageTransitionOverlay').classList.add('active');
      
      // Redirect after animation
      setTimeout(() => {
        window.location.href = form.getAttribute('action');
      }, 2500);
    } else {
      // Shake form on error
      form.classList.add('shake');
      setTimeout(() => {
        form.classList.remove('shake');
      }, 500);
    }
  });
}

// Create loading animation overlay
function createLoadingAnimation() {
  // Check if overlay already exists
  if (document.getElementById('pageTransitionOverlay')) return;
  
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
  
  // Add CSS for the loading animation
  const style = document.createElement('style');
  style.textContent = `
    .page-transition-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(6, 95, 70, 0.97), rgba(6, 78, 59, 0.99));
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    }
    
    .page-transition-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
    }
    
    .plant-container {
      position: relative;
      width: 120px;
      height: 200px;
    }
    
    .soil {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 30px;
      background: #5c4033;
      border-radius: 50% 50% 0 0 / 20% 20% 0 0;
      transform-origin: bottom;
      animation: soilAppear 0.5s ease forwards;
    }
    
    .stem {
      position: absolute;
      bottom: 30px;
      left: 50%;
      width: 8px;
      height: 0;
      background: #10b981;
      transform: translateX(-50%);
      animation: stemGrow 1.5s ease forwards 0.5s;
    }
    
    .growing-leaf {
      position: absolute;
      width: 0;
      height: 0;
      background: #34d399;
      border-radius: 50% 50% 50% 0;
      transform-origin: bottom left;
      opacity: 0;
    }
    
    .growing-leaf-1 {
      top: 20%;
      right: 0;
      animation: leafGrow 0.6s ease forwards 1s;
    }
    
    .growing-leaf-2 {
      top: 40%;
      left: 0;
      transform: scaleX(-1);
      animation: leafGrow 0.6s ease forwards 1.2s;
    }
    
    .growing-leaf-3 {
      top: 60%;
      right: 0;
      animation: leafGrow 0.6s ease forwards 1.4s;
    }
    
    .growing-leaf-4 {
      top: 80%;
      left: 0;
      transform: scaleX(-1);
      animation: leafGrow 0.6s ease forwards 1.6s;
    }
    
    .growing-leaf-5 {
      top: 0;
      left: 50%;
      transform: translateX(-50%) rotate(-90deg);
      border-radius: 50% 50% 0 50%;
      animation: topLeafGrow 0.8s ease forwards 1.8s;
    }
    
    .loading-text {
      color: white;
      font-size: 24px;
      font-weight: 500;
      letter-spacing: 2px;
      animation: textPulse 1.5s ease-in-out infinite;
    }
    
    @keyframes soilAppear {
      from {
        transform: scaleX(0);
        opacity: 0;
      }
      to {
        transform: scaleX(1);
        opacity: 1;
      }
    }
    
    @keyframes stemGrow {
      from {
        height: 0;
      }
      to {
        height: 170px;
      }
    }
    
    @keyframes leafGrow {
      0% {
        width: 0;
        height: 0;
        opacity: 0;
      }
      100% {
        width: 40px;
        height: 30px;
        opacity: 1;
      }
    }
    
    @keyframes topLeafGrow {
      0% {
        width: 0;
        height: 0;
        opacity: 0;
      }
      100% {
        width: 50px;
        height: 50px;
        opacity: 1;
      }
    }
    
    @keyframes textPulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
      animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
  `;
  
  document.head.appendChild(style);
}

// Animate floating leaves
function animateFloatingLeaves() {
  const leaves = document.querySelectorAll('.leaf');
  
  leaves.forEach((leaf, index) => {
    // Set random initial positions
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    leaf.style.left = `${randomX}%`;
    leaf.style.top = `${randomY}%`;
  });
}

// Setup modals
function setupModals() {
  // Forgot password modal
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  
  if (forgotPasswordLink && forgotPasswordModal) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(forgotPasswordModal);
    });
  }
  
  // Terms modal
  const termsLink = document.getElementById('termsLink');
  const termsModal = document.getElementById('termsModal');
  
  if (termsLink && termsModal) {
    termsLink.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(termsModal);
    });
  }
  
  // Privacy modal
  const privacyLink = document.getElementById('privacyLink');
  const privacyModal = document.getElementById('privacyModal');
  
  if (privacyLink && privacyModal) {
    privacyLink.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(privacyModal);
    });
  }
  
  // Close buttons
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // Modal buttons
  const modalButtons = document.querySelectorAll('.modal-btn');
  modalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // Overlay click to close
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', function() {
      const openModals = document.querySelectorAll('.modal.show');
      openModals.forEach(modal => {
        closeModal(modal);
      });
    });
  }
  
  // Reset password form submission
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim() !== '') {
        // Show success message
        const modalContent = this.closest('.modal-content');
        modalContent.innerHTML = `
          <div class="success-message">
            <i class='bx bx-check-circle' style="font-size: 40px; color: var(--color-emerald-500);"></i>
            <h3>Reset Link Sent!</h3>
            <p>We've sent a password reset link to ${emailInput.value}. Please check your inbox.</p>
            <button class="btn modal-btn" style="margin-top: 20px;">Close</button>
          </div>
        `;
        
        // Add event listener to new close button
        const newCloseButton = modalContent.querySelector('.modal-btn');
        newCloseButton.addEventListener('click', function() {
          closeModal(forgotPasswordModal);
        });
      }
    });
  }
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

// Setup social login
function setupSocialLogin() {
  const socialButtons = document.querySelectorAll('.social-btn');
  const socialLoginModal = document.getElementById('socialLoginModal');
  const socialLoginTitle = document.getElementById('socialLoginTitle');
  const socialIconLarge = document.getElementById('socialIconLarge');
  
  if (!socialButtons.length || !socialLoginModal) return;
  
  socialButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get provider from button class
      let provider = '';
      if (this.classList.contains('google')) provider = 'Google';
      else if (this.classList.contains('facebook')) provider = 'Facebook';
      else if (this.classList.contains('apple')) provider = 'Apple';
      
      // Update modal content
      if (socialLoginTitle) {
        socialLoginTitle.textContent = `Continue with ${provider}`;
      }
      
      // Update icon
      if (socialIconLarge) {
        socialIconLarge.className = 'social-icon-large';
        socialIconLarge.classList.add(provider.toLowerCase());
        socialIconLarge.innerHTML = `<i class='bx bxl-${provider.toLowerCase()}'></i>`;
      }
      
      // Open modal
      openModal(socialLoginModal);
      
      // Add event listener to continue button
      const continueBtn = socialLoginModal.querySelector('.continue-btn');
      if (continueBtn) {
        continueBtn.onclick = function() {
          // Show loading state
          this.innerHTML = '<span>Connecting...</span> <i class="bx bx-loader-alt bx-spin"></i>';
          this.disabled = true;
          
          // Create and show loading animation
          createLoadingAnimation();
          
          // Close modal and show loading animation
          closeModal(socialLoginModal);
          setTimeout(() => {
            document.getElementById('pageTransitionOverlay').classList.add('active');
            
            // Simulate redirect after delay
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 2500);
          }, 500);
        };
      }
    });
  });
}

// Add keydown event for form navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.tagName.toLowerCase() === 'input') {
    const form = e.target.closest('form');
    const inputs = Array.from(form.querySelectorAll('input:not([type="checkbox"])'));
    const index = inputs.indexOf(e.target);
    
    if (index < inputs.length - 1) {
      e.preventDefault();
      inputs[index + 1].focus();
    }
  }
  
  // Close modal on Escape key
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      closeModal(modal);
    });
  }
});

// Add direct link transitions
document.addEventListener('click', function(e) {
  // Check if clicked element is a link
  if (e.target.tagName === 'A' || e.target.closest('a')) {
    const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
    const href = link.getAttribute('href');
    
    // Only handle internal links
    if (href && href !== '#' && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !link.getAttribute('target')) {
      e.preventDefault();
      
      // Create and show loading animation
      createLoadingAnimation();
      document.getElementById('pageTransitionOverlay').classList.add('active');
      
      // Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 2500);
    }
  }
});

// Check if page was just loaded via transition
window.addEventListener('load', function() {
  // Add a class to body when page is loaded
  document.body.classList.add('page-loaded');
  
  // Add entrance animation for auth form
  const authForm = document.querySelector('.auth-form');
  if (authForm) {
    authForm.classList.add('animate-entrance');
  }
});