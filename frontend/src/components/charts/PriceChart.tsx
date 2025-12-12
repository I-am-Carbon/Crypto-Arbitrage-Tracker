import { ExchangePrice } from '@/types/crypto';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PriceChartProps {
  data: ExchangePrice[];
  symbol: string;
}

const EXCHANGE_COLORS: Record<string, string> = {
  Binance: '#F0B90B',
  Coinbase: '#0052FF',
  Kraken: '#5741D9',
};

export function PriceChart({ data, symbol }: PriceChartProps) {
  const filteredData = data.filter((d) => d.symbol === symbol);

  const chartData = filteredData.reduce((acc: any[], curr) => {
    const timestamp = new Date(curr.timestamp).toLocaleTimeString();
    const existing = acc.find((item) => item.time === timestamp);
    if (existing) {
      existing[curr.exchange] = curr.price;
    } else {
      acc.push({
        time: timestamp,
        [curr.exchange]: curr.price,
      });
    }
    return acc;
  }, []);

  const exchanges = [...new Set(filteredData.map((d) => d.exchange))];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-6">{symbol} Price History</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.slice(-50)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            {exchanges.map((exchange) => (
              <Line
                key={exchange}
                type="monotone"
                dataKey={exchange}
                stroke={EXCHANGE_COLORS[exchange] || '#888'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
