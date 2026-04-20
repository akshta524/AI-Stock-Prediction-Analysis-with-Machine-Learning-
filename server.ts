import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stock Data API
  app.get("/api/stocks/:ticker", async (req, res) => {
    const { ticker } = req.params;
    const { range } = req.query;
    // Prioritize key from header, then fallback to env var
    const apiKey = req.headers['x-api-key'] || process.env.ALPHA_VANTAGE_API_KEY;
    
    let days = 30;
    if (range === '1W') days = 7;
    else if (range === '1M') days = 30;
    else if (range === '1Y') days = 365;

    // If API Key is provided, try to fetch real data
    if (apiKey && apiKey !== "") {
      try {
        let func = 'TIME_SERIES_DAILY';
        let extraParams: Record<string, string> = {};

        if (range === '1W') {
          func = 'TIME_SERIES_INTRADAY';
          extraParams = { interval: '60min' };
        } else if (range === '1Y') {
          func = 'TIME_SERIES_WEEKLY';
        }

        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: func,
            symbol: ticker,
            apikey: apiKey,
            ...extraParams
          }
        });

        // Alpha Vantage returns 200 even for errors, so we check for error keys
        if (response.data['Error Message'] || response.data['Note']) {
          console.warn("Alpha Vantage Notice/Error:", response.data['Note'] || response.data['Error Message']);
          const mockData = generateMockData(ticker, days);
          return res.json({ data: mockData, apiKeyError: !!response.data['Error Message'], rateLimit: !!response.data['Note'] });
        }

        const dataKey = range === '1W' ? 'Time Series (60min)' : 
                        range === '1Y' ? 'Weekly Time Series' : 
                        'Time Series (Daily)';
        
        const timeSeries = response.data[dataKey];

        if (timeSeries) {
          const formattedData = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
            date: date.includes(' ') ? date.split(' ')[0] : date,
            price: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume']) || 0
          })).reverse(); // AV returns newest first

          // For Alpha Vantage, we might want to trim the data to match our requested range
          // especially for DAILY which returns 100 points
          const slicedData = formattedData.slice(-Math.min(formattedData.length, days));
          return res.json(slicedData);
        }
      } catch (error: any) {
        console.error("Alpha Vantage API Error:", error.response?.data || error.message);
        const mockData = generateMockData(ticker, days);
        return res.json({ data: mockData, apiKeyError: true });
      }
    }

    // Fallback Mock Data
    const data = generateMockData(ticker, days);
    res.json(data);
  });

  function generateMockData(ticker: string, days: number) {
    const data = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        price: 150 + Math.random() * 50 + (ticker === 'TSLA' ? Math.random() * 100 : 0),
        volume: Math.floor(Math.random() * 1000000),
      });
    }
    return data;
  }

  // Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AlphaStream Enterprise Subscription",
                description: "Unlock AI insights and real-time volatility tracking",
              },
              unit_amount: 2900, // $29.00
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?canceled=true`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
