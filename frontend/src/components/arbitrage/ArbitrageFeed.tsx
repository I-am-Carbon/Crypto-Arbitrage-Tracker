import { ArbitrageOpportunity } from '@/types/crypto';
import { ArbitrageCard } from './ArbitrageCard';
import { Zap, Bell } from 'lucide-react';

interface ArbitrageFeedProps {
  opportunities: ArbitrageOpportunity[];
}

export function ArbitrageFeed({ opportunities }: ArbitrageFeedProps) {
  if (opportunities.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Scanning for opportunities...</h3>
        <p className="text-sm text-muted-foreground">
          Arbitrage signals will appear here when price differences ≥ 0.5% are detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <span className="font-semibold">{opportunities.length} Opportunities Detected</span>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin pr-2">
        {opportunities.map((opp, index) => (
          <ArbitrageCard key={opp.id} opportunity={opp} isNew={index === 0} />
        ))}
      </div>
    </div>
  );
}
