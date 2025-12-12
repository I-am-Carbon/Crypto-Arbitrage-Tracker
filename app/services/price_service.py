from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models import PriceRecord
from app.schemas import PriceCreate
from app.fetchers import BinanceFetcher, CoinbaseFetcher, KrakenFetcher


class PriceService:
    def __init__(self):
        self.fetchers = [
            BinanceFetcher(),
            CoinbaseFetcher(),
            KrakenFetcher()
        ]
        self.symbols = ["BTCUSDT", "ETHUSDT"]

    async def fetch_all_prices(self) -> List[Dict]:
        prices = []
        for fetcher in self.fetchers:
            for symbol in self.symbols:
                price = await fetcher.fetch_price(symbol)
                if price:
                    prices.append({
                        "exchange": fetcher.exchange_name,
                        "symbol": symbol,
                        "price": price
                    })
        return prices

    async def save_prices(self, db: AsyncSession, prices: List[Dict]):
        for price_data in prices:
            record = PriceRecord(**price_data)
            db.add(record)
        await db.commit()

    async def get_history(self, db: AsyncSession, limit: int = 100) -> List[PriceRecord]:
        result = await db.execute(
            select(PriceRecord)
            .order_by(desc(PriceRecord.timestamp))
            .limit(limit)
        )
        return result.scalars().all()

    async def close(self):
        for fetcher in self.fetchers:
            await fetcher.close()


price_service = PriceService()