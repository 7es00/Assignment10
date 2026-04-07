# anonymous-inbox-api

Backend REST API for an **anonymous inbox**: every user has a **unique shareable link** (`profileSlug`). Anyone can post **anonymous** messages; logged-in users can also send **public** messages that show sender info to the recipient. The API includes **JWT access + refresh tokens**, **OTP verification**, **single-device and all-device logout**, **profile picture uploads**, **role-based admin**, and **MongoDB** persistence.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the server](#running-the-server)
- [API overview](#api-overview)
- [Authentication](#authentication)
- [Response format](#response-format)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- **User accounts** — signup/signin, profile CRUD, optional custom `profileSlug`, account deletion (cleans up related data).
- **Shareable inbox** — auto-generated `profileSlug`; public lookup of display name + slug before sending.
- **Messaging** — anonymous send (no auth), public send (auth), inbox with pagination and unread count, get one message, mark read, delete.
- **Sessions** — access JWT with `jti` + `tokenVersion`; refresh JWT stored server-side; refresh endpoint rotates tokens.
- **Logout** — revoke current access token; **logout all devices** bumps `tokenVersion` and clears refresh/revocation records for that user.
- **Email verification (OTP)** — OTP generated on signup; verify and resend endpoints (integrate email delivery in production).
- **Profile images** — multipart upload, served statically under `/uploads`.
- **Admin** — list users, get user by id, change role (requires `admin`).

---

## Tech stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Runtime     | Node.js (ES modules)                 |
| Framework   | Express 5                            |
| Database    | MongoDB                              |
| ODM         | Mongoose 9                           |
| Auth        | JWT (jsonwebtoken), bcrypt           |
| Uploads     | multer                               |
| Other       | cors, morgan, dotenv                 |

---

## Project structure

```
├── config/
│   ├── .env                 # local secrets (create this; not committed)
│   └── Config.service.js    # env → app config
├── src/
│   ├── main.js              # HTTP server, middleware, static /uploads
│   ├── App.controller.js    # mounts routers
│   ├── constants/           # messages, roles, etc.
│   ├── DB/
│   │   ├── DB.connection.js
│   │   └── models/          # User, Message, RefreshToken, RevokedToken, …
│   ├── modules/
│   │   ├── Auth/            # signup, login, tokens, OTP, session, /users + /auth routes
│   │   ├── User/            # profile, upload picture
│   │   ├── Messages/        # inbox, send anonymous/public
│   │   └── Admin/           # admin-only user APIs
│   └── utils/               # jwt, bcrypt, errors, otp, slug, …
├── uploads/                 # created at runtime (profile images)
├── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ recommended  
- **MongoDB** running locally or **MongoDB Atlas** URI  

---

## Installation

```bash
git clone <your-repo-url>
cd anonymous-inbox-api
npm install
```

Create **`config/.env`** (see [Configuration](#configuration)). Ensure MongoDB is reachable.

---

## Configuration

Environment variables are loaded from **`config/.env`** (path resolved in `config/Config.service.js`).

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | HTTP port. Default: `3000` |
| `MONGO_URI` | No* | MongoDB connection string. Default: `mongodb://127.0.0.1:27017/AssignmentSaraha` |
| `JWT_SECRET` | **Yes (prod)** | Secret for signing JWTs. Default in code is **dev only** |
| `JWT_EXPIRES_IN` | No | Access token lifetime (e.g. `1h`) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token lifetime (e.g. `7d`) |
| `OTP_SECRET` | **Yes (prod)** | HMAC secret for OTP hashing |
| `EXPOSE_OTP` | No | Set `true` to return `devOtp` in responses for testing (**never in production**) |
| `PHONE_SECRET` | No | Used by phone-related encryption config |
| `PHONE_ALGORITHM` | No | Encryption algorithm label (see config) |
| `ENCRYPTION_KEY` | No | Used by encryption utilities |

\*Omit `MONGO_URI` only if the default local database is correct for you.

---

## Running the server

**Development** (auto-restart on file changes):

```bash
npm run dev
```

**Production-style**:

```bash
npm start
```

Entry point: **`src/main.js`**.

- **Health:** `GET /` → JSON confirming the API is running.  
- **Static files:** `GET /uploads/...` → uploaded profile images.

---

## API overview

Base URL: `http://localhost:<PORT>` (or your deployed host).

### Authentication — `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | — | Register. Returns `token`, `accessToken`, `refreshToken`, `user` |
| `POST` | `/auth/signin` | — | Sign in; same response shape as signup |
| `GET` | `/auth/refresh-token` | Refresh JWT | New `accessToken` + `refreshToken` + `user` |
| `PATCH` | `/auth/verify-account` | — | Body: `{ "email", "otp" }` |
| `POST` | `/auth/resend-otp` | — | Body: `{ "email" }` |
| `POST` | `/auth/logout` | Access JWT | Revokes current access token (`jti`) |
| `PATCH` | `/auth/logout-from-all-devices` | Access JWT | Invalidates all sessions for that user |

**Refresh token location** (pick one):

- Header: `Authorization: Bearer <refreshToken>`
- Header: `x-refresh-token: <refreshToken>`
- Query: `?refreshToken=<refreshToken>`

### Users (alternate) — `/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users/signup` | — | Same as `/auth/signup` |
| `POST` | `/users/login` | — | Same as `/auth/signin` |
| `GET` | `/users/` | Access | Current user |
| `PATCH` | `/users/` | Access | Update profile fields |
| `DELETE` | `/users/` | Access | Delete current user |

### User profile — `/user`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/user/profile` | Access | Current user profile |
| `PATCH` | `/user/upload-profile-pic` | Access | `multipart/form-data`, field **`profilePic`** (image). Max size enforced in code (e.g. 2MB); allowed types: JPEG, PNG, WebP, GIF |

### Messages — `/messages`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/messages/profile/:profileSlug` | — | Public recipient preview |
| `POST` | `/messages/send/:profileSlug` | — | Anonymous message; body: `{ "content" }` |
| `POST` | `/messages/send-public/:profileSlug` | Access | Identified message (sender stored for recipient) |
| `GET` | `/messages/` | Access | Inbox; query: `page`, `limit` |
| `GET` | `/messages/:messageId` | Access | Single message (recipient only) |
| `PATCH` | `/messages/:messageId/read` | Access | Mark as read |
| `DELETE` | `/messages/:messageId` | Access | Delete (recipient only) |

### Admin — `/admin`

All routes require **Bearer access token** and user **`role: admin`**.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users` | Paginated list; query: `page`, `limit` |
| `GET` | `/admin/users/:userId` | User by ID |
| `PATCH` | `/admin/users/:userId/role` | Body: `{ "role" }` |

---

## Authentication

Protected routes expect:

```http
Authorization: Bearer <accessToken>
```

Some code paths also accept a `token` header for the raw JWT (see `auth.middleware.js`).

Access tokens carry **`userId`**, **`tv`** (token version), **`jti`**, and **`typ: "access"`**. The middleware checks:

- Signature and expiry  
- Optional **`jti`** against a revocation list  
- **`tv`** against the user’s current `tokenVersion` in the database  

Refresh tokens use **`typ: "refresh"`** and a server-side record; successful refresh **rotates** the refresh token.

---

## Response format

Typical success:

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": { }
}
```

Typical error (global handler):

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP status codes follow REST conventions (`400`, `401`, `403`, `404`, `500`, etc.).

---

## Security notes

1. **Never commit `config/.env`** or real secrets.  
2. Replace all default JWT and OTP secrets before any shared or production deployment.  
3. **OTP:** The API stores and verifies OTPs; **email/SMS delivery is not implemented** — add a provider (SendGrid, SES, Twilio, etc.) for real use.  
4. **`EXPOSE_OTP=true`** is only for local debugging.  
5. **Uploads:** Harden with antivirus, stricter MIME checks, CDN, and size limits in production.  
6. Add **rate limiting**, **HTTPS**, and **CORS** restrictions appropriate to your frontend origin(s).

---

## Troubleshooting

| Issue | Things to check |
|--------|------------------|
| `Cannot connect to MongoDB` | `MONGO_URI`, firewall, Atlas IP allowlist, local `mongod` running |
| `401` on protected routes | Access token expired, logged out, or logout-all; try refresh or sign in again |
| `403` on `/admin/*` | User document must have `role` set to `admin` |
| Refresh fails | Use **refresh** JWT, not access; token may have been rotated or invalidated |
| Upload fails | Field name must be **`profilePic`**; check file type and size |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run `node ./src/main.js` |
| `npm run dev` | Run with `node --watch` for development |
| `npm test` | Placeholder (no tests configured yet) |

---

## License

ISC — see `package.json` (update if you change license).

---

## Contributing

Issues and pull requests are welcome if you open-source the repo. Keep changes focused; match existing style (ES modules, async/await, centralized messages in `constants`).
