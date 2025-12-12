from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import prices, arbitrage, websocket
from app.scheduler import start_scheduler, stop_scheduler
from app.services.price_service import price_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()            # initialize DB tables
    start_scheduler()          # start background price fetcher
    yield
    stop_scheduler()           # stop scheduler on shutdown
    await price_service.close()  # close aiohttp client session


app = FastAPI(
    title="CryptoArb API",
    description="Real-time crypto arbitrage monitoring API",
    version="1.0.0",
    lifespan=lifespan,
)


# Enable CORS for frontend (React, Lovable, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(prices.router)
app.include_router(arbitrage.router)
app.include_router(websocket.router)


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
