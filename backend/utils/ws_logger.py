import asyncio
import logging
from typing import List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketLogger:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # Create an event loop explicitly for the background thread if needed
        try:
            self.loop = asyncio.get_running_loop()
        except RuntimeError:
            self.loop = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total: {len(self.active_connections)}")

    async def broadcast_async(self, message: str):
        """Send a message to all connected clients."""
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Failed to send WS message: {e}")
                dead_connections.append(connection)
        
        # Cleanup dead connections
        for dead in dead_connections:
            self.disconnect(dead)

    def broadcast_sync(self, message: str):
        """
        Synchronous wrapper to broadcast messages from blocking functions (like scrapers).
        It schedules the coroutine on the main event loop.
        """
        try:
            # Try to get the running loop (works if called from async def)
            loop = asyncio.get_running_loop()
            loop.create_task(self.broadcast_async(message))
        except RuntimeError:
            # If called from a separate thread (e.g. ThreadPoolExecutor or BackgroundTasks),
            # we need to submit it to a known running loop, or use asyncio.run if isolated.
            if self.loop and self.loop.is_running():
                asyncio.run_coroutine_threadsafe(self.broadcast_async(message), self.loop)
            else:
                # Fallback: create a new loop just for this message
                asyncio.run(self.broadcast_async(message))


# Create a global instance
ws_manager = WebSocketLogger()

def send_log(message: str):
    """Global helper function to cleanly broadcast a log message to the frontend terminal."""
    print(f"[WS LOG] {message}") # Still print to console for debugging
    ws_manager.broadcast_sync(message)
