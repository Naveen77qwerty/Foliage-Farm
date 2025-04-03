const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const helmet = require("helmet"); // For security

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Environment Variables
const SECRET_KEY = process.env.SECRET_KEY || "a6155a29-0a34-48bc-a184-1237ffa3c25b";
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3001; // Changed to match frontend expectations

// Ensure MongoDB URI is provided
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env file");
    process.exit(1);
}

// MongoDB Connection
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// Define User Schema & Model
const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const UserLogin = mongoose.model("UserLogin", userSchema);

// **Register a New User**
app.post("/register", async (req, res) => {
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
app.post("/login", async (req, res) => {
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
app.get("/profile", authenticateUser, async (req, res) => {
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

// **Start Server**
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});


