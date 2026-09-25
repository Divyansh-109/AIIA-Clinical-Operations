# Server-Side Role-Based Access Control (RBAC) Matrix
## AIIA Clinical Research Intelligence, Compliance & Trial Management Platform

---

## 1. System Roles Overview

| Role Code | Display Title | Core Function |
| :--- | :--- | :--- |
| `ADMIN` | System Administrator | User management, role assignment, system configurations, global thresholds, audit logs |
| `LEADERSHIP` | Institutional Leadership | Portfolio-level oversight, study status, recruitment risk, safety signals, high-level alerts |
| `PI` | Principal Investigator | Study operations oversight, visit reviews, protocol deviation sign-offs, AE/SAE reviews |
| `STUDY_COORDINATOR`| Study Coordinator | Participant screening, enrollment, visit scheduling, eCRF data entry, query responses |
| `MONITOR` | Clinical Research Associate / Monitor | Site monitoring, source data verification (SDV), protocol deviation oversight, query reviews |
| `ETHICS_COMMITTEE`| Institutional Ethics Committee | Protocol & amendment reviews, informed consent reviews, ethics approvals, renewals |
| `PHARMACOVIGILANCE`| Central Safety Officer / PV | AE/ADR/SAE processing, 24h/7d regulatory deadline tracking, signal detection, safety reporting |
| `REGULATOR` | CDSCO / Regulatory Auditor | Read-only oversight of authorized studies, CTRI milestones, safety reports, tamper-evident audit |

---

## 2. Server-Side Permissions Matrix

| Permission Code | Category | ADMIN | LEADERSHIP | PI | STUDY_COORDINATOR | MONITOR | ETHICS_COMMITTEE | PHARMACOVIGILANCE | REGULATOR |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `users:manage` | Admin | **Y** | N | N | N | N | N | N | N |
| `system:config` | Admin | **Y** | N | N | N | N | N | N | N |
| `study:create` | Study | **Y** | N | **Y** | N | N | N | N | N |
| `study:read` | Study | **Y** | **Y** | **Y** (Assigned) | **Y** (Assigned) | **Y** (Assigned) | **Y** (Assigned) | **Y** | **Y** (Read-Only) |
| `study:update_lifecycle`| Study | **Y** | N | **Y** | N | N | N | N | N |
| `protocol:amend` | Protocol | **Y** | N | **Y** | N | N | N | N | N |
| `protocol:read` | Protocol | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** |
| `site:manage` | Site | **Y** | N | **Y** | N | N | N | N | N |
| `participant:screen` | Clinical Ops | N | N | **Y** | **Y** | N | N | N | N |
| `participant:enroll` | Clinical Ops | N | N | **Y** | **Y** | N | N | N | N |
| `participant:view_pii` | Privacy | N | N | **Y** (Assigned) | **Y** (Assigned) | **Y** (Limited) | N | N | N |
| `visit:record` | Clinical Ops | N | N | **Y** | **Y** | N | N | N | N |
| `visit:verify_sdv` | Monitoring | N | N | N | N | **Y** | N | N | N |
| `deviation:view` | Protocol | **Y** | **Y** (Agg) | **Y** | **Y** | **Y** | **Y** | **Y** | **Y** |
| `deviation:signoff` | Protocol | N | N | **Y** | N | **Y** | N | N | N |
| `query:create` | Data Quality | N | N | **Y** | N | **Y** | N | N | N |
| `query:respond` | Data Quality | N | N | N | **Y** | N | N | N | N |
| `query:close` | Data Quality | N | N | **Y** | N | **Y** | N | N | N |
| `ae:create` | Safety | N | N | **Y** | **Y** | N | N | **Y** | N |
| `sae:review` | Safety | N | N | **Y** | N | N | N | **Y** | N |
| `sae:submit_regulatory`| Safety | N | N | N | N | N | N | **Y** | N |
| `signal:evaluate` | Safety | N | **Y** (Agg) | **Y** | N | N | N | **Y** | N |
| `ethics:review` | Compliance | N | N | N | N | N | **Y** | N | N |
| `ethics:approve` | Compliance | N | N | N | N | N | **Y** | N | N |
| `ctri:manage` | Compliance | **Y** | N | **Y** | N | N | N | N | N |
| `kpi:read_portfolio` | Intelligence | **Y** | **Y** | N | N | N | N | N | N |
| `trust_engine:view` | Intelligence | **Y** | **Y** | **Y** | N | **Y** | N | **Y** | N |
| `simulation:run` | Intelligence | **Y** | **Y** | **Y** | N | N | N | N | N |
| `fhir:export` | Interop | **Y** | N | **Y** | N | N | N | N | **Y** |
| `cdisc:export` | Interop | **Y** | N | **Y** | N | N | N | N | **Y** |
| `audit:read` | Audit | **Y** | N | **Y** (Study) | N | **Y** (Site) | N | N | **Y** |
| `audit:verify_hash` | Audit | **Y** | **Y** | **Y** | N | **Y** | **Y** | **Y** | **Y** |

---

## 3. Server-Side Enforcement Rules

1. **Defense in Depth**: Permissions are strictly validated in the backend API layer using dependency injection / security middlewares (`require_permission(...)`).
2. **Resource Scoping**:
   - PIs and Coordinators are scoped to their assigned `study_id` and `site_id`.
   - Monitor visits are restricted to sites listed in their site initiation assignment.
3. **Data Minimization (DPDP Act alignment)**:
   - Leadership and Regulators receive aggregated study metrics without participant personal identifiable information (PII).
   - Participant records use irreversible de-identified codes (`AIIA-PCOS-001-S01-P0042`).
