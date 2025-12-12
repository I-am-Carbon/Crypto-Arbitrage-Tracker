import { ExchangePrice } from '@/types/crypto';
import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PriceTableProps {
  prices: ExchangePrice[];
  symbol: string;
}

export function PriceTable({ prices, symbol }: PriceTableProps) {
  const filteredPrices = prices.filter((p) => p.symbol === symbol);
  const sortedPrices = [...filteredPrices].sort((a, b) => a.price - b.price);

  const minPrice = sortedPrices[0]?.price ?? 0;
  const maxPrice = sortedPrices[sortedPrices.length - 1]?.price ?? 0;
  const spread = minPrice > 0 ? ((maxPrice - minPrice) / minPrice) * 100 : 0;

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{symbol}</h3>
            <p className="text-xs text-muted-foreground">Cross-exchange comparison</p>
          </div>
        </div>
        <div
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium',
            spread >= 0.5 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
          )}
        >
          Spread: {spread.toFixed(3)}%
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground">Exchange</TableHead>
            <TableHead className="text-muted-foreground text-right">Price</TableHead>
            <TableHead className="text-muted-foreground text-right">24h Change</TableHead>
            <TableHead className="text-muted-foreground text-right">Last Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPrices.map((price, index) => {
            const isBest = index === 0;
            const isWorst = index === sortedPrices.length - 1;
            return (
              <TableRow
                key={`${price.exchange}-${price.symbol}`}
                className={cn(
                  'border-border/30 transition-colors',
                  isBest && 'bg-success/5',
                  isWorst && 'bg-destructive/5'
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
                        price.exchange === 'Binance' && 'bg-yellow-500/20 text-yellow-400',
                        price.exchange === 'Coinbase' && 'bg-blue-500/20 text-blue-400',
                        price.exchange === 'Kraken' && 'bg-purple-500/20 text-purple-400'
                      )}
                    >
                      {price.exchange[0]}
                    </div>
                    <span className="font-medium">{price.exchange}</span>
                    {isBest && (
                      <span className="text-xs bg-success/20 text-success px-1.5 py-0.5 rounded">
                        Best Buy
                      </span>
                    )}
                    {isWorst && sortedPrices.length > 1 && (
                      <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
                        Best Sell
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatPrice(price.price)}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={cn(
                      'inline-flex items-center gap-1',
                      price.change24h && price.change24h >= 0 ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {price.change24h && price.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="font-medium">{Math.abs(price.change24h ?? 0).toFixed(2)}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {new Date(price.timestamp).toLocaleTimeString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
