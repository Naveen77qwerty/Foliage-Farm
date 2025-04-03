const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const ElectronStore = require('electron-store');
const dotenv = require('dotenv');

// Initialize secure store for sensitive data
const secureStore = new ElectronStore({
  encryptionKey: 'your-secure-encryption-key',
  name: 'foliage-farm-secure-storage'
});

// Load environment variables
dotenv.config();

// Environment Variables with fallbacks from secure store
const SECRET_KEY = process.env.SECRET_KEY || secureStore.get('SECRET_KEY') || "a6155a29-0a34-48bc-a184-1237ffa3c25b";
const MONGO_URI = process.env.MONGO_URI || secureStore.get('MONGO_URI') || "mongodb://localhost:27017/foliage_farm";

// Store these securely if not already stored
if (!secureStore.get('SECRET_KEY')) {
  secureStore.set('SECRET_KEY', SECRET_KEY);
}
if (!secureStore.get('MONGO_URI')) {
  secureStore.set('MONGO_URI', MONGO_URI);
}

let mainWindow;
let expressApp;
let server;

// Setup Express app
function setupExpressApp() {
  expressApp = express();
  
  // Middleware
  expressApp.use(express.json());
  expressApp.use(express.static(path.join(__dirname, 'public')));
  
  // Define User Schema & Model
  const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
  });
  const UserLogin = mongoose.model("UserLogin", userSchema);
  
  // **Register a New User**
  expressApp.post("/api/register", async (req, res) => {
    try {
      const { name, username, password } = req.body;
  
      // Validate Input
      if (!name || !username || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      // Check if username exists
      const existingUser = await UserLogin.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserLogin({ name, username, password: hashedPassword });
      await newUser.save();
  
      res.status(201).json({ message: "✅ User registered successfully" });
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  });
  
  // **Login Route**
  expressApp.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
  
      const user = await UserLogin.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
  
      // Generate JWT Token
      const token = jwt.sign(
        { username: user.username, name: user.name },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
  
      res.status(200).json({ message: "✅ Login successful", token });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ error: "Server error during login" });
    }
  });
  
  // **Middleware to Authenticate User**
  const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from "Bearer <token>"
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
  };
  
  // **Get User Profile**
  expressApp.get("/api/profile", authenticateUser, async (req, res) => {
    try {
      const user = await UserLogin.findOne({ username: req.user.username }).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      res.status(500).json({ error: "Server error while fetching profile" });
    }
  });
  
  // Serve index.html for all other routes
  expressApp.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  // Start server on an available port
  server = expressApp.listen(0, () => {
    const port = server.address().port;
    console.log(`🚀 Express server running at http://localhost:${port}`);
    
    // Store the port for the renderer to use
    secureStore.set('API_PORT', port);
  });
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    // Set up Express server after MongoDB connection is established
    setupExpressApp();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    app.quit();
  }
}

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public', 'favicon.svg')
  });

  // In production, load from the express server
  // In development, could load from file directly
  const startUrl = url.format({
    pathname: `localhost:${secureStore.get('API_PORT')}`,
    protocol: 'http:',
    slashes: true,
  });
  
  mainWindow.loadURL(startUrl);
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

// Copy the web project files to public directory for serving via Express
function copyWebFilesToPublic() {
  const publicDir = path.join(__dirname, 'public');
  const sourceDir = path.join(__dirname, '..');  // Assuming the web files are in the parent directory
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Function to copy files recursively
  function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      fs.readdirSync(src).forEach(function(childItemName) {
        // Skip node_modules and .git directories
        if (childItemName !== 'node_modules' && childItemName !== '.git' && childItemName !== 'electron-app') {
          copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        }
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
  
  // Copy files from source to public
  copyRecursiveSync(sourceDir, publicDir);
  
  // Update auth.js file to use the correct API URL
  const authJsPath = path.join(publicDir, 'auth.js');
  if (fs.existsSync(authJsPath)) {
    let authContent = fs.readFileSync(authJsPath, 'utf8');
    // Replace the API_URL with the correct API endpoint for Electron
    authContent = authContent.replace(
      /const API_URL = '.*';/,
      `const API_URL = '/api';`
    );
    fs.writeFileSync(authJsPath, authContent);
  }
}

// Electron app events
app.on('ready', async () => {
  // Copy web files to public directory
  copyWebFilesToPublic();
  
  // Connect to MongoDB
  await connectToMongoDB();
  
  // Create the browser window after the server is started
  setTimeout(createWindow, 1000);  // Small delay to ensure server is ready
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function() {
  if (mainWindow === null) createWindow();
});

// IPC communication between renderer and main process
ipcMain.handle('get-user-data', async () => {
  return secureStore.get('user-data') || null;
});

ipcMain.handle('set-user-data', async (event, userData) => {
  secureStore.set('user-data', userData);
  return true;
});

ipcMain.handle('clear-user-data', async () => {
  secureStore.delete('user-data');
  return true;
});

// Cleanup when app closes
app.on('before-quit', () => {
  if (server) {
    server.close();
  }
  if (mongoose.connection.readyState === 1) {
    mongoose.disconnect();
  }
}); 