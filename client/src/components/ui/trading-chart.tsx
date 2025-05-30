import { useEffect, useRef, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  InteractionItem,
} from 'chart.js';
import { Chart, getElementAtEvent, getDatasetAtEvent } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { TrendlineData, OHLCData } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TradingChartProps {
  onTrendlineUpdate: (trendlines: TrendlineData[]) => void;
  onCoordinateDisplay: (trendline: TrendlineData | null) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
  selectedSymbol?: string;
  className?: string;
}

export function TradingChart({ onTrendlineUpdate, onCoordinateDisplay, onDrawingStateChange, selectedSymbol = 'BTCUSDT', className }: TradingChartProps) {
  const chartRef = useRef<ChartJS<'line', any[], any>>(null);
  const [trendlines, setTrendlines] = useState<TrendlineData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTrendline, setCurrentTrendline] = useState<TrendlineData | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<{ trendlineId: string; point: 'start' | 'end' } | null>(null);

  // Fetch real OHLC data from API
  const fetchOHLCData = useCallback(async (): Promise<OHLCData[]> => {
    try {
      const response = await fetch(`/api/ohlc?symbol=${selectedSymbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch OHLC data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
      return [];
    }
  }, [selectedSymbol]);

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchOHLCData();
      setOhlcData(data);
      loadTrendlines();
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [fetchOHLCData]);

  // Create chart data
  const chartData = {
    labels: ohlcData.map(d => new Date(d.timestamp * 1000)),
    datasets: [
      {
        label: `${selectedSymbol} Price`,
        data: ohlcData.map(d => ({ x: new Date(d.timestamp * 1000), y: d.close })),
        borderColor: '#2962FF',
        backgroundColor: 'rgba(41, 98, 255, 0.1)',
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 6,
        tension: 0.1,
      },
      ...trendlines.map((trendline, index) => ({
        label: `Trendline ${index + 1}`,
        data: [
          { x: new Date(trendline.start.timestamp * 1000), y: trendline.start.price },
          { x: new Date(trendline.end.timestamp * 1000), y: trendline.end.price }
        ],
        borderColor: trendline.color,
        backgroundColor: trendline.color,
        borderWidth: 2,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 8,
        showLine: true,
        tension: 0,
      }))
    ],
  };

  // Calculate dynamic price range for Y-axis
  const prices = ohlcData.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1; // Add 10% padding
  
  const yMin = Math.max(0, minPrice - padding);
  const yMax = maxPrice + padding;

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm',
          },
        },
        grid: {
          color: '#2A2E39',
        },
        ticks: {
          color: '#868993',
        },
      },
      y: {
        min: yMin,
        max: yMax,
        grid: {
          color: '#2A2E39',
        },
        ticks: {
          color: '#868993',
          callback: function(value) {
            const num = Number(value);
            if (num < 1) {
              return '$' + num.toFixed(4);
            } else if (num < 100) {
              return '$' + num.toFixed(2);
            } else {
              return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
            }
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1E293B',
        titleColor: '#E2E8F0',
        bodyColor: '#E2E8F0',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    events: ['mousedown', 'mouseup', 'mousemove', 'click', 'touchstart', 'touchmove', 'touchend'],
    onHover: (event, activeElements) => {
      const chart = chartRef.current;
      if (!chart || isDrawing) return;

      // Change cursor when hovering over trendline points
      if (activeElements.length > 0) {
        const element = activeElements[0];
        if (element.datasetIndex > 0) {
          chart.canvas.style.cursor = 'move';
        } else {
          chart.canvas.style.cursor = 'default';
        }
      } else {
        chart.canvas.style.cursor = 'default';
      }
    },
    onClick: (event, elements) => {
      const chart = chartRef.current;
      if (!chart) return;

      // Handle clicking on existing trendline points for dragging
      if (!isDrawing && elements.length > 0) {
        const element = elements[0];
        if (element.datasetIndex > 0) { // Not the main price line
          const trendlineIndex = element.datasetIndex - 1;
          const pointIndex = element.index;
          const trendline = trendlines[trendlineIndex];
          
          if (trendline) {
            onCoordinateDisplay(trendline);
            return;
          }
        }
        return;
      }

      if (!isDrawing) return;

      const rect = chart.canvas.getBoundingClientRect();
      const x = (event as any).native.offsetX;
      const y = (event as any).native.offsetY;

      const dataX = chart.scales.x.getValueForPixel(x);
      const dataY = chart.scales.y.getValueForPixel(y);

      if (!dataX || !dataY) return;

      const timestamp = Math.floor(new Date(dataX).getTime() / 1000);
      const price = Number(dataY);

      if (clickCount === 0) {
        // First click - start new trendline
        const newTrendline: TrendlineData = {
          id: Date.now().toString(),
          start: {
            timestamp: timestamp,
            price: price,
            x: x,
            y: y
          },
          end: {
            timestamp: timestamp,
            price: price,
            x: x,
            y: y
          },
          color: '#2962FF'
        };
        
        setCurrentTrendline(newTrendline);
        setClickCount(1);
        
      } else if (clickCount === 1) {
        // Second click - complete trendline
        if (currentTrendline) {
          const completedTrendline: TrendlineData = {
            ...currentTrendline,
            end: {
              timestamp: timestamp,
              price: price,
              x: x,
              y: y
            }
          };
          
          const updatedTrendlines = [...trendlines, completedTrendline];
          setTrendlines(updatedTrendlines);
          onTrendlineUpdate(updatedTrendlines);
          onCoordinateDisplay(completedTrendline);
          saveTrendlines(updatedTrendlines);
          
          console.log('Trendline Created:', {
            id: completedTrendline.id,
            start: {
              timestamp: completedTrendline.start.timestamp,
              price: completedTrendline.start.price
            },
            end: {
              timestamp: completedTrendline.end.timestamp,
              price: completedTrendline.end.price
            }
          });
        }
        
        setCurrentTrendline(null);
        setClickCount(0);
        setIsDrawing(false);
        onDrawingStateChange(false);
      }
    },
  };

  const deleteTrendline = useCallback((id: string) => {
    const updatedTrendlines = trendlines.filter(t => t.id !== id);
    setTrendlines(updatedTrendlines);
    onTrendlineUpdate(updatedTrendlines);
    saveTrendlines(updatedTrendlines);
  }, [trendlines, onTrendlineUpdate]);

  const clearAllTrendlines = useCallback(() => {
    setTrendlines([]);
    onTrendlineUpdate([]);
    onCoordinateDisplay(null);
    localStorage.removeItem('tradingTrendlines');
  }, [onTrendlineUpdate, onCoordinateDisplay]);

  const saveTrendlines = useCallback((trendlinesToSave: TrendlineData[]) => {
    const saveData = trendlinesToSave.map(t => ({
      id: t.id,
      start: { timestamp: t.start.timestamp, price: t.start.price },
      end: { timestamp: t.end.timestamp, price: t.end.price },
      color: t.color
    }));
    
    localStorage.setItem('tradingTrendlines', JSON.stringify(saveData));
  }, []);

  const loadTrendlines = useCallback(() => {
    const saved = localStorage.getItem('tradingTrendlines');
    if (!saved) return;
    
    try {
      const savedTrendlines = JSON.parse(saved);
      
      const restoredTrendlines = savedTrendlines.map((saved: any) => ({
        id: saved.id,
        start: { 
          timestamp: saved.start.timestamp, 
          price: saved.start.price,
          x: 0,
          y: 0
        },
        end: { 
          timestamp: saved.end.timestamp, 
          price: saved.end.price,
          x: 0,
          y: 0
        },
        color: saved.color || '#2962FF'
      }));
      
      setTrendlines(restoredTrendlines);
    } catch (e) {
      console.error('Failed to load saved trendlines:', e);
    }
  }, []);

  const startDrawing = useCallback(() => {
    setIsDrawing(true);
    setClickCount(0);
    setCurrentTrendline(null);
    onDrawingStateChange(true);
  }, [onDrawingStateChange]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setClickCount(0);
    setCurrentTrendline(null);
    onDrawingStateChange(false);
  }, [onDrawingStateChange]);

  // Handle mouse events for dragging
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const canvas = chart.canvas;
    
    const handleMouseDown = (event: MouseEvent) => {
      if (isDrawing || isDragging) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Check if clicking on a trendline point
      const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
      
      if (elements.length > 0) {
        const element = elements[0];
        if (element.datasetIndex > 0) { // Not the main price line
          const trendlineIndex = element.datasetIndex - 1;
          const pointIndex = element.index;
          const trendline = trendlines[trendlineIndex];
          
          if (trendline) {
            setIsDragging(true);
            setDragTarget({
              trendlineId: trendline.id,
              point: pointIndex === 0 ? 'start' : 'end'
            });
            
            canvas.style.cursor = 'grabbing';
            event.preventDefault();
          }
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !dragTarget) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const dataX = chart.scales.x.getValueForPixel(x);
      const dataY = chart.scales.y.getValueForPixel(y);
      
      if (dataX && dataY) {
        const timestamp = Math.floor(new Date(dataX).getTime() / 1000);
        const price = Number(dataY);
        
        const updatedTrendlines = trendlines.map(t => {
          if (t.id === dragTarget.trendlineId) {
            return {
              ...t,
              [dragTarget.point]: {
                timestamp,
                price,
                x,
                y
              }
            };
          }
          return t;
        });
        
        setTrendlines(updatedTrendlines);
        onTrendlineUpdate(updatedTrendlines);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragTarget(null);
        canvas.style.cursor = 'default';
        saveTrendlines(trendlines);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp); // Handle mouse up outside canvas

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [trendlines, isDrawing, isDragging, dragTarget, onTrendlineUpdate, saveTrendlines]);

  // Expose methods for parent component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).tradingChart = {
        startDrawing,
        cancelDrawing,
        clearAllTrendlines,
        deleteTrendline
      };
    }
  }, [startDrawing, cancelDrawing, clearAllTrendlines, deleteTrendline]);

  return (
    <div className={`relative ${className || ''}`} style={{ backgroundColor: '#131722' }}>
      <div className="w-full h-full p-4">
        <Chart
          ref={chartRef}
          type="line"
          data={chartData}
          options={options}
        />
      </div>
      {isDrawing && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg z-10">
          <i className="fas fa-crosshairs mr-2"></i>
          {clickCount === 0 ? 'Click to start trendline' : 'Click to finish trendline'}
        </div>
      )}
    </div>
  );
}

export { type TrendlineData };