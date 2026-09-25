# Event-Driven Architecture & Event Specification
## AIIA Clinical Research Intelligence, Compliance & Trial Management Platform

---

## 1. Event Model Philosophy

Every consequential operational action generates an immutable, strongly-typed domain event. The event contains:
- `event_id`: Unique UUIDv4
- `event_type`: Standardized event string
- `timestamp`: UTC ISO 8601 timestamp
- `actor`: User UUID and active role
- `study_id` & `site_id`: Operational scope
- `payload`: Domain-specific mutation data

Events are dispatched through the **AIIA Event Bus** (in-memory async worker pool in development, backed by Redis in production).

---

## 2. Core Domain Event Schemas

### 2.1 `StudyLifecycleChanged`
- **Trigger**: Study advances to next state machine status (e.g. `ETHICS_APPROVED` $\to$ `CTRI_REGISTERED`).
- **Payload**:
  ```json
  {
    "study_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "previous_status": "ETHICS_APPROVED",
    "new_status": "CTRI_REGISTERED",
    "reason": "CTRI acknowledgment number received",
    "changed_by": "e5b87c4a-4a21-4f1e-9274-123456789abc"
  }
  ```
- **Downstream Actions**:
  - `AuditEventService.record_event()`
  - `NotificationService.notify_study_team()`
  - `KPIService.recalculate_study_status()`

### 2.2 `ParticipantEnrolled`
- **Trigger**: Consent verified and enrollment confirmed (Study Day 0).
- **Payload**:
  ```json
  {
    "participant_id": "a1b2c3d4-0001-4000-8000-111122223333",
    "participant_code": "AIIA-PCOS-001-S01-P0042",
    "study_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "site_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "enrollment_date": "2026-09-23"
  }
  ```
- **Downstream Actions**:
  - `KPIService.update_recruitment_metrics(study_id, site_id)`
  - `TrialRiskEngine.evaluate_recruitment_risk(study_id)`
  - `ScheduleService.generate_visit_schedule(participant_id)`
  - `AuditEventService.record_event()`

### 2.3 `VisitCompleted`
- **Trigger**: Study Coordinator submits visit data and assessments.
- **Payload**:
  ```json
  {
    "visit_id": "c1d2e3f4-0002-4000-8000-444455556666",
    "participant_id": "a1b2c3d4-0001-4000-8000-111122223333",
    "protocol_visit_id": "d1e2f3a4-0003-4000-8000-777788889999",
    "scheduled_date": "2026-10-21",
    "actual_date": "2026-10-25",
    "study_day": 33,
    "assessments_recorded": ["SYSBP", "DIABP", "PULSE"]
  }
  ```
- **Downstream Actions**:
  - `ProtocolGuardian.validate_visit_window(visit_id)`: Detects if Day 33 is within Day $28 \pm 3$ window $\implies$ flags `OUT_OF_WINDOW`.
  - `ProtocolGuardian.validate_required_assessments(visit_id)`: Checks for missing lab panels.
  - `DataQualityEngine.validate_vital_ranges(visit_id)`
  - `TrialTrustEngine.inspect_measurement_patterns(site_id)`
  - `KPIService.update_compliance_kpis(study_id)`
  - `AuditEventService.record_event()`

### 2.4 `ProtocolDeviationDetected`
- **Trigger**: Protocol Guardian or Monitor detects protocol non-adherence.
- **Payload**:
  ```json
  {
    "deviation_id": "e1f2a3b4-0004-4000-8000-000011112222",
    "study_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "site_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "participant_id": "a1b2c3d4-0001-4000-8000-111122223333",
    "deviation_type": "OUT_OF_WINDOW_VISIT",
    "severity": "MAJOR",
    "details": "Visit V2 attended on Day 33; allowed protocol window Day 25-31"
  }
  ```
- **Downstream Actions**:
  - `KPIService.increment_deviation_count(study_id, site_id)`
  - `TrialRiskEngine.recompute_deviation_risk(study_id)`
  - `AlertEngine.evaluate_thresholds(site_id)`
  - `AuditEventService.record_event()`

### 2.5 `AdverseEventLogged`
- **Trigger**: Coordinator or Investigator captures an adverse event.
- **Payload**:
  ```json
  {
    "ae_id": "a9b8c7d6-0005-4000-8000-333344445555",
    "study_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "site_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "participant_id": "a1b2c3d4-0001-4000-8000-111122223333",
    "event_term": "Severe Abdominal Pain",
    "severity": "SEVERE",
    "is_serious": true,
    "suspected_drug": "Ayush-PCOS Herbal Formulation"
  }
  ```
- **Downstream Actions**:
  - If `is_serious == true`: Spawn `SeriousAdverseEvent` and dispatch `SAEEscalated` event.
  - `SafetySignalEngine.evaluate_signal(study_id, event_term)`
  - `KPIService.update_safety_kpis(study_id)`
  - `AuditEventService.record_event()`

### 2.6 `SAEEscalated`
- **Trigger**: Serious Adverse Event confirmed.
- **Payload**:
  ```json
  {
    "sae_id": "b8c7d6e5-0006-4000-8000-666677778888",
    "ae_id": "a9b8c7d6-0005-4000-8000-333344445555",
    "study_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "reported_at": "2026-09-23T14:45:00Z",
    "initial_deadline_24h": "2026-09-24T14:45:00Z",
    "detailed_deadline_7d": "2026-09-30T14:45:00Z"
  }
  ```
- **Downstream Actions**:
  - `SAEDeadlineEngine.register_deadline_timer(sae_id)`
  - `AlertEngine.create_urgent_alert("CRITICAL", "SAE Reported - 24h Regulatory Deadline Active")`
  - `NotificationService.notify_roles(["PHARMACOVIGILANCE", "PI", "LEADERSHIP"])`
  - `TrialRiskEngine.elevate_safety_risk(study_id)`
  - `AuditEventService.record_event()`
