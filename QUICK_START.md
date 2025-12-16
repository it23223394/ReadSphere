# ReadSphere Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Terminal 1: Start Backend
```bash
cd backend
mvn clean install      # First time only
mvn spring-boot:run
```

Expected: `Started ReadSphereApplication in X seconds`

### Terminal 2: Start Frontend
```bash
cd frontend-react
npm install            # First time only
npm start
```

Expected: Browser opens to `http://localhost:3000`

## 🧪 Quick Test

### Register (Terminal 3)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## 📋 Directory Structure

```
readsphere_clean/
├── backend/                    # Spring Boot API
│   ├── src/main/java/...      # Java source code
│   ├── pom.xml                # Maven dependencies
│   └── mvnw / mvnw.cmd        # Maven wrapper
├── frontend-react/            # React frontend
│   ├── src/
│   │   ├── pages/             # Login, Register, Dashboard
│   │   ├── components/        # Navbar, ProtectedRoute
│   │   ├── context/           # AuthContext for state
│   │   ├── services/          # API calls
│   │   └── styles/            # CSS files
│   └── package.json           # Node dependencies
├── TESTING_GUIDE.md           # Comprehensive testing guide
└── API_DOCUMENTATION.md       # API specifications
```

## 🔑 Key Files Created

### Backend
- `JwtTokenProvider.java` - Token generation & validation
- `UserService.java` - Authentication logic
- `AuthController.java` - REST endpoints
- DTOs: `RegisterRequest`, `LoginRequest`, `AuthResponse`

### Frontend
- `AuthContext.js` - Global auth state management
- `LoginPage.js` - Login form component
- `RegisterPage.js` - Registration form component
- `Navbar.js` - Navigation with logout
- `ProtectedRoute.js` - Route protection wrapper
- `Auth.css` - Styling for auth pages

## ✅ Features Completed

✅ **RS-101: User Registration API**
- Email validation
- Password strength (min 6 chars)
- Password confirmation matching
- BCrypt password hashing
- Unique email check
- JWT token generation

✅ **RS-102: User Login with JWT**
- Email lookup
- Password verification (BCrypt)
- JWT access token (24h expiry)
- JWT refresh token (7d expiry)
- Error handling

✅ **Frontend Integration**
- Registration form component
- Login form component
- Token persistence in localStorage
- Protected routes (redirect to login if not authenticated)
- Navbar with logout
- Context-based auth state

## 🔐 Security

- Passwords hashed with **BCrypt**
- Tokens signed with **HS512**
- CORS configured for localhost:3000
- Token in header: `Authorization: Bearer {token}`
- No passwords in logs/responses

## 📝 Configuration

Update these files for different settings:

**Backend ([application.properties](./backend/src/main/resources/application.properties)):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/readsphere
spring.datasource.username=root
spring.datasource.password=password
jwt.secret=your-secret-key-change-in-production
jwt.expiration=86400000  # 24 hours in milliseconds
jwt.refreshExpiration=604800000  # 7 days
```

**Frontend ([api.js](./frontend-react/src/services/api.js)):**
```javascript
const API_URL = "http://localhost:8080/api";  // Change for production
```

## 🧪 Database Setup

### Option 1: MySQL
```bash
# Create database
mysql -u root -p
CREATE DATABASE readsphere;
```

### Option 2: SQL Server
Update `application.properties`:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=readsphere
spring.jpa.database-platform=org.hibernate.dialect.SQLServerDialect
```

## 📚 Next Steps

1. **Test APIs** - Use TESTING_GUIDE.md
2. **RS-103: User Profile** - Get/update user profile
3. **RS-104: Password Reset** - Forgot password flow
4. **RS-105: Email Verification** - Verify email before activation
5. **RS-106: User Settings** - User preferences

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| Port 8080 in use | `lsof -i :8080` then kill process |
| Port 3000 in use | `lsof -i :3000` then kill process |
| CORS error | Check SecurityConfig.java allows localhost:3000 |
| DB connection error | Verify MySQL is running and credentials are correct |
| Token invalid | JWT secret in backend matches, tokens not expired |

## 📖 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Detailed testing instructions
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoint specs
- **[backend/README.md](./backend/README.md)** - Backend setup
- **[frontend-react/README.md](./frontend-react/README.md)** - Frontend setup

---

**Status:** ✅ RS-101 & RS-102 Complete  
**Last Updated:** Week 1 Sprint  
**Next Review:** Before RS-103 implementation
