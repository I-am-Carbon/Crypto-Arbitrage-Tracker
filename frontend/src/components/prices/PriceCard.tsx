import { ExchangePrice } from '@/types/crypto';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceCardProps {
  price: ExchangePrice;
  previousPrice?: number;
}

export function PriceCard({ price, previousPrice }: PriceCardProps) {
  const priceChange = previousPrice ? price.price - previousPrice : 0;
  const isUp = priceChange > 0;
  const isDown = priceChange < 0;

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p);
  };

  return (
    <div
      className={cn(
        'glass-card p-4 transition-all duration-300',
        isUp && 'border-success/30',
        isDown && 'border-destructive/30'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
              price.exchange === 'Binance' && 'bg-yellow-500/20 text-yellow-400',
              price.exchange === 'Coinbase' && 'bg-blue-500/20 text-blue-400',
              price.exchange === 'Kraken' && 'bg-purple-500/20 text-purple-400'
            )}
          >
            {price.exchange[0]}
          </div>
          <span className="font-medium text-sm text-muted-foreground">{price.exchange}</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground/60">
          {new Date(price.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{price.symbol}</p>
          <p
            className={cn(
              'text-2xl font-bold font-mono transition-colors',
              isUp && 'text-success',
              isDown && 'text-destructive',
              !isUp && !isDown && 'text-foreground'
            )}
          >
            {formatPrice(price.price)}
          </p>
        </div>

        {price.change24h !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
              price.change24h >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}
          >
            {price.change24h >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(price.change24h).toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
