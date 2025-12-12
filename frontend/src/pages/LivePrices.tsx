import { useRealPrices } from '@/hooks/useRealData';
import { PriceCard } from '@/components/prices/PriceCard';
import { PriceTable } from '@/components/prices/PriceTable';
import { StatsCard } from '@/components/stats/StatsCard';
import { Activity, TrendingUp, Layers, RefreshCw } from 'lucide-react';

export default function LivePrices() {
  const { prices, isConnected } = useRealPrices();

  const btcPrices = prices.filter((p) => p.symbol === 'BTCUSDT');
  const ethPrices = prices.filter((p) => p.symbol === 'ETHUSDT');

  const avgBtc = btcPrices.length > 0 
    ? btcPrices.reduce((sum, p) => sum + p.price, 0) / btcPrices.length 
    : 0;
  const avgEth = ethPrices.length > 0 
    ? ethPrices.reduce((sum, p) => sum + p.price, 0) / ethPrices.length 
    : 0;

  const btcSpread = btcPrices.length > 0
    ? ((Math.max(...btcPrices.map(p => p.price)) - Math.min(...btcPrices.map(p => p.price))) / Math.min(...btcPrices.map(p => p.price))) * 100
    : 0;
  const ethSpread = ethPrices.length > 0
    ? ((Math.max(...ethPrices.map(p => p.price)) - Math.min(...ethPrices.map(p => p.price))) / Math.min(...ethPrices.map(p => p.price))) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Prices</h1>
          <p className="text-muted-foreground">Real-time cryptocurrency prices across exchanges</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className={`h-4 w-4 ${isConnected ? 'animate-spin' : ''}`} />
          <span>Auto-refresh every 1s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="BTC Average"
          value={`$${avgBtc.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subtitle="Across 3 exchanges"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatsCard
          title="ETH Average"
          value={`$${avgEth.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          subtitle="Across 3 exchanges"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatsCard
          title="BTC Spread"
          value={`${btcSpread.toFixed(3)}%`}
          subtitle="Max price difference"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={btcSpread >= 0.5 ? 'up' : 'neutral'}
        />
        <StatsCard
          title="ETH Spread"
          value={`${ethSpread.toFixed(3)}%`}
          subtitle="Max price difference"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={ethSpread >= 0.5 ? 'up' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Bitcoin (BTC/USDT)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {btcPrices.map((price) => (
              <PriceCard key={`${price.exchange}-${price.symbol}`} price={price} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Ethereum (ETH/USDT)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ethPrices.map((price) => (
              <PriceCard key={`${price.exchange}-${price.symbol}`} price={price} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTable prices={prices} symbol="BTCUSDT" />
        <PriceTable prices={prices} symbol="ETHUSDT" />
      </div>
    </div>
  );
}
