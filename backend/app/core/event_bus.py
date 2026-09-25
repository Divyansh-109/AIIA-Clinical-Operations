import logging
from typing import Callable, Dict, List, Any
from datetime import datetime, timezone
import uuid

logger = logging.getLogger("aiia_event_bus")


class Event:
    """Strongly-typed domain event."""
    def __init__(self, event_type: str, payload: Dict[str, Any], user_id: str = None, user_role: str = None):
        self.event_id = str(uuid.uuid4())
        self.event_type = event_type
        self.payload = payload
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.user_id = user_id
        self.user_role = user_role

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "payload": self.payload,
            "timestamp": self.timestamp,
            "user_id": self.user_id,
            "user_role": self.user_role,
        }


class EventBus:
    """Central asynchronous Event Bus managing domain events across modules."""
    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[Event], Any]]] = {}

    def subscribe(self, event_type: str, handler: Callable[[Event], Any]):
        """Registers an asynchronous or synchronous event listener."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        logger.info(f"Registered subscriber for event: {event_type} -> {handler.__name__}")

    def publish(self, event: Event):
        """Dispatches an event to all registered domain subscribers."""
        logger.info(f"Publishing domain event: {event.event_type} [{event.event_id}]")
        handlers = self._subscribers.get(event.event_type, [])
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(f"Error executing handler {handler.__name__} for event {event.event_type}: {e}", exc_info=True)


# Global singleton instance
event_bus = EventBus()
