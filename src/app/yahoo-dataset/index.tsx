import React, { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// === INTERFACES ===
interface FormData {
  symbol: string;
  timeframe: string;
  period: string;
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

interface TickerInfo {
  ticker: string;
  price: number;
  change_amount: number;
  change_percentage: number;
  volume: number;
}

interface MarketMovers {
  top_gainers: TickerInfo[];
  top_losers: TickerInfo[];
  most_actively_traded: TickerInfo[];
  last_updated: string;
}

interface NewsArticle {
  title: string;
  url: string;
  publisher: string;
  published_date: string;
  summary: string;
}

interface NewsResponse {
  items: NewsArticle[];
  total_count: number;
}

// === CONSTANTS ===
const timeframes = [
  { value: '1d', label: 'Daily' },
  { value: '1wk', label: 'Weekly' },
  { value: '1mo', label: 'Monthly' }
];

const periods = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'max', label: 'Maximum' }
];

const popularCryptos = [
  { value: 'BTC-USD', label: 'Bitcoin' },
  { value: 'ETH-USD', label: 'Ethereum' },
  { value: 'SOL-USD', label: 'Solana' },
  { value: 'BNB-USD', label: 'Binance Coin' },
  { value: 'XRP-USD', label: 'Ripple' },
  { value: 'ADA-USD', label: 'Cardano' },
  { value: 'DOT-USD', label: 'Polkadot' },
  { value: 'DOGE-USD', label: 'Dogecoin' }
];

// Component Implementations...
const IndicatorCard: React.FC<{
  label: string;
  value: number | string;
  signal?: string;
  description: string;
}> = ({ label, value, signal, description }) => (
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

// Main Component
const CryptoPrediction: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    symbol: 'BTC-USD',
    timeframe: '1d',
    period: '30d'
  });

  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [marketMovers, setMarketMovers] = useState<MarketMovers | null>(null);
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fetch prediction
      const predictionResponse = await fetch('https://portal2.incoe.astra.co.id/api-analysis-yahoo/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!predictionResponse.ok) {
        const errorData = await predictionResponse.json();
        throw new Error(errorData.detail || 'Failed to fetch prediction');
      }

      const predictionData = await predictionResponse.json();
      setPrediction(predictionData);

      // Fetch market movers
      const marketResponse = await fetch('https://portal2.incoe.astra.co.id/api-analysis-yahoo/market-movers');
      if (marketResponse.ok) {
        const marketData = await marketResponse.json();
        setMarketMovers(marketData);
      }

      // Fetch news
      const newsResponse = await fetch(`https://portal2.incoe.astra.co.id/api-analysis-yahoo/news?symbol=${formData.symbol}`);
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        setNews(newsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cryptocurrency Analysis Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cryptocurrency</label>
                <Select
                  value={formData.symbol}
                  onValueChange={(value: string) => 
                    setFormData({...formData, symbol: value})
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
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                'Analyze Market'
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

      {/* After the Alert component, add: */}

<Tabs defaultValue="prediction" className="space-y-4">
  <TabsList className="w-full">
    <TabsTrigger value="prediction">Price Prediction</TabsTrigger>
    <TabsTrigger value="market">Market Overview</TabsTrigger>
    <TabsTrigger value="news">News</TabsTrigger>
  </TabsList>

  <TabsContent value="prediction">
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
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Prediction Confidence
                  </h3>
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
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price Charts and Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-w-16 aspect-h-9 bg-white rounded-lg overflow-hidden">
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
            <p className="text-sm text-gray-500">Next 10 periods prediction with confidence intervals</p>
          </CardHeader>
          <CardContent>
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
                  {prediction.forecast.map((point, index) => (
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
          </CardContent>
        </Card>
      </div>
    )}
  </TabsContent>

  <TabsContent value="market">
    {marketMovers && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Top Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {marketMovers.top_gainers.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.ticker}</span>
                    <span className="text-sm text-gray-500 ml-2">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 text-sm font-medium">
                      <ChevronUp className="inline h-4 w-4" />
                      {item.change_percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Top Losers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {marketMovers.top_losers.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.ticker}</span>
                    <span className="text-sm text-gray-500 ml-2">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600 text-sm font-medium">
                      <ChevronDown className="inline h-4 w-4" />
                      {Math.abs(item.change_percentage).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {marketMovers.most_actively_traded.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.ticker}</span>
                    <span className="text-sm text-gray-500 ml-2">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      item.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change_percentage >= 0 ? (
                        <ChevronUp className="inline h-4 w-4" />
                      ) : (
                        <ChevronDown className="inline h-4 w-4" />
                      )}
                      {Math.abs(item.change_percentage).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  </TabsContent>

  <TabsContent value="news">
    {news && (
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.items.map((article, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h3 className="font-medium text-base">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" 
                     className="hover:text-blue-600">
                    {article.title}
                  </a>
                </h3>
                <p className="text-sm text-gray-600">{article.summary}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(article.published_date).toLocaleDateString()}</span>
                  <span>{article.publisher}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </TabsContent>
</Tabs>
      
    </div>
  );
};

export default CryptoPrediction;