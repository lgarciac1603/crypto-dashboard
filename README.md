# CryptoDashboard

A modern, real-time cryptocurrency dashboard with dark theme and neon accents. Built with Angular 20.

> **Full stack**: This frontend is the entry point for the complete application. It orchestrates [cpp-rest-api](https://github.com/lgarciac1603/cpp-rest-api) (C++ backend) and [favorites-api](https://github.com/lgarciac1603/favorites-api) (Go microservice) via Docker Compose.

## Features

### Modern UI Design
- **Dark theme** with neon cyan and magenta accents
- **Three-panel layout**:
  - Left sidebar with user profile and favorite cryptocurrencies
  - Top app bar with user information and login/logout
  - Main content area with real-time crypto data

### Cryptocurrency Features
- View top 10 cryptocurrencies by market cap
- Real-time price updates (auto-refresh every 30 seconds)
- Detailed crypto information including:
  - Current price and 24h change percentage
  - Market cap and trading volume
  - 24h high/low prices
  - All-time high/low
  - Circulating supply
- Time period selection (Current, Week, Month, Year, 5 Years)

### User Management
- Login/Logout functionality
- User profile display in sidebar and app bar
- Favorite cryptocurrencies quick access

### Real-Time Updates
- Live data refresh every 30 seconds
- Visual indicators for price changes (green for positive, red for negative)
- Last update timestamp display

## Full Stack Deployment (Docker)

This is the recommended way to run the entire application — frontend, backend, and microservice — with a single command.

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

### Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running
- [Git](https://git-scm.com/downloads)

### Setup

**1. Clone the backend services into `backend/`:**

On Windows (PowerShell):
```powershell
.\setup.ps1
```

On Linux / macOS:
```bash
bash setup.sh
```

> The script checks for a `.env` file. If none exists, it creates one from `.env.example` and exits — edit the file with your values, then re-run the script. On subsequent runs it clones the backend repos and generates `config.local.h` inside `cpp-rest-api` from your `.env` values.

**2. Start the full stack:**

```bash
docker compose up --build
```

**3. Access the app:**

| Service         | URL                       |
|-----------------|---------------------------|
| Frontend        | http://localhost:4200     |
| Backend API     | http://localhost:8080     |
| Favorites API   | http://localhost:8090     |

**Useful commands:**

```bash
# Run in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Stop and wipe the database
docker compose down -v
```

### Environment Variables

Copy `.env.example` to `.env` (the setup script does this automatically on first run) and edit your values:

```bash
cp .env.example .env
```

```env
JWT_SECRET=your-production-secret
CORS_ALLOW_ORIGIN=http://localhost:4200
DB_NAME=apidb
DB_USER=apiuser_test
DB_PASS=apipass_test
```

| Variable           | Default                    | Description                        |
|--------------------|----------------------------|------------------------------------|
| `JWT_SECRET`       | `dev-secret-key`           | Secret for signing JWT tokens      |
| `CORS_ALLOW_ORIGIN`| `http://localhost:4200`    | Allowed CORS origin for both APIs  |

> Always set a strong `JWT_SECRET` in production.

### How it works

1. `setup.ps1` / `setup.sh` clones `cpp-rest-api` and `favorites-api` into `backend/`. The `backend/` folder is git-ignored and never committed.
2. `docker compose up` builds all four services from source and starts them on a shared `app-network`.
3. `cpp-rest-api` applies all database migrations automatically on first start.
4. `favorites-api` connects to the same PostgreSQL instance and delegates JWT validation to `cpp-rest-api` via internal Docker DNS (`http://cpp-rest-api:8080`).

---

## 🛠 Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Design System

### Color Palette
- **Background**: `#0a0a0f` (dark)
- **Card Background**: `#12121a`
- **Neon Cyan**: `#00f3ff`
- **Neon Magenta**: `#ff00ff`
- **Neon Green**: `#39ff14` (positive changes)
- **Text Primary**: `#e8e8ff`
- **Text Secondary**: `#9b9bb5`

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Data models
│   │   └── services/        # API services
│   ├── features/
│   │   ├── dashboard/       # Main dashboard view
│   │   └── crypto-detail/   # Detailed crypto view
│   └── shared/              # Shared components and pipes
└── styles.scss              # Global styles
```

## API

This application uses the [CoinGecko API](https://www.coingecko.com/en/api) to fetch real-time cryptocurrency data.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## License

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.
