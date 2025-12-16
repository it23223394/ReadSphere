# ReadSphere 📚

A modern reading tracking and recommendation application with user authentication, book management, notes, and personalized recommendations.

## 🎯 Project Overview

ReadSphere is a full-stack web application designed to help users:
- Track their reading journey with an intuitive dashboard
- Manage a personal library of books
- Save notes and quotes from books
- Get personalized book recommendations
- Connect with reading goals and preferences

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Java 17 with Spring Boot 3.3.4
- Spring Security for authentication
- MySQL/SQL Server database
- JWT-based authentication
- RESTful API design

**Frontend:**
- React for UI
- React Router for navigation
- CSS3 for styling
- Context API for state management
- localStorage for token persistence

**Infrastructure:**
- Docker for containerization
- Maven for Java build management
- npm for frontend dependency management
- GitHub for version control

## 📁 Project Structure

```
readsphere_clean/
├── backend/                       # Spring Boot API Server
│   ├── src/main/java/com/example/readsphere/
│   │   ├── controller/           # REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── BookController.java
│   │   │   └── PdfController.java
│   │   ├── service/              # Business logic
│   │   │   ├── UserService.java
│   │   │   ├── PdfService.java
│   │   │   └── recommendation/
│   │   ├── model/                # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Book.java
│   │   │   ├── Note.java
│   │   │   └── Quote.java
│   │   ├── repository/           # Data access
│   │   │   ├── UserRepository.java
│   │   │   └── BookRepository.java
│   │   ├── security/             # Auth & security
│   │   │   ├── JwtTokenProvider.java
│   │   │   └── SecurityConfig.java
│   │   └── dto/                  # Data transfer objects
│   │       ├── RegisterRequest.java
│   │       ├── LoginRequest.java
│   │       └── AuthResponse.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   ├── Dockerfile
│   └── mvnw / mvnw.cmd
│
├── frontend-react/                # React Application
│   ├── src/
│   │   ├── pages/                # Page components
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Bookshelf.js
│   │   │   ├── NotesQuotes.js
│   │   │   ├── Recommendations.js
│   │   │   └── BookDetails.js
│   │   ├── components/           # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/              # Global state
│   │   │   └── AuthContext.js
│   │   ├── services/             # API calls
│   │   │   └── api.js
│   │   ├── styles/               # Stylesheets
│   │   │   ├── Auth.css
│   │   │   └── Navbar.css
│   │   ├── App.js                # Main component
│   │   └── index.js              # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── Documentation Files (Root)
│   ├── QUICK_START.md            # 5-minute setup guide
│   ├── TESTING_GUIDE.md          # Comprehensive testing
│   ├── API_DOCUMENTATION.md      # API reference
│   ├── IMPLEMENTATION_SUMMARY.md # What was built
│   ├── CONFIGURATION.md          # Setup instructions
│   ├── DEVELOPMENT_CHECKLIST.md  # Progress tracking
│   └── README.md                 # This file
│
├── Docker Files
│   ├── Dockerfile                # Multi-stage backend build
│   ├── docker-compose.yml        # Local dev environment
│   └── railway.json              # Railway.app deployment
│
└── root files
    ├── branch-strategy.md        # Git workflow
    └── web.config                # IIS configuration
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+ or SQL Server
- Maven 3.6+
- Git

### 5-Minute Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd readsphere_clean
```

2. **Start Backend** (Terminal 1)
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080
```

3. **Start Frontend** (Terminal 2)
```bash
cd frontend-react
npm install  # First time only
npm start
# Runs on http://localhost:3000
```

4. **Test Authentication**
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

For detailed setup, see [QUICK_START.md](./QUICK_START.md)

## 📚 Features

### ✅ Week 1: Authentication System (COMPLETE)

**RS-101: User Registration**
- Email validation with uniqueness check
- Password strength validation (min 6 chars)
- Password confirmation matching
- BCrypt password hashing
- JWT token generation
- Responsive registration form

**RS-102: User Login with JWT**
- Email and password authentication
- Password verification with BCrypt
- Access token generation (24-hour expiration)
- Refresh token generation (7-day expiration)
- Token persistence in localStorage
- Secure API requests with Authorization header

**Authentication Infrastructure**
- AuthContext for global state management
- ProtectedRoute component for route guards
- Navbar with logout functionality
- API helper with automatic Authorization header
- CORS configuration for frontend
- Comprehensive error handling

### 🔄 Week 2: User Management (Planned)

**RS-103: User Profile Management**
- View user profile
- Edit profile information
- Change email address
- Update personal details

**RS-104: Password Reset**
- Forgot password flow
- Email-based password reset
- Reset token validation
- New password confirmation

**RS-105: Email Verification**
- Email verification on registration
- Verification link in email
- Verification token validation
- Account activation requirement (optional)

**RS-106: User Settings & Preferences**
- Theme preferences (light/dark mode)
- Notification settings
- Reading goals
- Privacy settings

### 📖 Week 3: Book Management (Planned)

**RS-201: Add Book**
- Add books to personal collection
- Book information (title, author, ISBN, rating)
- Cover image upload
- Reading status tracking

**RS-202: View Books**
- Display user's book collection
- Filter and sort options
- Pagination support
- Search functionality

**RS-203: Remove Book**
- Delete books from collection
- Archive option
- Confirmation before deletion

### 💭 Week 4: Notes & Quotes (Planned)

**RS-301: Save Notes & Quotes**
- Save notes while reading
- Save memorable quotes
- Link to specific book
- Tag and organize notes

**RS-302: Search & Filter**
- Search notes and quotes
- Filter by book
- Filter by date
- Full-text search

## 🔐 Security Features

- **Password Security:** BCrypt hashing with salt
- **Authentication:** JWT tokens (HS512 algorithm)
- **Token Expiration:** 
  - Access tokens: 24 hours
  - Refresh tokens: 7 days
- **Email Validation:** Format check and uniqueness constraint
- **CORS Protection:** Configured for specific origins
- **Authorization Header:** Bearer token scheme
- **Input Validation:** Server-side validation for all endpoints
- **Error Handling:** Secure error messages without information leakage

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing instructions
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoint reference
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was built
- **[CONFIGURATION.md](./CONFIGURATION.md)** - Configuration guide
- **[DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)** - Progress tracking

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
mvn test
```

### Manual API Testing
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for:
- cURL examples for all endpoints
- Error case testing
- Frontend integration testing
- Postman collection (recommended)

### Frontend Testing
```bash
cd frontend-react
npm test
```

## 🐳 Docker Deployment

### Local Development
```bash
docker-compose up --build
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
```

### Production Build
```bash
# Backend
docker build -t readsphere-api ./backend

# Frontend
docker build -t readsphere-web ./frontend-react
```

## 🚢 Deployment

### Railway.app
The project includes `railway.json` for easy deployment to Railway.app:
```bash
railway up
```

### Manual Deployment
See [CONFIGURATION.md](./CONFIGURATION.md) for:
- Production environment setup
- Database configuration
- SSL/HTTPS setup
- Monitoring and logging
- Backup strategy

## 📊 Project Status

**Week 1: 100% Complete** ✅
- RS-101: User Registration API ✅
- RS-102: User Login with JWT ✅
- Authentication Infrastructure ✅
- Documentation ✅

**Week 2: 0% Complete** 🔄
- RS-103: User Profile Management (Planned)
- RS-104: Password Reset (Planned)
- RS-105: Email Verification (Planned)
- RS-106: User Settings (Planned)

**Week 3-4: 0% Complete** ⏳
- Book Management (Planned)
- Notes & Quotes (Planned)

**Overall Progress:** ~25-30% complete

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/RS-XXX`
2. Make your changes
3. Commit with meaningful message: `git commit -m "RS-XXX: Description"`
4. Push to branch: `git push origin feature/RS-XXX`
5. Submit pull request

## 📝 Configuration

### Backend (application.properties)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/readsphere
spring.datasource.username=root
spring.datasource.password=password

# JWT
jwt.secret=your-secret-key-change-in-production
jwt.expiration=86400000
jwt.refreshExpiration=604800000

# Server
server.port=8080
```

### Frontend (api.js)
```javascript
const API_URL = "http://localhost:8080/api";
```

For detailed configuration, see [CONFIGURATION.md](./CONFIGURATION.md)

## 🔧 Troubleshooting

### Backend Won't Start
- Ensure Java 17+ is installed: `java -version`
- Ensure Maven is installed: `mvn -version`
- Check database connection in application.properties
- See [CONFIGURATION.md](./CONFIGURATION.md#troubleshooting-configuration)

### Frontend Won't Start
- Ensure Node.js 16+ is installed: `node -v`
- Delete node_modules and package-lock.json, reinstall: `npm install`
- Clear npm cache: `npm cache clean --force`

### CORS Errors
- Verify backend CORS configuration includes frontend origin
- Check [SecurityConfig.java](./backend/src/main/java/com/example/readsphere/config/SecurityConfig.java)
- Restart backend after changes

### Database Connection Issues
- Ensure MySQL/SQL Server is running
- Verify credentials in application.properties
- Check firewall allows database port (3306 for MySQL)

See [TESTING_GUIDE.md](./TESTING_GUIDE.md#common-issues--fixes) for more troubleshooting

## 📞 Support

For issues or questions:
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Review [CONFIGURATION.md](./CONFIGURATION.md)
3. See [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md)
4. Check application logs for error messages

## 📄 License

This project is proprietary and confidential.

## 👨‍💻 Authors

- Project Lead: [Your Name]
- Backend Developer: [Developer Name]
- Frontend Developer: [Developer Name]
- DevOps: [DevOps Name]

## 🎯 Next Steps

1. **Test the Current Implementation**
   - Follow [TESTING_GUIDE.md](./TESTING_GUIDE.md)
   - Run cURL examples for both API endpoints
   - Test frontend registration and login

2. **Deploy Locally**
   - Use [QUICK_START.md](./QUICK_START.md)
   - Verify backend and frontend communicate
   - Check database for stored users

3. **Begin RS-103 Implementation**
   - User Profile Management
   - GET/PUT endpoints for profile
   - ProfilePage.js component

4. **Prepare RS-104 (Password Reset)**
   - Email service integration
   - Reset token mechanism
   - ForgotPasswordPage.js component

---

**Last Updated:** Week 1 Sprint  
**Status:** ✅ Authentication Complete - Ready for Testing  
**Next Milestone:** Complete RS-103, Prepare RS-104-106
