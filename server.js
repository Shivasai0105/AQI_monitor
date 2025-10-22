const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongo-signup';

async function connectToMongo() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        return mongoose.connection.db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Graceful handling: log error but don't exit
        return null;
    }
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'landing_page', 'public')));

// API routes
const createAuthRouter = require('./landing_page/routes/auth');
let db;
connectToMongo().then(database => {
    db = database;
    const users = db.collection('users');
    app.use('/api/auth', createAuthRouter(users));
});

// API endpoint to provide the API key
app.get('/api/key', (req, res) => {
    res.json({ apiKey: process.env.API_KEY });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing_page', 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
