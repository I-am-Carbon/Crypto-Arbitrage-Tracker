from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models import ArbitrageEvent
from app.config import settings
from datetime import datetime
import uuid


class ArbitrageService:
    def detect_opportunities(self, prices: List[Dict]) -> List[Dict]:
        opportunities = []
        symbols = set(p["symbol"] for p in prices)

        for symbol in symbols:
            symbol_prices = [p for p in prices if p["symbol"] == symbol]
            if len(symbol_prices) < 2:
                continue

            min_price = min(symbol_prices, key=lambda x: x["price"])
            max_price = max(symbol_prices, key=lambda x: x["price"])

            spread = ((max_price["price"] - min_price["price"]) / min_price["price"]) * 100

            if spread >= settings.ARBITRAGE_THRESHOLD:
                opportunities.append({
                    "id": str(uuid.uuid4()),
                    "symbol": symbol,
                    "buy_exchange": min_price["exchange"],
                    "sell_exchange": max_price["exchange"],
                    "buy_price": min_price["price"],
                    "sell_price": max_price["price"],
                    "spread_percent": spread,
                    "potential_profit": (max_price["price"] - min_price["price"]) * 0.1,
                    "timestamp": datetime.utcnow().isoformat()
                })

        return opportunities

    async def save_opportunities(self, db: AsyncSession, opportunities: List[Dict]):
        for opp in opportunities:
            record = ArbitrageEvent(
                symbol=opp["symbol"],
                buy_exchange=opp["buy_exchange"],
                sell_exchange=opp["sell_exchange"],
                buy_price=opp["buy_price"],
                sell_price=opp["sell_price"],
                spread_percent=opp["spread_percent"],
                potential_profit=opp["potential_profit"]
            )
            db.add(record)
        await db.commit()

    async def get_history(self, db: AsyncSession, limit: int = 100) -> List[ArbitrageEvent]:
        result = await db.execute(
            select(ArbitrageEvent)
            .order_by(desc(ArbitrageEvent.timestamp))
            .limit(limit)
        )
        return result.scalars().all()


arbitrage_service = ArbitrageService()