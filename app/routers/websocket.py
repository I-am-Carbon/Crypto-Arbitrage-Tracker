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