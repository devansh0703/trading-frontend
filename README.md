## Project Setup

### Prerequisites

- Node.js 20+ 
- npm or yarn package manager

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/devansh0703/trading-frontend.git
   cd trading-frontend/
   npm install
   npm run dev
   ```

2. **Open in browser**:
   Navigate to `http://localhost:5000`

## Usage Guide

### Drawing Trendlines

1. Click the **"Draw Trendline"** button in the sidebar
2. Click on any point on the chart to set the start point
3. Click on another point to complete the trendline
4. The trendline will appear and be listed in the sidebar

## Features

- **Real-time Bitcoin Data**: Live OHLC (Open, High, Low, Close) candlestick data from Binance API
- **Interactive Trendline Drawing**: Click twice on the chart to create trendlines
- **Draggable Trendlines**: Move trendline endpoints by dragging (coming soon)
- **Trendline Management**: View, delete, and manage all drawn trendlines in the sidebar
- **Coordinate Display**: Real-time display of trendline coordinates and slope calculations
- **Persistent Storage**: Trendlines are automatically saved to localStorage and restored on reload
- **Real-time Updates**: Chart data refreshes every 30 seconds

## Technology Stack

- **Frontend**: React, TypeScript, Chart.js, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Data Source**: Binance Public API
- **Storage**: localStorage (client-side persistence)


### Managing Trendlines

- **View Details**: All active trendlines are listed in the sidebar with:
  - Start and end coordinates (time + price)
  - Slope percentage (positive/negative trend)
  - Color-coded slope indicators
  
- **Delete Trendlines**: Click the trash icon next to any trendline to remove it
- **Clear All**: Use the "Clear All" button to remove all trendlines at once

### Persistence

- All drawn trendlines are automatically saved to your browser's localStorage
- Trendlines will be restored when you reload the page
- Data persists across browser sessions

## API Endpoints

### GET /api/ohlc
Fetches real-time Bitcoin OHLC data from Binance.

**Response Format**:
```json
[
  {
    "timestamp": 1648616400,
    "open": 43000.50,
    "high": 43250.75,
    "low": 42800.25,
    "close": 43100.00,
    "volume": 1250.5
  }
]
```

### Trendline API
- `GET /api/trendlines` - Get all saved trendlines
- `POST /api/trendlines` - Create a new trendline
- `PATCH /api/trendlines/:id` - Update a trendline
- `DELETE /api/trendlines/:id` - Delete a trendline

## Architecture Notes

### Frontend Architecture
- **Component Structure**: Modular components using React hooks and TypeScript
- **State Management**: Local React state with useCallback for performance optimization
- **Chart Integration**: Chart.js with react-chartjs-2 for reliable chart rendering
- **Styling**: Tailwind CSS with custom trading-specific color scheme

