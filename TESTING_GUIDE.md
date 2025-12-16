# ReadSphere Authentication - Complete Testing Guide

## Overview
This guide provides detailed instructions for testing the complete authentication flow including user registration, login, and protected routes.

## Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:3000`
- MySQL/SQL Server database running
- Maven and Node.js installed

## Backend Setup & Testing

### Step 1: Build Backend with New Dependencies
```bash
cd backend
mvn clean install
```

This will:
- Download JJWT dependency (JWT token generation)
- Compile Java code with Java 17
- Package the Spring Boot application

### Step 2: Start Backend Server
```bash
mvn spring-boot:run
```

Expected output:
```
Started ReadSphereApplication in X seconds
Tomcat initialized with port(s): 8080
```

### Step 3: Test Health Check Endpoint
```bash
curl -X GET http://localhost:8080/api/auth/health
```

Expected response:
```json
{
  "message": "Auth service is up and running"
}
```

## API Testing with cURL

### Test 1: User Registration (RS-101)

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "User registered successfully"
}
```

**Error Cases to Test:**

1. **Email Already Exists:**
```bash
# Run the first registration, then run again with same email
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

Expected response (400 Bad Request):
```json
{
  "message": "Email already registered"
}
```

2. **Password Mismatch:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "confirmPassword": "DifferentPass123"
  }'
```

Expected response (400 Bad Request):
```json
{
  "message": "Passwords do not match"
}
```

3. **Weak Password:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "weak",
    "confirmPassword": "weak"
  }'
```

Expected response (400 Bad Request):
```json
{
  "message": "Password must be at least 6 characters long"
}
```

4. **Invalid Email Format:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Doe",
    "email": "invalid-email",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

Expected response (400 Bad Request):
```json
{
  "message": "Please provide a valid email address"
}
```

### Test 2: User Login (RS-102)

**Request (with correct credentials):**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (200 OK):**
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Login successful"
}
```

**Error Cases to Test:**

1. **User Not Found:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123"
  }'
```

Expected response (401 Unauthorized):
```json
{
  "message": "Invalid credentials"
}
```

2. **Wrong Password:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }'
```

Expected response (401 Unauthorized):
```json
{
  "message": "Invalid credentials"
}
```

## Frontend Testing

### Step 1: Install Frontend Dependencies
```bash
cd frontend-react
npm install
```

### Step 2: Start Frontend Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

### Step 3: Test Registration Flow

1. **Navigate to Register Page:**
   - Open browser to `http://localhost:3000/register`
   - Should see the registration form with fields: Name, Email, Password, Confirm Password

2. **Fill Form and Submit:**
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "TestPass123"
   - Confirm Password: "TestPass123"
   - Click "Register" button

3. **Expected Behavior:**
   - Loading state appears
   - Form submits to backend
   - Success message displays
   - Page redirects to `/dashboard`
   - Tokens stored in browser localStorage

4. **Verify Tokens in Browser:**
   - Open DevTools (F12)
   - Go to Application > Local Storage > http://localhost:3000
   - Verify presence of:
     - `token`: JWT access token
     - `refreshToken`: JWT refresh token
     - `userId`: User ID (number)

### Step 4: Test Login Flow

1. **Navigate to Login Page:**
   - Go to `http://localhost:3000/login`
   - Should see login form with Email and Password fields

2. **Fill Form and Submit:**
   - Email: "testuser@example.com"
   - Password: "TestPass123"
   - Click "Login" button

3. **Expected Behavior:**
   - Form submits to backend
   - Success message displays
   - Redirects to `/dashboard`
   - Tokens updated in localStorage
   - Navbar appears (with Logout button)

### Step 5: Test Protected Routes

1. **Logout:**
   - Click "Logout" button in navbar
   - Redirected to `/login`
   - Tokens removed from localStorage

2. **Access Protected Page Without Auth:**
   - Try to access `http://localhost:3000/dashboard` directly
   - Should redirect to `/login`

3. **Login and Access Routes:**
   - Login again
   - Navigate to different protected routes:
     - `/dashboard` - Main dashboard
     - `/bookshelf` - User's book collection
     - `/recommendations` - Book recommendations
     - `/notes-quotes` - Saved notes and quotes

### Step 6: Test UI Components

1. **Register Page Features:**
   - Error message displays in red for validation errors
   - Success message displays in green on successful registration
   - Loading spinner shows during submission
   - Links to login page work

2. **Login Page Features:**
   - Error message displays for invalid credentials
   - Success message shows on login
   - Links to register page and forgot password work
   - Responsive design on mobile (try F12 device emulation)

3. **Navbar Features:**
   - Shows on all pages after login
   - Contains links: Dashboard, Bookshelf, Recommendations, Notes & Quotes
   - Logout button works correctly
   - Responsive design on mobile

## Integration Testing Checklist

- [ ] Backend starts without errors
- [ ] Health check endpoint responds
- [ ] Registration with valid data succeeds
- [ ] Registration rejects duplicate emails
- [ ] Registration rejects weak passwords
- [ ] Registration rejects mismatched passwords
- [ ] Registration rejects invalid email format
- [ ] Login with valid credentials succeeds
- [ ] Login rejects non-existent users
- [ ] Login rejects incorrect passwords
- [ ] Tokens are generated correctly
- [ ] Frontend registers and stores tokens
- [ ] Frontend logs in and stores tokens
- [ ] Protected routes require authentication
- [ ] Logout clears tokens and redirects
- [ ] Navbar displays only when authenticated
- [ ] API requests include Authorization header
- [ ] CORS works between frontend and backend
- [ ] Responsive design works on mobile

## Common Issues & Fixes

### Issue: "Connection Refused" - Backend Not Running
```bash
# Make sure backend is running on port 8080
mvn spring-boot:run
```

### Issue: "CORS Error" - Frontend can't reach backend
- Verify backend CORS config includes `http://localhost:3000`
- Check [SecurityConfig.java](./src/main/java/com/example/readsphere/config/SecurityConfig.java)
- Restart backend after changes

### Issue: "No Suitable Driver" - Database Connection
- Ensure MySQL/SQL Server is running
- Check `application.properties` for correct database URL
- Verify credentials in properties file

### Issue: Tokens Not Persisting
- Check browser's localStorage in DevTools
- Verify code calls `localStorage.setItem()` after login
- Clear localStorage and try again: `localStorage.clear()`

### Issue: Logout Button Not Working
- Verify `logout()` function in [AuthContext.js](./src/context/AuthContext.js)
- Check browser console for JavaScript errors (F12)
- Ensure AuthProvider wraps entire app

## API Endpoint Reference

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|--------------|---------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and get tokens |
| GET | `/api/auth/health` | No | Health check |
| GET | `/api/users/profile` | Yes | Get user profile (RS-103) |
| PUT | `/api/users/profile` | Yes | Update user profile (RS-103) |
| POST | `/api/auth/forgot-password` | No | Request password reset (RS-104) |
| POST | `/api/auth/reset-password` | No | Reset password (RS-104) |

## Token Structure

JWT tokens include the following claims:
```json
{
  "sub": "userId",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Access Token Expiration:** 24 hours
**Refresh Token Expiration:** 7 days

## Security Notes

⚠️ **Production Checklist:**
- [ ] Change `jwt.secret` in `application.properties`
- [ ] Use HTTPS instead of HTTP
- [ ] Change JWT token expiration times as needed
- [ ] Store sensitive configs in environment variables
- [ ] Enable database encryption
- [ ] Set strong password policy
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CSRF protection for session-based operations

## Next Steps

After successful authentication testing:
1. Implement **RS-103: User Profile Management**
   - Add GET/PUT `/api/users/profile` endpoints
   - Create ProfilePage.js component

2. Implement **RS-104: Password Reset Flow**
   - Add email service integration
   - Create ForgotPasswordPage and ResetPasswordPage

3. Implement **RS-105: Email Verification**
   - Add email verification before account activation
   - Update User model with `emailVerified` flag

4. Implement **RS-106: User Settings & Preferences**
   - Add user preferences storage
   - Create SettingsPage component

## Support

For detailed implementation information, see:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API specifications
- [backend/README.md](./backend/README.md) - Backend setup
- [frontend-react/README.md](./frontend-react/README.md) - Frontend setup
