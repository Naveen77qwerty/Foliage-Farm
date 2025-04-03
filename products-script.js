// Import API service
import { fetchPlants, fetchFilteredPlants, fetchPlantById, fetchCareGuide, fetchHardinessMap } from './api-service.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize products page
  initProductsPage();
  
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
  
  // Update cart count
  updateCartCount();
});

// Initialize products page
async function initProductsPage() {
  try {
    // Setup filter toggles
    setupFilterToggles();
    
    // Setup mobile filters toggle
    setupMobileFilters();
    
    // Setup rating slider
    setupRatingSlider();
    
    // Setup filter search
    setupFilterSearch();
    
    // Setup clear filters button
    setupClearFilters();
    
    // Setup sort select
    setupSortSelect();
    
    // Setup price filter
    setupPriceFilter();
    
    // Store current page in global variable
    window.currentPage = 1;
    
    // Load initial products
    await loadProducts();
    
    // Setup filter change event
    setupFilterChangeEvent();
    
    // Setup quick view modal
    setupQuickViewModal();
  } catch (error) {
    console.error('Error initializing products page:', error);
    showError('Failed to load products. Please try again later.');
  }
}

// Setup filter toggles
function setupFilterToggles() {
  const filterTitles = document.querySelectorAll('.filter-title');
  
  filterTitles.forEach(title => {
    title.addEventListener('click', function() {
      this.classList.toggle('collapsed');
    });
  });
}

// Setup mobile filters toggle
function setupMobileFilters() {
  const toggleFiltersBtn = document.getElementById('toggleFilters');
  const filtersSidebar = document.querySelector('.filters-sidebar');
  const overlay = document.getElementById('overlay');
  
  if (toggleFiltersBtn && filtersSidebar) {
    toggleFiltersBtn.addEventListener('click', function() {
      filtersSidebar.classList.add('show');
      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.classList.add('show');
      }, 10);
    });
    
    // Close filters on overlay click
    overlay.addEventListener('click', function() {
      filtersSidebar.classList.remove('show');
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    });
  }
}

// Setup rating slider
function setupRatingSlider() {
  const ratingSlider = document.getElementById('ratingSlider');
  const ratingValue = document.getElementById('ratingValue');
  const ratingStars = document.querySelector('.rating-stars');
  
  if (ratingSlider && ratingValue) {
    ratingSlider.addEventListener('input', function() {
      ratingValue.textContent = this.value;
      
      // Update stars
      if (ratingStars) {
        const stars = ratingStars.querySelectorAll('i');
        const value = parseFloat(this.value);
        
        stars.forEach((star, index) => {
          if (index < Math.floor(value)) {
            star.className = 'bx bxs-star';
          } else if (index === Math.floor(value) && value % 1 !== 0) {
            star.className = 'bx bxs-star-half';
          } else {
            star.className = 'bx bx-star';
          }
        });
      }
      
      // Trigger filter change
      triggerFilterChange();
    });
  }
}

// Setup filter search
function setupFilterSearch() {
  const filterSearchInputs = document.querySelectorAll('.filter-search input');
  
  filterSearchInputs.forEach(input => {
    input.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const filterOptions = this.closest('.filter-options').querySelectorAll('.filter-option');
      
      filterOptions.forEach(option => {
        const text = option.querySelector('span:last-child').textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          option.style.display = 'flex';
        } else {
          option.style.display = 'none';
        }
      });
    });
  });
  
  // Main search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      triggerFilterChange();
    });
  }
}

// Setup clear filters button
function setupClearFilters() {
  const clearFiltersBtn = document.getElementById('clearFilters');
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      // Clear all checkboxes
      const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Reset rating slider
      const ratingSlider = document.getElementById('ratingSlider');
      if (ratingSlider) {
        ratingSlider.value = 1;
        const event = new Event('input');
        ratingSlider.dispatchEvent(event);
      }
      
      // Clear price inputs
      const minPriceInput = document.getElementById('minPrice');
      const maxPriceInput = document.getElementById('maxPrice');
      if (minPriceInput && maxPriceInput) {
        minPriceInput.value = '';
        maxPriceInput.value = '';
      }
      
      // Clear search input
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = '';
      }
      
      // Clear active filters
      const activeFilters = document.getElementById('activeFilters');
      if (activeFilters) {
        activeFilters.innerHTML = '';
      }
      
      // Reload products
      loadProducts();
    });
  }
}

// Setup sort select
function setupSortSelect() {
  const sortSelect = document.getElementById('sortSelect');
  
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      triggerFilterChange();
    });
  }
}

// Setup price filter
function setupPriceFilter() {
  const applyPriceBtn = document.getElementById('applyPriceFilter');
  
  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', function() {
      triggerFilterChange();
    });
  }
}

// Setup filter change event
function setupFilterChangeEvent() {
  // Get all filter checkboxes
  const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  
  // Add event listener to each checkbox
  filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // Trigger filter change after a small delay to allow for multiple selections
      triggerFilterChange();
    });
  });
  
  // Add event listener to rating slider
  const ratingSlider = document.getElementById('ratingSlider');
  if (ratingSlider) {
    ratingSlider.addEventListener('change', triggerFilterChange);
  }
  
  // Add event listener to price filter button
  const applyPriceBtn = document.getElementById('applyPriceFilter');
  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', triggerFilterChange);
  }
  
  // Add event listener to sort select
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', triggerFilterChange);
  }
}

// Add a function to reinitialize UI components after filtering
function reinitializeUI() {
  // Make sure cart count is updated
  updateCartCount();
  
  // Ensure Boxicons are properly refreshed
  if (typeof Boxicons !== 'undefined') {
    Boxicons.refresh();
  }
  
  // Re-attach event listeners to filter checkboxes
  setupFilterChangeEvent();
  
  // Add event listeners for add to cart buttons
  const addToCartButtons = document.querySelectorAll('.product-add-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const card = button.closest('.product-card');
      const id = card.getAttribute('data-id');
      const name = card.querySelector('.product-title').textContent;
      const price = parseFloat(card.querySelector('.product-current-price').textContent.replace('₹', ''));
      const image = card.querySelector('.product-image img').getAttribute('src');
      
      const product = {
        id: id,
        name: name,
        price: price,
        image: image,
        quantity: 1
      };
      
      addProductToCart(product);
    });
  });
}

// Trigger filter change
async function triggerFilterChange() {
  // Get active filters
  const filters = getActiveFilters();
  
  // Update active filters display
  updateActiveFiltersDisplay(filters);
  
  // Load filtered products
  await loadProducts(1);
  
  // Reinitialize UI components after filtering
  reinitializeUI();
}

// Get active filters
function getActiveFilters() {
  const filters = {
    search: document.getElementById('searchInput')?.value || '',
    state: [],
    environment: [],
    weather: [],
    soil: [],
    terrain: [],
    category: [],
    usage: [],
    rating: parseFloat(document.getElementById('ratingSlider')?.value || 1),
    price: {
      min: document.getElementById('minPrice')?.value || null,
      max: document.getElementById('maxPrice')?.value || null
    }
  };
  
  // Get checkbox filters
  const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]:checked');
  filterCheckboxes.forEach(checkbox => {
    if (checkbox.name in filters) {
      if (checkbox.value === 'all') return; // Skip "All" options
      filters[checkbox.name].push(checkbox.value);
    }
  });
  
  return filters;
}

// Update active filters display
function updateActiveFiltersDisplay(filters) {
  const activeFilters = document.getElementById('activeFilters');
  if (!activeFilters) return;
  
  activeFilters.innerHTML = '';
  
  // Add search filter
  if (filters.search) {
    addActiveFilter(activeFilters, 'Search', filters.search);
  }
  
  // Add checkbox filters
  const filterGroups = ['state', 'environment', 'weather', 'soil', 'terrain', 'category', 'usage'];
  filterGroups.forEach(group => {
    filters[group].forEach(value => {
      // Format the value for display (capitalize first letter and replace hyphens with spaces)
      const displayValue = value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const displayGroup = group.charAt(0).toUpperCase() + group.slice(1);
      
      addActiveFilter(activeFilters, displayGroup, displayValue);
    });
  });
  
  // Add rating filter
  if (filters.rating > 1) {
    addActiveFilter(activeFilters, 'Rating', `${filters.rating}+ Stars`);
  }
  
  // Add price filter
  if (filters.price.min || filters.price.max) {
    let priceText = '';
    if (filters.price.min && filters.price.max) {
      priceText = `₹${filters.price.min} - ₹${filters.price.max}`;
    } else if (filters.price.min) {
      priceText = `Min: ₹${filters.price.min}`;
    } else if (filters.price.max) {
      priceText = `Max: ₹${filters.price.max}`;
    }
    
    addActiveFilter(activeFilters, 'Price', priceText);
  }
}

// Add active filter
function addActiveFilter(container, type, value) {
  const filterElement = document.createElement('div');
  filterElement.className = 'active-filter';
  filterElement.innerHTML = `
    <span>${type}: ${value}</span>
    <button type="button" data-type="${type}" data-value="${value}">
      <i class='bx bx-x'></i>
    </button>
  `;
  
  // Add click event to remove filter
  const removeBtn = filterElement.querySelector('button');
  removeBtn.addEventListener('click', function() {
    const type = this.getAttribute('data-type');
    const value = this.getAttribute('data-value');
    
    removeFilter(type, value);
    filterElement.remove();
  });
  
  container.appendChild(filterElement);
}

// Remove filter
function removeFilter(type, value) {
  if (type === 'Search') {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
  } else if (type === 'Rating') {
    const ratingSlider = document.getElementById('ratingSlider');
    if (ratingSlider) {
      ratingSlider.value = 1;
      const event = new Event('input');
      ratingSlider.dispatchEvent(event);
    }
  } else if (type === 'Price') {
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    if (minPriceInput && maxPriceInput) {
      minPriceInput.value = '';
      maxPriceInput.value = '';
    }
  } else {
    // Convert display value back to filter value
    const filterValue = value.toLowerCase().replace(/ /g, '-');
    
    // Find and uncheck the corresponding checkbox
    const checkbox = document.querySelector(`.filter-option input[name="${type.toLowerCase()}"][value="${filterValue}"]`);
    if (checkbox) {
      checkbox.checked = false;
    }
  }
  
  triggerFilterChange();
}

// Filter products
function filterProducts(products, filters) {
  return products.filter(product => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        product.name.toLowerCase(),
        product.scientificName.toLowerCase(),
        product.description.toLowerCase()
      ];
      
      if (!searchFields.some(field => field.includes(searchTerm))) {
        return false;
      }
    }
    
    // State filter
    if (filters.state.length > 0 && !filters.state.includes(product.state)) {
      return false;
    }
    
    // Environment filter
    if (filters.environment.length > 0 && !filters.environment.includes(product.environment) && !filters.environment.includes('both')) {
      return false;
    }
    
    // Weather filter
    if (filters.weather.length > 0 && !filters.weather.includes(product.weather)) {
      return false;
    }
    
    // Soil filter
    if (filters.soil.length > 0 && !filters.soil.includes(product.soil)) {
      return false;
    }
    
    // Terrain filter
    if (filters.terrain.length > 0 && !filters.terrain.includes(product.terrain)) {
      return false;
    }
    
    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(product.category)) {
      return false;
    }
    
    // Usage filter
    if (filters.usage.length > 0 && !filters.usage.some(usage => product.usage.includes(usage))) {
      return false;
    }
    
    // Rating filter
    if (product.rating < filters.rating) {
      return false;
    }
    
    // Price filter
    if (filters.price.min && product.price < filters.price.min) {
      return false;
    }
    
    if (filters.price.max && product.price > filters.price.max) {
      return false;
    }
    
    return true;
  });
}

// Sort products
function sortProducts(products) {
  const sortSelect = document.getElementById('sortSelect');
  const sortValue = sortSelect ? sortSelect.value : 'featured';
  
  const sortedProducts = [...products];
  
  switch (sortValue) {
    case 'name-asc':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      sortedProducts.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // Featured - no sorting needed
      break;
  }
  
  return sortedProducts;
}

// Load products
async function loadProducts(page = 1) {
  const productsGrid = document.getElementById('productsGrid');
  const productCount = document.getElementById('productCount');
  const apiStatus = document.getElementById('apiStatus');
  const apiStatusText = document.getElementById('apiStatusText');
  
  if (!productsGrid) return;
  
  // Show loading state
  productsGrid.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading Plants...</p>
    </div>
  `;
  
  // Set current page
  window.currentPage = page;
  
  try {
    // Get active filters
    const filters = getActiveFilters();
    filters.page = page;
    
    // Start timing the request
    const startTime = performance.now();
    
    // Track which data source we're using
    let sourceType = 'api';
    
    // Initialize products array
    let products = [];
    
    // Map filter parameters to API parameters
    filters.apiParams = {};
    
    // Add page parameter
    filters.apiParams.page = page;
    filters.apiParams.per_page = 12; // Number of items per page
    
    // Map cycles to API parameter
    if (filters.cycle && filters.cycle.length > 0) {
      filters.apiParams.cycle = filters.cycle.join(',');
    }
    
    // Map watering to API parameter
    if (filters.watering && filters.watering.length > 0) {
      filters.apiParams.watering = filters.watering.join(',');
    }
    
    // Map sunlight to API parameter
    if (filters.sunlight && filters.sunlight.length > 0) {
      filters.apiParams.sunlight = filters.sunlight.join(',');
    }
    
    // Map environment to indoor parameter if applicable
    if (filters.environment && filters.environment.length > 0) {
      if (filters.environment.includes('indoor')) {
        filters.apiParams.indoor = 1;
      } else if (filters.environment.includes('outdoor')) {
        // For now the API doesn't have a specific outdoor parameter
        // We could potentially look for plants without the indoor flag
      }
    }
    
    // Map soil type if applicable
    if (filters.soil && filters.soil.length > 0) {
      const soilMapping = {
        'clay': 'clay',
        'sandy': 'sandy',
        'loamy': 'loamy',
        'peaty': 'peaty'
      };
      
      for (const soil of filters.soil) {
        if (soilMapping[soil]) {
          filters.apiParams.soil = soilMapping[soil];
          break;
        }
      }
    }
    
    // Map usage to edible if applicable
    if (filters.usage && filters.usage.length > 0) {
      if (filters.usage.includes('edible')) {
        filters.apiParams.edible = '1';
      } else if (filters.usage.includes('ornamental') || filters.usage.includes('decorative')) {
        // For ornamental plants, we don't set edible parameter as they could be either
      }
      
      // Check for medicinal plants
      if (filters.usage.includes('medicinal')) {
        filters.apiParams.medicinal = '1';
      }
      
      // Check for poisonous plants
      if (filters.usage.includes('poisonous')) {
        filters.apiParams.poisonous = '1';
      }
    }
    
    // Check if we have active filters (excluding API params and pagination)
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
      if (key === 'page' || key === 'per_page' || key === 'apiParams') return false;
      if (Array.isArray(value)) {
        return value.length > 0;
      } else if (key === 'price') {
        return value.min || value.max;
      } else if (key === 'rating') {
        return value > 1; 
      }
      return !!value;
    });
    
    if (hasActiveFilters || Object.keys(filters.apiParams).length > 0) {
      console.log(`Fetching filtered plants for page ${page}...`);
      console.log('API Parameters:', filters.apiParams);
      products = await fetchFilteredPlants(filters);
    } else {
      console.log(`Fetching all plants for page ${page}...`);
      products = await fetchPlants(filters);
    }
    
    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(0);
    console.log(`Plants fetched in ${responseTime}ms. Got ${products.length} plants.`);
    
    // If we're using local data (check if response was fast, under 50ms)
    if (responseTime < 50) {
      console.log('Fast response detected, likely using local data');
      showNotification('API unavailable. Using local data to display plants.', 'warning');
      sourceType = 'local';
    }
    
    // Update product count
    if (productCount) {
      productCount.textContent = products.length;
    }
    
    // Clear products grid
    productsGrid.innerHTML = '';
    
    // Add products
    if (products.length === 0) {
      const noProducts = document.createElement('div');
      noProducts.className = 'no-products';
      noProducts.innerHTML = `
        <i class='bx bx-search' style="font-size: 48px; color: var(--color-gray-400); margin-bottom: 16px;"></i>
        <h3>No plants found</h3>
        <p>Try adjusting your filters or search term</p>
      `;
      productsGrid.appendChild(noProducts);
      console.log('No plants matched the criteria');
    } else {
      console.log(`Displaying ${products.length} plants from ${sourceType} data for page ${page}`);
      products.forEach(product => {
        try {
          productsGrid.appendChild(createProductCard(product));
        } catch (cardError) {
          console.error('Error creating product card:', cardError, product);
        }
      });
      
      // Ensure icons are properly loaded for new content
      if (typeof Boxicons !== 'undefined') {
        Boxicons.init();
      }
      
      // Re-attach event listeners to new elements
      const addToCartButtons = document.querySelectorAll('.product-add-btn');
      if (addToCartButtons) {
        addToCartButtons.forEach(button => {
          // Remove existing listeners to prevent duplicates
          const newButton = button.cloneNode(true);
          button.parentNode.replaceChild(newButton, button);
          
          // Add fresh listener
          newButton.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-id');
            const product = products.find(p => p.id == productId);
            if (product) {
              addProductToCart(product);
            }
          });
        });
      }
      
      // Re-attach quick view listeners
      const quickViewButtons = document.querySelectorAll('.quick-view-btn');
      if (quickViewButtons) {
        quickViewButtons.forEach(button => {
          // Remove existing listeners to prevent duplicates
          const newButton = button.cloneNode(true);
          button.parentNode.replaceChild(newButton, button);
          
          // Add fresh listener
          newButton.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.getAttribute('data-id');
            const product = products.find(p => p.id == productId);
            if (product) {
              openQuickViewModal(product);
            }
          });
        });
      }
      
      // Update cart count to ensure it's displayed correctly
      updateCartCount();
    }
    
    // Add pagination - we'll pass the total count from API response
    // For now we'll use the length of products multiplied by number of pages to simulate total
    const estimatedTotal = products.length * 5; // Assume 5 pages total if we don't have actual total
    setupPagination(estimatedTotal, page);
    
    // Scroll to top of products section
    const productsSection = document.querySelector('.products-main');
    if (productsSection) {
      window.scrollTo({
        top: productsSection.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  } catch (error) {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = `
      <div class="error-message">
        <i class='bx bx-error-circle' style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
        <h3>Error Loading Plants</h3>
        <p>${error.message || 'Failed to load products. Please try again later.'}</p>
        <button onclick="location.reload()" class="retry-button">
          <i class='bx bx-refresh'></i> Retry
        </button>
      </div>
    `;
  }
}

// Create product card with cart functionality
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-id', product.id);
  
  // Calculate discount percentage
  const discountPercentage = product.discount || Math.floor(Math.random() * 20);
  const isSale = product.isSale || discountPercentage > 0;
  const isNew = product.isNew || Math.random() > 0.7;
  
  // Make sure required properties exist
  product.name = product.name || product.common_name || 'Unknown Plant';
  product.price = product.price || Math.floor(Math.random() * (1500 - 300) + 300);
  product.rating = product.rating || (Math.random() * 3 + 2).toFixed(1);
  product.category = product.category || 'Plant';
  product.state = product.state || 'maharashtra';
  product.image = product.image || product.default_image?.thumbnail || 'https://source.unsplash.com/random/300x300/?plant';
  
  // Calculate original price if on sale
  product.originalPrice = product.originalPrice || Math.round(product.price * (1 + discountPercentage/100));
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}">
      ${isNew ? '<span class="product-badge badge-new">New</span>' : ''}
      ${isSale ? '<span class="product-badge badge-sale">Sale</span>' : ''}
      <div class="product-actions">
        <button type="button" class="product-action-btn quick-view-btn">
          <i class='bx bx-search'></i>
        </button>
        <button type="button" class="product-action-btn wishlist-btn">
          <i class='bx bx-heart'></i>
        </button>
        <button type="button" class="product-action-btn compare-btn">
          <i class='bx bx-git-compare'></i>
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
        ${isSale ? `
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
  
  // Add event listeners
  const quickViewBtn = card.querySelector('.quick-view-btn');
  if (quickViewBtn) {
    quickViewBtn.addEventListener('click', function() {
      openQuickViewModal(product);
    });
  }
  
  const wishlistBtn = card.querySelector('.wishlist-btn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', function() {
      this.classList.toggle('active');
      if (this.classList.contains('active')) {
        this.querySelector('i').className = 'bx bxs-heart';
        showNotification(`${product.name} added to wishlist!`, 'success');
      } else {
        this.querySelector('i').className = 'bx bx-heart';
        showNotification(`${product.name} removed from wishlist`, 'info');
      }
    });
  }
  
  // Find Add button in the card
  const addToCartBtn = card.querySelector('.product-add-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      // Add product to cart
      addProductToCart(product);
    });
  }
  
  return card;
}

// Function to add product to cart
function addProductToCart(product) {
  // Create cart item object
  const cartItem = {
    id: product.id,
    name: product.name || product.common_name,
    price: product.price || Math.floor(Math.random() * (1500 - 300) + 300),
    image: product.image || product.default_image?.thumbnail || 'https://source.unsplash.com/random/300x300/?plant',
    quantity: 1
  };
  
  // Get existing cart from localStorage or initialize empty cart
  let cart = JSON.parse(localStorage.getItem('plant_cart')) || [];
  
  // Check if product already in cart
  const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
  
  if (existingItemIndex !== -1) {
    // Increment quantity if already in cart
    cart[existingItemIndex].quantity++;
  } else {
    // Otherwise add new item
    cart.push(cartItem);
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('plant_cart', JSON.stringify(cart));
  
  // Show success notification
  showNotification(`${cartItem.name} added to cart!`, 'success');
  
  // Update cart count
  updateCartCount();
}

// Update cart count in navbar
function updateCartCount() {
  const cartCount = document.querySelector('.cart-count');
  const cart = JSON.parse(localStorage.getItem('plant_cart')) || [];
  
  // Calculate total quantity
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Update DOM
  if (cartCount) {
    cartCount.textContent = totalItems;
    
    // Add animation
    cartCount.classList.add('pulse');
    setTimeout(() => {
      cartCount.classList.remove('pulse');
    }, 500);
  }
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

// Setup pagination
function setupPagination(totalProducts, currentPage = 1) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  // Clear pagination
  pagination.innerHTML = '';
  
  // Calculate total pages
  const productsPerPage = 12;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) return;
  
  // Add previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.innerHTML = '<i class="bx bx-chevron-left"></i>';
  if (currentPage === 1) {
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.addEventListener('click', function() {
      if (currentPage > 1) {
        loadProducts(currentPage - 1);
      }
    });
  }
  pagination.appendChild(prevBtn);
  
  // Define maximum page buttons to show
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  // Add first page button if not already included
  if (startPage > 1) {
    const firstPageBtn = document.createElement('button');
    firstPageBtn.className = 'pagination-btn';
    firstPageBtn.textContent = '1';
    firstPageBtn.addEventListener('click', function() {
      loadProducts(1);
    });
    pagination.appendChild(firstPageBtn);
    
    // Add ellipsis if there's a gap
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      pagination.appendChild(ellipsis);
    }
  }
  
  // Add page buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = 'pagination-btn';
    if (i === currentPage) pageBtn.classList.add('active');
    pageBtn.textContent = i;
    
    pageBtn.addEventListener('click', function() {
      loadProducts(i);
    });
    
    pagination.appendChild(pageBtn);
  }
  
  // Add last page button if not already included
  if (endPage < totalPages) {
    // Add ellipsis if there's a gap
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      pagination.appendChild(ellipsis);
    }
    
    const lastPageBtn = document.createElement('button');
    lastPageBtn.className = 'pagination-btn';
    lastPageBtn.textContent = totalPages;
    lastPageBtn.addEventListener('click', function() {
      loadProducts(totalPages);
    });
    pagination.appendChild(lastPageBtn);
  }
  
  // Add next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.innerHTML = '<i class="bx bx-chevron-right"></i>';
  if (currentPage === totalPages) {
    nextBtn.classList.add('disabled');
  } else {
    nextBtn.addEventListener('click', function() {
      if (currentPage < totalPages) {
        loadProducts(currentPage + 1);
      }
    });
  }
  pagination.appendChild(nextBtn);
}

// Setup quick view modal
function setupQuickViewModal() {
  const modal = document.getElementById('quickViewModal');
  const overlay = document.getElementById('overlay');
  const closeBtn = modal.querySelector('.close-modal');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      closeModal(modal, overlay);
    });
  }
  
  overlay.addEventListener('click', function() {
    closeModal(modal, overlay);
  });
}

// Open quick view modal
async function openQuickViewModal(product) {
  const modal = document.getElementById('quickViewModal');
  const overlay = document.getElementById('overlay');
  const quickViewContent = document.getElementById('quickViewContent');
  
  if (!modal || !overlay || !quickViewContent) return;
  
  // Show loading state
  quickViewContent.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading plant details...</p>
    </div>
  `;
  
  // Show modal
  modal.style.display = 'block';
  overlay.style.display = 'block';
  
  setTimeout(() => {
    modal.classList.add('show');
    overlay.classList.add('show');
  }, 10);
  
  try {
    // Fetch detailed plant data
    const detailedProduct = await fetchPlantById(product.id);
    
    // Try to get care guide in parallel
    let careGuide = null;
    try {
      careGuide = await fetchCareGuide(product.id);
    } catch (careError) {
      console.log('Care guide fetch failed', careError);
    }
    
    // Try to get hardiness map in parallel
    let hardinessMap = null;
    try {
      hardinessMap = await fetchHardinessMap(product.id);
    } catch (mapError) {
      console.log('Hardiness map fetch failed', mapError);
    }
    
    // Build care guide HTML if available
    let careGuideHTML = '';
    if (careGuide) {
      careGuideHTML = `
        <div class="quick-view-care-guide">
          <h4>Care Guide</h4>
          ${careGuide.watering ? `
            <div class="care-item">
              <span class="care-label">Watering:</span>
              <span class="care-value">${careGuide.watering}</span>
            </div>
          ` : ''}
          ${careGuide.sunlight ? `
            <div class="care-item">
              <span class="care-label">Sunlight:</span>
              <span class="care-value">${careGuide.sunlight}</span>
            </div>
          ` : ''}
          ${careGuide.pruning ? `
            <div class="care-item">
              <span class="care-label">Pruning:</span>
              <span class="care-value">${careGuide.pruning}</span>
            </div>
          ` : ''}
        </div>
      `;
    }
    
    // Build hardiness map HTML if available
    let hardinessHTML = '';
    if (hardinessMap && hardinessMap.data && hardinessMap.data.image_url) {
      hardinessHTML = `
        <div class="quick-view-hardiness">
          <h4>Hardiness Map</h4>
          <div class="hardiness-image">
            <img src="${hardinessMap.data.image_url.replace(/\\\//g, '/')}" alt="Hardiness Map">
          </div>
          <p class="hardiness-note">Plant hardiness zones indicate where plants can grow based on climate conditions.</p>
        </div>
      `;
    }
    
    // Populate modal content
    quickViewContent.innerHTML = `
      <div class="quick-view-image">
        <img src="${detailedProduct.image}" alt="${detailedProduct.name}">
      </div>
      <div class="quick-view-info">
        <div class="quick-view-category">${detailedProduct.category.charAt(0).toUpperCase() + detailedProduct.category.slice(1)}</div>
        <h2 class="quick-view-title">${detailedProduct.name}</h2>
        <div class="quick-view-scientific-name">${detailedProduct.scientificName}</div>
        <div class="quick-view-rating">
          <div class="quick-view-rating-stars">
            ${generateRatingStars(detailedProduct.rating)}
          </div>
          <span class="quick-view-rating-count">(${Math.floor(Math.random() * 100) + 10} reviews)</span>
        </div>
        <div class="quick-view-price">
          <span class="quick-view-current-price">₹${detailedProduct.price}</span>
          ${detailedProduct.discount > 0 ? `
            <span class="quick-view-original-price">₹${detailedProduct.originalPrice}</span>
            <span class="quick-view-discount">-${detailedProduct.discount}%</span>
          ` : ''}
        </div>
        <div class="quick-view-description">
          <h4>Description</h4>
          <p>${detailedProduct.description}</p>
        </div>
        ${careGuideHTML}
        <div class="quick-view-details">
          <h4>Details</h4>
          <div class="detail-item">
            <span class="detail-label">State:</span>
            <span class="detail-value">${formatState(detailedProduct.state)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Environment:</span>
            <span class="detail-value">${detailedProduct.environment.charAt(0).toUpperCase() + detailedProduct.environment.slice(1)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Weather:</span>
            <span class="detail-value">${detailedProduct.weather.charAt(0).toUpperCase() + detailedProduct.weather.slice(1)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Soil Type:</span>
            <span class="detail-value">${detailedProduct.soil.charAt(0).toUpperCase() + detailedProduct.soil.slice(1)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Terrain:</span>
            <span class="detail-value">${detailedProduct.terrain.charAt(0).toUpperCase() + detailedProduct.terrain.slice(1)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Usage:</span>
            <span class="detail-value">${detailedProduct.usage.map(u => u.charAt(0).toUpperCase() + u.slice(1)).join(', ')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Height:</span>
            <span class="detail-value">${detailedProduct.details.height}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Water Needs:</span>
            <span class="detail-value">${detailedProduct.details.waterNeeds}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Sunlight:</span>
            <span class="detail-value">${detailedProduct.details.sunlight}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Growth Rate:</span>
            <span class="detail-value">${detailedProduct.details.growthRate}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Lifespan:</span>
            <span class="detail-value">${detailedProduct.details.lifespan}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Difficulty:</span>
            <span class="detail-value">${detailedProduct.details.difficulty}</span>
          </div>
        </div>
        ${hardinessHTML}
        <div class="quick-view-actions">
          <div class="quantity-selector">
            <button type="button" class="quantity-btn minus-btn">
              <i class='bx bx-minus'></i>
            </button>
            <input type="number" class="quantity-input" value="1" min="1" max="99">
            <button type="button" class="quantity-btn plus-btn">
              <i class='bx bx-plus'></i>
            </button>
          </div>
          <button type="button" class="add-to-cart-btn">
            <i class='bx bx-cart-add'></i>
            <span>Add to Cart</span>
          </button>
          <button type="button" class="wishlist-btn">
            <i class='bx bx-heart'></i>
          </button>
        </div>
      </div>
    `;
    
    // Setup quantity selector
    const minusBtn = quickViewContent.querySelector('.minus-btn');
    const plusBtn = quickViewContent.querySelector('.plus-btn');
    const quantityInput = quickViewContent.querySelector('.quantity-input');
    
    if (minusBtn && plusBtn && quantityInput) {
      minusBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      });
      
      plusBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
          quantityInput.value = currentValue + 1;
        }
      });
    }
    
    // Setup wishlist button
    const wishlistBtn = quickViewContent.querySelector('.wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        if (this.classList.contains('active')) {
          this.querySelector('i').className = 'bx bxs-heart';
        } else {
          this.querySelector('i').className = 'bx bx-heart';
        }
      });
    }
  } catch (error) {
    console.error('Error loading plant details:', error);
    quickViewContent.innerHTML = `
      <div class="error-message">
        <i class='bx bx-error-circle' style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
        <h3>Error</h3>
        <p>Failed to load plant details. Please try again later.</p>
        <button onclick="openQuickViewModal(${JSON.stringify(product)})" class="retry-button">
          <i class='bx bx-refresh'></i> Retry
        </button>
      </div>
    `;
  }
}

// Close modal
function closeModal(modal, overlay) {
  modal.classList.remove('show');
  overlay.classList.remove('show');
  
  setTimeout(() => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
  }, 300);
}

// Show error message
function showError(message) {
  const productsGrid = document.getElementById('productsGrid');
  if (productsGrid) {
    productsGrid.innerHTML = `
      <div class="error-message">
        <i class='bx bx-error-circle' style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="retry-button">
          <i class='bx bx-refresh'></i> Retry
        </button>
      </div>
    `;
  }
}

// Show notification
function showNotification(message, type = 'success') {
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
      
      .toast.warning {
        background-color: #f59e0b;
      }
      
      .toast.info {
        background-color: #3b82f6;
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
  let icon;
  switch(type) {
    case 'success':
      icon = 'bx-check-circle';
      break;
    case 'error':
      icon = 'bx-error-circle';
      break;
    case 'warning':
      icon = 'bx-warning';
      break;
    case 'info':
    default:
      icon = 'bx-info-circle';
      break;
  }
  
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