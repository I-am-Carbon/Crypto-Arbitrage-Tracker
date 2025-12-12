from typing import Optional
from app.fetchers.base import BaseFetcher


class KrakenFetcher(BaseFetcher):
    BASE_URL = "https://api.kraken.com/0/public"

    SYMBOL_MAP = {
        "BTCUSDT": "XBTUSDT",
        "ETHUSDT": "ETHUSDT"
    }

    @property
    def exchange_name(self) -> str:
        return "Kraken"

    async def fetch_price(self, symbol: str) -> Optional[float]:
        try:
            kraken_symbol = self.SYMBOL_MAP.get(symbol, symbol)
            response = await self.client.get(
                f"{self.BASE_URL}/Ticker",
                params={"pair": kraken_symbol}
            )
            if response.status_code == 200:
                data = response.json()
                if "result" in data and data["result"]:
                    pair_data = list(data["result"].values())[0]
                    return float(pair_data["c"][0])
        except Exception:
            pass
        return None