# ReadSphere Configuration Guide

## Backend Configuration (application.properties)

### Database Configuration
```properties
# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/readsphere
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### JWT Configuration
```properties
# JWT Secret Key (CHANGE THIS IN PRODUCTION!)
jwt.secret=your-super-secret-key-change-this-in-production

# Token Expiration Times (in milliseconds)
# Access Token: 24 hours
jwt.expiration=86400000

# Refresh Token: 7 days
jwt.refreshExpiration=604800000
```

### Server Configuration
```properties
# Server Port
server.port=8080

# Application Name
spring.application.name=readsphere

# Logging
logging.level.root=INFO
logging.level.com.example.readsphere=DEBUG
```

### CORS Configuration
```properties
# CORS is configured in SecurityConfig.java
# Allowed Origins: http://localhost:3000
# Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
# Allowed Headers: Content-Type, Authorization
```

## Frontend Configuration

### API Base URL (.env or api.js)
```javascript
// src/services/api.js
const API_URL = "http://localhost:8080/api";

// For production:
// const API_URL = "https://api.readsphere.com/api";
```

### Environment Variables (.env)
```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_API_TIMEOUT=30000
```

## Development Setup

### Prerequisites
- Java 17+
- Node.js 16+
- npm or yarn
- MySQL 8.0+ or SQL Server
- Maven 3.6+

### Local Development

1. **Clone Repository**
```bash
git clone <repository-url>
cd readsphere_clean
```

2. **Create Database**
```bash
mysql -u root -p
CREATE DATABASE readsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Configure Backend**
```bash
cd backend
# Edit src/main/resources/application.properties
# Set database credentials and JWT secret
```

4. **Build and Run Backend**
```bash
mvn clean install
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

5. **Configure Frontend**
```bash
cd frontend-react
# Verify API_URL in src/services/api.js
npm install
npm start
# Frontend runs on http://localhost:3000
```

## Production Configuration

### Backend - Production Properties
```properties
# application-prod.properties
spring.datasource.url=jdbc:mysql://prod-db-host:3306/readsphere
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JWT - Use strong secret from environment
jwt.secret=${JWT_SECRET}

# SSL/HTTPS
server.ssl.key-store=${SSL_KEYSTORE_PATH}
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
```

### Frontend - Production Build
```bash
cd frontend-react
npm run build
# Creates optimized build in build/ directory
```

### Docker Configuration

**Backend Dockerfile** (uses multi-stage build)
```dockerfile
FROM maven:3.8.1-openjdk-17 AS builder
WORKDIR /build
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
EXPOSE 8080
COPY --from=builder /build/target/readsphere-0.0.1.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile**
```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (Local Development)
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: readsphere
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/readsphere
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root
      JWT_SECRET: dev-secret-key
    depends_on:
      - mysql

  frontend:
    build: ./frontend-react
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_URL: http://localhost:8080/api
    depends_on:
      - backend

volumes:
  mysql_data:
```

## Environment Variables

### Backend Environment Variables
```bash
# Database
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DB_URL=jdbc:mysql://localhost:3306/readsphere

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-chars
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Server
SERVER_PORT=8080

# Logging
LOG_LEVEL=INFO
```

### Frontend Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_API_TIMEOUT=30000

# Feature Flags (optional)
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_DEBUG_MODE=false
```

## Security Configuration

### Recommended Production Settings

1. **JWT Secret**
   - Minimum 32 characters
   - Use strong random string
   - Store in environment variables
   - Never commit to repository

2. **HTTPS/SSL**
   - Use valid SSL certificate
   - Enforce HTTPS redirect
   - Set Secure cookie flag
   - Set SameSite cookie policy

3. **CORS**
   - Whitelist specific domains
   - Avoid using "*" in production
   - Specify allowed methods and headers

4. **Password Policy**
   - Minimum 8 characters (increase from 6)
   - Require uppercase and numbers
   - Implement rate limiting
   - Add password history

5. **Token Security**
   - Implement token refresh mechanism
   - Add token blacklist for logout
   - Monitor token usage patterns
   - Set appropriate expiration times

## Database Configuration

### MySQL Setup
```sql
-- Create database
CREATE DATABASE readsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'readsphere'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON readsphere.* TO 'readsphere'@'localhost';
FLUSH PRIVILEGES;
```

### SQL Server Setup
```sql
-- Create database
CREATE DATABASE readsphere;

-- Use database
USE readsphere;

-- Create user and login
CREATE LOGIN readsphere_user WITH PASSWORD = 'SecurePassword123!';
CREATE USER readsphere_user FOR LOGIN readsphere_user;
ALTER ROLE db_owner ADD MEMBER readsphere_user;
```

## Monitoring & Logging

### Application Logging Configuration
```properties
# Log file configuration
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=30

# Log levels by package
logging.level.com.example.readsphere=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=INFO

# Log pattern
logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
```

### Health Check
```bash
# Health check endpoint
curl http://localhost:8080/api/auth/health
```

## Troubleshooting Configuration

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check credentials in application.properties
   - Ensure database exists
   - Check firewall rules

2. **CORS Errors**
   - Verify frontend URL in SecurityConfig
   - Check CORS headers in response
   - Ensure frontend is running on correct port

3. **JWT Token Invalid**
   - Verify secret key matches between generations
   - Check token expiration time
   - Ensure Authorization header format: `Bearer {token}`

4. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :8080  # for backend
   lsof -i :3000  # for frontend
   
   # Kill process
   kill -9 <PID>
   ```

## Configuration Checklist

- [ ] Database credentials configured
- [ ] JWT secret key set and strong
- [ ] CORS origins configured correctly
- [ ] API URL correct in frontend
- [ ] Logging level appropriate
- [ ] Token expiration times set
- [ ] SSL/HTTPS configured (production)
- [ ] Environment variables documented
- [ ] Sensitive data not in version control
- [ ] Database backup strategy in place
- [ ] Monitoring and alerts configured
- [ ] Rate limiting configured
- [ ] Security headers configured

## Deployment

See [QUICK_START.md](./QUICK_START.md) for local development and [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing instructions.

For production deployment, follow:
1. Build Docker images for backend and frontend
2. Configure production environment variables
3. Use strong JWT secret (32+ chars, random)
4. Enable HTTPS/SSL
5. Set up database backup and replication
6. Configure logging and monitoring
7. Implement rate limiting
8. Set up CI/CD pipeline
9. Configure health checks
10. Monitor application performance

---

**Last Updated:** Week 1  
**Version:** 1.0
