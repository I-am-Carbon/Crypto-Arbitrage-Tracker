from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base


class PriceRecord(Base):
    __tablename__ = "price_records"

    id = Column(Integer, primary_key=True, index=True)
    exchange = Column(String, index=True)
    symbol = Column(String, index=True)
    price = Column(Float)
    timestamp = Column(DateTime, default=func.now())


class ArbitrageEvent(Base):
    __tablename__ = "arbitrage_events"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    buy_exchange = Column(String)
    sell_exchange = Column(String)
    buy_price = Column(Float)
    sell_price = Column(Float)
    spread_percent = Column(Float)
    potential_profit = Column(Float)
    timestamp = Column(DateTime, default=func.now())