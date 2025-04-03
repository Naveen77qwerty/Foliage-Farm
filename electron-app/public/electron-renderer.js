// This script integrates the web application with Electron desktop functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Check if running in Electron
  const isElectron = window.electronAPI !== undefined;

  if (isElectron) {
    console.log('Running in Electron');
    
    // Get app version and platform
    const appVersion = await window.electronAPI.getAppVersion() || '1.0.0';
    const platform = await window.electronAPI.getPlatform() || 'unknown';
    
    console.log(`Electron App Version: ${appVersion}, Platform: ${platform}`);
    
    // Integrate with auth.js functionality
    
    // Override token storage to use Electron secure storage
    const originalSetToken = window.setToken;
    const originalGetToken = window.getToken;
    const originalRemoveToken = window.removeToken;
    
    if (typeof originalSetToken === 'function') {
      window.setToken = async function(token) {
        const userData = await window.electronAPI.getUserData() || {};
        userData.token = token;
        await window.electronAPI.setUserData(userData);
        // Still use localStorage for compatibility
        originalSetToken(token);
        return token;
      };
    }
    
    if (typeof originalGetToken === 'function') {
      window.getToken = async function() {
        const userData = await window.electronAPI.getUserData() || {};
        return userData.token || originalGetToken();
      };
    }
    
    if (typeof originalRemoveToken === 'function') {
      window.removeToken = async function() {
        const userData = await window.electronAPI.getUserData() || {};
        delete userData.token;
        await window.electronAPI.setUserData(userData);
        originalRemoveToken();
      };
    }
    
    // Add app version to footer
    const footerElement = document.querySelector('.footer-bottom');
    if (footerElement) {
      const versionElement = document.createElement('p');
      versionElement.classList.add('app-version');
      versionElement.textContent = `Desktop App v${appVersion}`;
      versionElement.style.marginTop = '8px';
      versionElement.style.fontSize = '12px';
      versionElement.style.opacity = '0.7';
      footerElement.appendChild(versionElement);
    }
    
    // Update logout handling
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Clear Electron secure storage
        await window.electronAPI.clearUserData();
        
        // Then perform normal logout
        if (typeof logoutUser === 'function') {
          logoutUser();
        } else {
          // Fallback if logoutUser is not defined
          localStorage.removeItem('foliageToken');
          localStorage.removeItem('foliageUser');
          window.location.href = 'index.html';
        }
      });
    });
  }
}); 