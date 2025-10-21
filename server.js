require('dotenv').config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const axios = require("axios");
const rateLimit = require('express-rate-limit');
const createAuthRouter = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Use built-in body parser instead of deprecated body-parser
app.use(express.static(path.join(__dirname, 'landing_page')));
app.use('/app', express.static(path.join(__dirname, 'public')));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
});

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("✅ Connected to Local MongoDB");
        
        const db = client.db("userDB");
        const users = db.collection("users");

        // Use modular auth routes
        app.use("/", createAuthRouter(users));

        app.get('/api/aqi', async (req, res) => {
            const { lat, lon } = req.query;
            const token = process.env.WAQI_API_TOKEN;
            if (!token) {
                return res.status(500).json({ message: "API token not configured" });
            }
            const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;

            try {
                const response = await axios.get(url);
                res.json(response.data);
            } catch (error) {
                console.error("AQI API error:", error);
                res.status(500).json({ message: "Error fetching AQI data" });
            }
        });

        // Start server
        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}

run().catch(console.dir);

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log("\n🛑 Shutting down gracefully...");
    await client.close();
    process.exit(0);
});
