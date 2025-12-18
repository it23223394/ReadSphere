# User Management API Documentation

## Overview
This document describes all the User Management & Authentication APIs for the ReadSphere application.

---

## Authentication APIs

### 1. User Registration (RS-101)
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (200):**
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Email already registered"
}
```

**Validations:**
- Name cannot be empty
- Email must be valid format
- Password must be at least 6 characters
- Passwords must match
- Email must be unique

---

### 2. User Login (RS-102)
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
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

### 3. Request Password Reset (RS-104)
**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note:** For security reasons, the same success message is returned regardless of whether the email exists.

---

### 4. Reset Password with Token (RS-104)
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-uuid",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid or expired reset token"
}
```

---

### 5. Verify Email (RS-105)
**Endpoint:** `GET /api/auth/verify-email?token={token}`

**Query Parameters:**
- `token`: Email verification token (UUID)

**Success Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid or expired verification token"
}
```

---

## User Profile APIs

### 6. Get User Profile (RS-103)
**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Profile retrieved successfully"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid authorization header"
}
```

---

### 7. Update User Profile (RS-103)
**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john.updated@example.com",
  "message": "Profile updated successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Email already in use by another account"
}
```

**Validations:**
- Email must be valid format if provided
- Email must not be taken by another user
- Name must not be empty if provided

---

### 8. Change Password (RS-103)
**Endpoint:** `PUT /api/users/change-password`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Password changed successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Current password is incorrect"
}
```

**Validations:**
- Old password must be correct
- New password must be at least 6 characters
- New passwords must match

---

### 9. Resend Email Verification (RS-105)
**Endpoint:** `POST /api/users/resend-verification`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "message": "Verification email sent"
}
```

**Error Response (400):**
```json
{
  "error": "Email is already verified"
}
```

---

## User Settings APIs

### 10. Get User Settings (RS-106)
**Endpoint:** `GET /api/users/settings`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "userId": 1,
  "readingGoalBooksPerMonth": 5,
  "readingGoalPagesPerDay": 50,
  "theme": "dark",
  "notificationsEnabled": true,
  "message": "Settings retrieved successfully"
}
```

---

### 11. Update User Settings (RS-106)
**Endpoint:** `PUT /api/users/settings`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "readingGoalBooksPerMonth": 10,
  "readingGoalPagesPerDay": 75,
  "theme": "light",
  "notificationsEnabled": false
}
```

**Success Response (200):**
```json
{
  "userId": 1,
  "readingGoalBooksPerMonth": 10,
  "readingGoalPagesPerDay": 75,
  "theme": "light",
  "notificationsEnabled": false,
  "message": "Settings updated successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Theme must be 'light' or 'dark'"
}
```

**Validations:**
- Reading goals cannot be negative
- Theme must be either 'light' or 'dark'
- All fields are optional (only provided fields are updated)

---

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (use token from login):
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile:
```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### Change Password:
```bash
curl -X PUT http://localhost:8080/api/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newPassword456",
    "confirmPassword": "newPassword456"
  }'
```

### Request Password Reset:
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Update Settings:
```bash
curl -X PUT http://localhost:8080/api/users/settings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "readingGoalBooksPerMonth": 5,
    "readingGoalPagesPerDay": 50,
    "theme": "dark",
    "notificationsEnabled": true
  }'
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials or token) |
| 500 | Internal Server Error |

---

## Notes

1. **Email Service**: Currently uses console logging. In production, integrate with:
   - Spring Mail (JavaMailSender)
   - SendGrid
   - AWS SES
   - Azure Communication Services

2. **Token Expiration**: Password reset and email verification tokens do not expire automatically. Consider implementing token expiration timestamps in production.

3. **Security**: All password endpoints use BCrypt hashing for secure password storage.

4. **CORS**: Currently configured for `http://localhost:3000`. Update for production domains.
