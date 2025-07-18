# React BlogSpace Backend

A simple Node.js backend with Express, MongoDB, and JWT authentication for the React BlogSpace.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/markdown-editor
JWT_SECRET=your-jwt-secret-key-here
NODE_ENV=development
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Authentication System

This backend uses a dual-token authentication system:
- **Access Token**: Short-lived (15 minutes) - used for API requests
- **Refresh Token**: Long-lived (7 days) - used to generate new access tokens

### How it works:
1. Login/Register returns both access and refresh tokens
2. Use access token for API requests in `Authorization: Bearer <token>` header
3. When access token expires, use refresh token to get a new access token
4. Refresh tokens are stored securely in the database

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  
- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com", 
    "password": "password123"
  }
  ```
  
- `POST /api/auth/refresh` - Get new access token
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
  
- `POST /api/auth/logout` - Logout (requires auth)
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
  
- `POST /api/auth/logout-all` - Logout from all devices (requires auth)

### Files & Folders (requires authentication)
- `GET /api/files` - Get all files and folders
- `POST /api/files/file` - Create a new file
- `POST /api/files/folder` - Create a new folder
- `PUT /api/files/file/:id` - Update a file
- `PUT /api/files/folder/:id` - Update a folder
- `DELETE /api/files/:id` - Delete a file or folder

### Response Formats

**Login/Register Success:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

**Refresh Success:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Expired Error:**
```json
{
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

## Frontend Integration

When integrating with your frontend:

1. Store both tokens securely (localStorage/sessionStorage)
2. Use access token for API requests
3. Implement automatic token refresh when you receive `TOKEN_EXPIRED` error
4. Clear tokens on logout

Example token refresh logic:
```javascript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (response.ok) {
    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  } else {
    // Redirect to login
    localStorage.clear();
    window.location.href = '/login';
  }
};
```

## Features

- JWT authentication with access/refresh tokens
- Secure password hashing with bcrypt
- Nested file/folder structure
- User-specific data isolation
- Recursive folder deletion
- Automatic token cleanup (refresh tokens expire after 7 days)
- Multi-device logout support 