# Comprehensive Data Dictionary
## AIIA Clinical Research Intelligence, Compliance & Trial Management Platform

---

## 1. Identity, Access & Organization

### 1.1 `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address for authentication |
| `hashed_password` | VARCHAR(255) | NOT NULL | Salted & hashed password (BCrypt/Argon2) |
| `full_name` | VARCHAR(255) | NOT NULL | User's full display name |
| `role_id` | UUID | FK -> `roles.id`, NOT NULL | Assigned system role |
| `organization_id`| UUID | FK -> `organizations.id` | Affiliated organization/institution |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 1.2 `roles`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Role identifier |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Role code (`ADMIN`, `LEADERSHIP`, `PI`, `STUDY_COORDINATOR`, `MONITOR`, `ETHICS_COMMITTEE`, `PHARMACOVIGILANCE`, `REGULATOR`) |
| `description` | TEXT | | Human-readable role description |

### 1.3 `permissions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Permission identifier |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL | Permission string (e.g. `studies:read`, `participants:create`, `sae:report`) |
| `category` | VARCHAR(50) | NOT NULL | Domain category (Study, Operations, Safety, Compliance) |

### 1.4 `role_permissions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `role_id` | UUID | FK -> `roles.id`, NOT NULL | Mapped role |
| `permission_id`| UUID | FK -> `permissions.id`, NOT NULL| Mapped permission |

### 1.5 `organizations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Organization identifier |
| `name` | VARCHAR(255) | NOT NULL | Organization name (e.g., "AIIA New Delhi", "CCRAS") |
| `org_code` | VARCHAR(50) | UNIQUE, NOT NULL | Institution code |
| `org_type` | VARCHAR(50) | NOT NULL | Type (Academic, Clinical, Regulatory, Sponsor) |

---

## 2. Study & Protocol Entities

### 2.1 `studies`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Study unique identifier |
| `study_code` | VARCHAR(100) | UNIQUE, NOT NULL | Protocol identifier (e.g. `AIIA-PCOS-001`) |
| `title` | TEXT | NOT NULL | Full scientific title |
| `short_title` | VARCHAR(255) | NOT NULL | Public/short working title |
| `study_type` | VARCHAR(50) | NOT NULL | `INTERVENTIONAL`, `OBSERVATIONAL`, `MULTI_CENTRE` |
| `intervention` | TEXT | NOT NULL | Investigational product / Ayurvedic intervention |
| `therapeutic_area`| VARCHAR(100) | NOT NULL | Clinical area (e.g. Gynecology, Metabolic, Neurology) |
| `phase` | VARCHAR(20) | NOT NULL | `PHASE_I`, `PHASE_II`, `PHASE_III`, `PHASE_IV`, `NOT_APPLICABLE` |
| `design` | VARCHAR(100) | NOT NULL | E.g., Randomized Double-Blind Controlled Trial |
| `status` | VARCHAR(50) | NOT NULL | State machine status (e.g. `DRAFT`, `RECRUITING`, etc.) |
| `start_date` | DATE | | Official trial start date |
| `planned_end_date`| DATE | | Target trial completion date |
| `target_enrollment`| INT | NOT NULL | Total target sample size across all sites |
| `actual_enrollment`| INT | DEFAULT 0 | Current total enrolled participants |
| `principal_investigator_id` | UUID | FK -> `users.id` | Lead PI assigned to the study |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### 2.2 `protocols`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Protocol container identifier |
| `study_id` | UUID | FK -> `studies.id`, UNIQUE | Parent study |
| `current_version_id`| UUID | | Pointer to active approved protocol version |

### 2.3 `protocol_versions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Protocol version identifier |
| `protocol_id` | UUID | FK -> `protocols.id`, NOT NULL | Parent protocol |
| `version_number`| VARCHAR(20) | NOT NULL | E.g. `v1.0`, `v1.1`, `v2.0` |
| `effective_date`| DATE | NOT NULL | Date version takes regulatory effect |
| `approval_status`| VARCHAR(50) | NOT NULL | `DRAFT`, `PENDING_ETHICS`, `APPROVED`, `SUPERSEDED` |
| `approval_date` | DATE | | Ethics committee approval date |
| `amendment_reason`| TEXT | | Description of changes & rationale |
| `document_id` | UUID | FK -> `documents.id` | Full protocol PDF reference |
| `created_by` | UUID | FK -> `users.id` | User who created version |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### 2.4 `protocol_visits`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Protocol visit definition |
| `protocol_version_id`| UUID | FK -> `protocol_versions.id` | Associated protocol version |
| `visit_name` | VARCHAR(100) | NOT NULL | E.g., "Screening", "Baseline", "Week 4 (V2)" |
| `visit_number` | INT | NOT NULL | Sequence index (1, 2, 3...) |
| `target_day` | INT | NOT NULL | Target study day (e.g. Day 0, Day 28, Day 56) |
| `lower_window_days`| INT | NOT NULL | Negative offset tolerance (e.g. -3) |
| `upper_window_days`| INT | NOT NULL | Positive offset tolerance (e.g. +3) |
| `is_mandatory` | BOOLEAN | DEFAULT TRUE | Whether visit is required for protocol adherence |

### 2.5 `protocol_rules`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Rule identifier |
| `protocol_visit_id` | UUID | FK -> `protocol_visits.id` | Associated visit |
| `rule_type` | VARCHAR(50) | NOT NULL | `REQUIRED_ASSESSMENT`, `LAB_TEST`, `MEDICATION_RULE` |
| `rule_code` | VARCHAR(100) | NOT NULL | Code (e.g., `SYSBP_REQ`, `FASTING_GLUCOSE_REQ`) |
| `parameters` | JSONB | NOT NULL | Structured parameters (acceptable ranges, units, etc.) |

---

## 3. Site & Investigator Management

### 3.1 `sites`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Site identifier |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Parent study |
| `site_code` | VARCHAR(50) | NOT NULL | E.g. `S01`, `S02`, `S08` |
| `site_name` | VARCHAR(255) | NOT NULL | Hospital/Clinic facility name |
| `location` | VARCHAR(255) | NOT NULL | City / State (e.g., "New Delhi", "Jaipur") |
| `activation_date`| DATE | | Date site was formally initiated |
| `status` | VARCHAR(50) | NOT NULL | `PENDING`, `ACTIVE`, `SUSPENDED`, `CLOSED` |
| `target_enrollment`| INT | NOT NULL | Site-specific target recruitment |
| `actual_enrollment`| INT | DEFAULT 0 | Current actual enrolled at site |

### 3.2 `investigators`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Investigator link identifier |
| `user_id` | UUID | FK -> `users.id`, NOT NULL | User profile |
| `site_id` | UUID | FK -> `sites.id`, NOT NULL | Assigned trial site |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Assigned study |
| `role_at_site` | VARCHAR(50) | NOT NULL | `PRINCIPAL_INVESTIGATOR`, `CO_INVESTIGATOR`, `COORDINATOR` |

---

## 4. Participant & Clinical Operations

### 4.1 `participants`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Internal UUID |
| `participant_code`| VARCHAR(100) | UNIQUE, NOT NULL | De-identified code (`AIIA-PCOS-001-S01-P0042`) |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Enrolled study |
| `site_id` | UUID | FK -> `sites.id`, NOT NULL | Recruited site |
| `status` | VARCHAR(50) | NOT NULL | `SCREENED`, `ENROLLED`, `ACTIVE`, `COMPLETED`, `DROPPED_OUT` |
| `age` | INT | NOT NULL | Age in years |
| `gender` | VARCHAR(20) | NOT NULL | De-identified demographic |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### 4.2 `screenings`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Screening record identifier |
| `participant_id` | UUID | FK -> `participants.id`, NOT NULL| Screened participant |
| `screening_date` | DATE | NOT NULL | Date screening assessments performed |
| `eligibility_status`| VARCHAR(50)| NOT NULL | `ELIGIBLE`, `INELIGIBLE`, `PENDING` |
| `screen_failure_reason`| TEXT| | Null if eligible; reason if failed |
| `screened_by` | UUID | FK -> `users.id` | Clinical coordinator who screened |

### 4.3 `enrollments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Enrollment identifier |
| `participant_id` | UUID | FK -> `participants.id`, UNIQUE | Enrolled participant |
| `enrollment_date`| DATE | NOT NULL | Official enrollment date (Day 0) |
| `enrolled_by` | UUID | FK -> `users.id` | Authorized coordinator/PI |

### 4.4 `randomizations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Randomization identifier |
| `participant_id` | UUID | FK -> `participants.id`, UNIQUE | Randomized participant |
| `randomization_date`| DATE | NOT NULL | Date of allocation |
| `allocation_group`| VARCHAR(100) | NOT NULL | E.g., `ARM_A` (Active Ayurvedic), `ARM_B` (Control) |
| `is_blinded` | BOOLEAN | DEFAULT TRUE | Blinding protection flag |

### 4.5 `visits`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Visit record identifier |
| `participant_id` | UUID | FK -> `participants.id`, NOT NULL| Participant |
| `protocol_visit_id`| UUID | FK -> `protocol_visits.id`, NOT NULL| Protocol definition |
| `scheduled_date` | DATE | NOT NULL | Calculated expected date |
| `actual_date` | DATE | | Actual attendance date |
| `status` | VARCHAR(50) | NOT NULL | `SCHEDULED`, `COMPLETED`, `MISSED`, `CANCELLED`, `OUT_OF_WINDOW` |
| `notes` | TEXT | | Clinical visit summary notes |
| `created_by` | UUID | FK -> `users.id` | Recording user |

### 4.6 `visit_assessments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Assessment entry |
| `visit_id` | UUID | FK -> `visits.id`, NOT NULL | Parent visit |
| `assessment_type`| VARCHAR(100) | NOT NULL | E.g. `VITALS`, `LAB`, `QUESTIONNAIRE` |
| `assessment_name`| VARCHAR(100) | NOT NULL | E.g. `SYSBP`, `DIABP`, `PULSE`, `FASTING_BG` |
| `numeric_value` | DOUBLE PRECISION| | Numeric result |
| `text_value` | TEXT | | Text/qualitative result |
| `unit` | VARCHAR(50) | | Measurement unit (`mmHg`, `mg/dL`, `bpm`) |
| `recorded_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### 4.7 `medications`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Medication entry |
| `participant_id` | UUID | FK -> `participants.id`, NOT NULL| Participant |
| `drug_name` | VARCHAR(255) | NOT NULL | Investigational or concomitant drug name |
| `is_investigational`| BOOLEAN | NOT NULL | True = study product; False = concomitant |
| `dosage` | VARCHAR(100) | NOT NULL | E.g., `500 mg BD` |
| `start_date` | DATE | NOT NULL | Commencement date |
| `end_date` | DATE | | Completion / discontinuation date |

---

## 5. Protocol Guardian & Data Quality Entities

### 5.1 `protocol_deviations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Deviation record identifier |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Associated study |
| `site_id` | UUID | FK -> `sites.id`, NOT NULL | Site where deviation occurred |
| `participant_id` | UUID | FK -> `participants.id`, NOT NULL| Affected participant |
| `visit_id` | UUID | FK -> `visits.id` | Linked visit if applicable |
| `deviation_type` | VARCHAR(100) | NOT NULL | `OUT_OF_WINDOW_VISIT`, `MISSING_ASSESSMENT`, `INELIGIBLE_ENROLLMENT` |
| `severity` | VARCHAR(50) | NOT NULL | `MINOR`, `MAJOR`, `CRITICAL` |
| `description` | TEXT | NOT NULL | Explanation of protocol non-compliance |
| `status` | VARCHAR(50) | NOT NULL | `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `REPORTED_TO_IRB` |
| `detected_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp detected by Guardian |
| `resolved_at` | TIMESTAMPTZ | | Timestamp of resolution |

### 5.2 `data_queries`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Query identifier |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Parent study |
| `site_id` | UUID | FK -> `sites.id`, NOT NULL | Parent site |
| `participant_id` | UUID | FK -> `participants.id`, NOT NULL| Associated participant |
| `visit_id` | UUID | FK -> `visits.id` | Associated visit |
| `field_name` | VARCHAR(100) | NOT NULL | Contested eCRF field |
| `description` | TEXT | NOT NULL | Discrepancy description |
| `severity` | VARCHAR(50) | NOT NULL | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `status` | VARCHAR(50) | NOT NULL | `OPEN`, `ASSIGNED`, `RESPONDED`, `RESOLVED`, `REJECTED` |
| `assigned_to` | UUID | FK -> `users.id` | Coordinator assigned to resolve |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |
| `due_at` | TIMESTAMPTZ | NOT NULL | Turnaround deadline |
| `resolved_at` | TIMESTAMPTZ | | Timestamp resolved |
| `resolution_text`| TEXT | | Description of data correction or rationale |

---

## 6. Pharmacovigilance (PV) Entities

### 6.1 `adverse_events`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Adverse Event identifier |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Parent study |
| `site_id` | UUID | FK -> `sites.id`, NOT NULL | Site |
| `participant_id` | UUID | FK -> `participants.id`, NOT NULL| Participant |
| `event_term` | VARCHAR(255) | NOT NULL | Verbatim reported event term |
| `meddra_pt_code` | VARCHAR(50) | | Preferred Term code (MedDRA abstraction) |
| `meddra_soc` | VARCHAR(255) | | System Organ Class |
| `onset_date` | DATE | NOT NULL | Date of first symptom |
| `end_date` | DATE | | Resolution date |
| `severity` | VARCHAR(50) | NOT NULL | `MILD`, `MODERATE`, `SEVERE` |
| `is_serious` | BOOLEAN | NOT NULL | True if any seriousness criteria met |
| `suspected_drug` | VARCHAR(255) | NOT NULL | Suspected study drug/intervention |
| `causality` | VARCHAR(50) | NOT NULL | `CERTAIN`, `PROBABLE`, `POSSIBLE`, `UNLIKELY`, `UNCLASSIFIED` |
| `outcome` | VARCHAR(50) | NOT NULL | `RECOVERED`, `RECOVERING`, `NOT_RECOVERED`, `FATAL`, `UNKNOWN` |
| `reported_by` | UUID | FK -> `users.id`, NOT NULL | Reporter |
| `reported_at` | TIMESTAMPTZ | DEFAULT NOW() | Capture timestamp |

### 6.2 `serious_adverse_events`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | SAE record identifier |
| `adverse_event_id`| UUID | FK -> `adverse_events.id`, UNIQUE| Linked AE |
| `criteria_death` | BOOLEAN | DEFAULT FALSE | Results in death |
| `criteria_life_threatening`| BOOLEAN | DEFAULT FALSE | Life-threatening episode |
| `criteria_hospitalization` | BOOLEAN | DEFAULT FALSE | Required inpatient hospitalization |
| `criteria_disability` | BOOLEAN | DEFAULT FALSE | Persistent or significant incapacity |
| `criteria_congenital` | BOOLEAN | DEFAULT FALSE | Congenital anomaly / birth defect |
| `initial_report_deadline` | TIMESTAMPTZ | NOT NULL | Regulatory 24-hour deadline |
| `detailed_report_deadline`| TIMESTAMPTZ | NOT NULL | Regulatory 7-day deadline |
| `status` | VARCHAR(50) | NOT NULL | `NEW`, `UNDER_REVIEW`, `REPORTABLE`, `SUBMITTED`, `CLOSED` |

### 6.3 `safety_signals`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Signal identifier |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Study |
| `event_term` | VARCHAR(255) | NOT NULL | MedDRA PT term |
| `observed_cases`| INT | NOT NULL | Actual count of reported events |
| `expected_cases`| DOUBLE PRECISION| NOT NULL | Statistical expected baseline |
| `disproportionality_score`| DOUBLE PRECISION| NOT NULL | PRR / Relative Ratio metric |
| `priority_score`| DOUBLE PRECISION| NOT NULL | Normalized composite priority score (0-100) |
| `status` | VARCHAR(50) | NOT NULL | `DETECTED`, `UNDER_EVALUATION`, `CONFIRMED`, `DISMISSED` |
| `evidence_summary`| JSONB | NOT NULL | Contributing factors and breakdown |

---

## 7. Compliance, Ethics, CTRI & Tamper-Evident Audit

### 7.1 `audit_events`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Audit event unique ID |
| `sequence_number`| BIGSERIAL | NOT NULL | Monotonic sequence counter |
| `timestamp` | TIMESTAMPTZ | DEFAULT NOW() | Server timestamp |
| `user_id` | UUID | | Actor user ID |
| `user_role` | VARCHAR(50) | | Role active during mutation |
| `action` | VARCHAR(100) | NOT NULL | Action string (`ENROLL_PARTICIPANT`, `RECORD_VISIT`, etc.) |
| `entity_type` | VARCHAR(100) | NOT NULL | Target entity table |
| `entity_id` | VARCHAR(100) | NOT NULL | Target record PK |
| `old_value` | JSONB | | Snapshot before mutation |
| `new_value` | JSONB | | Snapshot after mutation |
| `change_reason` | TEXT | | Stated justification |
| `ip_address` | VARCHAR(50) | | Client network IP |
| `previous_hash` | VARCHAR(64) | NOT NULL | SHA-256 hash of previous record ($H_{n-1}$) |
| `current_hash` | VARCHAR(64) | NOT NULL | SHA-256 hash of this record ($H_n$) |

### 7.2 `ethics_submissions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Ethics submission ID |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Study |
| `committee_name`| VARCHAR(255) | NOT NULL | Institutional Ethics Committee (IEC) name |
| `submission_date`| DATE | NOT NULL | Date dossier submitted |
| `approval_status`| VARCHAR(50) | NOT NULL | `PENDING`, `APPROVED`, `CONDITIONAL`, `REJECTED` |
| `approval_date` | DATE | | Date formal approval issued |
| `expiry_date` | DATE | NOT NULL | Date ethical approval lapses |
| `document_id` | UUID | FK -> `documents.id` | Formal IEC letter PDF |

### 7.3 `ctri_records`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | CTRI registry entry |
| `study_id` | UUID | FK -> `studies.id`, UNIQUE | Associated study |
| `ctri_number` | VARCHAR(100) | NOT NULL | Format: `CTRI/YYYY/MM/XXXXXX` |
| `registration_date`| DATE | NOT NULL | Date approved by CTRI |
| `last_updated_date`| DATE | NOT NULL | Last regulatory status update |
| `next_update_due` | DATE | NOT NULL | Mandatory renewal / update milestone |
| `registration_status`| VARCHAR(50)| NOT NULL | `REGISTERED`, `UPDATE_PENDING`, `VERIFIED` |

### 7.4 `consents` & `consent_versions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Consent instance |
| `participant_id`| UUID | FK -> `participants.id`, NOT NULL| Participant |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Study |
| `version_id` | UUID | FK -> `consent_versions.id` | Version signed |
| `status` | VARCHAR(50) | NOT NULL | `CONSENTED`, `RE_CONSENT_REQUIRED`, `WITHDRAWN` |
| `signed_at` | TIMESTAMPTZ | NOT NULL | Timestamp of electronic consent |
| `signer_role` | VARCHAR(50) | NOT NULL | `PARTICIPANT`, `LAR` (Legally Authorized Rep) |
| `signature_metadata`| JSONB | NOT NULL | IP, device info, signature token hash |

---

## 8. Intelligence, Risk & Trial Trust Entities

### 8.1 `kpis`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | KPI snapshot identifier |
| `study_id` | UUID | FK -> `studies.id` | Study or null for portfolio-wide |
| `metric_name` | VARCHAR(100) | NOT NULL | E.g., `ENROLLMENT_PCT`, `RETENTION_RATE`, `DEVIATION_RATE` |
| `metric_value` | DOUBLE PRECISION| NOT NULL | Current calculated value |
| `target_value` | DOUBLE PRECISION| | Benchmark target |
| `calculated_at` | TIMESTAMPTZ | DEFAULT NOW() | Time calculated |

### 8.2 `alerts`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Alert identifier |
| `study_id` | UUID | FK -> `studies.id` | Study |
| `site_id` | UUID | FK -> `sites.id` | Site |
| `category` | VARCHAR(50) | NOT NULL | `SAFETY`, `COMPLIANCE`, `RECRUITMENT`, `DATA_QUALITY` |
| `severity` | VARCHAR(20) | NOT NULL | `INFO`, `WARNING`, `CRITICAL` |
| `title` | VARCHAR(255) | NOT NULL | Alert summary |
| `message` | TEXT | NOT NULL | Detailed alert narrative |
| `is_acknowledged`| BOOLEAN | DEFAULT FALSE | Status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp |

### 8.3 `trial_integrity_evidence` (Trial Trust Engine)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Integrity flag identifier |
| `study_id` | UUID | FK -> `studies.id`, NOT NULL | Study |
| `site_id` | UUID | FK -> `sites.id`, NOT NULL | Site exhibiting pattern |
| `anomaly_type` | VARCHAR(100) | NOT NULL | `IDENTICAL_VITALS`, `TIMESTAMP_BURST`, `AE_UNDERREPORTING` |
| `confidence` | VARCHAR(20) | NOT NULL | `HIGH`, `MEDIUM`, `REQUIRES_REVIEW` |
| `evidence_data` | JSONB | NOT NULL | Concrete telemetry & record references |
| `status` | VARCHAR(50) | NOT NULL | `FLAGGED`, `UNDER_REVIEW`, `JUSTIFIED`, `ESCALATED` |
