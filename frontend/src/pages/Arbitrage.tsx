import { useRealPrices, useRealArbitrage } from '@/hooks/useRealData';
import { ArbitrageFeed } from '@/components/arbitrage/ArbitrageFeed';
import { StatsCard } from '@/components/stats/StatsCard';
import { PriceTable } from '@/components/prices/PriceTable';
import { Zap, Target, DollarSign, Activity } from 'lucide-react';

export default function Arbitrage() {
  const { prices, isConnected: pricesConnected } = useRealPrices();
  const { opportunities, isConnected: arbConnected } = useRealArbitrage();

  const totalOpportunities = opportunities.length;
  const avgSpread = opportunities.length > 0
    ? opportunities.reduce((sum, o) => sum + o.spreadPercent, 0) / opportunities.length
    : 0;
  const totalPotentialProfit = opportunities.reduce((sum, o) => sum + o.potentialProfit, 0);
  const highValueOps = opportunities.filter(o => o.spreadPercent >= 1).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Arbitrage Scanner</h1>
          <p className="text-muted-foreground">Real-time arbitrage opportunity detection</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${pricesConnected && arbConnected ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            <span className={`w-2 h-2 rounded-full ${pricesConnected && arbConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            {pricesConnected && arbConnected ? 'Scanning' : 'Disconnected'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Opportunities Found"
          value={totalOpportunities}
          subtitle="Last 24 hours"
          icon={<Zap className="h-5 w-5" />}
          trend="up"
        />
        <StatsCard
          title="Avg Spread"
          value={`${avgSpread.toFixed(3)}%`}
          subtitle="Across all signals"
          icon={<Target className="h-5 w-5" />}
        />
        <StatsCard
          title="Potential Profit"
          value={`$${totalPotentialProfit.toFixed(2)}`}
          subtitle="If all executed"
          icon={<DollarSign className="h-5 w-5" />}
          trend="up"
        />
        <StatsCard
          title="High Value (≥1%)"
          value={highValueOps}
          subtitle="Premium opportunities"
          icon={<Activity className="h-5 w-5" />}
          trend={highValueOps > 0 ? 'up' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Live Signals
          </h2>
          <ArbitrageFeed opportunities={opportunities} />
        </div>

        <div className="space-y-6">
          <PriceTable prices={prices} symbol="BTCUSDT" />
          <PriceTable prices={prices} symbol="ETHUSDT" />
        </div>
      </div>
    </div>
  );
}
