import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.compliance import AuditEvent

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


def compute_event_hash(
    previous_hash: str,
    timestamp: str,
    action: str,
    entity_type: str,
    entity_id: str,
    old_value: Optional[Dict],
    new_value: Optional[Dict],
    change_reason: Optional[str]
) -> str:
    """Computes SHA-256 cryptographic hash chaining this event with the prior block."""
    raw_payload = {
        "prev": previous_hash,
        "ts": timestamp,
        "act": action,
        "ent_type": entity_type,
        "ent_id": str(entity_id),
        "old": old_value,
        "new": new_value,
        "reason": change_reason
    }
    serialized = json.dumps(raw_payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


class AuditService:
    @staticmethod
    def record(
        db: Session,
        action: str,
        entity_type: str,
        entity_id: str,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        change_reason: Optional[str] = None,
        ip_address: Optional[str] = "127.0.0.1"
    ) -> AuditEvent:
        """Appends an immutable audit event with cryptographic SHA-256 hash chaining."""
        # Find the latest audit event to obtain previous_hash
        latest_event = db.query(AuditEvent).order_by(desc(AuditEvent.sequence_number)).first()
        prev_hash = latest_event.current_hash if latest_event else GENESIS_HASH

        now_utc = datetime.now(timezone.utc)
        curr_hash = compute_event_hash(
            previous_hash=prev_hash,
            timestamp=now_utc.isoformat(),
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            change_reason=change_reason
        )

        event = AuditEvent(
            timestamp=now_utc,
            user_id=user_id,
            user_role=user_role,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            old_value=old_value,
            new_value=new_value,
            change_reason=change_reason,
            ip_address=ip_address,
            previous_hash=prev_hash,
            current_hash=curr_hash
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def verify_integrity(db: Session) -> Tuple[bool, int, Optional[str]]:
        """
        Recalculates the entire cryptographic hash chain from Genesis.
        Returns: (is_valid: bool, total_events: int, failure_reason: Optional[str])
        """
        events = db.query(AuditEvent).order_by(AuditEvent.sequence_number.asc()).all()
        if not events:
            return True, 0, None

        expected_prev_hash = GENESIS_HASH

        for idx, event in enumerate(events):
            # Check 1: Previous hash must match prior block's current hash
            if event.previous_hash != expected_prev_hash:
                return False, len(events), f"Hash chain broken at event #{event.sequence_number} ({event.action}): Expected prev {expected_prev_hash[:10]}... got {event.previous_hash[:10]}..."

            # Check 2: Current hash must match recomputed hash
            recomputed = compute_event_hash(
                previous_hash=event.previous_hash,
                timestamp=event.timestamp.isoformat(),
                action=event.action,
                entity_type=event.entity_type,
                entity_id=event.entity_id,
                old_value=event.old_value,
                new_value=event.new_value,
                change_reason=event.change_reason
            )
            if recomputed != event.current_hash:
                return False, len(events), f"Data tampering detected at event #{event.sequence_number} ({event.action}): Payload signature does not match stored hash."

            expected_prev_hash = event.current_hash

        return True, len(events), None
