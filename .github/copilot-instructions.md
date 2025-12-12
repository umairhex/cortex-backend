# Cortex Backend - AI Agent Instructions

## Architecture Overview

This is a Node.js Express API server built with TypeScript and ES modules. It uses MongoDB (Mongoose) for data persistence and JWT authentication with refresh tokens. The codebase follows a modular structure with clear separation of concerns.

**Key Components:**

- `src/app.ts`: Express app setup with middleware (CORS, Helmet, body parsing)
- `src/index.ts`: Server startup and DB connection
- `src/routes/`: API route definitions
- `src/controllers/`: Business logic with input validation
- `src/models/`: Mongoose schemas with pre-save hooks
- `src/middleware/`: Auth, rate limiting, error handling
- `src/config/`: Environment configuration and DB connection

**Data Flow:** HTTP requests → Routes → Controllers (validation) → Models → MongoDB

## Development Workflow

- **Start dev server:** `pnpm run dev` (uses tsx --watch for hot reload)
- **Build for production:** `pnpm run build` (TypeScript compilation to `dist/`)
- **Run production build:** `pnpm start` (serves from `dist/index.js`)
- **Debug:** Use VS Code debugger on `src/index.ts`; check console logs for DB connection and errors

## Key Patterns & Conventions

- **Imports:** Always use `.js` extensions for TypeScript files (ES modules requirement)
- **Type Imports:** Use `import type { Request, Response } from 'express';` to avoid runtime imports
- **Documentation:** Add JSDoc comments (`/** */`) to all functions, explaining purpose and parameters
- **Validation:** Controllers export validation arrays (express-validator) alongside handlers
- **Error Handling:** Centralized in `middleware/errorHandler.ts`; controllers return JSON errors
- **Auth:** JWT access tokens (15min) + refresh tokens (7d); store refresh tokens hashed in DB
- **Security:** Rate limiting on auth routes (5/15min), Helmet headers, bcrypt password hashing (12 rounds)

## Important Files

- `src/config/index.ts`: Central config object with env defaults
- `src/models/User.ts`: User schema with password hashing and token fields
- `src/controllers/auth.ts`: Complete auth implementation (signup/signin/refresh/logout/reset)
- `package.json`: Scripts and dependencies (pnpm package manager)

## Integration Points

- **Database:** MongoDB connection in `config/database.ts`; models use Mongoose with timestamps
- **Email:** Nodemailer in auth controller for password reset (configure SMTP in env)
- **External APIs:** None currently; auth is self-contained

## Common Pitfalls

- Forget `.js` extensions in imports (causes module resolution errors)
- Use `import { Request }` instead of `import type` (runtime bundle bloat)
- Skip validation in new controllers (use express-validator patterns from auth.ts)
- Hardcode secrets (always use `config` object with env fallbacks)
