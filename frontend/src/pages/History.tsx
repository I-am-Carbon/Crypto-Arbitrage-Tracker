import { useRealHistory } from '@/hooks/useRealData';
import { PriceChart } from '@/components/charts/PriceChart';
import { StatsCard } from '@/components/stats/StatsCard';
import { ArbitrageCard } from '@/components/arbitrage/ArbitrageCard';
import { History as HistoryIcon, TrendingUp, Database, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function History() {
  const { priceHistory, arbitrageHistory, isLoading } = useRealHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading historical data...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-muted-foreground">Historical price and arbitrage data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Price Records"
          value={priceHistory.length.toLocaleString()}
          subtitle="Stored in database"
          icon={<Database className="h-5 w-5" />}
        />
        <StatsCard
          title="Arbitrage Events"
          value={arbitrageHistory.length}
          subtitle="Detected opportunities"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <StatsCard
          title="Exchanges Tracked"
          value="3"
          subtitle="Binance, Coinbase, Kraken"
          icon={<HistoryIcon className="h-5 w-5" />}
        />
        <StatsCard
          title="Update Frequency"
          value="1s"
          subtitle="Real-time updates"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceChart data={priceHistory} symbol="BTCUSDT" />
        <PriceChart data={priceHistory} symbol="ETHUSDT" />
      </div>

      <Tabs defaultValue="arbitrage" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="arbitrage">Arbitrage History</TabsTrigger>
          <TabsTrigger value="prices">Price History</TabsTrigger>
        </TabsList>

        <TabsContent value="arbitrage" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Recent Arbitrage Opportunities</h3>
              <p className="text-sm text-muted-foreground">Last 20 detected signals</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
              {arbitrageHistory.slice(0, 20).map((opp) => (
                <ArbitrageCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prices" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold">Price History</h3>
              <p className="text-sm text-muted-foreground">Recent price records from all exchanges</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.slice(0, 50).map((price, index) => (
                    <TableRow key={`${price.exchange}-${price.symbol}-${index}`} className="border-border/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(price.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{price.exchange}</TableCell>
                      <TableCell>{price.symbol}</TableCell>
                      <TableCell className="text-right font-mono">{formatPrice(price.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
