// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize categories page
  initCategoriesPage();
  
  // Set current year in footer
  document.getElementById("current-year").textContent = new Date().getFullYear();
  
  // Navbar scroll effect
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
});

// Initialize categories page
function initCategoriesPage() {
  // Setup option buttons
  setupOptionButtons();
  
  // Setup view options
  setupViewOptions();
  
  // Setup recommendation slider
  setupRecommendationSlider();
  
  // Setup weather popup
  setupWeatherPopup();
  
  // Load featured plants
  loadFeaturedPlants();
  
  // Set user name
  setUserName();
  
  // Setup logout button
  setupLogoutButton();
}

// Setup option buttons
function setupOptionButtons() {
  const optionButtons = document.querySelectorAll('.option-btn');
  
  optionButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from siblings
      const siblings = this.parentElement.querySelectorAll('.option-btn');
      siblings.forEach(sibling => {
        sibling.classList.remove('active');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update recommendations based on selections
      updateRecommendations();
    });
  });
}

// Setup view options
function setupViewOptions() {
  const viewButtons = document.querySelectorAll('.view-btn');
  const categoriesGrid = document.querySelector('.categories-grid');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all view buttons
      viewButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update view
      const viewType = this.getAttribute('data-view');
      if (categoriesGrid) {
        if (viewType === 'list') {
          categoriesGrid.classList.add('list-view');
        } else {
          categoriesGrid.classList.remove('list-view');
        }
      }
    });
  });
}

// Setup recommendation slider
function setupRecommendationSlider() {
  const slider = document.getElementById('weatherRecommendations');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (slider && prevBtn && nextBtn) {
    // Previous button click
    prevBtn.addEventListener('click', function() {
      slider.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    });
    
    // Next button click
    nextBtn.addEventListener('click', function() {
      slider.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    });
  }
}

// Setup weather popup
function setupWeatherPopup() {
  const weatherCard = document.querySelector('.weather-card');
  const weatherPopup = document.getElementById('weatherPopup');
  const closePopupBtn = document.querySelector('.close-popup');
  
  if (weatherCard && weatherPopup && closePopupBtn) {
    // Open popup on weather card click
    weatherCard.addEventListener('click', function() {
      weatherPopup.style.display = 'block';
      setTimeout(() => {
        weatherPopup.classList.add('show');
      }, 10);
    });
    
    // Close popup on close button click
    closePopupBtn.addEventListener('click', function() {
      weatherPopup.classList.remove('show');
      setTimeout(() => {
        weatherPopup.style.display = 'none';
      }, 300);
    });
    
    // Close popup on outside click
    window.addEventListener('click', function(event) {
      if (event.target === weatherPopup) {
        weatherPopup.classList.remove('show');
        setTimeout(() => {
          weatherPopup.style.display = 'none';
        }, 300);
      }
    });
  }
}

// Update recommendations based on user selections
function updateRecommendations() {
  // Get selected options
  const environment = document.querySelector('.option-btn[data-value].active[data-value]')?.getAttribute('data-value') || 'indoor';
  const experience = document.querySelector('.option-buttons:nth-child(2) .option-btn.active')?.getAttribute('data-value') || 'beginner';
  const climate = document.querySelector('.option-buttons:nth-child(3) .option-btn.active')?.getAttribute('data-value') || 'temperate';
  const state = document.getElementById('stateSelect')?.value || '';
  
  // In a real app, this would make an API call to get personalized recommendations
  console.log('Updating recommendations based on:');
  console.log('Environment:', environment);
  console.log('Experience:', experience);
  console.log('Climate:', climate);
  console.log('State:', state);
  
  // For demo purposes, we'll just update the weather icon based on climate
  const weatherIcon = document.querySelector('.weather-icon i');
  if (weatherIcon) {
    switch (climate) {
      case 'tropical':
        weatherIcon.className = 'bx bx-sun';
        break;
      case 'temperate':
        weatherIcon.className = 'bx bx-cloud-light-rain';
        break;
      case 'arid':
        weatherIcon.className = 'bx bx-sun';
        break;
      case 'humid':
        weatherIcon.className = 'bx bx-cloud-drizzle';
        break;
      default:
        weatherIcon.className = 'bx bx-sun';
    }
  }
}

// Load featured plants
function loadFeaturedPlants() {
  const featuredGrid = document.querySelector('.featured-grid');
  
  if (!featuredGrid) return;
  
  // Sample featured plants data
  const featuredPlants = [
    {
      id: 1,
      name: "Red Sanders",
      category: "tree",
      state: "andhra-pradesh",
      price: 1200,
      originalPrice: 1500,
      discount: 20,
      rating: 4.8,
      image: "https://source.unsplash.com/random/300x300/?tree,red"
    },
    {
      id: 7,
      name: "Cardamom",
      category: "herb",
      state: "kerala",
      price: 350,
      originalPrice: 400,
      discount: 13,
      rating: 4.8,
      image: "https://source.unsplash.com/random/300x300/?cardamom,spice"
    },
    {
      id: 12,
      name: "Glory Lily",
      category: "climber",
      state: "tamil-nadu",
      price: 400,
      originalPrice: 450,
      discount: 11,
      rating: 4.8,
      image: "https://source.unsplash.com/random/300x300/?lily,flower"
    },
    {
      id: 24,
      name: "Flame of the Forest",
      category: "tree",
      state: "maharashtra",
      price: 700,
      originalPrice: 800,
      discount: 13,
      rating: 4.8,
      image: "https://source.unsplash.com/random/300x300/?orange,flower"
    }
  ];
  
  // Clear featured grid
  featuredGrid.innerHTML = '';
  
  // Add featured plants
  featuredPlants.forEach(plant => {
    featuredGrid.appendChild(createProductCard(plant));
  });
}

// Create product card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  // Calculate discount percentage
  const discountPercentage = product.discount;
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-actions">
        <button type="button" class="product-action-btn quick-view-btn" data-id="${product.id}">
          <i class='bx bx-search'></i>
        </button>
        <button type="button" class="product-action-btn wishlist-btn" data-id="${product.id}">
          <i class='bx bx-heart'></i>
        </button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
      <h3 class="product-title">${product.name}</h3>
      <div class="product-rating">
        <div class="product-rating-stars">
          ${generateRatingStars(product.rating)}
        </div>
        <span class="product-rating-count">(${Math.floor(Math.random() * 100) + 10})</span>
      </div>
      <div class="product-price">
        <span class="product-current-price">₹${product.price}</span>
        ${product.discount > 0 ? `
          <span class="product-original-price">₹${product.originalPrice}</span>
          <span class="product-discount">-${discountPercentage}%</span>
        ` : ''}
      </div>
      <div class="product-footer">
        <div class="product-state">
          <i class='bx bx-map'></i>
          <span>${formatState(product.state)}</span>
        </div>
        <button type="button" class="product-add-btn">
          <i class='bx bx-cart-add'></i> Add
        </button>
      </div>
    </div>
  `;
  
  return card;
}

// Generate rating stars
function generateRatingStars(rating) {
  let stars = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '<i class="bx bxs-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<i class="bx bxs-star-half"></i>';
    } else {
      stars += '<i class="bx bx-star"></i>';
    }
  }
  
  return stars;
}

// Format state name
function formatState(state) {
  return state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Set user name
function setUserName() {
  const userNameElement = document.getElementById('userName');
  
  if (userNameElement) {
    // In a real app, this would get the user's name from a session or localStorage
    // For demo purposes, we'll just set a sample name
    userNameElement.textContent = 'Gardener';
  }
}

// Setup logout button
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // In a real app, this would clear the user's session
      // For demo purposes, we'll just redirect to the login page
      window.location.href = 'login.html';
    });
  }
}

// Add product card styles
document.head.insertAdjacentHTML('beforeend', `
<style>
  /* Product Card Styles */
  .product-card {
    background-color: var(--color-white);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
    position: relative;
  }

  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }

  .product-card:hover .product-image img {
    transform: scale(1.05);
  }

  .product-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1;
  }

  .product-action-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--color-white);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-gray-700);
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
    opacity: 0;
    transform: translateX(20px);
  }

  .product-card:hover .product-action-btn {
    opacity: 1;
    transform: translateX(0);
  }

  .product-action-btn:nth-child(2) {
    transition-delay: 0.05s;
  }

  .product-action-btn:hover {
    background-color: var(--color-emerald-500);
    color: var(--color-white);
  }

  .product-info {
    padding: 15px;
  }

  .product-category {
    font-size: 12px;
    color: var(--color-gray-500);
    margin-bottom: 5px;
  }

  .product-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-gray-800);
    margin-bottom: 8px;
    transition: color var(--transition-normal);
  }

  .product-card:hover .product-title {
    color: var(--color-emerald-600);
  }

  .product-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
  }

  .product-rating-stars {
    display: flex;
  }

  .product-rating-stars i {
    color: var(--color-yellow-400);
    font-size: 14px;
  }

  .product-rating-count {
    font-size: 12px;
    color: var(--color-gray-500);
  }

  .product-price {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .product-current-price {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-emerald-700);
  }

  .product-original-price {
    font-size: 14px;
    color: var(--color-gray-500);
    text-decoration: line-through;
  }

  .product-discount {
    font-size: 12px;
    color: #ef4444;
    font-weight: 500;
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--color-gray-200);
  }

  .product-state {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--color-gray-600);
  }

  .product-state i {
    color: var(--color-emerald-500);
  }

  .product-add-btn {
    padding: 6px 12px;
    background-color: var(--color-emerald-500);
    color: var(--color-white);
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition-normal);
  }

  .product-add-btn:hover {
    background-color: var(--color-emerald-600);
  }
</style>
`);