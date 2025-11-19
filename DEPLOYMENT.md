# GitHub Pages Deployment Guide

## Prerequisites

- GitHub repository created
- Code pushed to GitHub

## Deployment Steps

### 1. Build for Production

```bash
npm run build:gh-pages
```

This will create a production build in the `dist/crypto-dashboard/browser` folder with the correct base href for GitHub Pages.

### 2. Deploy to GitHub Pages

#### Option A: Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build:gh-pages

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/crypto-dashboard/browser
          cname: your-custom-domain.com # Optional: remove if not using custom domain
```

#### Option B: Manual Deployment

1. Build the project:

   ```bash
   npm run build:gh-pages
   ```

2. Install `angular-cli-ghpages`:

   ```bash
   npm install -g angular-cli-ghpages
   ```

3. Deploy:
   ```bash
   ngh --dir=dist/crypto-dashboard/browser
   ```

#### Option C: Using gh-pages package

1. Install gh-pages:

   ```bash
   npm install --save-dev gh-pages
   ```

2. Add deploy script to `package.json`:

   ```json
   "deploy": "gh-pages -d dist/crypto-dashboard/browser"
   ```

3. Build and deploy:
   ```bash
   npm run build:gh-pages
   npm run deploy
   ```

### 3. Configure GitHub Repository

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select the `gh-pages` branch
4. Click **Save**

Your app will be available at: `https://[username].github.io/crypto-dashboard/`

## Important Files

- **404.html**: Handles SPA routing on GitHub Pages
- **.nojekyll**: Prevents Jekyll processing
- **package.json**: Contains build scripts

## Troubleshooting

### Routing Issues

If routes don't work, ensure:

- `404.html` is in the `src` folder
- Base href is set correctly in build script
- `.nojekyll` file exists

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `ng cache clean`

### API CORS Issues

GitHub Pages serves static files. If you encounter CORS issues with the CoinGecko API:

- The API should work fine as it's called from the browser
- If issues persist, consider using a CORS proxy for development

## Custom Domain (Optional)

1. Add a `CNAME` file to `src` folder with your domain
2. Configure DNS settings with your domain provider
3. Update the build script to use your domain as base href

## Notes

- GitHub Pages may take a few minutes to update after deployment
- The app uses client-side routing, so the 404.html trick is necessary
- Production build is optimized and minified
