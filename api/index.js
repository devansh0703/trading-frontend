import express from 'express';
import { storage } from '../server/storage.js';
import { insertTrendlineSchema } from '../shared/schema.js';
import { z } from 'zod';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get all trendlines for a user (or all if no auth)
app.get("/api/trendlines", async (req, res) => {
  try {
    const trendlines = await storage.getAllTrendlines();
    res.json(trendlines);
  } catch (error) {
    console.error("Error fetching trendlines:", error);
    res.status(500).json({ message: "Failed to fetch trendlines" });
  }
});

// Create a new trendline
app.post("/api/trendlines", async (req, res) => {
  try {
    const validatedData = insertTrendlineSchema.parse(req.body);
    const trendline = await storage.createTrendline(validatedData);
    res.status(201).json(trendline);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid trendline data", errors: error.errors });
    } else {
      console.error("Error creating trendline:", error);
      res.status(500).json({ message: "Failed to create trendline" });
    }
  }
});

// Update a trendline
app.patch("/api/trendlines/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertTrendlineSchema.partial().parse(req.body);
    const trendline = await storage.updateTrendline(id, validatedData);
    
    if (!trendline) {
      return res.status(404).json({ message: "Trendline not found" });
    }
    
    res.json(trendline);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid trendline data", errors: error.errors });
    } else {
      console.error("Error updating trendline:", error);
      res.status(500).json({ message: "Failed to update trendline" });
    }
  }
});

// Delete a trendline
app.delete("/api/trendlines/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteTrendline(id);
    
    if (!success) {
      return res.status(404).json({ message: "Trendline not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting trendline:", error);
    res.status(500).json({ message: "Failed to delete trendline" });
  }
});

// Real Binance OHLC data endpoint
app.get("/api/ohlc", async (req, res) => {
  try {
    const symbol = req.query.symbol || 'BTCUSDT';
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=100`);
    const binanceData = await response.json();
    
    const ohlcData = binanceData.map((kline) => ({
      timestamp: Math.floor(kline[0] / 1000), // Convert to seconds
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5])
    }));
    
    res.json(ohlcData);
  } catch (error) {
    console.error("Error fetching Binance data:", error);
    res.status(500).json({ message: "Failed to fetch OHLC data from Binance API" });
  }
});

export default app;