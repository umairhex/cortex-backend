# Cortex DB Backend

The intelligent, headless API core for the Cortex CMS. Built with Node.js, Express, and TypeScript, it provides a robust foundation for content management, authentication, and integration.

**Repository:** [https://github.com/umairrx/cortex-backend](https://github.com/umairrx/cortex-backend)
**Frontend:** [https://github.com/umairrx/cortex](https://github.com/umairrx/cortex)

## 🚀 Features

- **Headless Architecture**: Decoupled content delivery via REST API.
- **Secure Authentication**: JWT-based auth with access/refresh token rotation (httpOnly cookies).
- **Dynamic Content Modeling**: Create and manage custom collections with dynamic schemas.
- **Integration System**: (In Progress) Connectors for external databases and services.
- **Type Safety**: Fully typed with TypeScript.
- **Performance**: Optimized MongoDB queries and indexing.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Validation**: Zod & Express-Validator
- **Security**: Helmet, bcrypt, CORS, Rate Limiting

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/umairrx/cortex-backend.git
    cd cortex-backend
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    # or npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:

    ```env
    # Server Configuration
    PORT=3000
    NODE_ENV=development

    # Database
    MONGODB_URI=mongodb://localhost:27017/cortex_db

    # Authentication
    JWT_SECRET=your_super_secret_jwt_key_here
    JWT_EXPIRY=15m
    REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_here
    REFRESH_TOKEN_EXPIRY=7d

    # Email Service (for password reset)
    EMAIL_HOST=smtp.example.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    ```

4.  **Start Development Server**
    ```bash
    pnpm dev
    ```

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `pnpm dev` | Starts the development server with hot-reload (`tsx`). |
| `pnpm build` | Compiles TypeScript code to JavaScript. |
| `pnpm start` | Runs the compiled production code from `dist/`. |

## 🔌 API Overview

The API is structured around resource-oriented endpoints.

### Authentication
- `POST /api/signup` - Register a new admin/user.
- `POST /api/signin` - Authenticate and receive cookies.
- `POST /api/refresh` - Rotate access tokens.
- `POST /api/logout` - Clear session.

### Collections (Headless CMS)
- `GET /api/collections` - List all content models.
- `POST /api/collections` - Define a new content model.
- `GET /api/collections/:id/items` - Fetch items for a collection.
- `POST /api/collections/:id/items` - Create a new item.

## 🚢 Deployment

1.  Build the project: `pnpm build`
2.  Set `NODE_ENV=production` in your environment.
3.  Run the server: `pnpm start`

Recommended to use a process manager like `pm2` for production:
```bash
pm2 start dist/index.js --name cortex-backend
```

