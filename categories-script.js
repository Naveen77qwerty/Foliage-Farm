// Import API service
import { fetchPlants, fetchFilteredPlants } from './api-service.js';

// Polyfill for the "managed" property to prevent errors
(function() {
  try {
    // Only add the polyfill if the property doesn't exist
    if (typeof window !== 'undefined' && window.managed === undefined) {
      console.log('Adding managed polyfill to prevent errors');
      Object.defineProperty(window, 'managed', {
        value: {
          ready: function() { return true; },
          // Add any other properties needed
          get: function() { return null; },
          set: function() { return null; }
        },
        writable: false
      });
    }
  } catch (e) {
    console.log('Could not add managed polyfill:', e);
  }
})();

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
async function initCategoriesPage() {
  // Setup option buttons
  setupOptionButtons();
  
  // Setup view options
  setupViewOptions();
  
  // Setup weather popup
  setupWeatherPopup();
  
  // Setup recommendations popup
  setupRecommendationsPopup();
  
  // Disable geolocation - use default climate instead
  // requestGeolocation();
  useDefaultWeather();
  
  // Load featured plants
  await loadFeaturedPlants();
  
  // Initial recommendations update based on default selections
  await updateRecommendations();
  
  // Add debounced event handlers for all filter interactions
  // This ensures recommendations update without too many API calls
  const filterElements = document.querySelectorAll('.option-btn, #stateSelect');
  filterElements.forEach(element => {
    if (element.id === 'stateSelect') {
      element.addEventListener('change', debounce(async () => {
        console.log('State changed, updating recommendations');
        await updateRecommendations();
      }, 500));
    } else {
      element.addEventListener('click', debounce(async () => {
        console.log('Filter changed, updating recommendations');
        await updateRecommendations();
      }, 500));
    }
  });
  
  // Setup recommendation slider (after recommendations are loaded)
  setupRecommendationSlider();
  
  // Set user name
  setUserName();
  
  // Setup logout button
  setupLogoutButton();
  
  console.log('Categories page initialized with API-driven recommendations');
}

// Setup option buttons
function setupOptionButtons() {
  const optionButtons = document.querySelectorAll('.option-btn');
  
  if (optionButtons.length === 0) {
    console.error('No option buttons found. Check selectors and DOM structure.');
  }
  
  optionButtons.forEach(button => {
    button.addEventListener('click', async function() {
      // Remove active class from siblings
      const siblings = this.parentElement.querySelectorAll('.option-btn');
      siblings.forEach(sibling => {
        sibling.classList.remove('active');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      
      console.log('Button clicked:', this.textContent, 'Value:', this.getAttribute('data-value'));
      
      // Update recommendations based on selections
      await updateRecommendations();
    });
  });

  // Add event listener for state select
  const stateSelect = document.getElementById('stateSelect');
  if (stateSelect) {
    stateSelect.addEventListener('change', async function() {
      console.log('State selected:', this.value);
      await updateRecommendations();
    });
  } else {
    console.error('State select element not found. Check ID and DOM structure.');
  }
}

// Use default weather instead of geolocation
function useDefaultWeather() {
  console.log('Using default weather settings without geolocation');
  
  // Get the active climate button or use 'temperate' as default
  const climateButtons = document.querySelectorAll('.option-buttons:nth-child(3) .option-btn.active');
  const climate = climateButtons.length > 0 ? 
    climateButtons[0].getAttribute('data-value') : 'temperate';
  
  // Update UI with simulated weather information
  let temp, condition, location;
  switch (climate) {
    case 'tropical':
      temp = 32;
      condition = 'Hot & Sunny';
      location = 'Tropical Region';
      break;
    case 'temperate':
      temp = 24;
      condition = 'Mild & Partly Cloudy';
      location = 'Temperate Region';
      break;
    case 'arid':
      temp = 38;
      condition = 'Hot & Dry';
      location = 'Arid Region';
      break;
    case 'humid':
      temp = 30;
      condition = 'Warm & Humid';
      location = 'Humid Region';
      break;
    default:
      temp = 25;
      condition = 'Pleasant';
      location = 'Default Region';
  }
  
  // Update UI with simulated weather information
  updateWeatherUI(temp, condition, location);
  
  // Set climate selection in UI
  setClimateSelection(climate);
  
  // Update recommendations based on climate
  updateWeatherRecommendationsFromWeatherData(climate)
    .catch(error => {
      console.error('Error updating recommendations:', error);
      showNotification('Using default plant recommendations', 'info');
    });
}

// Determine climate type from weather data
// Simplified version that doesn't depend on API weather data
function determineClimateFromWeather(weatherData) {
  // If called with actual weather data (not used anymore but kept for compatibility)
  if (weatherData && typeof weatherData === 'object') {
    try {
      if (!weatherData.main) {
        return 'temperate';
      }
      
      const temp = weatherData.main.temp;
      const humidity = weatherData.main.humidity || 50;
      
      if (temp > 30 && humidity < 40) {
        return 'arid';
      } else if (temp > 25 && humidity > 70) {
        return 'tropical';
      } else if (temp > 20 && humidity > 60) {
        return 'humid';
      } else {
        return 'temperate';
      }
    } catch (error) {
      console.error('Error determining climate:', error);
      return 'temperate';
    }
  }
  
  // If called with just temperature and humidity (for simulated weather)
  if (arguments.length >= 2) {
    const temp = arguments[0];
    const humidity = arguments[1];
    
    if (temp > 30 && humidity < 40) {
      return 'arid';
    } else if (temp > 25 && humidity > 70) {
      return 'tropical';
    } else if (temp > 20 && humidity > 60) {
      return 'humid';
    }
  }
  
  // Default return
  return 'temperate';
}

// Set climate selection in UI
function setClimateSelection(climate) {
  const climateBtns = document.querySelectorAll('.option-buttons:nth-child(3) .option-btn');
  
  climateBtns.forEach(btn => {
    if (btn.getAttribute('data-value') === climate) {
      // Remove active class from all climate buttons
      climateBtns.forEach(b => b.classList.remove('active'));
      // Add active class to matching climate button
      btn.classList.add('active');
    }
  });
}

// Update UI with weather information
function updateWeatherUI(temperature, condition, location) {
  const temperatureEl = document.querySelector('.temperature');
  const conditionEl = document.querySelector('.condition');
  const locationEl = document.querySelector('.location');
  
  if (temperatureEl && conditionEl && locationEl) {
    temperatureEl.textContent = `${Math.round(temperature)}°C`;
    conditionEl.textContent = condition;
    locationEl.textContent = location;
    
    // Update weather icon based on condition
    updateWeatherIconFromCondition(condition);
  }
}

// Update weather icon based on weather condition
function updateWeatherIconFromCondition(condition) {
  const weatherIcon = document.querySelector('.weather-icon i');
  if (weatherIcon) {
    condition = condition.toLowerCase();
    
    if (condition.includes('clear') || condition.includes('sun')) {
      weatherIcon.className = 'bx bx-sun';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      weatherIcon.className = 'bx bx-cloud-rain';
    } else if (condition.includes('cloud')) {
      weatherIcon.className = 'bx bx-cloud';
    } else if (condition.includes('snow')) {
      weatherIcon.className = 'bx bx-cloud-snow';
    } else if (condition.includes('storm') || condition.includes('thunder')) {
      weatherIcon.className = 'bx bx-cloud-lightning';
    } else {
      weatherIcon.className = 'bx bx-cloud';
    }
  }
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

// Setup recommendations popup
function setupRecommendationsPopup() {
  const recommendationsPopup = document.getElementById('recommendationsPopup');
  const submitButton = document.getElementById('submitRecommendations');
  const closePopupBtn = recommendationsPopup.querySelector('.close-popup');
  
  if (!recommendationsPopup || !submitButton) {
    console.error('Recommendations popup or submit button not found');
    return;
  }
  
  // Setup submit button click handler
  submitButton.addEventListener('click', async function() {
    // Show popup
    showRecommendationsPopup();
    
    // Update popup with recommendations
    await updateRecommendationsPopup();
  });
  
  // Setup close button
  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', function() {
      hideRecommendationsPopup();
    });
  }
  
  // Close popup on outside click
  window.addEventListener('click', function(event) {
    if (event.target === recommendationsPopup) {
      hideRecommendationsPopup();
    }
  });
  
  // Setup View All button
  const viewAllBtn = recommendationsPopup.querySelector('.view-all-recommendations-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get current filter selections
      const activeButtons = document.querySelectorAll('.option-btn.active');
      const filters = {};
      
      activeButtons.forEach(button => {
        const value = button.getAttribute('data-value');
        if (['indoor', 'outdoor', 'both'].includes(value)) {
          filters.environment = value;
        } else if (['beginner', 'intermediate', 'expert'].includes(value)) {
          filters.experience = value;
        } else if (['tropical', 'temperate', 'arid', 'humid'].includes(value)) {
          filters.climate = value;
        }
      });
      
      // Get state from select element
      const stateSelect = document.getElementById('stateSelect');
      if (stateSelect?.value) {
        filters.state = stateSelect.value;
      }
      
      // Redirect to products page with combined filters from user selections
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      window.location.href = `products.html?${queryParams.toString()}`;
    });
  }
}

// Show recommendations popup
function showRecommendationsPopup() {
  const popup = document.getElementById('recommendationsPopup');
  if (popup) {
    popup.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }
}

// Hide recommendations popup
function hideRecommendationsPopup() {
  const popup = document.getElementById('recommendationsPopup');
  if (popup) {
    popup.classList.remove('show');
    document.body.style.overflow = ''; // Enable scrolling
  }
}

// Update recommendations popup with current selections and data
async function updateRecommendationsPopup() {
  try {
    // Get the popup elements
    const popup = document.getElementById('recommendationsPopup');
    const plantsContainer = document.getElementById('recommendationsPlants');
    const environmentCriteria = document.getElementById('environmentCriteria');
    const experienceCriteria = document.getElementById('experienceCriteria');
    const climateCriteria = document.getElementById('climateCriteria');
    const stateCriteria = document.getElementById('stateCriteria');
    
    if (!popup || !plantsContainer) {
      console.error('Popup elements not found');
      return;
    }
    
    // Get current selections - Improved selectors
    const environment = document.querySelector('.form-group:nth-of-type(1) .option-btn.active')?.getAttribute('data-value') || 'indoor';
    const experience = document.querySelector('.form-group:nth-of-type(2) .option-btn.active')?.getAttribute('data-value') || 'intermediate';
    const climate = document.querySelector('.form-group:nth-of-type(3) .option-btn.active')?.getAttribute('data-value') || 'temperate';
    const stateSelect = document.getElementById('stateSelect');
    const state = stateSelect?.value || '';
    
    console.log('Updating recommendations popup with selections:', { environment, experience, climate, state });
    
    // Update criteria display
    if (environmentCriteria) environmentCriteria.textContent = environment.charAt(0).toUpperCase() + environment.slice(1);
    if (experienceCriteria) experienceCriteria.textContent = experience.charAt(0).toUpperCase() + experience.slice(1);
    if (climateCriteria) climateCriteria.textContent = climate.charAt(0).toUpperCase() + climate.slice(1);
    
    if (stateCriteria) {
      if (state) {
        const stateName = stateSelect.options[stateSelect.selectedIndex].text;
        stateCriteria.textContent = ` • ${stateName}`;
      } else {
        stateCriteria.textContent = '';
      }
    }
    
    // Show loading state
    if (plantsContainer) {
      plantsContainer.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Finding perfect plants for you...</p>
        </div>
      `;
    }
    
    // Create API query parameters based on user selections
    const apiParams = new URLSearchParams();
    
    // Add environment filter (indoor/outdoor)
    if (environment === 'indoor') {
      apiParams.append('indoor', '1');
    } else if (environment === 'outdoor') {
      apiParams.append('indoor', '0');
    }
    
    // Add cycle filter based on climate
    if (climate === 'tropical') {
      apiParams.append('cycle', 'perennial');
    } else if (climate === 'temperate') {
      apiParams.append('hardiness', '5,9');
    } else if (climate === 'arid') {
      apiParams.append('drought_tolerant', '1');
    } else if (climate === 'humid') {
      apiParams.append('humidity', 'high');
    }
    
    // Add difficulty filter
    if (experience === 'beginner') {
      apiParams.append('edible', '1'); // Edible plants tend to be easier to grow
    } else if (experience === 'expert') {
      apiParams.append('rare', '1'); // Rare plants are typically more challenging
    }
    
    // Create filters object
    const filters = {
      environment: [environment === 'both' ? 'indoor' : environment],
      state: state ? [state] : [],
      weather: [climate],
      category: [],
      usage: [],
      soil: [],
      terrain: [],
      rating: 0,
      price: { min: null, max: null },
      apiParams: apiParams
    };
    
    // Import required API functions
    const { fetchFilteredPlants } = await import('./api-service.js');
    
    // Fetch plants based on filters
    let plants = await fetchFilteredPlants(filters);
    
    if (!plants || plants.length === 0) {
      console.warn('No plants received from API for selected criteria, using fallback data');
      showNotification('No plants match your criteria. Showing similar options.', 'info');
      plants = await loadFallbackRecommendations(climate);
    }
    
    // Filter plants by climate with improved matching
    let recommendedPlants = filterPlantsByClimate(plants, climate);
    
    // If we have at least 10 plants, filter by climate if possible
    if (plants.length > 10) {
      let climateFiltered = filterPlantsByClimate(plants, climate);
      // If climate filtering returns too few plants, use original list
      recommendedPlants = climateFiltered.length >= 4 ? climateFiltered : plants;
    }
    
    // Sort plants by relevance
    recommendedPlants = recommendedPlants.sort((a, b) => {
      // First sort by exact climate match
      const aClimateMatch = a.weather === climate ? 1 : 0;
      const bClimateMatch = b.weather === climate ? 1 : 0;
      if (aClimateMatch !== bClimateMatch) return bClimateMatch - aClimateMatch;
      
      // Then by environment match
      const aEnvMatch = a.environment === environment ? 1 : 0;
      const bEnvMatch = b.environment === environment ? 1 : 0;
      if (aEnvMatch !== bEnvMatch) return bEnvMatch - aEnvMatch;
      
      // Then by rating
      return b.rating - a.rating;
    });
    
    // Limit to 6 plants maximum for recommendations
    recommendedPlants = recommendedPlants.slice(0, 6);
    
    if (plantsContainer) {
      // Clear loading state
      plantsContainer.innerHTML = '';
      
      // If no plants found, show message
      if (recommendedPlants.length === 0) {
        plantsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">
            <i class='bx bx-search' style="font-size: 48px; color: var(--color-gray-400); margin-bottom: 16px;"></i>
            <h3>No Plants Found</h3>
            <p>Try different criteria or browse our catalog</p>
          </div>
        `;
        return;
      }
      
      // Add plant cards to container
      recommendedPlants.forEach(plant => {
        const plantCard = createRecommendationPlantCard(plant, climate);
        plantsContainer.appendChild(plantCard);
      });
    }
  } catch (error) {
    console.error('Error updating recommendations popup:', error);
    
    // Show error message
    const plantsContainer = document.getElementById('recommendationsPlants');
    if (plantsContainer) {
      plantsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">
          <i class='bx bx-error-circle' style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
          <h3>Error Loading Plants</h3>
          <p>Please try again later</p>
        </div>
      `;
    }
    
    // Show notification
    showNotification('Error loading plant recommendations', 'error');
  }
}

// Create a recommendation plant card for the popup
function createRecommendationPlantCard(plant, climate) {
  const card = document.createElement('div');
  card.className = 'recommendation-plant-card';
  
  // Create plant suitability text
  const suitabilityText = getPlantSuitabilityText(plant, climate);
  
  // Format price
  const price = plant.price ? `₹${plant.price}` : '';
  const originalPrice = plant.originalPrice && plant.originalPrice > plant.price ? 
    `₹${plant.originalPrice}` : '';
  const discount = plant.discount ? `-${plant.discount}%` : '';
  
  // Ensure we have a valid image URL
  const imageUrl = plant.image && typeof plant.image === 'string' 
    ? plant.image 
    : 'https://source.unsplash.com/random/300x300/?plant';
  
  // For debugging
  console.log(`Plant card: ${plant.name}, Image URL: ${imageUrl}`);
  
  // Create HTML
  card.innerHTML = `
    <div class="recommendation-plant-image">
      <img src="${imageUrl}" alt="${plant.name}" onerror="this.src='https://source.unsplash.com/random/300x300/?plant'; this.onerror=null;">
    </div>
    <div class="recommendation-plant-content">
      <h3 class="recommendation-plant-name">${plant.name}</h3>
      <div class="recommendation-plant-suitability">${suitabilityText}</div>
      <div class="recommendation-plant-footer">
        <div class="recommendation-plant-price">
          ${price}
          ${originalPrice ? `<span style="text-decoration: line-through; font-size: 12px; color: var(--color-gray-500); margin-left: 5px;">${originalPrice}</span>` : ''}
          ${discount ? `<span style="color: #ef4444; font-size: 12px; margin-left: 5px;">${discount}</span>` : ''}
        </div>
        <div class="recommendation-plant-rating">
          <i class='bx bxs-star'></i>
          <span>${plant.rating || 4.0}</span>
        </div>
      </div>
    </div>
  `;
  
  // Add click event
  card.addEventListener('click', () => {
    window.location.href = `products.html?id=${plant.id}`;
  });
  
  return card;
}

// Update recommendations based on user selections
async function updateRecommendations() {
  try {
    // Find active buttons with different method (more reliable for different DOM structures)
    const activeButtons = document.querySelectorAll('.option-btn.active');
    
    // Default values
    let environment = 'indoor';
    let experience = 'intermediate';
    let climate = 'temperate';
    
    // Extract values from active buttons
    activeButtons.forEach(button => {
      const value = button.getAttribute('data-value');
      // Determine which category this button belongs to based on its value or position
      if (['indoor', 'outdoor', 'both'].includes(value)) {
        environment = value;
      } else if (['beginner', 'intermediate', 'expert'].includes(value)) {
        experience = value;
      } else if (['tropical', 'temperate', 'arid', 'humid'].includes(value)) {
        climate = value;
      }
    });
    
    // Get state from select element
    const stateSelect = document.getElementById('stateSelect');
    const state = stateSelect?.value || '';
    
    // Log the values as plain strings to avoid object reference issues
    console.log('Using values for recommendations:',
      `environment: "${environment}", experience: "${experience}", climate: "${climate}", state: "${state}"`);
    
    // Show loading UI
    const recommendationsContainer = document.getElementById('weatherRecommendations');
    if (recommendationsContainer) {
      recommendationsContainer.innerHTML = `
        <div class="recommendation-card loading">
          <div class="spinner"></div>
          <p>Finding perfect plants for you...</p>
        </div>
      `;
    }
    
    // Update weather icon based on climate
    updateWeatherIcon(climate);
    
    // Create API query parameters based on user selections
    const apiParams = new URLSearchParams();
    
    // Add environment filter (indoor/outdoor)
    if (environment === 'indoor') {
      apiParams.append('indoor', '1');
    } else if (environment === 'outdoor') {
      apiParams.append('indoor', '0');
    }
    
    // Add cycle filter based on climate
    if (climate === 'tropical') {
      apiParams.append('cycle', 'perennial');
    } else if (climate === 'temperate') {
      apiParams.append('hardiness', '5,9');
    } else if (climate === 'arid') {
      apiParams.append('drought_tolerant', '1');
    } else if (climate === 'humid') {
      apiParams.append('humidity', 'high');
    }
    
    // Add difficulty filter
    if (experience === 'beginner') {
      apiParams.append('edible', '1'); // Edible plants tend to be easier to grow
    } else if (experience === 'expert') {
      apiParams.append('rare', '1'); // Rare plants are typically more challenging
    }
    
    // Create complete and safe filters object with defaults for all fields
    // This ensures the filter object has all the expected properties
    const filters = {
      environment: [environment === 'both' ? 'indoor' : environment], 
      state: state ? [state] : [],
      weather: [climate],
      category: [],
      usage: [],
      soil: [],
      terrain: [],
      rating: 0,
      price: { min: null, max: null },
      apiParams: apiParams // Add API params to filters
    };
    
    // Log as stringified JSON to avoid object reference issues in console
    console.log('Sending API filters:', JSON.stringify(filters));
    
    // Import required API functions
    const { fetchFilteredPlants } = await import('./api-service.js');
    
    // Fetch plants based on filters
    let plants = await fetchFilteredPlants(filters);
    
    if (!plants || plants.length === 0) {
      console.warn('No plants received from API for selected criteria, using fallback data');
      showNotification('No plants match your criteria. Showing similar options.', 'info');
      plants = await loadFallbackRecommendations(climate);
    }
    
    // Filter plants by climate with improved matching
    let recommendedPlants = filterPlantsByClimate(plants, climate);
    
    // If we have at least 10 plants, filter by climate if possible
    if (plants.length > 10) {
      let climateFiltered = filterPlantsByClimate(plants, climate);
      // If climate filtering returns too few plants, use original list
      recommendedPlants = climateFiltered.length >= 4 ? climateFiltered : plants;
    }
    
    // Sort plants by relevance (higher rating, matching climate, matching environment)
    recommendedPlants = recommendedPlants.sort((a, b) => {
      // First sort by exact climate match
      const aClimateMatch = a.weather === climate ? 1 : 0;
      const bClimateMatch = b.weather === climate ? 1 : 0;
      if (aClimateMatch !== bClimateMatch) return bClimateMatch - aClimateMatch;
      
      // Then by environment match
      const aEnvMatch = a.environment === environment ? 1 : 0;
      const bEnvMatch = b.environment === environment ? 1 : 0;
      if (aEnvMatch !== bEnvMatch) return bEnvMatch - aEnvMatch;
      
      // Then by rating
      return b.rating - a.rating;
    });
    
    // Limit to 6 plants maximum for recommendations
    recommendedPlants = recommendedPlants.slice(0, 6);
    
    // Clear container
    if (recommendationsContainer) {
      recommendationsContainer.innerHTML = '';
    } else {
      console.error('Container no longer available');
      return;
    }
    
    // If no plants found, show message
    if (recommendedPlants.length === 0) {
      recommendationsContainer.innerHTML = `
        <div class="recommendation-card">
          <i class='bx bx-search' style="font-size: 40px; color: var(--color-gray-400); margin-bottom: 10px;"></i>
          <h4>No recommendations found</h4>
          <p>Try different criteria</p>
        </div>
      `;
      return;
    }
    
    // Safely add plants to recommendations
    try {
      recommendedPlants.forEach(plant => {
        if (!recommendationsContainer) return;
        
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        card.innerHTML = `
          <img src="${plant.image}" alt="${plant.name}">
          <h4>${plant.name}</h4>
          <p>${getPlantSuitabilityText(plant, climate)}</p>
        `;
        
        // Add click event to view plant details
        card.addEventListener('click', () => {
          window.location.href = `products.html?id=${plant.id}`;
        });
        
        recommendationsContainer.appendChild(card);
      });
    } catch (innerError) {
      console.error('Error rendering plant cards:', innerError);
    }
    
    // Also update the weather popup recommendations
    try {
      updateWeatherPopupRecommendations(recommendedPlants, climate);
    } catch (popupError) {
      console.error('Error updating weather popup:', popupError);
    }
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    
    // Use fallback data if API fails
    try {
      const recommendationsContainer = document.getElementById('weatherRecommendations');
      if (!recommendationsContainer) {
        console.error('Container no longer available');
        return;
      }
      
      console.log('Using fallback data for recommendations');
      const fallbackPlants = await loadFallbackRecommendations(climate);
      
      // Clear container
      recommendationsContainer.innerHTML = '';
      
      // Add fallback plants to recommendations
      fallbackPlants.forEach(plant => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        card.innerHTML = `
          <img src="${plant.image}" alt="${plant.name}">
          <h4>${plant.name}</h4>
          <p>${getPlantSuitabilityText(plant, climate)}</p>
        `;
        
        // Add click event to view plant details
        card.addEventListener('click', () => {
          window.location.href = `products.html?id=${plant.id}`;
        });
        
        recommendationsContainer.appendChild(card);
      });
      
      // Also update the weather popup recommendations
      try {
        updateWeatherPopupRecommendations(fallbackPlants, climate);
      } catch (popupError) {
        console.error('Error updating popup with fallback data:', popupError);
      }
      
      // Show offline notification
      showNotification('Using offline plant recommendations', 'warning');
      
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      
      const recommendationsContainer = document.getElementById('weatherRecommendations');
      // Check if container still exists before updating
      if (recommendationsContainer) {
        recommendationsContainer.innerHTML = `
          <div class="recommendation-card">
            <i class='bx bx-error-circle' style="font-size: 40px; color: #ef4444; margin-bottom: 10px;"></i>
            <h4>Error loading recommendations</h4>
            <p>Please try again later</p>
          </div>
        `;
      }
    }
  }
}

// Update weather recommendations based on real weather data
async function updateWeatherRecommendationsFromWeatherData(climate) {
  try {
    if (!climate) {
      console.warn('No climate provided for recommendations, using temperate');
      climate = 'temperate';
    }
    
    console.log('Updating weather recommendations based on climate:', climate);
    
    // Use the climate determined from the weather data
    // and create appropriate filters with safe defaults
    const filters = {
      environment: ['outdoor'], // Weather affects outdoor plants most directly
      state: [],
      weather: [climate],
      category: [],
      usage: [],
      soil: [],
      terrain: []
    };
    
    // Update recommendations
    await updateWeatherRecommendations(climate, filters);
  } catch (error) {
    console.error('Error updating weather-based recommendations:', error);
    showNotification('Error loading weather recommendations. Using defaults.', 'error');
    
    // Use a safe fallback
    await updateWeatherRecommendations('temperate', { 
      environment: ['indoor'],
      state: [],
      weather: ['temperate'] 
    });
  }
}

// Filter plants by climate with improved matching
function filterPlantsByClimate(plants, climate) {
  console.log('Filtering plants by climate:', climate);
  return plants.filter(plant => {
    switch (climate) {
      case 'tropical':
        return plant.weather === 'tropical' || plant.weather === 'humid';
      case 'temperate':
        return plant.weather === 'temperate';
      case 'arid':
        return plant.weather === 'arid';
      case 'humid':
        return plant.weather === 'humid' || plant.weather === 'tropical';
      default:
        return true;
    }
  });
}

// Update weather icon based on climate
function updateWeatherIcon(climate) {
  console.log('Updating weather icon for climate:', climate);
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

// Get appropriate plant suitability text
function getPlantSuitabilityText(plant, climate) {
  // Generate a relevant description based on plant type and climate
  const climateMatch = plant.weather === climate || 
    (climate === 'tropical' && plant.weather === 'humid') || 
    (climate === 'humid' && plant.weather === 'tropical');
  
  if (climateMatch) {
    return `Perfect for ${climate} climate`;
  }
  
  switch (plant.category) {
    case 'tree':
      return 'Adds greenery and shade';
    case 'herb':
      return 'Aromatic and useful';
    case 'climber':
      return 'Grows vertically, saves space';
    case 'shrub':
      return 'Compact and attractive';
    default:
      return `Works well in ${plant.environment} settings`;
  }
}

// Update weather popup recommendations
function updateWeatherPopupRecommendations(plants, climate) {
  console.log('Updating weather popup with recommendations');
  const popupRecommendationsList = document.querySelector('.plant-recommendations');
  
  if (!popupRecommendationsList) {
    console.error('Plant recommendations list not found');
    return;
  }
  
  try {
    // Clear current recommendations
    popupRecommendationsList.innerHTML = '';
    
    // Get the top 3 recommended plants
    const topPlants = plants.slice(0, 3);
    
    // Weather information in popup
    const temperatureEl = document.querySelector('.temperature');
    const conditionEl = document.querySelector('.condition');
    const locationEl = document.querySelector('.location');
    
    if (temperatureEl && conditionEl) {
      // If location hasn't been set by geolocation, use climate-based defaults
      if (!locationEl || locationEl.textContent === 'Mumbai, Maharashtra') {
        // Set simulated weather info based on climate
        let temp, condition;
        switch (climate) {
          case 'tropical':
            temp = '32°C';
            condition = 'Hot & Sunny';
            break;
          case 'temperate':
            temp = '24°C';
            condition = 'Mild & Partly Cloudy';
            break;
          case 'arid':
            temp = '38°C';
            condition = 'Hot & Dry';
            break;
          case 'humid':
            temp = '30°C';
            condition = 'Warm & Humid';
            break;
          default:
            temp = '25°C';
            condition = 'Pleasant';
        }
        temperatureEl.textContent = temp;
        conditionEl.textContent = condition;
      }
    }
    
    // Add plants to weather popup
    topPlants.forEach(plant => {
      if (!popupRecommendationsList) return;
      
      const item = document.createElement('li');
      item.innerHTML = `
        <img src="${plant.image}" alt="${plant.name}">
        <div class="plant-info">
          <h5>${plant.name}</h5>
          <p>${getPlantSuitabilityText(plant, climate)}</p>
        </div>
      `;
      
      // Add click event to view plant details
      item.addEventListener('click', () => {
        // Close popup
        const weatherPopup = document.getElementById('weatherPopup');
        if (weatherPopup) {
          weatherPopup.classList.remove('show');
          setTimeout(() => {
            weatherPopup.style.display = 'none';
          }, 300);
        }
        window.location.href = `products.html?id=${plant.id}`;
      });
      
      popupRecommendationsList.appendChild(item);
    });
    
    // Update the view plants button
    const viewPlantsBtn = document.querySelector('.view-plants-btn');
    if (viewPlantsBtn) {
      // Remove existing event listeners
      const newBtn = viewPlantsBtn.cloneNode(true);
      viewPlantsBtn.parentNode.replaceChild(newBtn, viewPlantsBtn);
      
      // Add new event listener
      newBtn.addEventListener('click', function() {
        // Get current filter selections
        const activeButtons = document.querySelectorAll('.option-btn.active');
        const filters = {};
        
        activeButtons.forEach(button => {
          const value = button.getAttribute('data-value');
          if (['indoor', 'outdoor', 'both'].includes(value)) {
            filters.environment = value;
          } else if (['beginner', 'intermediate', 'expert'].includes(value)) {
            filters.experience = value;
          } else if (['tropical', 'temperate', 'arid', 'humid'].includes(value)) {
            filters.climate = value;
          }
        });
        
        // Get state from select element
        const stateSelect = document.getElementById('stateSelect');
        if (stateSelect?.value) {
          filters.state = stateSelect.value;
        }
        
        // Close popup
        const weatherPopup = document.getElementById('weatherPopup');
        if (weatherPopup) {
          weatherPopup.classList.remove('show');
          setTimeout(() => {
            weatherPopup.style.display = 'none';
          }, 300);
        }
        
        // Redirect to products page with combined filters from user selections
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          queryParams.append(key, value);
        });
        
        window.location.href = `products.html?${queryParams.toString()}`;
      });
    }
  } catch (error) {
    console.error('Error updating weather popup recommendations:', error);
  }
}

// Load featured plants
async function loadFeaturedPlants() {
  const featuredGrid = document.querySelector('.featured-grid');
  
  if (!featuredGrid) return;

  // Show loading state
  featuredGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading featured plants...</p></div>';
  
  try {
    console.log('Fetching featured plants from API...');
    const startTime = performance.now();
    
    // Import the fetchPlants function from api-service.js
    const { fetchPlants } = await import('./api-service.js');
    
    // Fetch plants from API
    const plants = await fetchPlants();
    
    const endTime = performance.now();
    console.log(`Plants fetched in ${(endTime - startTime).toFixed(2)}ms`);
    
    // Clear loading state
    featuredGrid.innerHTML = '';
    
    if (!plants || plants.length === 0) {
      featuredGrid.innerHTML = '<div class="error-message">No plants found. Please try again later.</div>';
      return;
    }
    
    // Select only 4 plants for featured section
    // Prioritize plants with images and discounts
    const featuredPlants = plants
      .filter(plant => plant.image && plant.image.includes('http'))
      .sort((a, b) => (b.discount || 0) - (a.discount || 0))
      .slice(0, 4);
    
    console.log(`Displaying ${featuredPlants.length} featured plants`);
    
    // Add featured plants
    featuredPlants.forEach(plant => {
      featuredGrid.appendChild(createProductCard(plant));
    });
  } catch (error) {
    console.error('Error loading featured plants:', error);
    featuredGrid.innerHTML = '<div class="error-message">Failed to load featured plants. Please try again later.</div>';
    
    // Show notification to user
    showNotification('Failed to load featured plants. Using fallback data.', 'error');
    
    // Use fallback data
    const fallbackPlants = [
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
    
    // Clear error message
    featuredGrid.innerHTML = '';
    
    // Add fallback plants
    fallbackPlants.forEach(plant => {
      featuredGrid.appendChild(createProductCard(plant));
    });
  }
}

// Create product card with error handling
function createProductCard(product) {
  try {
    if (!product) {
      console.warn('Attempted to create product card with no product data');
      return null;
    }
    
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Calculate discount percentage
    const discountPercentage = product.discount || 0;
    
    // Safely access product properties
    const productName = product.name || 'Unknown Plant';
    const productImage = product.image || 'https://source.unsplash.com/random/300x300/?plant';
    const productCategory = (product.category || 'plant').charAt(0).toUpperCase() + (product.category || 'plant').slice(1);
    const productState = product.state || 'unknown';
    const productId = product.id || 'unknown';
    const productPrice = product.price || 0;
    const productOriginalPrice = product.originalPrice || productPrice;
    const productRating = product.rating || 4.0;
    
    card.innerHTML = `
      <div class="product-image">
        <img src="${productImage}" alt="${productName}">
        <div class="product-actions">
          <button type="button" class="product-action-btn quick-view-btn" data-id="${productId}">
            <i class='bx bx-search'></i>
          </button>
          <button type="button" class="product-action-btn wishlist-btn" data-id="${productId}">
            <i class='bx bx-heart'></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${productCategory}</div>
        <h3 class="product-title">${productName}</h3>
        <div class="product-rating">
          <div class="product-rating-stars">
            ${generateRatingStars(productRating)}
          </div>
          <span class="product-rating-count">(${Math.floor(Math.random() * 100) + 10})</span>
        </div>
        <div class="product-price">
          <span class="product-current-price">₹${productPrice}</span>
          ${discountPercentage > 0 ? `
            <span class="product-original-price">₹${productOriginalPrice}</span>
            <span class="product-discount">-${discountPercentage}%</span>
          ` : ''}
        </div>
        <div class="product-footer">
          <div class="product-state">
            <i class='bx bx-map'></i>
            <span>${formatState(productState)}</span>
          </div>
          <button type="button" class="product-add-btn">
            <i class='bx bx-cart-add'></i> Add
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    try {
      const quickViewBtn = card.querySelector('.quick-view-btn');
      if (quickViewBtn) {
        quickViewBtn.addEventListener('click', function() {
          window.location.href = `products.html?id=${productId}`;
        });
      }
      
      const wishlistBtn = card.querySelector('.wishlist-btn');
      if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
          this.classList.toggle('active');
          if (this.classList.contains('active')) {
            this.querySelector('i').className = 'bx bxs-heart';
            showNotification('Added to wishlist!', 'success');
          } else {
            this.querySelector('i').className = 'bx bx-heart';
            showNotification('Removed from wishlist', 'info');
          }
        });
      }
      
      const addBtn = card.querySelector('.product-add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', function() {
          showNotification('Added to cart!', 'success');
        });
      }
    } catch (eventError) {
      console.error('Error adding event listeners to product card:', eventError);
    }
    
    return card;
  } catch (error) {
    console.error('Error creating product card:', error, product);
    return null;
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

// Show notification with improved styling
function showNotification(message, type = 'info') {
  // Make sure we're running in browser context
  if (typeof document === 'undefined') return;
  
  console.log(`Notification (${type}):`, message);
  
  // Create notification element if it doesn't exist
  let notification = document.getElementById('api-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'api-notification';
    notification.className = `notification ${type}`;
    document.body.appendChild(notification);
  } else {
    notification.className = `notification ${type}`;
  }

  // Update notification content and icon based on type
  let icon = 'bx-info-circle';
  if (type === 'success') icon = 'bx-check-circle';
  if (type === 'error') icon = 'bx-error-circle';
  if (type === 'warning') icon = 'bx-error';

  notification.innerHTML = `
    <div class="notification-content">
      <i class='bx ${icon}'></i>
      <span>${message}</span>
      <button class="close-notification">
        <i class='bx bx-x'></i>
      </button>
    </div>
  `;

  // Add show class after a small delay to trigger animation
  setTimeout(() => {
    if (notification) {
      notification.classList.add('show');
    }
  }, 10);

  // Setup close button
  const closeBtn = notification.querySelector('.close-notification');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    });
  }

  // Auto-hide notification after 5 seconds
  setTimeout(() => {
    if (notification && document.body.contains(notification)) {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Add improved styles
document.head.insertAdjacentHTML('beforeend', `
<style>
  /* Weather-based recommendations styles */
  .weather-card {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .weather-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.15);
  }
  
  .recommendation-card {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .recommendation-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .plant-recommendations li {
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .plant-recommendations li:hover {
    background-color: rgba(16, 185, 129, 0.1);
  }
  
  /* Loading spinner */
  .recommendation-card.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
    width: 100%;
    background-color: var(--color-white);
    border-radius: 10px;
    box-shadow: var(--shadow-sm);
    cursor: default;
  }
  
  .recommendation-card .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid var(--color-emerald-200);
    border-top-color: var(--color-emerald-500);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Enhanced Product Card Styles */
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
    background-color: #f8f8f8;
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
    text-transform: capitalize;
  }

  .product-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-gray-800);
    margin-bottom: 8px;
    transition: color var(--transition-normal);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    color: var(--color-yellow-400);
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
    flex-wrap: wrap;
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
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .product-add-btn:hover {
    background-color: var(--color-emerald-600);
  }
  
  .product-action-btn.wishlist-btn.active i {
    color: #ef4444;
  }
  
  .product-action-btn.wishlist-btn.active {
    background-color: rgba(239, 68, 68, 0.1);
  }
  
  /* Featured section styles */
  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  /* Fix for dark background */
  body {
    background-color: #111;
  }
  
  .section-header h2 {
    color: #fff;
  }
  
  /* Notification styles */
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 350px;
    background-color: white;
    box-shadow: 0 5px 15px rgba(0,0,0,0.15);
    border-radius: 8px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s, transform 0.3s;
    z-index: 9999;
  }
  
  .notification.show {
    opacity: 1;
    transform: translateY(0);
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    padding: 15px;
  }
  
  .notification i {
    font-size: 24px;
    margin-right: 12px;
  }
  
  .notification.success i {
    color: #10b981;
  }
  
  .notification.error i {
    color: #ef4444;
  }
  
  .notification.warning i {
    color: #f59e0b;
  }
  
  .notification.info i {
    color: #3b82f6;
  }
  
  .notification span {
    flex: 1;
    font-size: 14px;
    color: #374151;
  }
  
  .close-notification {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
    transition: color 0.2s;
  }
  
  .close-notification:hover {
    color: #4b5563;
  }
</style>

<!-- Prevent injectAIMarker error by defining window.managed -->
<script>
  // Define managed property if it doesn't exist
  if (window.managed === undefined) {
    Object.defineProperty(window, 'managed', {
      value: {
        // Add any properties needed by injectAIMarker.js
        ready: function() { return true; }
      },
      writable: false,
      configurable: false
    });
  }
</script>
`);

// Fallback method to handle API failures
async function loadFallbackRecommendations(climate) {
  console.log('Loading fallback recommendations for climate:', climate);
  
  // Create fallback plants based on climate
  const fallbackPlants = [];
  
  if (climate === 'tropical' || climate === 'humid') {
    fallbackPlants.push({
      id: 'tropical1',
      name: 'Monstera Deliciosa',
      image: 'https://source.unsplash.com/random/150x150/?monstera',
      category: 'tropical',
      weather: 'tropical',
      environment: 'indoor',
      rating: 4.8,
      price: 1299,
      discount: 10,
      originalPrice: 1499,
      state: 'kerala'
    });
    fallbackPlants.push({
      id: 'tropical2',
      name: 'Bird of Paradise',
      image: 'https://source.unsplash.com/random/150x150/?bird-of-paradise',
      category: 'tropical',
      weather: 'tropical',
      environment: 'indoor',
      rating: 4.6,
      price: 2199,
      discount: 0,
      originalPrice: 2199,
      state: 'kerala'
    });
  } else if (climate === 'arid') {
    fallbackPlants.push({
      id: 'arid1',
      name: 'Aloe Vera',
      image: 'https://source.unsplash.com/random/150x150/?aloe',
      category: 'succulent',
      weather: 'arid',
      environment: 'indoor',
      rating: 4.7,
      price: 499,
      discount: 20,
      originalPrice: 599,
      state: 'rajasthan'
    });
    fallbackPlants.push({
      id: 'arid2',
      name: 'Barrel Cactus',
      image: 'https://source.unsplash.com/random/150x150/?cactus',
      category: 'succulent',
      weather: 'arid',
      environment: 'indoor',
      rating: 4.3,
      price: 799,
      discount: 0,
      originalPrice: 799,
      state: 'rajasthan'
    });
  } else {
    fallbackPlants.push({
      id: 'temperate1',
      name: 'Snake Plant',
      image: 'https://source.unsplash.com/random/150x150/?snake-plant',
      category: 'indoor',
      weather: 'temperate',
      environment: 'indoor',
      rating: 4.9,
      price: 899,
      discount: 15,
      originalPrice: 1099,
      state: 'maharashtra'
    });
    fallbackPlants.push({
      id: 'temperate2',
      name: 'Peace Lily',
      image: 'https://source.unsplash.com/random/150x150/?peace-lily',
      category: 'indoor',
      weather: 'temperate',
      environment: 'indoor',
      rating: 4.7,
      price: 1099,
      discount: 0,
      originalPrice: 1099,
      state: 'delhi'
    });
  }
  
  // Add a few more general plants
  fallbackPlants.push({
    id: 'general1',
    name: 'Pothos',
    image: 'https://source.unsplash.com/random/150x150/?pothos',
    category: 'vine',
    weather: 'temperate',
    environment: 'indoor',
    rating: 4.5,
    price: 599,
    discount: 0,
    originalPrice: 599,
    state: 'west-bengal'
  });
  
  fallbackPlants.push({
    id: 'general2',
    name: 'Fiddle Leaf Fig',
    image: 'https://source.unsplash.com/random/150x150/?fiddle-leaf-fig',
    category: 'tree',
    weather: 'tropical',
    environment: 'indoor',
    rating: 4.8,
    price: 2499,
    discount: 10,
    originalPrice: 2799,
    state: 'karnataka'
  });
  
  return fallbackPlants;
}

// Simple debounce function to prevent too many API calls
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
} 