import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getStockInsights(ticker: string, data: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    return "AI Insights are currently unavailable. Please configure your Gemini API key.";
  }

  try {
    const prompt = `Analyze the following stock data for ${ticker} and provide a brief, professional market sentiment analysis (Bullish, Bearish, or Neutral) and 3 key takeaways. 
    Data: ${JSON.stringify(data.slice(-10))}
    Format the response as:
    Sentiment: [Sentiment]
    Takeaways:
    1. [Point 1]
    2. [Point 2]
    3. [Point 3]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI insights.";
  }
}

export async function chatWithAI(message: string, context: { ticker: string, data: any[], watchlist: any[] }) {
  if (!process.env.GEMINI_API_KEY) {
    return "I'm currently offline. Please configure the Gemini API key to chat.";
  }

  try {
    const prompt = `You are an expert financial analyst chatbot for StockPro Analytics. 
    Current Context:
    - Selected Ticker: ${context.ticker}
    - Recent Data for ${context.ticker}: ${JSON.stringify(context.data.slice(-5))}
    - Watchlist Overview: ${JSON.stringify(context.watchlist.map(s => ({ t: s.ticker, p: s.price, c: s.change })))}

    User Question: ${message}

    Provide a concise, professional, and data-driven answer. Use markdown for formatting if needed.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I encountered an error while processing your request.";
  }
}
