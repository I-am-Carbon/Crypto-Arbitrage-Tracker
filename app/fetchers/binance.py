from typing import Optional
from app.fetchers.base import BaseFetcher


class BinanceFetcher(BaseFetcher):
    BASE_URL = "https://api.binance.com/api/v3"

    @property
    def exchange_name(self) -> str:
        return "Binance"

    async def fetch_price(self, symbol: str) -> Optional[float]:
        try:
            response = await self.client.get(
                f"{self.BASE_URL}/ticker/price",
                params={"symbol": symbol}
            )
            if response.status_code == 200:
                data = response.json()
                return float(data["price"])
        except Exception:
            pass
        return None