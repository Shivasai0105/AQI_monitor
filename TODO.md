# Project Improvements TODO

## Major Fixes
- [x] Remove unused dashboard.js (React Native code)
- [x] Rename or remove app.js (test file, main is server.js)
- [ ] Implement real email sending for forgot-password using nodemailer
- [ ] Add input validation (password strength, email format) in routes/auth.js
- [ ] Move hardcoded API token to environment variables
- [ ] Add server-side logout endpoint
- [x] Update deprecated body-parser (use express built-in)
- [ ] Add JWT authentication for secure sessions
- [x] Fix hardcoded AQI values in dashboard.html
- [x] Improve location accuracy (use better geocoding or adjust WAQI API)

## Security Improvements
- [ ] Use JWT tokens instead of sessionStorage
- [x] Add rate limiting for auth endpoints
- [ ] Sanitize inputs

## Testing
- [ ] Test signup/login/forgot-password
- [ ] Test dashboard loading and AQI fetching
- [ ] Test location accuracy
- [ ] Test logout

## Dependencies
- [ ] Update package.json if needed
- [x] Add dotenv for env vars
- [x] Add jsonwebtoken for JWT
