import { useState, useEffect, useRef, useCallback } from 'react';
import { ExchangePrice, ArbitrageOpportunity } from '@/types/crypto';

const API_BASE_URL = 'https://blossom-spinachlike-preston.ngrok-free.dev';
const WS_BASE_URL = 'wss://blossom-spinachlike-preston.ngrok-free.dev';

export function useRealPrices() {
  const [prices, setPrices] = useState<ExchangePrice[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Get only the latest price for each exchange/symbol pair
  const getLatestPrices = (data: ExchangePrice[]): ExchangePrice[] => {
    const latestMap = new Map<string, ExchangePrice>();
    for (const price of data) {
      const key = `${price.exchange}-${price.symbol}`;
      const existing = latestMap.get(key);
      if (!existing || new Date(price.timestamp) > new Date(existing.timestamp)) {
        latestMap.set(key, price);
      }
    }
    return Array.from(latestMap.values());
  };

  // Fetch current prices via REST API
  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prices/history`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (response.ok) {
        const data = await response.json();
        const pricesData = Array.isArray(data) ? data : data.prices || [];
        if (pricesData.length > 0) {
          const latestPrices = getLatestPrices(pricesData);
          setPrices(latestPrices);
        }
      }
    } catch (e) {
      console.error('Failed to fetch prices:', e);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPrices();
    
    // Keep polling running as primary data source (every 1 second)
    pollingRef.current = setInterval(fetchPrices, 1000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchPrices]);

  return { prices, isConnected };
}

export function useRealArbitrage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/arbitrage`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.opportunity) {
            setOpportunities((prev) => [data.opportunity, ...prev].slice(0, 50));
          } else if (Array.isArray(data)) {
            setOpportunities(data);
          }
        } catch (e) {
          console.error('Failed to parse arbitrage:', e);
        }
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { opportunities, isConnected };
}

export function useRealHistory() {
  const [priceHistory, setPriceHistory] = useState<ExchangePrice[]>([]);
  const [arbitrageHistory, setArbitrageHistory] = useState<ArbitrageOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [pricesRes, arbRes] = await Promise.all([
          fetch(`${API_BASE_URL}/prices/history`, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }),
          fetch(`${API_BASE_URL}/arbitrage/history`, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
          }),
        ]);

        if (pricesRes.ok) {
          const pricesData = await pricesRes.json();
          setPriceHistory(Array.isArray(pricesData) ? pricesData : pricesData.prices || []);
        }

        if (arbRes.ok) {
          const arbData = await arbRes.json();
          setArbitrageHistory(Array.isArray(arbData) ? arbData : arbData.opportunities || []);
        }
      } catch (e) {
        console.error('Failed to fetch history:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return { priceHistory, arbitrageHistory, isLoading };
}
