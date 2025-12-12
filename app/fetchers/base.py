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