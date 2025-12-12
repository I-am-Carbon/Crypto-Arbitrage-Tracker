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