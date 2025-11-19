# CryptoDashboard 🚀

A modern, real-time cryptocurrency dashboard with dark theme and neon accents. Built with Angular 20.

## ✨ Features

### 🎨 Modern UI Design
- **Dark theme** with neon cyan and magenta accents
- **Three-panel layout**:
  - Left sidebar with user profile and favorite cryptocurrencies
  - Top app bar with user information and login/logout
  - Main content area with real-time crypto data

### 💱 Cryptocurrency Features
- View top 10 cryptocurrencies by market cap
- Real-time price updates (auto-refresh every 30 seconds)
- Detailed crypto information including:
  - Current price and 24h change percentage
  - Market cap and trading volume
  - 24h high/low prices
  - All-time high/low
  - Circulating supply
- Time period selection (Current, Week, Month, Year, 5 Years)

### 👤 User Management
- Login/Logout functionality
- User profile display in sidebar and app bar
- Favorite cryptocurrencies quick access

### 🔄 Real-Time Updates
- Live data refresh every 30 seconds
- Visual indicators for price changes (green for positive, red for negative)
- Last update timestamp display

## 🛠 Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 🎨 Design System

### Color Palette
- **Background**: `#0a0a0f` (dark)
- **Card Background**: `#12121a`
- **Neon Cyan**: `#00f3ff`
- **Neon Magenta**: `#ff00ff`
- **Neon Green**: `#39ff14` (positive changes)
- **Text Primary**: `#e8e8ff`
- **Text Secondary**: `#9b9bb5`

## 📁 Project Structure

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

## 🌐 API

This application uses the [CoinGecko API](https://www.coingecko.com/en/api) to fetch real-time cryptocurrency data.

## 🚀 Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 🧪 Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## 📝 Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## 📚 Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## 📄 License

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.
