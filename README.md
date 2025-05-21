# Artisan Platform API

A comprehensive Node.js backend for an artisan-client platform with user authentication, role-based authorization, and post management.

## Features

- **Authentication**
  - JWT-based authentication with access and refresh tokens
  - Signup, signin, signout
  - Password reset and email verification
  - Role-based authorization (artisan and client)

- **User Management**
  - Profile management (update profile, change password)
  - Email notifications for sensitive actions

- **Post Management**
  - Artisans can create, update, and delete posts
  - Clients can view all public posts
  - Image uploads for posts
  - Search, filter, and pagination for posts

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middlewares
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── validators/       # Request validators
│   └── index.js          # Entry point
├── .env.example          # Environment variables example
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Run the development server:
   ```
   npm run dev
   ```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Environment Variables

- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URL` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY` - Clouadinary credentials
- `CLOUDINARY_API_SECRET`
- `SMTP_*` - Email configuration

## Authentication Flow

1. User registers with email/password
2. Verification email is sent
3. User verifies email by clicking link
4. User can now log in with email/password
5. JWT access token + refresh token are provided
6. Protected routes require valid access token
7. Expired access tokens can be refreshed using refresh token

## License

MIT