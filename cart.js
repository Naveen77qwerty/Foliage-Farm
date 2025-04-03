// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart functionality
  initCart();
  
  // Initialize product carousel
  initProductCarousel();
  
  // Set current year in footer
  const yearElement = document.getElementById("current-year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();
  
  // Update cart count on all pages
  updateCartCount();
});

// Initialize cart functionality
function initCart() {
  // Get cart elements
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartActions = document.getElementById('cartActions');
  const cartSummary = document.getElementById('cartSummary');
  
  // Check if we're on the cart page
  if (!cartItems) return;
  
  // Clear existing cart items
  cartItems.innerHTML = `
    <div class="cart-header">
      <div class="cart-header-product">Product</div>
      <div class="cart-header-price">Price</div>
      <div class="cart-header-quantity">Quantity</div>
      <div class="cart-header-total">Total</div>
      <div class="cart-header-action"></div>
    </div>
  `;
  
  // Load cart items from localStorage
  const cart = JSON.parse(localStorage.getItem('plant_cart')) || [];
  
  // Check if cart is empty
  if (cart.length === 0) {
    showEmptyCart();
    return;
  }
  
  // Display cart items
  cart.forEach(item => {
    const cartItemElement = createCartItemElement(item);
    cartItems.appendChild(cartItemElement);
  });
  
  // Add event listeners to quantity buttons
  const quantityBtns = document.querySelectorAll('.quantity-btn');
  quantityBtns.forEach(btn => {
    btn.addEventListener('click', handleQuantityChange);
  });
  
  // Add event listeners to quantity inputs
  const quantityInputs = document.querySelectorAll('.quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', updateItemTotal);
  });
  
  // Add event listeners to remove buttons
  const removeButtons = document.querySelectorAll('.remove-item');
  removeButtons.forEach(button => {
    button.addEventListener('click', removeCartItem);
  });
  
  // Add event listener to update cart button
  const updateCartBtn = document.querySelector('.update-cart-btn');
  if (updateCartBtn) {
    updateCartBtn.addEventListener('click', updateCart);
  }
  
  // Add event listener to checkout button
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
  }
  
  // Add event listener to apply coupon button
  const applyCouponBtn = document.querySelector('.apply-coupon-btn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', applyCoupon);
  }
  
  // Initialize cart summary
  updateCartSummary();
}

// Create cart item element
function createCartItemElement(item) {
  const cartItemElement = document.createElement('div');
  cartItemElement.className = 'cart-item';
  cartItemElement.dataset.id = item.id;
  
  cartItemElement.innerHTML = `
    <div class="cart-item-product">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <p class="cart-item-meta">Size: Medium, Pot: Ceramic</p>
      </div>
    </div>
    <div class="cart-item-price">₹${item.price}</div>
    <div class="cart-item-quantity">
      <button class="quantity-btn decrease" aria-label="Decrease quantity">
        <i class='bx bx-minus'></i>
      </button>
      <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-price="${item.price}">
      <button class="quantity-btn increase" aria-label="Increase quantity">
        <i class='bx bx-plus'></i>
      </button>
    </div>
    <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
    <div class="cart-item-action">
      <button class="remove-item" aria-label="Remove item">
        <i class='bx bx-trash'></i>
      </button>
    </div>
  `;
  
  return cartItemElement;
}

// Handle quantity change
function handleQuantityChange(e) {
  const btn = e.currentTarget;
  const isIncrease = btn.classList.contains('increase');
  const input = btn.parentElement.querySelector('.quantity-input');
  let value = parseInt(input.value);
  
  if (isIncrease) {
    if (value < parseInt(input.max)) {
      value++;
    }
  } else {
    if (value > parseInt(input.min)) {
      value--;
    }
  }
  
  input.value = value;
  
  // Add pulse animation to quantity
  input.classList.add('pulse');
  setTimeout(() => {
    input.classList.remove('pulse');
  }, 500);
  
  // Update item total
  updateItemTotal({ target: input });
  
  // Update cart in localStorage
  updateCartItemQuantity(input);
}

// Update cart item quantity in localStorage
function updateCartItemQuantity(input) {
  const cartItem = input.closest('.cart-item');
  const itemId = cartItem.dataset.id;
  const quantity = parseInt(input.value);
  
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('plant_cart')) || [];
  
  // Find and update item
  const itemIndex = cart.findIndex(item => item.id == itemId);
  if (itemIndex !== -1) {
    cart[itemIndex].quantity = quantity;
    
    // Save updated cart
    localStorage.setItem('plant_cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
  }
}

// Update item total
function updateItemTotal(e) {
  const input = e.target;
  const cartItem = input.closest('.cart-item');
  const price = parseFloat(input.dataset.price);
  const quantity = parseInt(input.value);
  const totalElement = cartItem.querySelector('.cart-item-total');
  
  const total = (price * quantity).toFixed(2);
  totalElement.textContent = `₹${total}`;
  
  // Add highlight animation to total
  totalElement.classList.add('highlight');
  setTimeout(() => {
    totalElement.classList.remove('highlight');
  }, 500);
  
  // Update cart summary
  updateCartSummary();
}

// Remove cart item
function removeCartItem(e) {
  const btn = e.currentTarget;
  const cartItem = btn.closest('.cart-item');
  const itemId = cartItem.dataset.id;
  const cartItems = document.getElementById('cartItems');
  
  // Add removing animation
  cartItem.classList.add('removing');
  
  // Remove item from localStorage
  let cart = JSON.parse(localStorage.getItem('plant_cart')) || [];
  cart = cart.filter(item => item.id != itemId);
  localStorage.setItem('plant_cart', JSON.stringify(cart));
  
  // Remove item after animation completes
  setTimeout(() => {
    cartItem.remove();
    
    // Check if cart is empty
    const remainingItems = cartItems.querySelectorAll('.cart-item:not(.cart-header)');
    if (remainingItems.length === 0) {
      showEmptyCart();
    } else {
      // Update cart summary
      updateCartSummary();
    }
    
    // Update cart count
    updateCartCount();
  }, 500);
}

// Show empty cart
function showEmptyCart() {
  const cartItems = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartActions = document.getElementById('cartActions');
  const cartSummary = document.getElementById('cartSummary');
  
  if (cartItems) cartItems.style.display = 'none';
  if (emptyCart) emptyCart.style.display = 'block';
  if (cartActions) cartActions.style.display = 'none';
  if (cartSummary) cartSummary.style.display = 'none';
}

// Update cart
function updateCart() {
  // Simulate updating cart with server
  const updateBtn = document.querySelector('.update-cart-btn');
  
  // Show loading state
  updateBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Updating...</span>';
  updateBtn.disabled = true;
  
  // Simulate delay
  setTimeout(() => {
    // Reset button
    updateBtn.innerHTML = '<i class="bx bx-refresh"></i><span>Update Cart</span>';
    updateBtn.disabled = false;
    
    // Show success message
    showToast('Cart updated successfully!');
    
    // Update cart summary
    updateCartSummary();
  }, 1500);
}

// Update cart summary
function updateCartSummary() {
  // Get all cart items
  const cartItems = document.querySelectorAll('.cart-item');
  
  // Calculate subtotal
  let subtotal = 0;
  cartItems.forEach(item => {
    const totalText = item.querySelector('.cart-item-total').textContent;
    subtotal += parseFloat(totalText.replace('₹', ''));
  });
  
  // Calculate shipping, tax, and total
  const shipping = subtotal > 100 ? 0 : 5.99;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;
  
  // Update summary elements
  document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
  document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
  
  // Update cart count in navbar
  updateCartCount();
}

// Update cart count in navbar
function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  if (!cartCount) return;
  
  const cart = JSON.parse(localStorage.getItem('plant_cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCount.textContent = totalItems;
  
  // Add pulse animation
  cartCount.classList.add('pulse');
  setTimeout(() => {
    cartCount.classList.remove('pulse');
  }, 500);
}

// Proceed to checkout
function proceedToCheckout() {
  // Simulate checkout process
  const checkoutBtn = document.querySelector('.checkout-btn');
  
  // Show loading state
  checkoutBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Processing...</span>';
  checkoutBtn.disabled = true;
  
  // Create and show loading animation
  createPageTransitionOverlay();
  
  // Show loading animation
  setTimeout(() => {
    document.getElementById('pageTransitionOverlay').classList.add('active');
    
    // Simulate redirect after delay
    setTimeout(() => {
      // For demo purposes, just reset the button
      checkoutBtn.innerHTML = '<span>Proceed to Checkout</span><i class="bx bx-right-arrow-alt"></i>';
      checkoutBtn.disabled = false;
      
      // Hide loading animation
      document.getElementById('pageTransitionOverlay').classList.remove('active');
      
      // Show success message
      showToast('Checkout functionality coming soon!');
    }, 2000);
  }, 500);
}

// Apply coupon
function applyCoupon() {
  const couponInput = document.querySelector('.coupon-input');
  const couponValue = couponInput.value.trim();
  
  if (!couponValue) {
    showToast('Please enter a coupon code', 'error');
    return;
  }
  
  // Simulate coupon validation
  const applyCouponBtn = document.querySelector('.apply-coupon-btn');
  
  // Show loading state
  applyCouponBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
  applyCouponBtn.disabled = true;
  
  // Simulate delay
  setTimeout(() => {
    // Reset button
    applyCouponBtn.innerHTML = 'Apply Coupon';
    applyCouponBtn.disabled = false;
    
    // Check coupon code
    if (couponValue.toUpperCase() === 'PLANT10') {
      // Valid coupon
      showToast('Coupon applied successfully! 10% discount added.');
      
      // Update cart summary with discount
      applyDiscount(0.1);
    } else {
      // Invalid coupon
      showToast('Invalid coupon code. Please try again.', 'error');
    }
  }, 1000);
}

// Apply discount to cart
function applyDiscount(discountRate) {
  // Get subtotal
  const subtotalElement = document.getElementById('subtotal');
  const subtotal = parseFloat(subtotalElement.textContent.replace('₹', ''));
  
  // Calculate discount
  const discount = subtotal * discountRate;
  
  // Create or update discount row
  let discountRow = document.querySelector('.discount-row');
  
  if (!discountRow) {
    // Create new discount row
    discountRow = document.createElement('div');
    discountRow.className = 'summary-row discount-row';
    
    const discountLabel = document.createElement('span');
    discountLabel.textContent = 'Discount (10%)';
    
    const discountValue = document.createElement('span');
    discountValue.id = 'discount';
    discountValue.textContent = `-₹${discount.toFixed(2)}`;
    
    discountRow.appendChild(discountLabel);
    discountRow.appendChild(discountValue);
    
    // Insert before total row
    const totalRow = document.querySelector('.summary-row.total');
    totalRow.parentNode.insertBefore(discountRow, totalRow);
  } else {
    // Update existing discount row
    const discountValue = discountRow.querySelector('#discount');
    discountValue.textContent = `-₹${discount.toFixed(2)}`;
  }
  
  // Update total
  updateCartSummary();
  
  // Add highlight animation to discount row
  discountRow.classList.add('highlight');
  setTimeout(() => {
    discountRow.classList.remove('highlight');
  }, 1000);
}

// Initialize product carousel
function initProductCarousel() {
  // For a real carousel, you would use a library like Swiper or implement custom carousel logic
  // This is a simplified version for demo purposes
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach((card, index) => {
    // Add staggered animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}

// Show toast message
function showToast(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }
      
      .toast {
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      
      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .toast.success {
        background-color: #10b981;
      }
      
      .toast.error {
        background-color: #ef4444;
      }
      
      .toast i {
        font-size: 20px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Add icon based on type
  const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
  
  toast.innerHTML = `
    <i class='bx ${icon}'></i>
    <span>${message}</span>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Remove toast after delay
  setTimeout(() => {
    toast.classList.remove('show');
    
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
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
  
  // Add event listener to close button
  const closeBtn = modal.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(modal));
  }
  
  // Add event listener to continue shopping button
  const continueBtn = modal.querySelector('.continue-shopping-btn');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => closeModal(modal));
  }
  
  // Add event listener to overlay for closing
  if (overlay) {
    overlay.addEventListener('click', () => closeModal(modal));
  }
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

// Create page transition overlay
function createPageTransitionOverlay() {
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
}

// Add keydown event for Escape key to close modals
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      closeModal(modal);
    });
  }
});

// Add animation styles for cart items
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    .pulse {
      animation: pulse 0.5s ease;
    }
    
    @keyframes highlight {
      0%, 100% {
        background-color: transparent;
      }
      50% {
        background-color: rgba(16, 185, 129, 0.1);
      }
    }
    
    .highlight {
      animation: highlight 1s ease;
    }
    
    .discount-row {
      color: #10b981;
      font-weight: 600;
    }
  </style>
`);