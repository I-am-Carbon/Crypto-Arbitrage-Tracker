# Python FastAPI Backend for CryptoArb

Complete production-ready backend code. Run this separately from the React frontend.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── fetchers/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── binance.py
│   │   ├── coinbase.py
│   │   └── kraken.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── price_service.py
│   │   └── arbitrage_service.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── prices.py
│   │   ├── arbitrage.py
│   │   └── websocket.py
│   └── scheduler.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## requirements.txt

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
aiosqlite==0.19.0
httpx==0.26.0
apscheduler==3.10.4
python-dotenv==1.0.0
pydantic==2.5.3
websockets==12.0
```

## app/__init__.py

```python
```

## app/config.py

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./crypto_arb.db"
    ARBITRAGE_THRESHOLD: float = 0.5
    FETCH_INTERVAL: int = 1
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## app/database.py

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

## app/models.py

```python
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
```

## app/schemas.py

```python
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
```

## app/fetchers/__init__.py

```python
from app.fetchers.binance import BinanceFetcher
from app.fetchers.coinbase import CoinbaseFetcher
from app.fetchers.kraken import KrakenFetcher

__all__ = ["BinanceFetcher", "CoinbaseFetcher", "KrakenFetcher"]
```

## app/fetchers/base.py

```python
from abc import ABC, abstractmethod
from typing import Optional
import httpx

class BaseFetcher(ABC):
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)
    
    @property
    @abstractmethod
    def exchange_name(self) -> str:
        pass
    
    @abstractmethod
    async def fetch_price(self, symbol: str) -> Optional[float]:
        pass
    
    async def close(self):
        await self.client.aclose()
```

## app/fetchers/binance.py

```python
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
```

## app/fetchers/coinbase.py

```python
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
```

## app/fetchers/kraken.py

```python
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
```

## app/services/__init__.py

```python
```

## app/services/price_service.py

```python
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
```

## app/services/arbitrage_service.py

```python
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
```

## app/routers/__init__.py

```python
```

## app/routers/prices.py

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas import Price
from app.services.price_service import price_service

router = APIRouter(prefix="/prices", tags=["prices"])

@router.get("/history", response_model=List[Price])
async def get_price_history(
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    records = await price_service.get_history(db, limit)
    return records
```

## app/routers/arbitrage.py

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas import Arbitrage
from app.services.arbitrage_service import arbitrage_service

router = APIRouter(prefix="/arbitrage", tags=["arbitrage"])

@router.get("/history", response_model=List[Arbitrage])
async def get_arbitrage_history(
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    records = await arbitrage_service.get_history(db, limit)
    return records
```

## app/routers/websocket.py

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Set
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.price_connections: Set[WebSocket] = set()
        self.arbitrage_connections: Set[WebSocket] = set()
    
    async def connect_prices(self, websocket: WebSocket):
        await websocket.accept()
        self.price_connections.add(websocket)
    
    async def connect_arbitrage(self, websocket: WebSocket):
        await websocket.accept()
        self.arbitrage_connections.add(websocket)
    
    def disconnect_prices(self, websocket: WebSocket):
        self.price_connections.discard(websocket)
    
    def disconnect_arbitrage(self, websocket: WebSocket):
        self.arbitrage_connections.discard(websocket)
    
    async def broadcast_prices(self, data: dict):
        disconnected = set()
        for connection in self.price_connections:
            try:
                await connection.send_json(data)
            except:
                disconnected.add(connection)
        self.price_connections -= disconnected
    
    async def broadcast_arbitrage(self, data: dict):
        disconnected = set()
        for connection in self.arbitrage_connections:
            try:
                await connection.send_json(data)
            except:
                disconnected.add(connection)
        self.arbitrage_connections -= disconnected

manager = ConnectionManager()

@router.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await manager.connect_prices(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_prices(websocket)

@router.websocket("/ws/arbitrage")
async def websocket_arbitrage(websocket: WebSocket):
    await manager.connect_arbitrage(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_arbitrage(websocket)
```

## app/scheduler.py

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.price_service import price_service
from app.services.arbitrage_service import arbitrage_service
from app.routers.websocket import manager
from app.database import AsyncSessionLocal
from app.config import settings
from datetime import datetime

scheduler = AsyncIOScheduler()

async def fetch_and_broadcast():
    prices = await price_service.fetch_all_prices()
    
    if prices:
        async with AsyncSessionLocal() as db:
            await price_service.save_prices(db, prices)
        
        await manager.broadcast_prices({
            "type": "price_update",
            "data": prices,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        opportunities = arbitrage_service.detect_opportunities(prices)
        
        if opportunities:
            async with AsyncSessionLocal() as db:
                await arbitrage_service.save_opportunities(db, opportunities)
            
            await manager.broadcast_arbitrage({
                "type": "arbitrage_signal",
                "data": opportunities,
                "timestamp": datetime.utcnow().isoformat()
            })

def start_scheduler():
    scheduler.add_job(
        fetch_and_broadcast,
        "interval",
        seconds=settings.FETCH_INTERVAL,
        id="price_fetcher"
    )
    scheduler.start()

def stop_scheduler():
    scheduler.shutdown()
```

## app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.routers import prices, arbitrage, websocket
from app.scheduler import start_scheduler, stop_scheduler
from app.services.price_service import price_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    start_scheduler()
    yield
    stop_scheduler()
    await price_service.close()

app = FastAPI(
    title="CryptoArb API",
    description="Real-time crypto arbitrage monitoring API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prices.router)
app.include_router(arbitrage.router)
app.include_router(websocket.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - sqlite_data:/app/data
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/crypto_arb.db
      - ARBITRAGE_THRESHOLD=0.5
      - FETCH_INTERVAL=1
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:8000
      - VITE_WS_URL=ws://backend:8000
    restart: unless-stopped

volumes:
  sqlite_data:
```

## Running the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /health` - Health check
- `GET /prices/history?limit=100` - Get price history
- `GET /arbitrage/history?limit=100` - Get arbitrage history
- `WS /ws/prices` - Real-time price updates
- `WS /ws/arbitrage` - Real-time arbitrage signals

## Connecting Frontend to Backend

Update `src/hooks/useWebSocket.ts` to connect to your backend:

```typescript
const WS_PRICES_URL = 'ws://localhost:8000/ws/prices';
const WS_ARBITRAGE_URL = 'ws://localhost:8000/ws/arbitrage';
```

Create API hooks to fetch history:

```typescript
const API_URL = 'http://localhost:8000';

export async function fetchPriceHistory() {
  const response = await fetch(`${API_URL}/prices/history`);
  return response.json();
}

export async function fetchArbitrageHistory() {
  const response = await fetch(`${API_URL}/arbitrage/history`);
  return response.json();
}
```
