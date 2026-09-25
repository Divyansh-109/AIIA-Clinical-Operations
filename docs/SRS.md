# Software Requirements Specification (SRS)
## SIH 2026 — Problem Statement 46: AIIA Clinical Research Intelligence, Compliance & Trial Management Platform

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **AIIA Clinical Research Intelligence, Compliance & Trial Management Platform**, developed for the All India Institute of Ayurveda (AIIA). It defines the functional and non-functional requirements, data workflows, user roles, security, regulatory compliance, and intelligence services covering the complete clinical research lifecycle.

### 1.2 Scope
The platform provides a unified, role-based, auditable, and intelligence-augmented environment for managing clinical studies from inception to close-out:
$$\text{Study Creation} \longrightarrow \text{Protocol} \longrightarrow \text{Ethics} \longrightarrow \text{CTRI} \longrightarrow \text{Site Activation} \longrightarrow \text{Screening} \longrightarrow \text{Consent} \longrightarrow \text{Enrollment} \longrightarrow \text{Visits} \longrightarrow \text{Data Collection} \longrightarrow \text{Deviations} \longrightarrow \text{Data Quality} \longrightarrow \text{AE/SAE} \longrightarrow \text{Close-out}$$

Key capabilities include:
- Real-time KPI recalculation via an asynchronous event bus.
- **Protocol Guardian**: Machine-readable protocol rules, visit-window validation, automated deviation detection, and predictive deviation risk indicators.
- **Pharmacovigilance (PV)**: Adverse Event (AE), Adverse Drug Reaction (ADR), Serious Adverse Event (SAE) workflows with strict 24-hour and 7-day reporting countdown timers.
- **Trial Trust Engine**: Statistical integrity analysis detecting duplicated data, unusual timestamp patterns, digit preferences, and atypical site reporting.
- **Explainable Trial Risk**: Multi-factor trial risk index combining recruitment, dropout, deviations, data queries, and safety signals.
- **What-If Scenario Simulator**: Discrete-event trial simulation for evaluating protocol and operational changes.
- **Interoperability**: FHIR R4 resources (`Patient`, `Observation`, `AdverseEvent`, `Consent`, `ResearchStudy`), CDISC SDTM datasets (`DM`, `VS`, `AE`, `CM`, `EX`), and `Define-XML` metadata generation.
- **Compliance & Audit**: Immutable SHA-256 tamper-evident hash-chained audit trail, ALCOA+ compliance mapping, and DPDP-oriented privacy safeguards.

---

## 2. Overall Description

### 2.1 Product Perspective
The system functions as the **AIIA Clinical Research Intelligence Hub**, serving as the central nervous system connecting operational trial management (CTMS), safety monitoring (PV), regulatory compliance (Ethics & CTRI), data quality management, explainable AI analytics, and interoperability standards (FHIR, CDISC, ABDM, EDC/HIS).

```
                        +---------------------------------------+
                        |      AIIA RESEARCH INTELLIGENCE HUB   |
                        +---------------------------------------+
                                           |
                 +-------------------------+-------------------------+
                 |                                                   |
      Role-Based Application                              RESTful API Layer
                 |                                                   |
        +--------+--------+--------------------+--------+------------+
        |        |        |         |          |        |            |
       CTMS      PV    Compliance  Data      AI/      Interop     Auditing
                        (Ethics/  Quality   Analytics (FHIR/
                         CTRI)                        CDISC)
```

### 2.2 User Classes and Roles
The platform enforces server-side role-based access control (RBAC) across 8 distinct roles:
1. **ADMIN**: System administration, user provisioning, role assignments, global threshold configuration.
2. **LEADERSHIP**: Portfolio-level oversight, aggregate recruitment trends, study risks, safety signals, high-priority alerts (PII minimized).
3. **PRINCIPAL INVESTIGATOR (PI)**: Management of assigned clinical studies, participant oversight, visit review, safety sign-offs, deviation approvals.
4. **STUDY COORDINATOR**: Operational participant management, screening, consent recording, visit scheduling, eCRF data entry, query resolution, initial AE capture.
5. **MONITOR**: Source data verification (SDV), site visit monitoring, protocol deviation oversight, data query reviews.
6. **ETHICS COMMITTEE**: Review of protocol versions, informed consent forms, ethics approval submissions, renewal tracking, safety summaries.
7. **PHARMACOVIGILANCE (PV)**: Central safety officer oversight, seriousness evaluations, SAE regulatory deadline tracking (24h/7d), signal detection, MedDRA/WHODrug terminology abstraction.
8. **REGULATOR**: Read-only oversight of authorized studies, CTRI status, protocol version history, safety records, and tamper-evident audit logs.

---

## 3. Specific Functional Requirements

### 3.1 Study & Protocol Management
- **FR-SP-01**: System shall maintain studies with unique codes (e.g., `AIIA-PCOS-001`), phase, therapeutic area, design, and target enrollment.
- **FR-SP-02**: System shall enforce a finite state machine for study lifecycle: `DRAFT` $\to$ `PROTOCOL_FINALIZED` $\to$ `ETHICS_PENDING` $\to$ `ETHICS_APPROVED` $\to$ `CTRI_REGISTERED` $\to$ `SITE_ACTIVATION` $\to$ `RECRUITING` $\to$ `ACTIVE` $\to$ `FOLLOW_UP` $\to$ `CLOSE_OUT` $\to$ `COMPLETED`. Arbitrary status skipping is prohibited.
- **FR-SP-03**: Protocols must support formal versioning (`v1.0`, `v1.1`, `v2.0`). Existing versions cannot be overwritten.
- **FR-SP-04**: Protocol versions must define structured visit schedules, allowed window offsets (e.g. Day $28 \pm 3$), and mandatory clinical assessments.

### 3.2 Participant & Clinical Operations
- **FR-CO-01**: Participants must be assigned de-identified codes (e.g. `AIIA-PCOS-001-S01-P0042`) adhering to data minimization principles.
- **FR-CO-02**: Screening records must capture eligibility status and specific screen failure reasons.
- **FR-CO-03**: Randomization data must maintain blinding where protocol requires.
- **FR-CO-04**: Visit records must track scheduled vs actual visit dates, completion status (`SCHEDULED`, `COMPLETED`, `MISSED`, `CANCELLED`, `OUT_OF_WINDOW`), and recorded assessments.

### 3.3 Protocol Guardian & Deviations
- **FR-PG-01**: On visit entry, system shall calculate the study day and compare it with the protocol visit window.
- **FR-PG-02**: System shall verify all mandatory assessments (e.g. Systolic/Diastolic BP, Lab panels) and generate an automatic deviation if missing.
- **FR-PG-03**: System shall classify deviations: `MINOR`, `MAJOR`, `CRITICAL` and route them for PI and Monitor review.
- **FR-PG-04**: System shall compute an upcoming deviation risk indicator if a participant's historical visit pattern shows persistent lateness.
- **FR-PG-05**: Protocol Amendment Impact Analyzer shall compare protocol versions and quantify the number of affected participants, visits, and sites.

### 3.4 Data Quality & Queries
- **FR-DQ-01**: Automated validation rules shall flag out-of-range clinical values, future dates, and chronological violations (e.g., Enrollment date $<$ Consent date).
- **FR-DQ-02**: Data queries shall support lifecycle states: `OPEN` $\to$ `ASSIGNED` $\to$ `RESPONDED` $\to$ `REVIEW` $\to$ `RESOLVED` / `REJECTED`.
- **FR-DQ-03**: Query aging must be tracked in real-time, escalating queries exceeding configured turnaround thresholds.

### 3.5 Pharmacovigilance & Safety Deadlines
- **FR-PV-01**: System shall record AEs with onset date, severity, seriousness criteria, suspected intervention, and outcome.
- **FR-PV-02**: If an AE meets any seriousness criteria (Death, Life-threatening, Hospitalization, Disability, Congenital anomaly), an SAE record must be spawned.
- **FR-PV-03**: System shall calculate regulatory reporting deadlines (e.g., Initial report within 24 hours, detailed report within 7 days) and show urgent countdown alerts.
- **FR-PV-04**: Terminology provider abstraction shall map verbatim terms to preferred terms and codes (MedDRA/WHODrug abstraction).
- **FR-PV-05**: Safety Signal Engine shall compute observed vs expected event rates and calculate an explainable signal priority score.

### 3.6 Compliance & Tamper-Evident Audit
- **FR-CP-01**: Every mutation shall generate an immutable `AuditEvent` capturing user, role, entity, old value, new value, timestamp, and reason.
- **FR-CP-02**: System shall maintain a cryptographic SHA-256 hash chain:
  $$H_n = \text{SHA-256}(Event_n \parallel H_{n-1})$$
- **FR-CP-03**: An audit integrity verification function must recalculate the chain and report `VERIFIED` or pinpoint tampered records.
- **FR-CP-04**: ALCOA+ controls (Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available) shall be systematically mapped.

### 3.7 Trial Trust & Risk Intelligence
- **FR-TT-01**: Trial Trust Engine shall inspect clinical data distributions for anomalies: repeated identical vitals, abnormal round numbers, atypical timestamp bursts, and site-level AE under-reporting.
- **FR-TT-02**: Anomalies must be presented via an interactive Evidence Graph linking concerns to specific records without making unsubstantiated accusations.
- **FR-TR-01**: Trial Risk Engine shall compute a composite, explainable risk index based on recruitment shortfall, dropout rate, deviation rate, query aging, and safety signals.
- **FR-SI-01**: What-If Trial Simulator shall allow adjusting parameters (adding sites, varying recruitment rates, adjusting dropout) to model projected completion trajectories.

### 3.8 Interoperability (FHIR R4 & CDISC SDTM)
- **FR-IO-01**: System shall expose FHIR R4 standard resources: `Patient`, `Observation`, `AdverseEvent`, `Consent`, `ResearchStudy`.
- **FR-IO-02**: System shall export canonical clinical records into standardized CDISC SDTM domains: `DM`, `VS`, `AE`, `CM`, `EX`.
- **FR-IO-03**: System shall generate standardized `Define-XML` metadata describing dataset variables, types, and codelists.
- **FR-IO-04**: Integration endpoints shall support mock ingestion from external EDC and Hospital Information Systems (HIS).

---

## 4. Non-Functional Requirements

### 4.1 Security & Privacy
- Zero unauthenticated access to clinical data endpoints.
- Passwords hashed using industry-standard algorithms (Argon2 / BCrypt).
- Server-side role checks on every API request.
- PII minimization: Participant identifiers de-identified; aggregate leadership views protect subject privacy in alignment with India's DPDP Act.

### 4.2 Performance & Scalability
- Async API handling capable of sub-100ms response times for operational endpoints.
- Event-driven background recalculation to avoid blocking user transactions.
- Redis caching for frequently queried KPI dashboards.

### 4.3 Data Integrity & Reliability
- Relational integrity enforced by PostgreSQL foreign keys and constraints.
- All timestamps recorded in UTC with ISO 8601 formatting.
- Versioning on protocols, consent forms, and study documents.
