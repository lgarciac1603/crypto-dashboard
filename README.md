# Crypto Dashboard

A modern, real-time cryptocurrency dashboard with dark theme and neon accents. Built with Angular 20, served via nginx, and fully orchestrated with Docker Compose alongside [cpp-rest-api](https://github.com/lgarciac1603/cpp-rest-api) (C++ backend) and [favorites-api](https://github.com/lgarciac1603/favorites-api) (Go microservice).

> **Full stack entry point**: This repository is the starting point for the entire application. It clones and orchestrates the backend services automatically via the included setup scripts and `docker-compose.yml`. Running each service standalone is also supported.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Project Structure](#project-structure)
7. [Full Stack Deployment](#full-stack-deployment)
8. [Running Locally](#running-locally)
9. [Building](#building)
10. [Testing](#testing)
11. [API Integration](#api-integration)
12. [Design System](#design-system)
13. [Contributing](#contributing)
14. [License](#license)
15. [Roadmap](#roadmap)

---

## Overview

Crypto Dashboard is an Angular 20 single-page application that displays real-time cryptocurrency data and lets authenticated users persist their favorite coins. It communicates with two backend services:

- **[cpp-rest-api](https://github.com/lgarciac1603/cpp-rest-api)** — C++ REST API that handles user registration, authentication, and JWT session management.
- **[favorites-api](https://github.com/lgarciac1603/favorites-api)** — Go microservice that manages each user's list of favorite cryptocurrencies.

Core features:

- View the top 10 cryptocurrencies by market cap with live price updates every 30 seconds.
- Detailed crypto view: current price, 24h change, market cap, volume, 24h high/low, ATH/ATL, and circulating supply.
- Time period selector: Current, Week, Month, Year, 5 Years.
- User login/logout with JWT-based session handling.
- Persistent favorites list synced to the backend — add or remove coins from any view.
- Visual price indicators: green for gains, red for losses, with last-updated timestamp.

---

## Technology Stack

| Component      | Technology                                             | Version |
| -------------- | ------------------------------------------------------ | ------- |
| Language       | TypeScript                                             | 5.x     |
| Framework      | Angular                                                | 20      |
| Styles         | SCSS                                                   | —       |
| HTTP Client    | Angular `HttpClient` + RxJS                            | —       |
| Web Server     | nginx                                                  | alpine  |
| Container      | Docker / Docker Compose                                | 26+     |
| Crypto Data    | [CoinGecko API](https://www.coingecko.com/en/api)      | v3      |
| Auth Backend   | [cpp-rest-api](https://github.com/lgarciac1603/cpp-rest-api) (C++) | — |
| Favorites API  | [favorites-api](https://github.com/lgarciac1603/favorites-api) (Go) | — |

---

## Prerequisites

Before running this project, ensure the following are installed:

- **Node.js 20+** and **npm** — [https://nodejs.org](https://nodejs.org)
- **Angular CLI** — `npm install -g @angular/cli`
- **Docker Desktop** (for full stack) — [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- **Git** — [https://git-scm.com/downloads](https://git-scm.com/downloads)

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/lgarciac1603/crypto-dashboard.git
cd crypto-dashboard

# 2. Install frontend dependencies
npm install

# 3. Run the setup script to clone backend services and generate config files
# Windows (PowerShell):
.\setup.ps1

# Linux / macOS:
bash setup.sh
```

> On the first run, the setup script creates `.env` from `.env.example` and exits. Fill in your values, then re-run the script. On subsequent runs it clones `cpp-rest-api` and `favorites-api` into `backend/` and generates all required config files.

---

## Configuration

All backend configuration is driven by a single `.env` file at the root of this repository. The setup script creates it from `.env.example` automatically on first run.

```bash
cp .env.example .env
```

| Variable            | Default                 | Description                              |
| ------------------- | ----------------------- | ---------------------------------------- |
| `JWT_SECRET`        | `dev-secret-key`        | Secret used to sign and verify JWT tokens |
| `CORS_ALLOW_ORIGIN` | `http://localhost:4200` | Allowed CORS origin for both backend APIs |
| `DB_NAME`           | `apidb`                 | PostgreSQL database name                 |
| `DB_USER`           | `apiuser_test`          | PostgreSQL user                          |
| `DB_PASS`           | `apipass_test`          | PostgreSQL password                      |

> Always use a strong, random `JWT_SECRET` in any non-local environment.

When the setup script runs, it writes these values into:
- `backend/cpp-rest-api/src/config/config.h` — runtime config for the Docker build (reads env vars).
- `backend/cpp-rest-api/src/config/config.local.h` — hardcoded config for native builds.

---

## Project Structure

```
crypto-dashboard/
├── backend/                        # Git-ignored; populated by setup scripts
│   ├── cpp-rest-api/               # C++ auth & user management backend
│   └── favorites-api/              # Go favorites microservice
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config/             # API base URLs
│   │   │   ├── interceptors/       # HTTP interceptors (auth token injection)
│   │   │   ├── models/             # TypeScript interfaces / data models
│   │   │   └── services/           # API services (auth, crypto, favorites)
│   │   ├── features/
│   │   │   ├── dashboard/          # Main dashboard view
│   │   │   └── crypto-detail/      # Detailed crypto view
│   │   └── shared/                 # Shared components and pipes
│   └── styles.scss                 # Global styles and design tokens
├── .env.example                    # Template for environment variables
├── .gitignore
├── docker-compose.yml              # Full stack orchestration (4 services)
├── Dockerfile                      # Multi-stage build: Angular → nginx
├── nginx.conf                      # nginx config with API reverse proxies
├── setup.ps1                       # Windows setup script
├── setup.sh                        # Linux/macOS setup script
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Full Stack Deployment

This is the recommended way to run the entire application. A single command builds and starts all four services.

### Architecture

```
crypto-dashboard (Angular / nginx)   :4200
        |
        +-- cpp-rest-api (C++)        :8080   ← user auth & sessions
        |
        +-- favorites-api (Go)        :8090   ← crypto favorites microservice
        |
        +-- PostgreSQL 16             :5432   ← shared database
```

### Steps

```bash
# 1. Run the setup script (first time only — sets up .env and clones backends)
.\setup.ps1        # Windows
bash setup.sh      # Linux / macOS

# 2. Build and start all services
docker compose up --build
```

Access the services:

| Service       | URL                   |
| ------------- | --------------------- |
| Frontend      | http://localhost:4200 |
| Backend API   | http://localhost:8080 |
| Favorites API | http://localhost:8090 |

### Useful commands

```bash
# Run in background
docker compose up --build -d

# Stream logs from all services
docker compose logs -f

# Stop all services
docker compose down

# Stop and wipe the database volume
docker compose down -v
```

### How it works

1. `setup.ps1` / `setup.sh` clones `cpp-rest-api` and `favorites-api` into `backend/` and generates the C++ config headers from your `.env`. The `backend/` folder is git-ignored and never committed.
2. `docker compose up` builds all four images from source and connects them on a shared `app-network`.
3. `cpp-rest-api` applies all database migrations automatically on startup.
4. `favorites-api` connects to the same PostgreSQL instance and delegates JWT validation to `cpp-rest-api` via Docker DNS (`http://cpp-rest-api:8080`).
5. nginx proxies all `/api/` requests to `cpp-rest-api` and `/favorites/` requests to `favorites-api`, so the browser only talks to port `4200`.

---

## Running Locally

To run only the Angular dev server (without Docker):

```bash
ng serve
```

Open `http://localhost:4200/`. The app hot-reloads on file changes.

> For full functionality (login, favorites) the backend services must also be running. See the standalone instructions in each backend's README.

### Code scaffolding

```bash
# Generate a new component
ng generate component component-name

# List all available schematics
ng generate --help
```

---

## Building

```bash
ng build
```

Build artifacts are written to `dist/`. The production build is optimized for performance. The Docker image runs this build behind nginx automatically.

---

## Testing

```bash
# Run unit tests with Karma
ng test
```

---

## API Integration

The frontend integrates with two backend APIs and one external service:

| Service       | Base URL              | Purpose                         |
| ------------- | --------------------- | ------------------------------- |
| cpp-rest-api  | `http://localhost:8080` | User auth, sessions, JWT        |
| favorites-api | `http://localhost:8090` | Add / remove / list favorites   |
| CoinGecko     | `https://api.coingecko.com/api/v3` | Live crypto market data |

The `AuthInterceptor` automatically attaches the `Authorization: Bearer <token>` header to all requests targeting either backend service.

---

## Design System

### Color Palette

| Token           | Value       | Usage                        |
| --------------- | ----------- | ---------------------------- |
| Background      | `#0a0a0f`   | Page background              |
| Card Background | `#12121a`   | Card and panel surfaces      |
| Neon Cyan       | `#00f3ff`   | Primary accent, highlights   |
| Neon Magenta    | `#ff00ff`   | Secondary accent             |
| Neon Green      | `#39ff14`   | Positive price changes       |
| Text Primary    | `#e8e8ff`   | Main readable text           |
| Text Secondary  | `#9b9bb5`   | Labels, subtitles            |

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "feat: add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

---

## License

This project is open source. See the [LICENSE](LICENSE) file for details.

---

## Roadmap

- [ ] Portfolio view with allocation breakdown
- [ ] Price alert notifications
- [ ] Dark/light theme toggle
- [ ] Pagination or infinite scroll for coin list
- [ ] Expanded time period charts with Chart.js or D3
- [ ] PWA support for offline mode
