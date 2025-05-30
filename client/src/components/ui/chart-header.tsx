import { useState, useEffect } from "react";

interface ChartHeaderProps {
  trendlineCount: number;
}

export function ChartHeader({ trendlineCount }: ChartHeaderProps) {
  const [currentPrice, setCurrentPrice] = useState(43250.75);
  const [priceChange, setPriceChange] = useState(2.34);
  const [lastUpdate, setLastUpdate] = useState<string>("2 seconds ago");

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = currentPrice + (Math.random() - 0.5) * 100;
      const newChange = ((newPrice - 43000) / 43000 * 100);
      
      setCurrentPrice(newPrice);
      setPriceChange(newChange);
      setLastUpdate("Just now");
      
      setTimeout(() => setLastUpdate("2 seconds ago"), 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">TrendLine Pro</h1>
        <div className="flex items-center space-x-3 text-sm">
          <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs font-mono">
            BTCUSDT
          </span>
          <span className="font-mono text-white">
            ${currentPrice.toFixed(2)}
          </span>
          <span className={`font-mono text-xs ${
            priceChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <i className="fas fa-clock"></i>
          <span>Last update: {lastUpdate}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <i className="fas fa-chart-line"></i>
          <span>{trendlineCount} Trendlines</span>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors">
          <i className="fas fa-cog mr-1"></i>Settings
        </button>
      </div>
    </header>
  );
}
