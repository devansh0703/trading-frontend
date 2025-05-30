import { TrendlineData } from "./trading-chart";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Trash2, TrendingUp } from "lucide-react";

interface TrendlineSidebarProps {
  trendlines: TrendlineData[];
  selectedCoordinate: TrendlineData | null;
  onStartDrawing: () => void;
  onClearAll: () => void;
  onDeleteTrendline: (id: string) => void;
  isDrawing: boolean;
}

export function TrendlineSidebar({
  trendlines,
  selectedCoordinate,
  onStartDrawing,
  onClearAll,
  onDeleteTrendline,
  isDrawing
}: TrendlineSidebarProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateSlope = (trendline: TrendlineData) => {
    const slope = ((trendline.end.price - trendline.start.price) / trendline.start.price * 100);
    return slope.toFixed(2);
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Drawing Tools</h2>
        <div className="space-y-3">
          <Button 
            onClick={onStartDrawing}
            className={`w-full ${isDrawing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {isDrawing ? 'Cancel Drawing' : 'Draw Trendline'}
          </Button>
          <Button 
            onClick={onClearAll}
            variant="destructive"
            className="w-full"
            disabled={trendlines.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>
      
      {/* Trendline List */}
      <div className="flex-1 p-4 overflow-auto">
        <h3 className="text-sm font-medium text-slate-200 mb-3">
          Active Trendlines ({trendlines.length})
        </h3>
        {trendlines.length === 0 ? (
          <div className="text-slate-400 text-sm italic">No trendlines drawn</div>
        ) : (
          <div className="space-y-2">
            {trendlines.map((trendline, index) => {
              const slope = calculateSlope(trendline);
              const isPositive = parseFloat(slope) >= 0;
              
              return (
                <Card key={trendline.id} className="bg-slate-700 border-slate-600">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        Trendline #{index + 1}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteTrendline(trendline.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Start:</span>
                        <span className="text-slate-200">
                          ${trendline.start.price.toFixed(2)} @ {formatTime(trendline.start.timestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">End:</span>
                        <span className="text-slate-200">
                          ${trendline.end.price.toFixed(2)} @ {formatTime(trendline.end.timestamp)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Slope:</span>
                        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                          {isPositive ? '+' : ''}{slope}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Coordinates Display */}
      {selectedCoordinate && (
        <div className="p-4 border-t border-slate-700">
          <Card className="bg-slate-900 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-400 flex items-center">
                <i className="fas fa-crosshairs mr-2"></i>
                Selected Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="text-slate-400 mb-1">Start Point</div>
                  <div className="text-slate-200">
                    Time: {new Date(selectedCoordinate.start.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="text-slate-200">
                    Price: ${selectedCoordinate.start.price.toFixed(2)}
                  </div>
                </div>
                <div className="border-t border-slate-600 pt-2">
                  <div className="text-slate-400 mb-1">End Point</div>
                  <div className="text-slate-200">
                    Time: {new Date(selectedCoordinate.end.timestamp * 1000).toLocaleString()}
                  </div>
                  <div className="text-slate-200">
                    Price: ${selectedCoordinate.end.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
