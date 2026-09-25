# RESTful API Specification
## AIIA Clinical Research Intelligence, Compliance & Trial Management Platform

---

## 1. Global Standards & Conventions
- Base Path: `/api/v1`
- Authentication: Bearer JWT in `Authorization` header (`Authorization: Bearer <token>`).
- Format: JSON request/response with ISO 8601 UTC dates (`YYYY-MM-DDTHH:MM:SSZ`).
- Error Handling: Standardized error format:
  ```json
  {
    "detail": {
      "error_code": "RESOURCE_NOT_FOUND",
      "message": "Participant with code AIIA-PCOS-001-S01-P0099 not found",
      "timestamp": "2026-09-23T14:45:00Z"
    }
  }
  ```

---

## 2. API Domain Routes

### 2.1 Identity & Access
- `POST /api/v1/auth/login`: Authenticate and receive access token + user role profile.
- `GET  /api/v1/auth/me`: Get current authenticated user profile & permissions.
- `POST /api/v1/auth/switch-role`: Instant switch between allowed test roles for SIH evaluators.
- `GET  /api/v1/users`: List users (Admin only).
- `POST /api/v1/users`: Create user & assign role (Admin only).

### 2.2 Studies & Protocols
- `GET  /api/v1/studies`: List studies (Scoped by user role: aggregate for Leadership, assigned for PI/Coord).
- `POST /api/v1/studies`: Create study.
- `GET  /api/v1/studies/{id}`: Detailed study view including lifecycle state, site breakdown, and key metrics.
- `PUT  /api/v1/studies/{id}/lifecycle`: Advance study state machine (`previous_status` $\to$ `new_status` + reason).
- `GET  /api/v1/studies/{id}/protocols`: Get protocol versions.
- `POST /api/v1/studies/{id}/protocols`: Submit new protocol version (triggers Amendment Impact Analyzer).
- `GET  /api/v1/protocols/{id}/rules`: Retrieve structured Protocol Guardian visit rules & windows.

### 2.3 Sites & Investigators
- `GET  /api/v1/studies/{id}/sites`: List clinical trial sites for study.
- `POST /api/v1/studies/{id}/sites`: Add new site to study.
- `GET  /api/v1/sites/{id}`: Site performance details, enrollment pace, query burden, and deviation rate.

### 2.4 Participants & Operations
- `GET  /api/v1/studies/{id}/participants`: List participants (de-identified codes).
- `POST /api/v1/studies/{id}/participants/screen`: Record participant screening & eligibility evaluation.
- `POST /api/v1/participants/{id}/enroll`: Confirm consent and record official enrollment (Day 0).
- `POST /api/v1/participants/{id}/randomize`: Allocate participant to blinded/unblinded treatment arm.
- `GET  /api/v1/participants/{id}/visits`: Get complete visit schedule with protocol compliance statuses.
- `POST /api/v1/visits/{id}/complete`: Record actual visit attendance, clinical vitals, and lab results (triggers Protocol Guardian validation).

### 2.5 Protocol Deviations & Data Quality
- `GET  /api/v1/studies/{id}/deviations`: List protocol deviations with filter by severity (`MINOR`, `MAJOR`, `CRITICAL`).
- `PUT  /api/v1/deviations/{id}/signoff`: PI / Monitor review & sign-off on deviation.
- `GET  /api/v1/studies/{id}/queries`: List data discrepancy queries with aging metrics.
- `POST /api/v1/queries`: Create manual or automated data query.
- `PUT  /api/v1/queries/{id}/respond`: Study coordinator submits resolution response.
- `PUT  /api/v1/queries/{id}/close`: Monitor / PI verifies resolution and closes query.

### 2.6 Pharmacovigilance & Safety
- `GET  /api/v1/studies/{id}/adverse-events`: List reported Adverse Events.
- `POST /api/v1/adverse-events`: Report new AE (evaluates seriousness; triggers SAE workflow if criteria met).
- `GET  /api/v1/sae`: List Serious Adverse Events with active countdown timers.
- `GET  /api/v1/sae/{id}/deadlines`: Get remaining hours/minutes for 24h initial & 7d detailed reports.
- `GET  /api/v1/safety/signals`: List detected safety signals with statistical disproportionality metrics and priority score.
- `GET  /api/v1/safety/terminology/search`: Mock MedDRA/WHODrug abstraction search endpoint.

### 2.7 Intelligence, Risk & Trial Trust
- `GET  /api/v1/kpis/portfolio`: High-level aggregate KPIs for Leadership.
- `GET  /api/v1/kpis/study/{id}`: Detailed study KPIs (recruitment curve, deviation rate, query turnaround).
- `GET  /api/v1/alerts`: List active alerts sorted by severity with correlation grouping.
- `GET  /api/v1/risk/study/{id}`: Multi-factor explainable trial risk with contributing breakdown.
- `GET  /api/v1/trial-trust/study/{id}`: Trial Trust Engine findings, identical measurement flags, and evidence graph data.
- `POST /api/v1/simulation/run`: Execute What-If trial simulation given adjusted parameters (added sites, revised enrollment rates).

### 2.8 Compliance & Tamper-Evident Audit
- `GET  /api/v1/audit/events`: Searchable audit history with old/new values, timestamps, and hash pointers.
- `POST /api/v1/audit/verify-integrity`: Recalculates the SHA-256 hash chain from genesis and reports cryptographic validity (`VERIFIED` or flags corrupt block).
- `GET  /api/v1/compliance/alcoa`: Returns ALCOA+ compliance mapping matrix with evidence links.
- `GET  /api/v1/compliance/ctri/{study_id}`: CTRI registration status and update countdown.
- `GET  /api/v1/compliance/ethics/{study_id}`: Ethics submission records and renewal dates.

### 2.9 Interoperability & Exports
- `GET  /api/v1/fhir/Patient/{id}`: Standard FHIR R4 Patient resource.
- `GET  /api/v1/fhir/Observation/{id}`: Standard FHIR R4 Observation resource.
- `GET  /api/v1/fhir/AdverseEvent/{id}`: Standard FHIR R4 AdverseEvent resource.
- `GET  /api/v1/fhir/Consent/{id}`: Standard FHIR R4 Consent resource.
- `GET  /api/v1/fhir/ResearchStudy/{id}`: Standard FHIR R4 ResearchStudy resource.
- `POST /api/v1/cdisc/export/{study_id}`: Generate CDISC SDTM domain datasets (`DM`, `VS`, `AE`, `CM`, `EX`) in CSV/ZIP.
- `GET  /api/v1/cdisc/define-xml/{study_id}`: Generate machine-readable Define-XML metadata.
- `POST /api/v1/integration/edc/ingest`: Mock external EDC data ingestion endpoint.
