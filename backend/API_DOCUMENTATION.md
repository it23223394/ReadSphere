# RS-101 & RS-102: User Registration & Login API

## Implementation Summary

### Backend Files Created:

1. **JwtTokenProvider.java** - JWT token generation and validation
2. **RegisterRequest.java** - DTO for registration request
3. **LoginRequest.java** - DTO for login request
4. **AuthResponse.java** - DTO for auth response
5. **UserService.java** - Business logic for registration and login
6. **AuthController.java** - REST endpoints

### Key Features:

✅ **RS-101: User Registration API**
- Email validation
- Password strength check (min 6 chars)
- Unique email check
- Password hashing with BCrypt
- JWT token generation
- Refresh token generation

✅ **RS-102: User Login with JWT**
- Email/password validation
- Secure password verification
- JWT token generation
- Refresh token generation

---

## API Endpoints

### 1. User Registration
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Success Response (200):**
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Email already registered"
}
```

---

### 2. User Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

## Testing with cURL

### Test Registration:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Test Health Check:
```bash
curl http://localhost:8080/api/auth/health
```

---

## Configuration

Update `application.properties` (create if not exists):

```properties
# JWT Configuration
app.jwtSecret=readsphere-secret-key-super-secure-change-in-production
app.jwtExpirationInMs=86400000
app.jwtRefreshExpirationInMs=604800000

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/readsphere
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Server
server.port=8080
```

---

## Next Steps (RS-103 to RS-106)

1. **RS-103: User Profile Management** - View/Edit profile, upload avatar
2. **RS-104: Password Reset Flow** - Forgot password, reset via email link
3. **RS-105: Email Verification** - Verify email before account activation
4. **RS-106: User Settings & Preferences** - Theme, notifications, reading goals

---

## Frontend Integration

### React Login Example:
```jsx
const handleLogin = async (email, password) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
};
```

---

## Security Notes

⚠️ **Important:**
- Change the `jwtSecret` in production to a strong random string
- Use HTTPS in production
- Never expose JWT secret in frontend
- Implement rate limiting for login/register endpoints
- Add CAPTCHA for bot protection

---

## Story Points
- **RS-101:** 5 points ✅
- **RS-102:** 8 points ✅
- **Total:** 13 points

