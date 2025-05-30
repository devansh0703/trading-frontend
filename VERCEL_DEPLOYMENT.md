# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (free tier works)
2. Vercel CLI installed: `npm i -g vercel`

## Deployment Steps

### 1. Install Vercel CLI and Login
```bash
npm i -g vercel
vercel login
```

### 2. Deploy from Project Root
```bash
vercel
```

### 3. Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (for first deployment)
- What's your project's name? Choose a name (e.g., trading-chart-app)
- In which directory is your code located? **./** (current directory)

### 4. Production Deployment
```bash
vercel --prod
```

## Configuration Details

The project is configured with:
- **Frontend**: React + Vite build output served statically
- **Backend**: Express API routes converted to Vercel serverless functions
- **API Routes**: All `/api/*` requests routed to serverless functions
- **Static Files**: Frontend assets served from `/client/dist`

## Environment Variables (if needed)
If your app requires environment variables, add them in Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add any required variables

## API Endpoints Available:
- `GET /api/ohlc` - Real-time price data from Binance
- `GET /api/trendlines` - Get all trendlines
- `POST /api/trendlines` - Create trendline
- `PATCH /api/trendlines/:id` - Update trendline
- `DELETE /api/trendlines/:id` - Delete trendline

## Notes
- The app uses in-memory storage, so data resets on each deployment
- Binance API integration provides real market data
- All routes are serverless and automatically scale