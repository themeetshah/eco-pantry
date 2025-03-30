import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { format, addDays, subDays } from 'date-fns';
import { AlertTriangle, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesData {
  date: Date;
  quantity: number;
}

interface WasteData {
  item: string;
  quantity: number;
  risk: number;
}

export function SalesForecasting() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [forecast, setForecast] = useState<number[]>([]);
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock historical data
  useEffect(() => {
    const generateMockData = () => {
      const data: SalesData[] = [];
      const today = new Date();
      
      // Generate 30 days of historical data
      for (let i = 30; i >= 0; i--) {
        const date = subDays(today, i);
        // Add some seasonality and randomness
        const baseQuantity = 100;
        const dayOfWeek = date.getDay();
        const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6) ? 30 : 0;
        const randomness = Math.random() * 20 - 10;
        
        data.push({
          date,
          quantity: Math.round(baseQuantity + weekendBoost + randomness)
        });
      }
      
      setSalesData(data);
      
      // Generate waste risk data
      const mockWasteData: WasteData[] = [
        { item: 'Tomatoes', quantity: 15, risk: 0.8 },
        { item: 'Lettuce', quantity: 8, risk: 0.7 },
        { item: 'Bananas', quantity: 12, risk: 0.6 },
        { item: 'Apples', quantity: 20, risk: 0.3 },
        { item: 'Carrots', quantity: 25, risk: 0.2 }
      ];
      setWasteData(mockWasteData);
      
      generateForecast(data);
      setIsLoading(false);
    };

    generateMockData();
  }, []);

  // Generate sales forecast using TensorFlow.js
  const generateForecast = async (data: SalesData[]) => {
    const quantities = data.map(d => d.quantity);
    const tensorData = tf.tensor2d(quantities.map((q, i) => [i]), [quantities.length, 1]);
    const tensorLabels = tf.tensor2d(quantities, [quantities.length, 1]);

    // Create and train a simple linear regression model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    await model.fit(tensorData, tensorLabels, { epochs: 100 });

    // Generate 7-day forecast
    const futureDays = tf.tensor2d([...Array(7)].map((_, i) => [quantities.length + i]));
    const prediction = model.predict(futureDays) as tf.Tensor;
    const forecastData = Array.from(prediction.dataSync());
    setForecast(forecastData);
  };

  const chartData = {
    labels: [
      ...salesData.map(d => format(d.date, 'MMM d')),
      ...Array(7).fill(0).map((_, i) => format(addDays(new Date(), i), 'MMM d'))
    ],
    datasets: [
      {
        label: 'Historical Sales',
        data: salesData.map(d => d.quantity),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Forecast',
        data: [...Array(salesData.length).fill(null), ...forecast],
        borderColor: 'rgb(99, 102, 241)',
        borderDash: [5, 5],
        fill: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Trend & Forecast'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity'
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Forecast Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Forecast</h3>
            <p className="text-sm text-gray-600">7-day prediction based on historical data</p>
          </div>
          <Line data={chartData} options={chartOptions} />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Trend</span>
              </div>
              <p className="mt-2 text-sm text-blue-700">
                {forecast[6] > salesData[salesData.length - 1].quantity ? (
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    Upward trend expected
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4" />
                    Downward trend expected
                  </span>
                )}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Forecast</span>
              </div>
              <p className="mt-2 text-sm text-green-700">
                Next 7 days: {Math.round(forecast.reduce((a, b) => a + b, 0))} units
              </p>
            </div>
          </div>
        </div>

        {/* Waste Risk Analysis */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Waste Risk Analysis</h3>
            <p className="text-sm text-gray-600">Items at risk of spoilage</p>
          </div>
          <div className="space-y-4">
            {wasteData.map((item) => (
              <div key={item.item} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.item}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity} units</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                    item.risk >= 0.7 
                      ? 'bg-red-100 text-red-800' 
                      : item.risk >= 0.4 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    {Math.round(item.risk * 100)}% risk
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.risk >= 0.7 
                        ? 'bg-red-500' 
                        : item.risk >= 0.4 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${item.risk * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}