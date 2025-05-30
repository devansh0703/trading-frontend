import { useState } from "react";
import { TradingChart, TrendlineData } from "@/components/ui/trading-chart";
import { TrendlineSidebar } from "@/components/ui/trendline-sidebar";
import { ChartHeader } from "@/components/ui/chart-header";

export default function TradingChartPage() {
  const [trendlines, setTrendlines] = useState<TrendlineData[]>([]);
  const [selectedCoordinate, setSelectedCoordinate] = useState<TrendlineData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const handleTrendlineUpdate = (updatedTrendlines: TrendlineData[]) => {
    setTrendlines(updatedTrendlines);
  };

  const handleCoordinateDisplay = (coordinate: TrendlineData | null) => {
    setSelectedCoordinate(coordinate);
  };

  const handleDrawingStateChange = (drawingState: boolean) => {
    setIsDrawing(drawingState);
  };

  const handleStartDrawing = () => {
    if (isDrawing) {
      // Cancel drawing if already drawing
      if (typeof window !== 'undefined' && (window as any).tradingChart) {
        (window as any).tradingChart.cancelDrawing();
      }
    } else {
      // Start drawing
      if (typeof window !== 'undefined' && (window as any).tradingChart) {
        (window as any).tradingChart.startDrawing();
      }
    }
  };

  const handleClearAll = () => {
    setIsDrawing(false);
    if (typeof window !== 'undefined' && (window as any).tradingChart) {
      (window as any).tradingChart.clearAllTrendlines();
    }
  };

  const handleDeleteTrendline = (id: string) => {
    if (typeof window !== 'undefined' && (window as any).tradingChart) {
      (window as any).tradingChart.deleteTrendline(id);
    }
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <ChartHeader 
        trendlineCount={trendlines.length} 
        selectedSymbol={selectedSymbol}
        onSymbolChange={handleSymbolChange}
      />
      
      <div className="flex-1 flex">
        <TradingChart
          onTrendlineUpdate={handleTrendlineUpdate}
          onCoordinateDisplay={handleCoordinateDisplay}
          onDrawingStateChange={handleDrawingStateChange}
          selectedSymbol={selectedSymbol}
          className="flex-1"
        />
        
        <TrendlineSidebar
          trendlines={trendlines}
          selectedCoordinate={selectedCoordinate}
          onStartDrawing={handleStartDrawing}
          onClearAll={handleClearAll}
          onDeleteTrendline={handleDeleteTrendline}
          isDrawing={isDrawing}
        />
      </div>
    </div>
  );
}
