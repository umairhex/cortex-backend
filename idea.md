# Cortex DB — Backend

## Core Idea

### Problem

Most headless CMS backends are tightly coupled to a single database provider. Developers who already have data in MongoDB, PostgreSQL, or Supabase must either migrate to the CMS's internal storage or maintain separate systems with no unified management interface. Existing solutions also rarely support runtime schema definition — collection structures are typically defined in code and require redeployment to change. There is no lightweight API backend that acts as a content management proxy over user-owned databases with dynamic schema support and public read endpoints.

### Solution

Cortex DB Backend is a headless CMS API built on Express 5 and TypeScript. It implements a vendor-agnostic storage adapter pattern where collection definitions and user data live in an internal MongoDB database, while actual content CRUD operations are proxied to whichever external database the user connects — MongoDB, PostgreSQL, or Supabase. Collections are defined at runtime through the API (not hardcoded schemas), and the system can introspect existing databases to discover table structures. Public read-only endpoints serve content to frontends without authentication, while authenticated endpoints provide full CRUD with role-based access control.

### Value

The adapter pattern decouples content management from content storage. Teams keep their existing database infrastructure and gain API-first content management without migration. Runtime schema definition means content types can be created, modified, and deleted through the admin panel without code changes or redeployment. Database introspection bridges legacy data with modern CMS capabilities. The serverless-ready architecture supports both Vercel deployment and traditional hosting.

### User Outcome

A developer deploys the backend, connects their existing database through the integration API, introspects its schemas, and begins managing content through authenticated endpoints. Frontend applications consume content through public read-only endpoints with no authentication overhead. New content types are defined through the API at any time, and external databases are managed through the same interface as internal collections.

---

## Tech Stack

- **Backend Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB, Mongoose, PostgreSQL
- **Authentication**: JWT, Bcrypt
- **Authorization**: Role-based access control
- **File Uploads**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, Express Rate Limit
- **Validation**: Zod, Express Validator
- **Middleware**: CORS, Cookie Parser
- **Logging**: Pino
- **Architecture**: Headless API with Storage Adapter Pattern

---

## Key Features

### Storage Adapter Pattern

#### Purpose

Decouple content management from database implementation, enabling multi-database support through a unified interface.

#### Capabilities

- StorageAdapter interface defining standard CRUD operations
- MongoAdapter implementation for MongoDB external databases
- PostgresAdapter implementation for PostgreSQL and Supabase connections
- Adapter selection based on integration type when processing item CRUD requests
- Connection testing before committing integration configurations
- Database introspection to discover existing tables, collections, and their schemas

#### User Benefit

Content management logic is database-agnostic — the same API endpoints and admin interface work identically regardless of whether content lives in MongoDB, PostgreSQL, or Supabase.

---

### Dynamic Content Modeling

#### Purpose

Allow content schemas to be created and modified at runtime through the API without code changes or redeployment.

#### Capabilities

- Collection definitions with name, singular/plural labels, and type (collection or single)
- Dynamic field arrays with field name, type, label, and required flag
- Optional binding to external databases via integration ID and external table name
- Admin-only collection creation, update, and deletion
- Authenticated read access for all users

#### User Benefit

Content types are managed through the admin panel or API calls, not source code — enabling non-developers to define and modify content structures without engineering involvement.

---

### Authentication and Authorization

#### Purpose

Secure the API with role-based access control while providing convenient public endpoints for frontend consumption.

#### Capabilities

- JWT dual-token authentication: access tokens (15-minute expiry) and refresh tokens (7-day expiry) in httpOnly cookies
- Token rotation on refresh with bcrypt-hashed refresh token storage
- Role-based authorization: admin and user roles with middleware enforcement
- First registered user automatically promoted to admin
- Password reset flow via email with cryptographically random tokens and expiry
- Rate limiting on authentication endpoints (5 attempts per 15 minutes)
- SameSite cookie policy adapting to production vs. development environments

#### User Benefit

The API is secure by default with minimal configuration. Admin and user role separation ensures content editors cannot accidentally modify schemas or integrations, while public endpoints serve frontends without friction.

---

### Public Read-Only API

#### Purpose

Serve content to frontend applications and static site generators without requiring authentication.

#### Capabilities

- Unauthenticated list and get endpoints for collections and items
- Separate rate limiting (100 requests per minute) from authenticated endpoints
- Standard JSON responses compatible with any frontend framework or static site generator
- Health check endpoints for monitoring

#### User Benefit

Frontend applications consume CMS content with simple GET requests — no API keys, no authentication tokens, no CORS complexity — enabling straightforward JAMstack and SSG integration.

---

### File Upload System

#### Purpose

Handle media file uploads with metadata tracking and secure storage.

#### Capabilities

- Single and multiple file upload via Multer
- MIME type filtering (images, PDF, text files)
- File metadata stored in MongoDB (filename, original name, path, MIME type, size)
- Delete operations removing both metadata and physical files
- Serverless-compatible with /tmp storage paths for Vercel deployment

#### User Benefit

Media management is built into the CMS API rather than requiring a separate file hosting service, with metadata tracking enabling media library browsing in the frontend admin panel.

---

## System Structure

### User Interface

The backend is a headless API with no built-in UI. It serves the companion Cortex frontend (SPA) through CORS-configured endpoints. API documentation is implicitly defined through route structure and Zod/express-validator schemas.

### Data Layer

Dual-database architecture: MongoDB stores internal data (users, collection definitions, integration configurations, file metadata) via Mongoose. External databases (MongoDB, PostgreSQL, Supabase) store actual content items, accessed through the storage adapter pattern. This separation ensures Cortex never owns user content data — it only manages schemas and access control.

### Access Model

JWT cookie-based authentication with automatic token rotation. Role-based authorization distinguishes admin (full access to schemas, integrations, and user management) from user (content CRUD only). Public endpoints provide unauthenticated read access with independent rate limiting. Express sessions handle OAuth state where applicable.

### Persistence

Internal data persists in MongoDB. External content persists in user-connected databases. File uploads persist on disk (or /tmp for serverless). Refresh tokens are bcrypt-hashed before storage. Reset tokens use cryptographic randomness with timed expiry. Connection caching supports serverless environments where connections may be reused across invocations.

---

## User Workflow

### Entry

The first user to register via the signup endpoint becomes the admin. Additional users are created through the same endpoint with the default user role. Authentication returns JWT tokens in httpOnly cookies.

### Creation

Admins create collection definitions specifying name, type, and fields. Integrations are added by providing database connection details. After testing a connection, the admin can introspect the external database to discover existing schemas and import them as collections.

### Organization

Collections serve as the organizational unit. Each collection has a type (collection for lists, single for singletons), a field schema, and an optional external database binding. Items within collections are the actual content entries.

### Retrieval

Authenticated endpoints provide full CRUD access to collections and items. Public endpoints serve read-only content for frontend consumption. Integration introspection discovers database schemas. File upload endpoints serve media URLs.

### Reuse

Collection schemas function as reusable content type definitions. External database integrations allow the same content to be accessed by both Cortex and other applications. Public API endpoints enable multiple frontends to consume identical content.

---

## Documentation / Support Layer

### Purpose

Enable developers to deploy, configure, and integrate the backend API with frontend applications and external databases.

### Contents

- API endpoint reference (auth, collections, items, integrations, uploads, public)
- Database connection and introspection guide
- Authentication flow and token management
- Role-based access control configuration
- Deployment instructions for Vercel and traditional hosting
- Contributing guidelines and code of conduct

### User Benefit

Developers can deploy the backend, connect databases, and integrate the API with frontend applications using clear endpoint documentation and deployment guides.

---

## Product Positioning

### Category

Open-source headless CMS backend — vendor-agnostic content management API.

### Scope

Provides content schema management, multi-database content CRUD, authentication, media uploads, and public API endpoints. Intentionally avoids frontend rendering, page building, or deployment orchestration. The backend is the API layer that powers the Cortex frontend admin panel and serves content to consumer applications.

### Primary Users

Developers setting up a self-hosted headless CMS backend who need multi-database support (MongoDB, PostgreSQL, Supabase), runtime schema management, and public API endpoints for frontend consumption — without vendor lock-in or data migration requirements.

### Core Value Proposition

A headless CMS API with a vendor-agnostic storage adapter pattern — managing content across MongoDB, PostgreSQL, and Supabase through a single API layer with runtime schema definition, database introspection, and public read endpoints for frontend consumption.
