export interface ExchangePrice {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: string;
  change24h?: number;
}

export interface ArbitrageOpportunity {
  id: string;
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercent: number;
  potentialProfit: number;
  timestamp: string;
}

export interface PriceHistory {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'price_update' | 'arbitrage_signal' | 'connection' | 'error';
  data: ExchangePrice | ArbitrageOpportunity | string;
}

export type Exchange = 'binance' | 'coinbase' | 'kraken';
export type Symbol = 'BTCUSDT' | 'ETHUSDT';
