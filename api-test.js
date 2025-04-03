// API Test Script
const API_KEY = 'sk-ooGA67ea26f7677fe9521';
const API_ENDPOINT = 'https://perenual.com/api/v2/species-list';

async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    const testUrl = `${API_ENDPOINT}?key=${API_KEY}&page=1&per_page=1`;
    console.log('Test URL:', testUrl.replace(API_KEY, 'API_KEY_HIDDEN')); // Log without exposing API key
    
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API connection test failed with status ${response.status}: ${errorText}`);
      console.warn('API key may have reached its daily limit');
      return false;
    }
    
    const data = await response.json();
    
    if (!data || !data.data) {
      console.error('API returned invalid data format:', data);
      console.warn('API key limitations detected');
      return false;
    }
    
    console.log('API connection successful:', {
      to: data.to,
      per_page: data.per_page,
      current_page: data.current_page,
      from: data.from,
      data: `Array(${data.data ? data.data.length : 0})`
    });
    
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    console.warn('API-key unavailable');
    return false;
  }
}

// Run the test
testApiConnection()
  .then(isAvailable => {
    if (isAvailable) {
      console.log('API is available and working correctly.');
    } else {
      console.log('API is not available. The API key may have reached its daily limit of 100 requests.');
    }
  }); 