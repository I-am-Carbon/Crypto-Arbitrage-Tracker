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