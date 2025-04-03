// Authentication functionality for Foliage Farm
const API_URL = '/api'; // Update this to your actual API URL

// Store JWT token
function setToken(token) {
  localStorage.setItem('foliageToken', token);
}

// Get JWT token
function getToken() {
  return localStorage.getItem('foliageToken');
}

// Remove JWT token
function removeToken() {
  localStorage.removeItem('foliageToken');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Store user data
function setUser(userData) {
  localStorage.setItem('foliageUser', JSON.stringify(userData));
}

// Get user data
function getUser() {
  const userData = localStorage.getItem('foliageUser');
  return userData ? JSON.parse(userData) : null;
}

// Register new user
async function registerUser(name, username, password) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store JWT token
    setToken(data.token);
    
    // Decode token to get user data
    const userData = parseJwt(data.token);
    setUser(userData);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Parse JWT token
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// Get user profile
async function getUserProfile() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get profile');
    }

    return data;
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
}

// Logout user
function logoutUser() {
  removeToken();
  localStorage.removeItem('foliageUser');
  window.location.href = 'index.html';
}

// Update UI based on authentication state
function updateAuthUI() {
  const isAuthenticated = isLoggedIn();
  const user = getUser();
  
  // Elements to update (add your specific selectors)
  const loginLinks = document.querySelectorAll('.auth-link:not(.signup-btn)');
  const signupLinks = document.querySelectorAll('.signup-btn');
  const profileElements = document.querySelectorAll('.profile-element');
  const userNameElements = document.querySelectorAll('.user-name');
  
  if (isAuthenticated && user) {
    // Hide login/signup links
    loginLinks.forEach(link => link.style.display = 'none');
    signupLinks.forEach(link => link.style.display = 'none');
    
    // Show profile elements
    profileElements.forEach(el => el.style.display = 'flex');
    
    // Update username display
    userNameElements.forEach(el => {
      el.textContent = user.name || user.username;
    });
  } else {
    // Show login/signup links
    loginLinks.forEach(link => link.style.display = 'flex');
    signupLinks.forEach(link => link.style.display = 'flex');
    
    // Hide profile elements
    profileElements.forEach(el => el.style.display = 'none');
  }
}

// Initialize authentication
function initAuth() {
  updateAuthUI();
  
  // Add logout event listeners
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
    });
  });
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', initAuth); 