const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Authentication functions
    getUserData: () => ipcRenderer.invoke('get-user-data'),
    setUserData: (userData) => ipcRenderer.invoke('set-user-data', userData),
    clearUserData: () => ipcRenderer.invoke('clear-user-data'),
    
    // App information
    getAppVersion: () => process.env.npm_package_version,
    getPlatform: () => process.platform
  }
); 