from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PriceBase(BaseModel):
    exchange: str
    symbol: str
    price: float


class PriceCreate(PriceBase):
    pass


class Price(PriceBase):
    id: int
    timestamp: datetime
    change24h: Optional[float] = None

    class Config:
        from_attributes = True


class ArbitrageBase(BaseModel):
    symbol: str
    buy_exchange: str
    sell_exchange: str
    buy_price: float
    sell_price: float
    spread_percent: float
    potential_profit: float


class ArbitrageCreate(ArbitrageBase):
    pass


class Arbitrage(ArbitrageBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class WebSocketMessage(BaseModel):
    type: str
    data: dict