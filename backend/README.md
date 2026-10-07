# Express MySQL Backend

This is the backend API for your Next.js application, built with Node.js, Express, Sequelize (ORM), and MySQL.

## Prerequisites
- Node.js installed
- A running MySQL server instance

## Setup & Running

1. **Configure Environment Variables**
   Rename `.env.example` to `.env` and fill in your MySQL database credentials (host, user, password, db name).

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   - For development (with auto-restart):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```

## How to Call This API from Next.js

Your backend will run on **http://localhost:5000**.
The base URL for all API routes will be `http://localhost:5000/api`.

### Standard Response Format
Every API call will return a JSON object in this exact format:
```json
{
  "success": true, // or false if an error occurred
  "message": "A descriptive message",
  "data": { ... } // the requested data, or null
}
```

### Example: Calling the API using `fetch`

Here is how you can call the login route from a Next.js component:

```javascript
const login = async (email, password) => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (result.success) {
      console.log('Logged in successfully!', result.data);
      // result.data.token contains your JWT
      // Save it to localStorage or a cookie to use in future requests
      localStorage.setItem('token', result.data.token);
    } else {
      console.error('Login failed:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};
```

### Example: Making an Authenticated Request

When accessing protected routes, you must attach the JWT token in the `Authorization` header.

```javascript
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  
  const res = await fetch('http://localhost:5000/api/some-protected-route', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await res.json();
  console.log(result);
};
```
