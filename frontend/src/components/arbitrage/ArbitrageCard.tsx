import { ArbitrageOpportunity } from '@/types/crypto';
import { ArrowRight, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArbitrageCardProps {
  opportunity: ArbitrageOpportunity;
  isNew?: boolean;
}

export function ArbitrageCard({ opportunity, isNew }: ArbitrageCardProps) {
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p);
  };

  const formatProfit = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p);
  };

  const timeDiff = Date.now() - new Date(opportunity.timestamp).getTime();
  const timeAgo =
    timeDiff < 60000
      ? `${Math.floor(timeDiff / 1000)}s ago`
      : timeDiff < 3600000
      ? `${Math.floor(timeDiff / 60000)}m ago`
      : `${Math.floor(timeDiff / 3600000)}h ago`;

  return (
    <div
      className={cn(
        'glass-card p-4 transition-all duration-500 arbitrage-signal',
        isNew && 'animate-slide-in-right border-success/50 glow-success',
        opportunity.spreadPercent >= 1 && 'border-primary/50'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{opportunity.symbol}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        </div>
        <div
          className={cn(
            'px-3 py-1.5 rounded-lg font-bold text-sm',
            opportunity.spreadPercent >= 1
              ? 'bg-primary/20 text-primary'
              : 'bg-success/20 text-success'
          )}
        >
          +{opportunity.spreadPercent.toFixed(3)}%
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1 p-3 rounded-lg bg-success/5 border border-success/20">
          <p className="text-xs text-muted-foreground mb-1">Buy on</p>
          <p className="font-semibold text-success">{opportunity.buyExchange}</p>
          <p className="font-mono text-sm">{formatPrice(opportunity.buyPrice)}</p>
        </div>

        <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />

        <div className="flex-1 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <p className="text-xs text-muted-foreground mb-1">Sell on</p>
          <p className="font-semibold text-destructive">{opportunity.sellExchange}</p>
          <p className="font-mono text-sm">{formatPrice(opportunity.sellPrice)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-sm text-muted-foreground">Potential Profit (0.1 BTC)</span>
        <span className="font-bold text-success">{formatProfit(opportunity.potentialProfit)}</span>
      </div>
    </div>
  );
}
