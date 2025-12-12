from typing import Optional
from app.fetchers.base import BaseFetcher


class CoinbaseFetcher(BaseFetcher):
    BASE_URL = "https://api.coinbase.com/v2"

    SYMBOL_MAP = {
        "BTCUSDT": "BTC-USD",
        "ETHUSDT": "ETH-USD"
    }

    @property
    def exchange_name(self) -> str:
        return "Coinbase"

    async def fetch_price(self, symbol: str) -> Optional[float]:
        try:
            coinbase_symbol = self.SYMBOL_MAP.get(symbol, symbol)
            response = await self.client.get(
                f"{self.BASE_URL}/prices/{coinbase_symbol}/spot"
            )
            if response.status_code == 200:
                data = response.json()
                return float(data["data"]["amount"])
        except Exception:
            pass
        return None