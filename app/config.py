from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./crypto_arb.db"
    ARBITRAGE_THRESHOLD: float = 0.5
    FETCH_INTERVAL: int = 1

    class Config:
        env_file = ".env"


settings = Settings()