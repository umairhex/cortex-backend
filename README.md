# Cortex Backend

A production-ready Node.js Express backend with JWT authentication.

## Features

- User registration and login
- JWT access and refresh tokens
- Password reset via email
- Rate limiting for auth routes
- Security headers with Helmet
- Input validation with express-validator
- MongoDB with Mongoose

## API Endpoints

### Authentication

- `POST /api/signup` - Register new user
- `POST /api/signin` - Login user
- `POST /api/refresh` - Refresh access token
- `POST /api/logout` - Logout user
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password

### Protected Routes

- `GET /api/profile` - Get user profile (requires auth)

### Collections

- `POST /api/collections` - Create a new collection (requires auth)
- `GET /api/collections` - Get all collections (requires auth)
- `GET /api/collections/:id` - Get collection by ID (requires auth)
- `PUT /api/collections/:id` - Update collection by ID (requires auth)
- `DELETE /api/collections/:id` - Delete collection by ID (requires auth)

### Public Routes

- `GET /api/health` - Health check

## Frontend Integration Guide

This guide shows how to integrate with the Collections API from your frontend application.

### Authentication

All collection endpoints require authentication. Include the JWT access token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Creating a Collection

To create a new collection, send a POST request to `/api/collections` with the collection data.

**Request:**

```javascript
const response = await fetch("/api/collections", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    id: "blog-posts",
    name: "Blog Posts",
    singular: "Blog Post",
    plural: "Blog Posts",
    type: "collection",
    fields: [
      {
        field_name: "title",
        type: "string",
        label: "Title",
      },
      {
        field_name: "content",
        type: "text",
        label: "Content",
      },
    ],
  }),
});

const result = await response.json();
```

**Response (201 Created):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "blog-posts",
  "name": "Blog Posts",
  "singular": "Blog Post",
  "plural": "Blog Posts",
  "type": "collection",
  "fields": [
    {
      "field_name": "title",
      "type": "string",
      "label": "Title"
    },
    {
      "field_name": "content",
      "type": "text",
      "label": "Content"
    }
  ],
  "createdAt": "2025-12-13T10:00:00.000Z",
  "updatedAt": "2025-12-13T10:00:00.000Z"
}
```

**Validation Errors (400 Bad Request):**

```json
{
  "message": "Validation error",
  "errors": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 1 character(s)",
      "path": ["name"]
    }
  ]
}
```

### Getting All Collections

To retrieve all collections, send a GET request to `/api/collections`.

**Request:**

```javascript
const response = await fetch("/api/collections", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const collections = await response.json();
```

**Response (200 OK):**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": "blog-posts",
    "name": "Blog Posts",
    "singular": "Blog Post",
    "plural": "Blog Posts",
    "type": "collection",
    "fields": [...],
    "createdAt": "2025-12-13T10:00:00.000Z",
    "updatedAt": "2025-12-13T10:00:00.000Z"
  }
]
```

### Getting a Specific Collection

To retrieve a single collection by ID, send a GET request to `/api/collections/:id`.

**Request:**

```javascript
const collectionId = "blog-posts";
const response = await fetch(`/api/collections/${collectionId}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const collection = await response.json();
```

**Response (200 OK):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "blog-posts",
  "name": "Blog Posts",
  "singular": "Blog Post",
  "plural": "Blog Posts",
  "type": "collection",
  "fields": [...],
  "createdAt": "2025-12-13T10:00:00.000Z",
  "updatedAt": "2025-12-13T10:00:00.000Z"
}
```

**Not Found (404):**

```json
{
  "message": "Collection not found"
}
```

### Updating a Collection

To update an existing collection, send a PUT request to `/api/collections/:id` with the fields you want to update.

**Request:**

```javascript
const collectionId = "blog-posts";
const response = await fetch(`/api/collections/${collectionId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    name: "Updated Blog Posts",
    fields: [
      {
        field_name: "title",
        type: "string",
        label: "Post Title",
      },
      {
        field_name: "content",
        type: "text",
        label: "Post Content",
      },
      {
        field_name: "author",
        type: "string",
        label: "Author Name",
      },
    ],
  }),
});

const result = await response.json();
```

**Response (200 OK):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "blog-posts",
  "name": "Updated Blog Posts",
  "singular": "Blog Post",
  "plural": "Blog Posts",
  "type": "collection",
  "fields": [
    {
      "field_name": "title",
      "type": "string",
      "label": "Post Title"
    },
    {
      "field_name": "content",
      "type": "text",
      "label": "Post Content"
    },
    {
      "field_name": "author",
      "type": "string",
      "label": "Author Name"
    }
  ],
  "createdAt": "2025-12-13T10:00:00.000Z",
  "updatedAt": "2025-12-13T10:30:00.000Z"
}
```

### Deleting a Collection

To delete a collection, send a DELETE request to `/api/collections/:id`.

**Request:**

```javascript
const collectionId = "blog-posts";
const response = await fetch(`/api/collections/${collectionId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const result = await response.json();
```

**Response (200 OK):**

```json
{
  "message": "Collection deleted successfully"
}
```

**Not Found (404):**

```json
{
  "message": "Collection not found"
}
```

### Error Handling

Handle common HTTP status codes:

- `400` - Validation error (check `errors` array)
- `401` - Unauthorized (invalid/missing token)
- `404` - Collection not found
- `500` - Internal server error

## Environment Variables

Create a `.env` file:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cortex-backend
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Installation

```bash
pnpm install
pnpm run build
pnpm start
```

## Development

```bash
pnpm run dev
```

## Security Features

- Password hashing with bcrypt
- JWT tokens with short expiry
- Refresh tokens for session renewal
- Rate limiting (5 attempts per 15 min)
- Helmet security headers
- Input sanitization and validation
- CORS enabled
