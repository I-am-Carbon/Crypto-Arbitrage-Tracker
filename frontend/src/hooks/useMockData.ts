import { useState, useEffect, useCallback } from 'react';
import { ExchangePrice, ArbitrageOpportunity } from '@/types/crypto';

const EXCHANGES = ['Binance', 'Coinbase', 'Kraken'];
const SYMBOLS = ['BTCUSDT', 'ETHUSDT'];

const BASE_PRICES: Record<string, number> = {
  BTCUSDT: 67500,
  ETHUSDT: 3450,
};

function generatePrice(symbol: string, exchange: string): number {
  const base = BASE_PRICES[symbol];
  const variance = base * 0.008;
  const exchangeOffset = exchange === 'Binance' ? 0 : exchange === 'Coinbase' ? 50 : -30;
  return base + (Math.random() - 0.5) * variance + exchangeOffset + (Math.random() - 0.5) * 100;
}

function generateChange24h(): number {
  return (Math.random() - 0.5) * 10;
}

export function useMockPrices() {
  const [prices, setPrices] = useState<ExchangePrice[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);

    const generatePrices = () => {
      const newPrices: ExchangePrice[] = [];
      EXCHANGES.forEach((exchange) => {
        SYMBOLS.forEach((symbol) => {
          newPrices.push({
            exchange,
            symbol,
            price: generatePrice(symbol, exchange),
            timestamp: new Date().toISOString(),
            change24h: generateChange24h(),
          });
        });
      });
      setPrices(newPrices);
    };

    generatePrices();
    const interval = setInterval(generatePrices, 1000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  return { prices, isConnected };
}

export function useMockArbitrage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);

    const checkArbitrage = () => {
      SYMBOLS.forEach((symbol) => {
        const prices = EXCHANGES.map((exchange) => ({
          exchange,
          price: generatePrice(symbol, exchange),
        }));

        const minPrice = Math.min(...prices.map((p) => p.price));
        const maxPrice = Math.max(...prices.map((p) => p.price));
        const spread = ((maxPrice - minPrice) / minPrice) * 100;

        if (spread >= 0.5 && Math.random() > 0.7) {
          const buyExchange = prices.find((p) => p.price === minPrice)!.exchange;
          const sellExchange = prices.find((p) => p.price === maxPrice)!.exchange;

          const opportunity: ArbitrageOpportunity = {
            id: `${Date.now()}-${symbol}`,
            symbol,
            buyExchange,
            sellExchange,
            buyPrice: minPrice,
            sellPrice: maxPrice,
            spreadPercent: spread,
            potentialProfit: (maxPrice - minPrice) * 0.1,
            timestamp: new Date().toISOString(),
          };

          setOpportunities((prev) => [opportunity, ...prev].slice(0, 50));
        }
      });
    };

    const interval = setInterval(checkArbitrage, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  return { opportunities, isConnected };
}

export function useMockHistory() {
  const [priceHistory, setPriceHistory] = useState<ExchangePrice[]>([]);
  const [arbitrageHistory, setArbitrageHistory] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateHistory = () => {
      const prices: ExchangePrice[] = [];
      const arbitrage: ArbitrageOpportunity[] = [];

      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(Date.now() - i * 60000).toISOString();
        EXCHANGES.forEach((exchange) => {
          SYMBOLS.forEach((symbol) => {
            prices.push({
              exchange,
              symbol,
              price: generatePrice(symbol, exchange),
              timestamp,
              change24h: generateChange24h(),
            });
          });
        });

        if (i % 5 === 0) {
          const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          arbitrage.push({
            id: `hist-${i}`,
            symbol,
            buyExchange: EXCHANGES[0],
            sellExchange: EXCHANGES[1],
            buyPrice: BASE_PRICES[symbol] - 100,
            sellPrice: BASE_PRICES[symbol] + 100,
            spreadPercent: 0.5 + Math.random() * 1.5,
            potentialProfit: 10 + Math.random() * 50,
            timestamp,
          });
        }
      }

      setPriceHistory(prices);
      setArbitrageHistory(arbitrage);
      setIsLoading(false);
    };

    generateHistory();
  }, []);

  return { priceHistory, arbitrageHistory, isLoading };
}
