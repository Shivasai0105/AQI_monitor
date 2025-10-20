# AQI_monitor
=======
# MongoDB Signup/Login with AQI Dashboard

A full-stack web application that provides user authentication (signup/login) with MongoDB and displays real-time Air Quality Index (AQI) data on a dashboard.

## Overview

This application consists of:
- **Backend**: Node.js/Express server with MongoDB for user data storage and authentication
- **Frontend**: HTML/CSS/JavaScript-based UI for user registration, login, and AQI dashboard
- **External API**: World Air Quality Index (WAQI) API for real-time air quality data

## Features

- User registration and login with validation
- Password hashing with bcrypt
- JWT-based authentication (currently storing user data in sessionStorage - see Security section)
- Real-time AQI data fetching based on user location
- Interactive dashboard with AQI visualization
- Geolocation integration for automatic location detection
- Responsive design with sidebar navigation
- Map integration with Leaflet.js

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database for user data
- **Mongoose**: MongoDB object modeling (not used, raw MongoDB driver)
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting for auth endpoints
- **axios**: HTTP client for external API calls
- **nodemailer**: Email sending (configured but not fully implemented)

### Frontend
- **HTML5**: Structure
- **CSS3**: Styling
- **JavaScript (ES6+)**: Client-side logic
- **Leaflet.js**: Interactive maps
- **Font Awesome**: Icons
- **jQuery**: DOM manipulation (minimal use)

### External Services
- **WAQI API**: Air Quality Index data
- **OpenStreetMap Nominatim**: Reverse geocoding for location names

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mongo-signup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/userDB
   JWT_SECRET=your-super-secret-jwt-key-here
   WAQI_API_TOKEN=your-waqi-api-token-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   ```

4. **Start MongoDB**
   ```bash
   # For local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   npm start
   # or
   node server.js
   ```

6. **Access the application**
   Open `http://localhost:3000` in your browser

## Usage

### User Registration
1. Navigate to the signup page
2. Fill in name, username, email, and password
3. Click "Sign Up" to create account
4. Validation ensures:
   - Name: 2+ characters
   - Username: 4+ characters, unique
   - Email: Valid format, unique
   - Password: 6+ characters

### User Login
1. Enter username/email and password
2. Click "Log In" to authenticate
3. On success, redirected to dashboard

### Dashboard Features
1. **User Info**: Displays welcome message and last login time
2. **Current AQI**: Shows real-time air quality data for user's location
3. **Pollutants**: Displays PM2.5, PM10, CO values
4. **Location**: Shows current location name or coordinates
5. **Map**: Interactive map centered on user location
6. **Navigation**: Sidebar with sections (Home, Trends, Heatmap, Health Tips, Actions, Settings)

## API Endpoints

### Authentication Endpoints
- `POST /signup`: User registration
  - Body: `{ name, username, email, password }`
  - Response: `{ message: "Signup successful" }`

- `POST /login`: User authentication
  - Body: `{ username, password }`
  - Response: User data (stored in sessionStorage)

- `POST /forgot-password`: Password reset request
  - Body: `{ username }`
  - Response: Reset email sent

- `POST /logout`: User logout
  - Response: `{ message: "Logged out successfully" }`

### AQI Endpoint
- `GET /api/aqi?lat={latitude}&lon={longitude}`: Fetch AQI data
  - Query params: lat, lon (required)
  - Response: WAQI API data with status, aqi, iaqi (pollutants)

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  username: String, // unique
  email: String, // unique
  password: String, // hashed with bcrypt
  createdAt: Date
}
```

## How It Works

### Backend Flow

1. **Server Startup**:
   - Loads environment variables
   - Connects to MongoDB
   - Sets up Express middleware (CORS, JSON parsing, static files)
   - Registers auth routes
   - Starts server on port 3000

2. **Authentication Process**:
   - Signup: Validates input, hashes password, stores in MongoDB
   - Login: Verifies credentials, returns user data (currently stored in sessionStorage)
   - Password reset: Generates JWT token, sends email (not fully implemented)

3. **AQI Data Fetching**:
   - Receives lat/lon from frontend
   - Calls WAQI API with token
   - Returns JSON response to frontend

### Frontend Flow

1. **Page Load**:
   - Checks for logged-in user in sessionStorage
   - Redirects to index.html if not authenticated

2. **Geolocation**:
   - Requests user location permission
   - Gets latitude/longitude coordinates

3. **Reverse Geocoding**:
   - Calls OpenStreetMap Nominatim API
   - Converts coordinates to location name

4. **AQI Fetching**:
   - Calls `/api/aqi` with coordinates
   - Parses response data
   - Updates DOM elements with AQI values
   - Colors AQI based on air quality levels

5. **Map Initialization**:
   - Creates Leaflet map centered on user location
   - Adds marker with popup

## File Structure

```
mongo-signup/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not committed)
├── routes/
│   └── auth.js               # Authentication routes
├── public/
│   ├── index.html            # Login/signup page
│   ├── dashboard.html        # Main dashboard
│   ├── css/
│   │   └── styles.css        # Stylesheets
│   └── js/
│       └── script.js         # Client-side JavaScript
├── node_modules/             # Dependencies (auto-generated)
└── README.md                 # This file
```

## Security Considerations

### Current Issues
- **Critical**: User credentials (including password hashes) are stored in browser sessionStorage
- This is a major security vulnerability
- Passwords should never be stored in browser storage

### Recommended Fixes
1. **Implement proper JWT authentication**:
   - Login returns JWT token, not user data
   - Store only token in localStorage/sessionStorage
   - Decode token client-side for user info

2. **Token Management**:
   - Set token expiration (e.g., 1 hour)
   - Implement token refresh mechanism
   - Clear tokens on logout

3. **Additional Security**:
   - HTTPS enforcement
   - CSRF protection
   - Input sanitization
   - Rate limiting (already implemented for auth)

## Development Notes

### Environment Variables
- `PORT`: Server port (default 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `WAQI_API_TOKEN`: API key for WAQI service
- `EMAIL_USER/EMAIL_PASS`: Gmail credentials for password reset

### API Limits
- WAQI API has rate limits - monitor usage
- Geocoding API may have request limits

### Browser Compatibility
- Requires modern browsers with geolocation support
- ES6+ JavaScript features used

## Troubleshooting

### Common Issues
1. **AQI not loading**: Check WAQI API token and server logs
2. **Geolocation denied**: User must allow location permission
3. **MongoDB connection failed**: Ensure MongoDB is running
4. **CORS errors**: Access via http://localhost:3000, not file://

### Debug Tips
- Check browser console for JavaScript errors
- Monitor server logs for API failures
- Verify environment variables are loaded
- Test API endpoints with curl/Postman

## Future Enhancements

- Implement proper JWT authentication
- Add user profile management
- Real-time AQI notifications
- Historical data charts
- Mobile app version
- Multi-language support

## License

ISC License

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request
=======
# AQI_monitor
>>>>>>> acd6107104e0137f67b82b5363188d43335e3061
