// CryptoPrediction.tsx
import React, { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

interface FormData {
  base_currency: string;
  quote_currency: string;
  timeframe: string;
  period: string;
  api_key: string;
}

interface ForecastPoint {
  date: string;
  predicted_price: number;
  prediction_interval_low: number;
  prediction_interval_high: number;
  direction: string;
  probability: number;
}

interface TechnicalIndicators {
  rsi: number;
  rsi_signal: string;
  macd: number;
  macd_signal: string;
  stochastic: number;
  stochastic_signal: string;
  adx: number;
  trend_strength: string;
  atr: number;
  mfi: number;
}

interface PredictionData {
  prediction: 'UP' | 'DOWN';
  probability_up: number;
  probability_down: number;
  current_price: number;
  technical_indicators: TechnicalIndicators;
  accuracy: number;
  plot_base64: string;
  forecast: ForecastPoint[];
}

interface IndicatorProps {
  label: string;
  value: number | string;
  signal?: string;
  description: string;
}

const timeframes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const periods = [
  { value: '30', label: '30 Days' },
  { value: '60', label: '60 Days' },
  { value: '90', label: '90 Days' },
  { value: '120', label: '120 Days' },
  { value: '180', label: '180 Days' },
  { value: '360', label: '360 Days' }
];

const popularCryptos = [
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'SOL', label: 'Solana' },
  { value: 'BNB', label: 'Binance Coin' },
  { value: 'XRP', label: 'Ripple' },
  { value: 'ADA', label: 'Cardano' },
  { value: 'DOT', label: 'Polkadot' },
  { value: 'DOGE', label: 'Dogecoin' }
];

const IndicatorCard: React.FC<IndicatorProps> = ({ label, value, signal, description }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className="flex items-center justify-between mt-1">
      <span className="text-xl font-bold">
        {typeof value === 'number' ? value.toFixed(2) : value}
      </span>
      {signal && (
        <span className={`text-sm font-medium px-2 py-1 rounded ${
          signal.toLowerCase().includes('bull') || signal.toLowerCase().includes('strong') || 
          signal === 'Overbought' ? 'bg-green-100 text-green-800' :
          signal.toLowerCase().includes('bear') || signal.toLowerCase().includes('weak') || 
          signal === 'Oversold' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {signal}
        </span>
      )}
    </div>
    <div className="text-xs text-gray-400 mt-1">{description}</div>
  </div>
);

const ForecastTable: React.FC<{ forecast: ForecastPoint[] }> = ({ forecast }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="py-2 text-left">Date</th>
          <th className="py-2 text-right">Predicted Price</th>
          <th className="py-2 text-center">Direction</th>
          <th className="py-2 text-right">Confidence</th>
          <th className="py-2 text-right">Range</th>
        </tr>
      </thead>
      <tbody>
        {forecast.map((point, index) => (
          <tr key={index} className="border-b">
            <td className="py-2">{point.date}</td>
            <td className="py-2 text-right">
              ${point.predicted_price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </td>
            <td className="py-2 text-center">
              <div className="flex items-center justify-center">
                {point.direction === "UP" ? (
                  <ArrowUp className="text-green-500" size={20} />
                ) : (
                  <ArrowDown className="text-red-500" size={20} />
                )}
                <span className={`ml-1 ${
                  point.direction === "UP" ? "text-green-600" : "text-red-600"
                }`}>
                  {point.direction}
                </span>
              </div>
            </td>
            <td className="py-2 text-right">
              {(point.probability * 100).toFixed(1)}%
            </td>
            <td className="py-2 text-right">
              <span className="text-red-600">
                ${point.prediction_interval_low.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              {" - "}
              <span className="text-green-600">
                ${point.prediction_interval_high.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CryptoPrediction: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    base_currency: 'BTC',
    quote_currency: 'USD',
    timeframe: 'daily',
    period: '30',
    api_key: ''
  });

  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modifikasi bagian fetch request pada CryptoPrediction.tsx
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://portal2.incoe.astra.co.id/api-analysis/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin',  // Ubah dari 'include' ke 'same-origin'
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch prediction');
      }

      const data = await response.json();
      setPrediction(data as PredictionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch error:', err); // Tambahkan logging untuk debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cryptocurrency Price Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cryptocurrency</label>
                <Select
                  value={formData.base_currency}
                  onValueChange={(value: string) => 
                    setFormData({...formData, base_currency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularCryptos.map((crypto) => (
                      <SelectItem key={crypto.value} value={crypto.value}>
                        {crypto.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Timeframe</label>
                <Select
                  value={formData.timeframe}
                  onValueChange={(value: string) => 
                    setFormData({...formData, timeframe: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((tf) => (
                      <SelectItem key={tf.value} value={tf.value}>
                        {tf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Period</label>
                <Select
                  value={formData.period}
                  onValueChange={(value: string) => 
                    setFormData({...formData, period: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alpha Vantage API Key</label>
                <Input
                  type="text"
                  value={formData.api_key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({...formData, api_key: e.target.value})
                  }
                  placeholder="Enter your API key"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                'Get Prediction'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {prediction && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Direction</h3>
                      <div className="flex items-center mt-1">
                        {prediction.prediction === 'UP' ? (
                          <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                        )}
                        <span className={`text-2xl font-bold ${
                          prediction.prediction === 'UP' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {prediction.prediction}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
                      <p className="text-2xl font-bold mt-1">
                        ${prediction.current_price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Prediction Confidence</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Upward</span>
                          <span>{(prediction.probability_up * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={prediction.probability_up * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Downward</span>
                          <span>{(prediction.probability_down * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={prediction.probability_down * 100} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Model Performance</h3>
                    <Progress value={prediction.accuracy * 100} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1">
                      {(prediction.accuracy * 100).toFixed(1)}% accuracy on historical predictions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IndicatorCard
                    label="RSI"
                    value={prediction.technical_indicators.rsi}
                    signal={prediction.technical_indicators.rsi_signal}
                    description="Relative Strength Index"
                  />
                  <IndicatorCard
                    label="MACD"
                    value={prediction.technical_indicators.macd}
                    signal={prediction.technical_indicators.macd_signal}
                    description="Moving Average Convergence Divergence"
                  />
                  <IndicatorCard
                    label="Stochastic"
                    value={prediction.technical_indicators.stochastic}
                    signal={prediction.technical_indicators.stochastic_signal}
                    description="Stochastic Oscillator"
                  />
                  <IndicatorCard
                    label="ADX"
                    value={prediction.technical_indicators.adx}
                    signal={prediction.technical_indicators.trend_strength}
                    description="Average Directional Index"
                  />
                  <IndicatorCard
                    label="ATR"
                    value={prediction.technical_indicators.atr}
                    description="Average True Range"
                  />
                  <IndicatorCard
                    label="MFI"
                    value={prediction.technical_indicators.mfi}
                    description="Money Flow Index"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price Charts and Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-w-16 aspect-h-12 bg-white rounded-lg overflow-hidden">
                <img
                  src={`data:image/png;base64,${prediction.plot_base64}`}
                  alt="Price Analysis Charts"
                  className="object-contain w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price Forecast</CardTitle>
              <p className="text-sm text-gray-500">
                Next 10 periods prediction with confidence intervals
              </p>
            </CardHeader>
            <CardContent>
              <ForecastTable forecast={prediction.forecast} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CryptoPrediction;