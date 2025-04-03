const API_KEY = 'sk-ooGA67ea26f7677fe9521';

// Perenual API endpoints
const API_ENDPOINTS = {
  SPECIES_LIST: 'https://perenual.com/api/v2/species-list',
  SPECIES_DETAILS: 'https://perenual.com/api/v2/species/details',
  PEST_DISEASE_LIST: 'https://perenual.com/api/pest-disease-list',
  CARE_GUIDE_LIST: 'https://perenual.com/api/species-care-guide-list',
  HARDINESS_MAP: 'https://perenual.com/api/hardiness-map'
};

// Set to false to use the API by default
let useLocalData = false;

// Import fallback data
const plantsData = [
  // Andhra Pradesh Plants
  {
    id: 1,
    name: "Red Sanders",
    scientificName: "Pterocarpus santalinus",
    category: "tree",
    state: "andhra-pradesh",
    environment: "outdoor",
    weather: "tropical",
    soil: "loamy",
    terrain: "hills",
    usage: ["medicinal", "ornamental"],
    rating: 4.8,
    price: 1200,
    originalPrice: 1500,
    discount: 20,
    image: "https://source.unsplash.com/random/300x300/?tree,red",
    description: "Red Sanders is a rare and endemic tree species found in the forests of Andhra Pradesh. It's highly valued for its rich red wood and medicinal properties.",
    details: {
      height: "Up to 10 meters",
      waterNeeds: "Moderate",
      sunlight: "Full sun",
      growthRate: "Slow",
      lifespan: "Over 100 years",
      difficulty: "Moderate"
    },
    isNew: false,
    isSale: true,
    inStock: true
  },
  {
    id: 2,
    name: "Neem Tree",
    scientificName: "Azadirachta indica",
    category: "tree",
    state: "andhra-pradesh",
    environment: "outdoor",
    weather: "tropical",
    soil: "sandy",
    terrain: "plains",
    usage: ["medicinal", "religious"],
    rating: 4.9,
    price: 800,
    originalPrice: 800,
    discount: 0,
    image: "https://source.unsplash.com/random/300x300/?neem,tree",
    description: "Neem is a fast-growing tree native to the Indian subcontinent. It's known for its medicinal properties and is considered sacred in many parts of India.",
    details: {
      height: "15-20 meters",
      waterNeeds: "Low",
      sunlight: "Full sun",
      growthRate: "Fast",
      lifespan: "150-200 years",
      difficulty: "Easy"
    },
    isNew: false,
    isSale: false,
    inStock: true
  },
  {
    id: 3,
    name: "Peepal Tree",
    scientificName: "Ficus religiosa",
    category: "tree",
    state: "andhra-pradesh",
    environment: "outdoor",
    weather: "tropical",
    soil: "loamy",
    terrain: "plains",
    usage: ["religious", "medicinal"],
    rating: 4.7,
    price: 950,
    originalPrice: 1100,
    discount: 14,
    image: "https://source.unsplash.com/random/300x300/?peepal,tree",
    description: "The Peepal tree is considered sacred in Hinduism, Buddhism, and Jainism. It has heart-shaped leaves and is known for its medicinal properties.",
    details: {
      height: "Up to 30 meters",
      waterNeeds: "Moderate",
      sunlight: "Full sun",
      growthRate: "Fast",
      lifespan: "Over 100 years",
      difficulty: "Easy"
    },
    isNew: false,
    isSale: true,
    inStock: true
  },
  {
    id: 4,
    name: "Tulsi Plant",
    scientificName: "Ocimum tenuiflorum",
    category: "herb",
    state: "andhra-pradesh",
    environment: "both",
    weather: "tropical",
    soil: "loamy",
    terrain: "plains",
    usage: ["medicinal", "religious", "aromatic"],
    rating: 5.0,
    price: 250,
    originalPrice: 300,
    discount: 17,
    image: "https://source.unsplash.com/random/300x300/?tulsi,basil",
    description: "Tulsi or Holy Basil is a sacred plant in Hindu tradition. It's known for its medicinal properties and is commonly grown in homes and temples.",
    details: {
      height: "0.5-1 meter",
      waterNeeds: "Moderate",
      sunlight: "Partial to full sun",
      growthRate: "Fast",
      lifespan: "2-3 years",
      difficulty: "Easy"
    },
    isNew: false,
    isSale: true,
    inStock: true
  },
  {
    id: 5,
    name: "Indian Sandalwood",
    scientificName: "Santalum album",
    category: "tree",
    state: "andhra-pradesh",
    environment: "outdoor",
    weather: "tropical",
    soil: "sandy",
    terrain: "hills",
    usage: ["aromatic", "medicinal", "religious"],
    rating: 4.6,
    price: 1500,
    originalPrice: 1800,
    discount: 17,
    image: "https://source.unsplash.com/random/300x300/?sandalwood,tree",
    description: "Indian Sandalwood is a small tropical tree known for its fragrant heartwood. It's used in perfumes, cosmetics, and religious ceremonies.",
    details: {
      height: "Up to 9 meters",
      waterNeeds: "Low to moderate",
      sunlight: "Full sun",
      growthRate: "Slow",
      lifespan: "40-80 years",
      difficulty: "Difficult"
    },
    isNew: false,
    isSale: true,
    inStock: true
  },
  // Add more sample plants here
  {
    id: 6,
    name: "Coconut Palm",
    scientificName: "Cocos nucifera",
    category: "tree",
    state: "kerala",
    environment: "outdoor",
    weather: "tropical",
    soil: "sandy",
    terrain: "coastal",
    usage: ["edible", "ornamental"],
    rating: 4.9,
    price: 1100,
    originalPrice: 1300,
    discount: 15,
    image: "https://source.unsplash.com/random/300x300/?coconut,palm",
    description: "The Coconut Palm is an iconic tree of Kerala, known as the 'Tree of Life'. Every part of the tree is useful, from its fruit to its leaves and trunk.",
    details: {
      height: "20-30 meters",
      waterNeeds: "Moderate",
      sunlight: "Full sun",
      growthRate: "Moderate",
      lifespan: "60-80 years",
      difficulty: "Easy"
    },
    isNew: false,
    isSale: true,
    inStock: true
  }
];

// Test the API connection first
async function testApiConnection() {
  try {
    // If we're already using local data, skip the test
    if (useLocalData) {
      console.log('Local data mode is forced, skipping API test');
      return false;
    }
    
    console.log('Testing API connection...');
    const testUrl = `${API_ENDPOINTS.SPECIES_LIST}?key=${API_KEY}&page=1&per_page=1`;
    console.log('Test URL:', testUrl.replace(API_KEY, 'API_KEY_HIDDEN')); // Log without exposing API key
    
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API connection test failed with status ${response.status}: ${errorText}`);
      console.warn('API key may have reached its daily limit - using local data');
      throw new Error(`API connection test failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.data) {
      console.error('API returned invalid data format:', data);
      console.warn('API key limitations detected - using local data');
      throw new Error('API returned invalid data format');
    }
    
    console.log('API connection successful:', {
      to: data.to,
      per_page: data.per_page,
      current_page: data.current_page,
      from: data.from,
      data: `Array(${data.data ? data.data.length : 0})`
    });
    
    // API is working, we can use it
    useLocalData = false;
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    console.warn('API-key unavailable - using local data fallback');
    // Force use of local data
    useLocalData = true;
    return false;
  }
}

// Convert Perenual API data to our app's format
function mapApiPlantToAppFormat(apiPlant) {
  try {
    if (!apiPlant) {
      console.error('Invalid plant data provided to mapper');
      throw new Error('Invalid plant data');
    }
    
    console.log('Mapping API plant data:', apiPlant.id, apiPlant.common_name);
    
    // Generate realistic prices based on plant type and rarity
    const basePrice = apiPlant.rare === 1 ? 1200 : 600;
    const originalPrice = Math.floor(basePrice + (Math.random() * 500));
    const discountPercent = Math.random() > 0.5 ? Math.floor(Math.random() * 30) : 0;
    const price = discountPercent > 0 
      ? Math.round(originalPrice * (1 - discountPercent / 100)) 
      : originalPrice;
    
    // Handle image URLs properly
    let image = 'https://source.unsplash.com/random/300x300/?plant';
    if (apiPlant.default_image && apiPlant.default_image.regular_url) {
      // Fix potential escaped URL issue
      image = apiPlant.default_image.regular_url.replace(/\\\//g, '/');
      // Fix missing https protocol if needed
      if (image.startsWith('//')) {
        image = 'https:' + image;
      }
    } else if (apiPlant.default_image && apiPlant.default_image.original_url) {
      image = apiPlant.default_image.original_url.replace(/\\\//g, '/');
      if (image.startsWith('//')) {
        image = 'https:' + image;
      }
    } else if (apiPlant.default_image && apiPlant.default_image.thumbnail) {
      image = apiPlant.default_image.thumbnail.replace(/\\\//g, '/');
      if (image.startsWith('//')) {
        image = 'https:' + image;
      }
    }
    
    // Fallback to Unsplash if no image or if the image URL doesn't start with http
    if (!image || (!image.startsWith('http') && !image.startsWith('//'))) {
      const plantName = apiPlant.common_name || 'plant';
      image = `https://source.unsplash.com/random/300x300/?${encodeURIComponent(plantName)}`;
    }
    
    // Handle scientific name
    let scientificName = '';
    if (apiPlant.scientific_name && Array.isArray(apiPlant.scientific_name) && apiPlant.scientific_name.length > 0) {
      scientificName = apiPlant.scientific_name[0];
    } else if (typeof apiPlant.scientific_name === 'string') {
      scientificName = apiPlant.scientific_name;
    }
    
    // Determine plant category more accurately
    let category = 'plant';
    if (apiPlant.type && typeof apiPlant.type === 'string') {
      // Use type directly from API if available
      category = apiPlant.type.toLowerCase();
    } else if (apiPlant.cycle === 'Perennial' && apiPlant.dimensions && apiPlant.dimensions.height_mature_ft && apiPlant.dimensions.height_mature_ft > 15) {
      category = 'tree';
    } else if (apiPlant.cycle === 'Perennial') {
      category = 'perennial';
    } else if (apiPlant.cycle === 'Annual') {
      category = 'annual';
    } else if (scientificName.toLowerCase().includes('tree') || 
               (apiPlant.common_name && apiPlant.common_name.toLowerCase().includes('tree'))) {
      category = 'tree';
    }
    
    // Randomly assign Indian states but ensure plants from similar climate zones are grouped
    const statesByClimate = {
      tropical: ['kerala', 'tamil-nadu', 'karnataka', 'andhra-pradesh'],
      temperate: ['maharashtra', 'gujarat'],
      humid: ['west-bengal', 'assam'],
      arid: ['bihar']
    };
    
    // Determine weather type based on plant attributes
    let weather = 'temperate';
    if (apiPlant.drought_tolerant === 1) {
      weather = 'arid';
    } else if (apiPlant.tropical === 1) {
      weather = 'tropical';
    } else if (apiPlant.humidity && apiPlant.humidity === 'high') {
      weather = 'humid';
    }
    
    // Select state based on determined weather
    const statesForWeather = statesByClimate[weather] || statesByClimate.temperate;
    const state = statesForWeather[Math.floor(Math.random() * statesForWeather.length)];
    
    // Create description from API data
    let description = apiPlant.description || `A beautiful ${category} that can be grown in India.`;
    if (description.length > 200) {
      description = description.substring(0, 197) + '...';
    }
    
    if (!description && apiPlant.other_name && Array.isArray(apiPlant.other_name) && apiPlant.other_name.length > 0) {
      description = `Also known as: ${apiPlant.other_name.join(', ')}. A beautiful ${category} that thrives in ${weather} conditions.`;
    }
    
    // Determine environment more accurately
    let environment = 'outdoor';
    if (apiPlant.indoor === 1) {
      environment = 'indoor';
    }
    
    // Extract appropriate soil type
    let soil = 'loamy';
    if (apiPlant.soil && Array.isArray(apiPlant.soil)) {
      if (apiPlant.soil.includes('Sandy')) soil = 'sandy';
      else if (apiPlant.soil.includes('Clay')) soil = 'clay';
      else if (apiPlant.soil.includes('Loamy')) soil = 'loamy';
    }
    
    // Create usage array
    const usage = ['ornamental'];
    if (apiPlant.edible === 1) usage.push('edible');
    if (apiPlant.medicinal === 1) usage.push('medicinal');
    if (apiPlant.tropical === 1) usage.push('tropical');
    if (apiPlant.poisonous === 1) usage.push('poisonous');
    
    // Extract details
    const details = {
      height: apiPlant.dimensions && apiPlant.dimensions.height_mature_ft 
        ? `${apiPlant.dimensions.height_mature_ft} ft` 
        : "Varies",
      waterNeeds: apiPlant.watering || "Moderate",
      sunlight: Array.isArray(apiPlant.sunlight) ? apiPlant.sunlight.join(', ') : "Partial to full sun",
      growthRate: apiPlant.growth_rate || "Moderate",
      lifespan: apiPlant.cycle || "Perennial",
      difficulty: apiPlant.maintenance || "Moderate"
    };
    
    // Calculate rating based on attributes (more interesting plants get higher ratings)
    let baseRating = 3.5;
    if (apiPlant.edible === 1) baseRating += 0.3;
    if (apiPlant.tropical === 1) baseRating += 0.2;
    if (apiPlant.rare === 1) baseRating += 0.5;
    if (apiPlant.medicinal === 1) baseRating += 0.4;
    
    // Add a small random factor (±0.3)
    const rating = Math.min(5.0, Math.max(1.0, baseRating + (Math.random() * 0.6 - 0.3))).toFixed(1);
    
    return {
      id: apiPlant.id,
      name: apiPlant.common_name || 'Unknown Plant',
      scientificName: scientificName,
      category: category,
      state: state,
      environment: environment,
      weather: weather,
      soil: soil,
      terrain: apiPlant.tropical === 1 ? 'tropical' : 'plains',
      usage: usage,
      rating: parseFloat(rating),
      price: price,
      originalPrice: originalPrice,
      discount: discountPercent,
      image: image,
      description: description,
      details: details,
      isNew: apiPlant.rare === 1 || Math.random() > 0.9,
      isSale: discountPercent > 0,
      inStock: true,
      // Preserve additional API data that might be useful
      apiData: {
        cycle: apiPlant.cycle,
        watering: apiPlant.watering,
        sunlight: apiPlant.sunlight
      }
    };
  } catch (error) {
    console.error('Error mapping plant data:', error, apiPlant);
    // Return a default plant object if mapping fails
    return {
      id: apiPlant?.id || Math.floor(Math.random() * 1000),
      name: apiPlant?.common_name || 'Unknown Plant',
      scientificName: 'Unknown',
      category: 'plant',
      state: 'andhra-pradesh',
      environment: 'outdoor',
      weather: 'tropical',
      soil: 'loamy',
      terrain: 'plains',
      usage: ['ornamental'],
      rating: 4.0,
      price: 500,
      originalPrice: 600,
      discount: 17,
      image: 'https://source.unsplash.com/random/300x300/?plant',
      description: 'A beautiful plant species.',
      details: {
        height: "Varies",
        waterNeeds: "Moderate",
        sunlight: "Partial to full sun",
        growthRate: "Moderate",
        lifespan: "Perennial",
        difficulty: "Moderate"
      },
      isNew: false,
      isSale: true,
      inStock: true
    };
  }
}

// Function to fetch all plants
export async function fetchPlants(options = {}) {
  try {
    // Set default pagination options
    const page = options.page || 1;
    const perPage = options.per_page || 12;
    
    // Check if we should use local data
    if (useLocalData) {
      console.log(`Using local plant data for page ${page}`);
      
      // Simple pagination logic for local data
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      
      // Return a slice of the local data to simulate pagination
      return plantsData.slice(startIndex, endIndex);
    }

    // Test API connection first
    const apiAvailable = await testApiConnection();
    if (!apiAvailable) {
      console.log(`API connection failed, using local data for page ${page}`);
      useLocalData = true;
      
      // Simple pagination logic for local data
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      
      // Return a slice of the local data to simulate pagination
      return plantsData.slice(startIndex, endIndex);
    }

    console.log(`Fetching plants from Perenual API for page ${page}...`);
    const requestUrl = `${API_ENDPOINTS.SPECIES_LIST}?key=${API_KEY}&page=${page}&per_page=${perPage}`;
    console.log('Request URL:', requestUrl.replace(API_KEY, 'API_KEY_HIDDEN')); // Log without exposing API key
    
    const response = await fetch(requestUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData = await response.json();
    console.log('API response received:', {
      to: apiData.to,
      per_page: apiData.per_page,
      current_page: apiData.current_page,
      from: apiData.from,
      data: `Array(${apiData.data ? apiData.data.length : 0})`
    });
    
    if (!apiData.data || !Array.isArray(apiData.data)) {
      console.error('Invalid API response format - data array missing:', apiData);
      throw new Error('Invalid API response format - data array missing');
    }
    
    // Map API data to our application format
    const mappedPlants = apiData.data.map(plant => mapApiPlantToAppFormat(plant));
    console.log(`Successfully mapped ${mappedPlants.length} plants for page ${page}`);
    return mappedPlants;
  } catch (error) {
    console.error('Error fetching plants:', error);
    
    // Fallback to local data
    useLocalData = true;
    console.warn('API-key unavailable - using local data fallback');
    
    // Simple pagination logic for local data
    const page = options.page || 1;
    const perPage = options.per_page || 12;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    // Return a slice of the local data to simulate pagination
    return plantsData.slice(startIndex, endIndex);
  }
}

// Function to fetch plants with filters
export async function fetchFilteredPlants(filters) {
  try {
    // Set default pagination options if not provided
    const page = filters.page || 1;
    const perPage = filters.per_page || 12;
    
    // Check if we should use local data
    if (useLocalData) {
      console.log(`Filtering local plant data for page ${page}`);
      const filteredPlants = filterLocalPlants(plantsData, filters);
      
      // Apply pagination to the filtered results
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      return filteredPlants.slice(startIndex, endIndex);
    }

    console.log(`Fetching filtered plants from Perenual API for page ${page}...`);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('key', API_KEY);
    
    // Add pagination parameters
    queryParams.append('page', page.toString());
    queryParams.append('per_page', perPage.toString());
    
    // Add search parameter if present
    if (filters.search) {
      queryParams.append('q', filters.search);
    }
    
    // Add environment filter (indoor/outdoor)
    if (filters.environment && filters.environment.length > 0) {
      // Perenual API uses 1 for indoor, 0 for outdoor
      if (filters.environment.includes('indoor')) {
        queryParams.append('indoor', '1');
      } else if (filters.environment.includes('outdoor')) {
        queryParams.append('indoor', '0');
      }
    }
    
    // Add cycle filter if present (annual, perennial, biennial)
    if (filters.cycle && filters.cycle.length > 0) {
      queryParams.append('cycle', filters.cycle.join(','));
    }
    
    // Add watering filter
    if (filters.watering && filters.watering.length > 0) {
      queryParams.append('watering', filters.watering.join(','));
    }
    
    // Add sunlight filter
    if (filters.sunlight && filters.sunlight.length > 0) {
      queryParams.append('sunlight', filters.sunlight.join(','));
    }
    
    // Add edible filter
    if (filters.edible !== undefined) {
      queryParams.append('edible', filters.edible ? '1' : '0');
    }
    
    // Add poisonous filter
    if (filters.poisonous !== undefined) {
      queryParams.append('poisonous', filters.poisonous ? '1' : '0');
    }
    
    // Add medicinal filter
    if (filters.medicinal !== undefined) {
      queryParams.append('medicinal', filters.medicinal ? '1' : '0');
    }
    
    // Add tropical filter
    if (filters.tropical !== undefined) {
      queryParams.append('tropical', filters.tropical ? '1' : '0');
    }
    
    // Add hardiness filter for climate/weather zones
    if (filters.hardiness) {
      queryParams.append('hardiness', filters.hardiness);
    }
    
    // Add soil type filter
    if (filters.soil) {
      queryParams.append('soil', filters.soil);
    }
    
    // Add API-specific parameters if provided in the filters
    if (filters.apiParams) {
      console.log('Using API-specific parameters from products page');
      // Get all key-value pairs from apiParams
      for (const [key, value] of Object.entries(filters.apiParams)) {
        // Only add if not already included
        if (!queryParams.has(key)) {
          queryParams.append(key, value);
        }
      }
    }
    
    // Make API request
    const requestUrl = `${API_ENDPOINTS.SPECIES_LIST}?${queryParams.toString()}`;
    console.log('Filter request URL:', requestUrl.replace(API_KEY, 'API_KEY_HIDDEN')); // Log without exposing API key
    
    const response = await fetch(requestUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData = await response.json();
    console.log('API response for filtered plants:', {
      to: apiData.to,
      per_page: apiData.per_page,
      current_page: apiData.current_page,
      from: apiData.from,
      total: apiData.total,
      last_page: apiData.last_page,
      data: `Array(${apiData.data ? apiData.data.length : 0})`
    });
    
    if (!apiData.data || !Array.isArray(apiData.data)) {
      console.error('Invalid API response format - data array missing:', apiData);
      throw new Error('Invalid API response format - data array missing');
    }
    
    // Map API data to our format and apply additional filtering
    const mappedPlants = apiData.data.map(plant => mapApiPlantToAppFormat(plant));
    
    // Apply local filtering for filters not supported by the API
    const filteredPlants = filterLocalPlants(mappedPlants, filters);
    console.log(`Found ${filteredPlants.length} plants after filtering for page ${page}`);
    
    return filteredPlants;
  } catch (error) {
    console.error('Error fetching filtered plants:', error);
    
    // Fallback to local data
    useLocalData = true;
    console.log('Falling back to local plant data filtering');
    const filteredPlants = filterLocalPlants(plantsData, filters);
    
    // Apply pagination to the filtered results
    const page = filters.page || 1;
    const perPage = filters.per_page || 12;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredPlants.slice(startIndex, endIndex);
  }
}

// Function to fetch a single plant by ID
export async function fetchPlantById(id) {
  // Check if we should use local data
  if (useLocalData) {
    console.log(`Finding plant with ID ${id} in local data`);
    const plant = plantsData.find(p => p.id === parseInt(id));
    if (plant) {
      return plant;
    }
    throw new Error(`Plant with ID ${id} not found in local data`);
  }

  try {
    console.log(`Fetching plant with ID ${id} from Perenual API...`);
    const response = await fetch(`${API_ENDPOINTS.SPECIES_DETAILS}/${id}?key=${API_KEY}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiPlant = await response.json();
    console.log('API response for plant details:', apiPlant);
    
    // Map plant to our format
    const mappedPlant = mapApiPlantToAppFormat(apiPlant);
    
    // Try to fetch care guide information
    try {
      const careGuide = await fetchCareGuide(id);
      if (careGuide) {
        // Add care guide information to plant details
        mappedPlant.details = {
          ...mappedPlant.details,
          waterNeeds: careGuide.watering || mappedPlant.details.waterNeeds,
          sunlight: careGuide.sunlight || mappedPlant.details.sunlight,
        };
        
        // Add care guide description if available
        if (careGuide.description) {
          mappedPlant.description = careGuide.description;
        }
      }
    } catch (careError) {
      console.log('Care guide not available:', careError);
    }
    
    return mappedPlant;
  } catch (error) {
    console.error(`Error fetching plant with ID ${id}:`, error);
    
    // Fallback to local data
    useLocalData = true;
    console.log('Falling back to local plant data');
    
    const plant = plantsData.find(p => p.id === parseInt(id));
    if (plant) {
      return plant;
    }
    throw new Error(`Plant with ID ${id} not found in local data`);
  }
}

// Function to fetch care guide for a plant
export async function fetchCareGuide(speciesId) {
  try {
    const response = await fetch(`${API_ENDPOINTS.CARE_GUIDE_LIST}?key=${API_KEY}&species_id=${speciesId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Care guide response:', data);
    
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching care guide for plant ${speciesId}:`, error);
    return null;
  }
}

// Function to fetch hardiness map for a plant
export async function fetchHardinessMap(speciesId) {
  try {
    const response = await fetch(`${API_ENDPOINTS.HARDINESS_MAP}?key=${API_KEY}&species_id=${speciesId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Hardiness map response:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching hardiness map for plant ${speciesId}:`, error);
    return null;
  }
}

// Function to fetch pest and disease information
export async function fetchPestDiseaseList() {
  try {
    const response = await fetch(`${API_ENDPOINTS.PEST_DISEASE_LIST}?key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching pest and disease list:', error);
    return [];
  }
}

// Function to filter local plants data
function filterLocalPlants(plants, filters) {
  if (!plants || !Array.isArray(plants)) {
    console.error('Invalid plants data for filtering:', plants);
    return [];
  }
  
  if (!filters) {
    console.warn('No filters provided, returning all plants');
    return plants;
  }
  
  return plants.filter(product => {
    try {
      // Ensure product exists
      if (!product) return false;
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchFields = [
          product.name ? product.name.toLowerCase() : '',
          product.scientificName ? product.scientificName.toLowerCase() : '',
          product.description ? product.description.toLowerCase() : ''
        ];
        
        if (!searchFields.some(field => field.includes(searchTerm))) {
          return false;
        }
      }
      
      // State filter
      if (filters.state && Array.isArray(filters.state) && filters.state.length > 0) {
        if (!product.state || !filters.state.includes(product.state)) {
          return false;
        }
      }
      
      // Environment filter
      if (filters.environment && Array.isArray(filters.environment) && filters.environment.length > 0) {
        if (!product.environment || 
            (!filters.environment.includes(product.environment) && 
             !filters.environment.includes('both'))) {
          return false;
        }
      }
      
      // Weather filter
      if (filters.weather && Array.isArray(filters.weather) && filters.weather.length > 0) {
        if (!product.weather || !filters.weather.includes(product.weather)) {
          return false;
        }
      }
      
      // Soil filter
      if (filters.soil && Array.isArray(filters.soil) && filters.soil.length > 0) {
        if (!product.soil || !filters.soil.includes(product.soil)) {
          return false;
        }
      }
      
      // Terrain filter
      if (filters.terrain && Array.isArray(filters.terrain) && filters.terrain.length > 0) {
        if (!product.terrain || !filters.terrain.includes(product.terrain)) {
          return false;
        }
      }
      
      // Category filter
      if (filters.category && Array.isArray(filters.category) && filters.category.length > 0) {
        if (!product.category || !filters.category.includes(product.category)) {
          return false;
        }
      }
      
      // Usage filter
      if (filters.usage && Array.isArray(filters.usage) && filters.usage.length > 0) {
        if (!product.usage || !Array.isArray(product.usage) || 
            !filters.usage.some(usage => product.usage.includes(usage))) {
          return false;
        }
      }
      
      // Rating filter
      if (filters.rating && product.rating < filters.rating) {
        return false;
      }
      
      // Price filter
      if (filters.price) {
        if (filters.price.min && product.price < filters.price.min) {
          return false;
        }
        
        if (filters.price.max && product.price > filters.price.max) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error filtering product:', error, product);
      return false;
    }
  });
} 