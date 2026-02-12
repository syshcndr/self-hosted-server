# Project Architecture

## Overview
This document describes the architecture of the `self-hosted-server` project, which consists of a client and server, both containerized and orchestrated via Docker Compose.

---

## Directory Structure

```
self-hosted-server/
├── docker-compose.yml
├── client/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.css
│       ├── App.js
│       ├── index.js
│       └── SuyashChandra3.html
└── server/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js
        ├── config/
        │   └── index.js
        ├── middleware/
        │   └── cors.js
        └── routes/
            ├── api.js
            └── metrics.js
```

---

## Components

### 1. Client
- **Framework:** React (JavaScript)
- **Containerized:** Yes (Dockerfile)
- **Web Server:** Nginx (nginx.conf)
- **Entry Point:** `src/index.js`
- **Static Files:** Served from `public/`

### 2. Server
- **Framework:** Node.js (Express)
- **Containerized:** Yes (Dockerfile)
- **Entry Point:** `src/index.js`
- **Configuration:** `src/config/index.js`
- **Middleware:** `src/middleware/cors.js` (CORS handling)
- **API Routes:**
  - `src/routes/api.js` (main API endpoints)
  - `src/routes/metrics.js` (metrics endpoints)

### 3. Orchestration
- **Tool:** Docker Compose
- **File:** `docker-compose.yml`
- **Purpose:** Defines and manages multi-container deployment for both client and server.

---

## Data Flow
1. **Client** sends HTTP requests to the **Server** (API endpoints).
2. **Server** processes requests, applies middleware, and responds with data or metrics.
3. **Nginx** serves the React app and proxies API requests if configured.

---

## Deployment
- Build and run both containers using Docker Compose:
  ```sh
  docker-compose up --build
  ```
- Access the client via the exposed port (as defined in `docker-compose.yml`).

---

## Extensibility
- Add new React components in `client/src/`.
- Add new API endpoints in `server/src/routes/`.
- Update Dockerfiles for custom build steps.

---

## Security & Best Practices
- Use environment variables for sensitive data (see `.env.example`).
- Use CORS middleware for cross-origin requests.
- Keep dependencies up to date in `package.json` files.

---

## Authors
- Suyash Chandra

---

For more details, see the code and configuration files in each directory.
---

## How to Run the Project

### Using Docker Compose (Recommended)
1. Ensure you have Docker and Docker Compose installed.
2. In the project root, run:
  ```sh
  docker-compose up --build
  ```
3. Access the client application in your browser at the port specified in `docker-compose.yml` (e.g., http://localhost:3000).
4. The server will be running on its configured port (see `docker-compose.yml`).

### Running Locally (Without Docker)
#### Server
1. Open a terminal and navigate to the `server` directory:
  ```sh
  cd server
  ```
2. Install dependencies:
  ```sh
  npm install
  ```
3. Start the server:
  ```sh
  npm start
  ```

#### Client
1. Open another terminal and navigate to the `client` directory:
  ```sh
  cd client
  ```
2. Install dependencies:
  ```sh
  npm install
  ```
3. Start the React development server:
  ```sh
  npm start
  ```
4. Open your browser to the port shown in the terminal (usually http://localhost:3000).

---
