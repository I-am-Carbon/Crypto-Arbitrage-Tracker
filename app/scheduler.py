from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.price_service import price_service
from app.services.arbitrage_service import arbitrage_service
from app.routers.websocket import manager
from app.database import AsyncSessionLocal
from app.config import settings
from datetime import datetime
import asyncio

scheduler = AsyncIOScheduler()


async def fetch_and_broadcast():
    print("Job start:", datetime.utcnow().isoformat())
    try:
        prices = await price_service.fetch_all_prices(timeout=5.0)  # ensure fetch_all_prices has timeout

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

    except Exception as e:
        print(f"Error in fetch_and_broadcast: {e}")

    print("Job end:", datetime.utcnow().isoformat())


def start_scheduler():
    scheduler.add_job(
        fetch_and_broadcast,
        "interval",
        seconds=settings.FETCH_INTERVAL,
        id="price_fetcher",
        max_instances=3  # prevent skipped runs
    )
    scheduler.start()


def stop_scheduler():
    scheduler.shutdown()
