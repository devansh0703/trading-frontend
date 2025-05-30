import { useState, useEffect } from "react";

interface ChartHeaderProps {
  trendlineCount: number;
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const tradingPairs = [
  { symbol: 'BTCUSDT', basePrice: 95842.50 },
  { symbol: 'ETHUSDT', basePrice: 3245.67 },
  { symbol: 'ADAUSDT', basePrice: 0.8956 },
  { symbol: 'DOTUSDT', basePrice: 7.234 },
  { symbol: 'LINKUSDT', basePrice: 23.45 },
  { symbol: 'MATICUSDT', basePrice: 1.234 },
  { symbol: 'SOLUSDT', basePrice: 156.78 },
  { symbol: 'AVAXUSDT', basePrice: 34.56 }
];

export function ChartHeader({ trendlineCount, selectedSymbol, onSymbolChange }: ChartHeaderProps) {
  const selectedPairIndex = tradingPairs.findIndex(pair => pair.symbol === selectedSymbol);
  const [currentPrice, setCurrentPrice] = useState(tradingPairs[selectedPairIndex]?.basePrice || tradingPairs[0].basePrice);
  const [priceChange, setPriceChange] = useState(2.34);
  const [lastUpdate, setLastUpdate] = useState<string>("2 seconds ago");

  const selectedPair = tradingPairs[selectedPairIndex] || tradingPairs[0];

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const basePrice = selectedPair.basePrice;
      const newPrice = basePrice + (Math.random() - 0.5) * (basePrice * 0.02);
      const newChange = ((newPrice - basePrice) / basePrice * 100);
      
      setCurrentPrice(newPrice);
      setPriceChange(newChange);
      setLastUpdate("Just now");
      
      setTimeout(() => setLastUpdate("2 seconds ago"), 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedPair]);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">Trading Frontend</h1>
        <div className="flex items-center space-x-3 text-sm">
          <select 
            value={selectedSymbol} 
            onChange={(e) => onSymbolChange(e.target.value)}
            className="bg-slate-700 text-white px-3 py-1 rounded text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
          >
            {tradingPairs.map((pair) => (
              <option key={pair.symbol} value={pair.symbol}>
                {pair.symbol}
              </option>
            ))}
          </select>
          <span className="font-mono text-white">
            ${currentPrice.toFixed(currentPrice < 1 ? 4 : 2)}
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
      </div>
    </header>
  );
}
