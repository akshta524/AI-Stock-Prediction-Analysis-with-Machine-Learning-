import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  PieChart as PieChartIcon, 
  Search, 
  Bell, 
  Settings, 
  User,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Lock,
  Upload,
  FileText,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StockChart } from './components/StockChart';
import { PortfolioDonut } from './components/PortfolioDonut';
import { RiskAnalysisChart } from './components/RiskAnalysisChart';
import { BuyingPowerChart } from './components/BuyingPowerChart';
import { DailyPnLChart } from './components/DailyPnLChart';
import { EnterpriseModal } from './components/EnterpriseModal';
import { ChatBot } from './components/ChatBot';
import { getStockInsights } from './lib/gemini';
import { predictNextDays, DataPoint } from './lib/ml';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Login } from './Login';
import Papa from 'papaparse';

const INITIAL_WATCHLIST = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 189.43, change: 1.24 },
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 175.22, change: -2.45 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 415.10, change: 0.85 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 154.30, change: 1.10 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 3.45 },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', price: 178.15, change: 0.45 },
  { ticker: 'META', name: 'Meta Platforms', price: 495.20, change: 2.15 },
  { ticker: 'NFLX', name: 'Netflix, Inc.', price: 610.50, change: -1.20 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', price: 160.30, change: 1.80 },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', price: 405.10, change: 0.30 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.40, change: 0.65 },
  { ticker: 'V', name: 'Visa Inc.', price: 280.15, change: 0.40 },
  { ticker: 'UNH', name: 'UnitedHealth Group', price: 485.20, change: -0.75 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', price: 155.30, change: 0.15 },
  { ticker: 'WMT', name: 'Walmart Inc.', price: 60.45, change: 0.80 },
  { ticker: 'PG', name: 'Procter & Gamble', price: 162.10, change: 0.25 },
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', price: 120.30, change: 1.45 },
  { ticker: 'CVX', name: 'Chevron Corp.', price: 160.50, change: 1.10 },
  { ticker: 'KO', name: 'Coca-Cola Co.', price: 60.15, change: 0.35 },
  { ticker: 'PEP', name: 'PepsiCo, Inc.', price: 175.20, change: 0.45 },
  { ticker: 'COST', name: 'Costco Wholesale', price: 720.40, change: 1.25 },
  { ticker: 'DIS', name: 'The Walt Disney Co.', price: 115.30, change: -0.90 },
  { ticker: 'CRM', name: 'Salesforce, Inc.', price: 305.15, change: 1.15 },
  { ticker: 'ORCL', name: 'Oracle Corp.', price: 125.40, change: 0.70 },
  { ticker: 'INTC', name: 'Intel Corp.', price: 35.20, change: -1.45 },
  { ticker: 'PYPL', name: 'PayPal Holdings', price: 65.30, change: 0.55 },
  { ticker: 'SQ', name: 'Block, Inc.', price: 75.15, change: 2.30 },
  { ticker: 'COIN', name: 'Coinbase Global', price: 245.50, change: 4.15 },
];

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1M');
  const [localApiKey, setLocalApiKey] = useState(localStorage.getItem('alpha_vantage_key') || '');
  const [mainView, setMainView] = useState<'stock' | 'portfolio' | 'pnl' | 'buying-power' | 'risk' | 'ai' | 'watchlist'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [stockData, setStockData] = useState<any[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [predictionData, setPredictionData] = useState<DataPoint[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [portfolioStats, setPortfolioStats] = useState({
    value: "$124,592.00",
    pnl: "+$1,240.50",
    buyingPower: "$45,000.00",
    risk: "Moderate"
  });
  const [industryData, setIndustryData] = useState<any[]>([]);
  const [pnlData, setPnlData] = useState<any[]>([]);
  const [buyingPowerData, setBuyingPowerData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<{ id: string, title: string, msg: string, time: string, type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchStockData(selectedTicker, timeRange);
    // Check for success URL param for enterprise status
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setIsEnterprise(true);
    }
  }, [selectedTicker, user]);

  // Auto-update stock data every 10 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchStockData(selectedTicker, timeRange);
      
      // Update watchlist prices with slight fluctuations
      setWatchlist(prev => prev.map(stock => {
        const fluctuation = (Math.random() - 0.5) * 2; // -1 to +1
        const newPrice = stock.price + fluctuation;
        const newChange = stock.change + (fluctuation / stock.price) * 100;
        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number(newChange.toFixed(2))
        };
      }));

      setLastUpdated(new Date());
      toast.info("Market Refresh", {
        description: `Updated ${selectedTicker} and watchlist feeds.`,
        duration: 2000,
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [selectedTicker, user, timeRange]);

  // Simulated Live Notifications
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const alertTypes = [
        { title: "Price Alert", msg: `${selectedTicker} reached target price level`, type: "Trade" },
        { title: "Market Volatility", msg: "High volatility detected in Tech sector", type: "Alert" },
        { title: "New Analysis", msg: `Gemini AI generated new insights for ${selectedTicker}`, type: "Analysis" },
        { title: "Trade Executed", msg: `Order for ${selectedTicker} completed`, type: "Trade" }
      ];
      const selectedAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const newAlert = {
        id: Math.random().toString(36).substr(2, 9),
        ...selectedAlert,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAlerts(prev => [newAlert, ...prev].slice(0, 20)); // Store last 20 alerts
      
      toast(newAlert.title, {
        description: newAlert.msg,
        icon: <AlertCircle className="w-4 h-4 text-[#00d4aa]" />,
      });
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchStockData = async (ticker: string, range: string = '1M') => {
    setPredictionData([]); // Reset prediction on ticker change
    try {
      const headers: Record<string, string> = {};
      if (localApiKey) {
        headers['x-api-key'] = localApiKey;
      }
      
      const response = await fetch(`/api/stocks/${ticker}?range=${range}`, { headers });
      const result = await response.json();
      
      if (result.apiKeyError) {
        toast.error("Invalid API Key", {
          description: "The Alpha Vantage key provided is invalid. Falling back to simulated data.",
          duration: 5000,
        });
        setStockData(result.data);
      } else {
        setStockData(Array.isArray(result) ? result : result.data || []);
      }
      
      setInsights(''); // Reset insights
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info("Processing Dataset", {
      description: `Analyzing ${file.name}...`
    });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        if (data.length > 0) {
          // Map CSV to Watchlist
          const newWatchlist = data.slice(0, 15).map(row => ({
            ticker: row['stock name'] || 'N/A',
            name: row['Industry'] || 'Unknown',
            price: parseFloat(row['Price'] || row['LTP'] || row['CPM'] || '0'),
            change: parseFloat(row['Net profit variance'] || row['Variance'] || '0')
          })).filter(item => item.ticker !== 'N/A');

          if (newWatchlist.length > 0) {
            setWatchlist(newWatchlist);
            setSelectedTicker(newWatchlist[0].ticker);
            
            // Update Portfolio Stats based on data
            const totalMarketCap = data.reduce((acc, row) => acc + parseFloat(row['Market cap'] || '0'), 0);
            const avgPE = data.reduce((acc, row) => acc + parseFloat(row['Yearly PE ratio'] || '0'), 0) / data.length;
            
            setPortfolioStats({
              value: `$${(totalMarketCap / 100).toFixed(2)}M`,
              pnl: `${avgPE.toFixed(2)} P/E`,
              buyingPower: `$${(parseFloat(data[0]['Equity'] || '0') * 10).toFixed(2)}k`,
              risk: avgPE > 25 ? "High" : avgPE > 15 ? "Moderate" : "Low"
            });

            // Process Industry Data for Donut
            const industries: Record<string, number> = {};
            data.forEach(row => {
              const ind = row['Industry'] || 'Others';
              industries[ind] = (industries[ind] || 0) + 1;
            });
            const formattedIndustries = Object.entries(industries)
              .map(([name, value]) => ({ name, value }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5);
            setIndustryData(formattedIndustries);

            // Process P&L Data (Simulate weekly trend from Net Profit)
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const newPnlData = days.map(day => ({
              day,
              pnl: (data.reduce((acc, row) => acc + parseFloat(row['Net profit'] || '0'), 0) / data.length) * (Math.random() + 0.5)
            }));
            setPnlData(newPnlData);

            // Process Buying Power (Simulate intraday trend from Equity)
            const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
            const baseEquity = parseFloat(data[0]['Equity'] || '40000');
            const newBuyingPowerData = times.map(time => ({
              time,
              value: baseEquity * (1 + (Math.random() - 0.5) * 0.1) * 10
            }));
            setBuyingPowerData(newBuyingPowerData);

            // Process Risk Data (Map CSV metrics to Radar subjects)
            const newRiskData = [
              { subject: 'Volatility', A: Math.abs(parseFloat(data[0]['Variance'] || '100')), fullMark: 150 },
              { subject: 'Beta', A: parseFloat(data[0]['Yearly PE ratio'] || '15') * 5, fullMark: 150 },
              { subject: 'Sharpe', A: 80 + Math.random() * 40, fullMark: 150 },
              { subject: 'Alpha', A: parseFloat(data[0]['Net profit variance'] || '10') * 2, fullMark: 150 },
              { subject: 'Drawdown', A: Math.abs(parseFloat(data[0]['Variance'] || '20')), fullMark: 150 },
              { subject: 'Liquidity', A: (parseFloat(data[0]['Market cap'] || '1000') / 100), fullMark: 150 },
            ];
            setRiskData(newRiskData);

            toast.success("Dashboard Synchronized", {
              description: `Imported ${data.length} records. Market intelligence updated.`
            });
          }
        }
        setIsUploading(false);
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        toast.error("Import Failed", {
          description: "Could not process the document format."
        });
        setIsUploading(false);
      }
    });
  };

  const generateInsights = async () => {
    if (!isEnterprise) return;
    setLoadingInsights(true);
    const result = await getStockInsights(selectedTicker, stockData);
    setInsights(result);
    setLoadingInsights(false);
  };

  const handlePredict = () => {
    if (stockData.length < 2) return;
    setIsPredicting(true);
    
    // Simulate ML processing time
    setTimeout(() => {
      const predictions = predictNextDays(stockData, 7);
      setPredictionData(predictions);
      setIsPredicting(false);
      toast.success("ML Prediction Complete", {
        description: `Generated 7-day price forecast for ${selectedTicker} using Linear Regression.`,
      });
    }, 1500);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="h-screen bg-[#0e1117] text-white flex flex-col relative overflow-hidden">
      <Toaster theme="dark" position="top-right" closeButton />
      <div className="visual-decor"></div>
      {/* Navigation */}
      <nav className="h-14 border-b border-[#334155] flex items-center justify-between px-6 bg-[#0e1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#00d4aa] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,212,170,0.3)]">
            <TrendingUp className="text-[#0e1117] w-5 h-5 font-bold" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#00d4aa]">StockPro Analytics</span>
          <div className="premium-badge ml-3">
            {isEnterprise ? 'ENTERPRISE' : 'FREE TIER'}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <Input 
              placeholder="Search symbols..." 
              className="pl-10 bg-[#0e1117]/50 border-[#334155] w-72 focus-visible:ring-[#00d4aa] rounded-lg"
            />
          </div>
          <Button variant="ghost" size="icon" className="text-[#94a3b8] hover:text-white" onClick={() => toast.info("No new notifications")}>
            <Bell className="w-5 h-5" />
          </Button>
          <div className="hidden lg:flex items-center bg-[#1e2130] border border-[#334155] rounded-lg px-3 py-1.5 gap-2">
            <span className="text-[10px] text-[#94a3b8] font-bold uppercase whitespace-nowrap">API Key:</span>
            <input 
              type="password" 
              placeholder="Alpha Vantage Key"
              value={localApiKey}
              onChange={(e) => {
                const val = e.target.value;
                setLocalApiKey(val);
                localStorage.setItem('alpha_vantage_key', val);
              }}
              className="bg-transparent border-none outline-none text-xs text-[#00d4aa] w-24 placeholder:text-[#334155]"
            />
          </div>
          <EnterpriseModal />
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-[#94a3b8] hover:text-white px-2"
            onClick={() => setUser(null)}
          >
            <div className="w-9 h-9 rounded-full bg-[#1e2130] border border-[#334155] flex items-center justify-center">
              <User className="w-4 h-4 text-[#94a3b8]" />
            </div>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Watchlist */}
        <aside className="w-80 border-r border-[#334155] flex flex-col bg-[#0e1117]">
          <div className="p-6 border-b border-[#334155]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1px]">Watchlist</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] text-[#00d4aa] hover:text-[#00d4aa] hover:bg-[#00d4aa]/10 px-2"
                onClick={() => setMainView('watchlist')}
              >
                VIEW ALL
              </Button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.json"
              onChange={handleFileUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-[#1e2130] border border-[#334155] hover:bg-[#2d3142] text-[#00d4aa] text-xs font-bold h-9 rounded-lg flex items-center gap-2"
            >
              <Upload className="w-3 h-3" />
              {isUploading ? 'Uploading...' : 'Add Your Dataset'}
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {watchlist.map((stock) => (
              <div 
                key={stock.ticker}
                onClick={() => {
                  setSelectedTicker(stock.ticker);
                  setMainView('stock');
                }}
                className={`data-row ${selectedTicker === stock.ticker && mainView === 'stock' ? 'bg-[#00d4aa]/10 border-l-2 border-[#00d4aa]' : ''}`}
              >
                <div>
                  <div className="font-bold text-sm">{stock.ticker}</div>
                  <div className="text-[11px] text-[#94a3b8] truncate uppercase tracking-wide">{stock.name}</div>
                </div>
                <div className="text-right font-mono text-sm">
                  ${stock.price.toFixed(2)}
                </div>
                <div className={`text-right flex items-center justify-end gap-1 text-xs ${stock.change >= 0 ? 'text-[#00d4aa]' : 'text-rose-400'}`}>
                  {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span className="font-mono">{Math.abs(stock.change)}%</span>
                </div>
              </div>
            ))}
          </ScrollArea>
          <div className="p-6 bg-[#1e2130]/30 mt-auto border-t border-[#334155]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Market Status</span>
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-[#00d4aa]"
                />
                <div className="premium-badge text-[9px] py-0.5 px-2">LIVE</div>
              </div>
            </div>
            <div className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Updated: {lastUpdated.toLocaleTimeString()}</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#0e1117]">
          {/* Top Stat Bar - More compact and fixed */}
          <div className="px-6 py-2 bg-[#1e2130]/50 border-b border-[#334155] flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <StatItem 
                label="Portfolio" 
                value={portfolioStats.value} 
                change="+12.5%" 
                active={mainView === 'portfolio'}
                onClick={() => setMainView('portfolio')}
              />
              <div className="w-px h-8 bg-[#334155]" />
              <StatItem 
                label="Market" 
                value={portfolioStats.pnl} 
                change="+0.8%" 
                active={mainView === 'pnl'}
                onClick={() => setMainView('pnl')}
              />
              <div className="w-px h-8 bg-[#334155]" />
              <StatItem 
                label="Buying Power" 
                value={portfolioStats.buyingPower} 
                active={mainView === 'buying-power'}
                onClick={() => setMainView('buying-power')}
              />
              <div className="w-px h-8 bg-[#334155]" />
              <StatItem 
                label="Risk" 
                value={portfolioStats.risk} 
                active={mainView === 'risk'}
                onClick={() => setMainView('risk')}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMainView('ai')}
                className={`h-9 border-[#334155] gap-2 rounded-xl transition-all ${mainView === 'ai' ? 'bg-[#00d4aa] text-[#0e1117] border-[#00d4aa]' : 'text-[#94a3b8] hover:text-white'}`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
              </Button>
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#0e1117] rounded-lg border border-[#334155]">
                <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
                <span className="text-[10px] text-[#94a3b8] font-bold uppercase">System: Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col p-4 bg-grid">
            <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col min-h-0 space-y-4">
              {/* Dynamic Focus Section */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
                {/* Primary Content (Chart/Donut/etc) */}
                <Card className="lg:col-span-3 bg-[#1e2130]/80 backdrop-blur-md border-[#334155] shadow-2xl rounded-xl overflow-hidden border-t-[#00d4aa]/20 border-t-2 flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-[#334155]/30">
                    <div>
                      <div className="flex items-center gap-3 mb-0.5">
                        <Badge variant="outline" className="text-[9px] h-4 border-[#00d4aa] text-[#00d4aa] bg-[#00d4aa]/5">
                          {mainView.toUpperCase()}
                        </Badge>
                        {mainView === 'stock' && (
                          <span className="text-[9px] text-[#94a3b8] font-mono">ID: {selectedTicker}</span>
                        )}
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                        {mainView === 'stock' ? selectedTicker : mainView.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        <span className="text-[9px] font-medium text-[#475569] tracking-widest">
                          {mainView === 'stock' ? 'REAL-TIME EQUITIES' : 'DATAPOINT ANALYSIS'}
                        </span>
                      </CardTitle>
                    </div>
                    {mainView === 'stock' && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handlePredict}
                          disabled={isPredicting || stockData.length < 2}
                          variant="outline"
                          className="border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/10 rounded-lg flex items-center gap-2 h-8 px-3"
                        >
                          <BrainCircuit className={`w-3 h-3 ${isPredicting ? 'animate-pulse' : ''}`} />
                          <span className="text-[10px] font-bold">{isPredicting ? 'Analyzing...' : 'Predict'}</span>
                        </Button>
                        <div className="h-8 p-1 bg-[#0e1117] border border-[#334155] rounded-lg flex items-center gap-1">
                          {['1W', '1M', '1Y'].map((r) => (
                            <button
                              key={r}
                              onClick={() => {
                                setTimeRange(r);
                                fetchStockData(selectedTicker, r);
                              }}
                              className={`px-2.5 h-full text-[9px] font-bold rounded transition-all ${timeRange === r ? 'bg-[#00d4aa] text-[#0e1117]' : 'text-[#94a3b8] hover:text-white'}`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={mainView + (mainView === 'stock' ? selectedTicker : '')}
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col"
                      >
                        {mainView === 'stock' && (
                          <div className="flex-1 min-h-0">
                            <StockChart data={stockData} ticker={selectedTicker} predictionData={predictionData} />
                          </div>
                        )}
                        {mainView === 'portfolio' && <div className="flex-1 min-h-0"><PortfolioDonut data={industryData} /></div>}
                        {mainView === 'risk' && <div className="flex-1 min-h-0"><RiskAnalysisChart data={riskData} /></div>}
                        {mainView === 'buying-power' && <div className="flex-1 min-h-0"><BuyingPowerChart data={buyingPowerData} /></div>}
                        {mainView === 'pnl' && <div className="flex-1 min-h-0"><DailyPnLChart data={pnlData} /></div>}
                        {mainView === 'watchlist' && (
                          <div className="space-y-4 h-full flex flex-col">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                              <Input 
                                placeholder="Search symbol..." 
                                className="pl-10 bg-[#0e1117] border-[#334155] text-white focus:border-[#00d4aa] h-10 rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <ScrollArea className="flex-1 pr-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {watchlist
                                  .filter(s => 
                                    s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    s.name.toLowerCase().includes(searchQuery.toLowerCase())
                                  )
                                  .map(stock => (
                                    <Card 
                                      key={stock.ticker}
                                      className={`bg-[#0e1117] border-[#334155] hover:border-[#00d4aa]/50 transition-all cursor-pointer group rounded-lg ${selectedTicker === stock.ticker ? 'border-[#00d4aa]' : ''}`}
                                      onClick={() => {
                                        setSelectedTicker(stock.ticker);
                                        setMainView('stock');
                                      }}
                                    >
                                      <CardContent className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded bg-[#1e2130] flex items-center justify-center font-bold text-[#00d4aa] text-xs">
                                            {stock.ticker[0]}
                                          </div>
                                          <div>
                                            <div className="font-bold text-white group-hover:text-[#00d4aa] transition-colors text-xs">{stock.ticker}</div>
                                            <div className="text-[10px] text-[#94a3b8]">{stock.name}</div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-mono text-xs text-white">${stock.price.toFixed(2)}</div>
                                          <div className={`text-[10px] font-bold ${stock.change >= 0 ? 'text-[#00d4aa]' : 'text-rose-400'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                        {mainView === 'ai' && (
                          <div className="flex-1 min-h-0">
                            <ChatBot 
                              selectedTicker={selectedTicker} 
                              stockData={stockData} 
                              watchlist={watchlist}
                              embedded={true}
                            />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Secondary Section (Context/Intelligence) */}
                <div className="flex flex-col gap-4 min-h-0">
                  {/* AI Quick Insights */}
                  <Card className="bg-[#1e2130] border-[#334155] shadow-2xl rounded-xl flex flex-col flex-1 min-h-0">
                    <CardHeader className="p-4">
                      <CardTitle className="flex items-center gap-3 text-xs font-bold">
                        <div className="p-1.5 bg-[#00d4aa]/10 rounded-lg">
                          <BrainCircuit className="w-4 h-4 text-[#00d4aa]" />
                        </div>
                        PULSE
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-0 min-h-0">
                      {!isEnterprise ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 p-3 bg-[#0e1117]/50 rounded-lg border border-dashed border-[#334155]">
                          <Lock className="w-5 h-5 text-[#334155]" />
                          <div className="text-[10px] text-[#94a3b8]">Insights Locked</div>
                          <EnterpriseModal />
                        </div>
                      ) : (
                        <div className="space-y-3 flex flex-col flex-1 min-h-0">
                          {!insights ? (
                            <Button 
                              onClick={generateInsights} 
                              disabled={loadingInsights}
                              className="w-full bg-[#00d4aa] hover:bg-[#00b894] text-[#0e1117] font-bold h-8 rounded-lg text-[10px]"
                            >
                              {loadingInsights ? 'Analyzing...' : 'Get Insights'}
                            </Button>
                          ) : (
                            <ScrollArea className="flex-1">
                              <div className="p-3 bg-[#0e1117] rounded-lg border border-[#00d4aa]/10 text-[11px] text-[#94a3b8] leading-relaxed italic">
                                {insights}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Activity/Alerts - Shorter and integrated */}
                  <Card className="bg-[#1e2130] border-[#334155] shadow-2xl rounded-xl h-[180px] flex flex-col">
                    <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-[9px] font-black uppercase tracking-wider text-[#94a3b8]">Signals</CardTitle>
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 px-3 pb-3">
                      <ScrollArea className="h-full pr-2">
                        <div className="space-y-1.5">
                          {alerts.length === 0 ? (
                            <div className="h-32 flex items-center justify-center text-[#334155] text-xs italic">
                              Monitoring...
                            </div>
                          ) : (
                            alerts.slice(0, 10).map((alert) => (
                              <div key={alert.id} className="p-2 rounded-lg bg-[#0e1117]/50 border border-transparent hover:border-[#334155] transition-all">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-mono text-[#00d4aa]">{alert.time}</span>
                                  <Badge className="text-[8px] h-4 bg-[#334155]">{alert.type}</Badge>
                                </div>
                                <div className="text-[10px] text-white font-medium line-clamp-1">{alert.title}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <ChatBot 
        selectedTicker={selectedTicker} 
        stockData={stockData} 
        watchlist={watchlist} 
      />
    </div>
  );
}

function StatItem({ label, value, change, active, onClick }: { label: string, value: string, change?: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`group cursor-pointer select-none py-1 px-4 rounded-xl transition-all ${active ? 'bg-[#00d4aa]/10' : 'hover:bg-white/5'}`}
    >
      <div className={`text-[9px] font-black uppercase tracking-[1px] mb-1 transition-colors ${active ? 'text-[#00d4aa]' : 'text-[#475569] group-hover:text-[#94a3b8]'}`}>
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-base font-bold text-white tracking-tight">{value}</span>
        {change && (
          <span className={`text-[10px] font-bold ${change.startsWith('+') ? 'text-[#00d4aa]' : 'text-rose-400'}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, onClick, active }: { title: string, value: string, change?: string, icon: React.ReactNode, onClick?: () => void, active?: boolean }) {
  return (
    <Card 
      onClick={onClick}
      className={`bg-[#1e2130] border-[#334155] shadow-lg transition-all duration-300 rounded-2xl cursor-pointer ${active ? 'border-[#00d4aa] ring-1 ring-[#00d4aa]/20' : 'hover:border-[#00d4aa]/50'}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-[1px]">{title}</span>
          <div className="p-2 bg-[#0e1117] rounded-lg border border-[#334155]">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {change && (
            <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-[#00d4aa]' : 'text-rose-400'}`}>
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  time: string;
  type: string;
  description: string;
  status: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ time, type, description, status }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#0e1117]/50 transition-colors border border-transparent hover:border-[#334155]">
      <div className="flex items-center gap-6">
        <div className="text-[11px] text-[#94a3b8] font-mono w-16">{time}</div>
        <Badge variant="outline" className="text-[9px] h-5 border-[#334155] text-[#94a3b8] uppercase tracking-wider">{type}</Badge>
        <div className="text-sm font-medium text-white">{description}</div>
      </div>
      <div className="text-[11px] text-[#94a3b8] uppercase tracking-wider font-bold">{status}</div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
  );
}
