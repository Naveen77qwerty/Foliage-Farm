// API key and endpoints setup
const API_KEY = 'sk-ooGA67ea26f7677fe9521';

// FAQ API endpoint 
const FAQ_API_ENDPOINT = 'https://perenual.com/api/species-care-guide-list';

// Set to true to force using local data
let useLocalData = true;

// Local fallback FAQ data
const faqData = [
  {
    id: 1,
    question: "How often should I water my indoor plants?",
    answer: "The watering frequency depends on the plant type, pot size, and environmental conditions. As a general rule, most indoor plants should be watered when the top inch of soil feels dry to the touch. Plants in bright light typically need more water than those in low light. Always check the soil moisture before watering and adjust based on your specific plant's needs."
  },
  {
    id: 2,
    question: "What's the best way to repot a plant?",
    answer: "Choose a pot 1-2 inches larger than the current one with drainage holes. Water your plant a day before repotting. Gently remove the plant from its current pot, loosen the root ball, and trim damaged roots. Place fresh potting mix in the new pot, position the plant, and fill around it with soil. Water thoroughly and keep it in a shaded area for a few days to recover from transplant shock."
  },
  {
    id: 3,
    question: "How do I know if my plant is getting enough light?",
    answer: "Signs of inadequate light include leggy growth (long stems with sparse leaves), smaller leaves, slow or no growth, and loss of variegation. Conversely, symptoms of too much light include leaf scorch, curling, or fading. Most plants thrive in bright, indirect light. Research your specific plant's light requirements and observe its response to current light conditions."
  },
  {
    id: 4,
    question: "Why are my plant's leaves turning yellow?",
    answer: "Yellowing leaves can indicate several issues: overwatering (usually affecting lower leaves), underwatering (typically with crispy edges), nutrient deficiencies, pest infestations, light problems, or natural aging. Check the soil moisture first, then examine for pests. Consider recent changes in care routine or environment. Proper diagnosis requires observing pattern and progression of yellowing."
  },
  {
    id: 5,
    question: "How do I get rid of pests on my houseplants?",
    answer: "First, isolate the affected plant to prevent spreading. For mild infestations, wipe leaves with a damp cloth or use insecticidal soap. Neem oil is effective against many common pests. For severe infestations, consider commercial insecticides appropriate for indoor use. Maintain good plant hygiene by regularly cleaning leaves and removing debris from soil. Ensure proper growing conditions to strengthen plant resistance."
  },
  {
    id: 6,
    question: "When should I fertilize my plants?",
    answer: "Most houseplants should be fertilized during their active growing season (spring and summer) and less or not at all during dormancy (fall and winter). Use a balanced, water-soluble fertilizer at half the recommended strength every 2-4 weeks during growing season. Always apply fertilizer to damp soil to prevent root burn. Different plants have varying nutrient needs, so research your specific plant's requirements."
  },
  {
    id: 7,
    question: "How do I propagate my plants?",
    answer: "Common propagation methods include stem cuttings, leaf cuttings, division, and air layering. For stem cuttings, cut a healthy stem below a node, remove lower leaves, and place in water or soil until roots develop. Leaf cuttings work for plants like succulents - let the cut end callus before placing on soil. Division involves separating root clumps during repotting. Research your specific plant's preferred propagation method for best results."
  },
  {
    id: 8,
    question: "Why are the tips of my plant's leaves turning brown?",
    answer: "Brown leaf tips often indicate low humidity, especially in tropical plants. Other causes include salt buildup from fertilizers, dry soil, or water quality issues (chlorine, fluoride, or high mineral content). Increase humidity by misting, using a humidifier, or placing the plant on a pebble tray with water. Flush the soil occasionally to remove salt buildup, and consider using filtered or distilled water for sensitive plants."
  },
  {
    id: 9,
    question: "How do I care for plants in different seasons?",
    answer: "In spring/summer (growing season): Increase watering, resume regular fertilizing, monitor for faster growth, and protect from intense afternoon sun. In fall/winter (dormant period): Reduce watering frequency, stop or minimize fertilizing, move plants away from cold drafts and heating vents, and provide supplemental light if needed. Adjust care based on your home's specific conditions and your plant's response."
  },
  {
    id: 10,
    question: "What's the best soil for indoor plants?",
    answer: "Most houseplants thrive in well-draining potting mix with good aeration. Avoid using garden soil as it's too dense and may contain pests. Different plants have specific soil preferences: cacti and succulents need sandy, fast-draining mix; tropical plants prefer humus-rich soil that retains some moisture; orchids require specialized bark-based medium. You can buy pre-made mixes or customize your own based on plant needs."
  },
  {
    id: 11,
    question: "How do I care for plants native to India?",
    answer: "Indian native plants often thrive in warm, humid conditions. Many require bright, indirect light and regular watering during growth seasons. For tropical Indian species, maintain humidity through misting or humidity trays. During monsoon season equivalents (summer), increase watering, but reduce during dry winter periods. Many Indian plants benefit from monthly feeding with balanced fertilizer during growth periods. Research your specific Indian plant variety for tailored care."
  },
  {
    id: 12,
    question: "Which plants are best for beginners?",
    answer: "Excellent beginner-friendly plants include Snake Plant (Sansevieria), Pothos (Epipremnum aureum), ZZ Plant (Zamioculcas zamiifolia), Spider Plant (Chlorophytum comosum), and Aloe Vera. These plants tolerate inconsistent watering, various light conditions, and generally forgive care mistakes. Many require minimal maintenance while still providing attractive foliage. Start with these resilient plants to build confidence before progressing to more demanding species."
  }
];

// Categories for organizing FAQs
const faqCategories = [
  { id: 1, name: "Watering", faqs: [1, 4, 8] },
  { id: 2, name: "Light & Environment", faqs: [3, 9] },
  { id: 3, name: "Soil & Nutrients", faqs: [6, 10] },
  { id: 4, name: "Common Problems", faqs: [4, 5, 8] },
  { id: 5, name: "Propagation & Repotting", faqs: [2, 7] },
  { id: 6, name: "Beginner Tips", faqs: [11, 12] }
];

// Test the API connection first
async function testApiConnection() {
  try {
    // If we're already using local data, skip the test
    if (useLocalData) {
      console.log('Local data mode is forced for FAQs, skipping API test');
      return false;
    }
    
    console.log('Testing FAQ API connection...');
    const testUrl = `${FAQ_API_ENDPOINT}?key=${API_KEY}&page=1&per_page=1`;
    console.log('Test URL:', testUrl.replace(API_KEY, 'API_KEY_HIDDEN')); // Log without exposing API key
    
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FAQ API connection test failed with status ${response.status}: ${errorText}`);
      console.warn('API key may have reached its daily limit - using local FAQ data');
      throw new Error(`FAQ API connection test failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.data) {
      console.error('FAQ API returned invalid data format:', data);
      console.warn('API key limitations detected - using local FAQ data');
      throw new Error('FAQ API returned invalid data format');
    }
    
    console.log('FAQ API connection successful:', {
      data: `Array(${data.data ? data.data.length : 0})`
    });
    
    // API is working, we can use it
    useLocalData = false;
    return true;
  } catch (error) {
    console.error('FAQ API connection test failed:', error);
    console.warn('API-key unavailable for FAQs - using local data fallback');
    // Force use of local data
    useLocalData = true;
    return false;
  }
}

// Convert API data to our app's FAQ format
function mapApiDataToFaqFormat(apiData) {
  try {
    if (!apiData || !Array.isArray(apiData)) {
      throw new Error('Invalid API data format');
    }
    
    // Map the API data to our FAQ format
    return apiData.map((item, index) => {
      return {
        id: index + 1,
        question: `How should I care for ${item.common_name || 'this plant'}?`,
        answer: item.section && item.section.length > 0 
          ? `${item.section.map(s => `${s.type}: ${s.description}`).join(' ')}` 
          : `Water ${item.watering || 'moderately'}, provide ${item.sunlight || 'bright indirect light'}, and ensure good drainage. For this specific plant, research more detailed care instructions.`
      };
    });
  } catch (error) {
    console.error('Error mapping API data to FAQ format:', error);
    return [];
  }
}

// Function to fetch all FAQs
export async function fetchFaqs() {
  try {
    // Check if we should use local data
    if (useLocalData) {
      console.log('Using local FAQ data');
      return { faqs: faqData, categories: faqCategories };
    }

    // Test API connection first
    const apiAvailable = await testApiConnection();
    if (!apiAvailable) {
      console.log('FAQ API connection failed, using local data');
      useLocalData = true;
      return { faqs: faqData, categories: faqCategories };
    }

    console.log('Fetching FAQs from API...');
    const requestUrl = `${FAQ_API_ENDPOINT}?key=${API_KEY}`;
    console.log('Request URL:', requestUrl.replace(API_KEY, 'API_KEY_HIDDEN')); // Log without exposing API key
    
    const response = await fetch(requestUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiData = await response.json();
    console.log('API response received for FAQs');
    
    if (!apiData.data || !Array.isArray(apiData.data)) {
      console.error('Invalid API response format - data array missing:', apiData);
      throw new Error('Invalid API response format - data array missing');
    }
    
    // Map API data to our application format
    const mappedFaqs = mapApiDataToFaqFormat(apiData.data);
    console.log(`Successfully mapped ${mappedFaqs.length} FAQs from API`);
    
    // For API data, we'll create dynamic categories
    const dynamicCategories = [
      { id: 1, name: "Watering Tips", faqs: mappedFaqs.filter((_, index) => index % 4 === 0).map(faq => faq.id) },
      { id: 2, name: "Light Requirements", faqs: mappedFaqs.filter((_, index) => index % 4 === 1).map(faq => faq.id) },
      { id: 3, name: "Plant Health", faqs: mappedFaqs.filter((_, index) => index % 4 === 2).map(faq => faq.id) },
      { id: 4, name: "General Care", faqs: mappedFaqs.filter((_, index) => index % 4 === 3).map(faq => faq.id) }
    ];
    
    return { faqs: mappedFaqs, categories: dynamicCategories };
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    
    // Fallback to local data
    useLocalData = true;
    console.warn('API-key unavailable - using local FAQ data fallback');
    return { faqs: faqData, categories: faqCategories };
  }
}

// Function to fetch FAQ by ID
export async function fetchFaqById(id) {
  const { faqs } = await fetchFaqs();
  const faq = faqs.find(f => f.id === parseInt(id));
  
  if (!faq) {
    throw new Error(`FAQ with ID ${id} not found`);
  }
  
  return faq;
}

// Function to fetch FAQs by category ID
export async function fetchFaqsByCategory(categoryId) {
  const { faqs, categories } = await fetchFaqs();
  const category = categories.find(c => c.id === parseInt(categoryId));
  
  if (!category) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  
  const categoryFaqs = faqs.filter(faq => category.faqs.includes(faq.id));
  return { category, faqs: categoryFaqs };
}

// Function to search FAQs
export async function searchFaqs(query) {
  const { faqs } = await fetchFaqs();
  
  if (!query || query.trim() === '') {
    return faqs;
  }
  
  const searchTerm = query.toLowerCase();
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm) || 
    faq.answer.toLowerCase().includes(searchTerm)
  );
} 