import sys
import os
import uuid
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models.identity import User
from app.models.study import Study, Protocol, ProtocolVersion, ProtocolVisit, ProtocolRule, Site
from app.models.clinical import Participant, Screening, Enrollment, Randomization, Visit, VisitAssessment, Medication
from app.models.protocol_guardian import ProtocolDeviation, DataQuery
from app.models.pharmacovigilance import AdverseEvent, SeriousAdverseEvent, SafetySignal
from app.models.compliance import EthicsSubmission, CTRIRecord, Consent, ConsentVersion
from app.models.intelligence import Alert
from app.services.audit_service import AuditService
from app.services.pv_service import PVService


def seed_flagship_study():
    db = SessionLocal()
    try:
        print("--- SEEDING FLAGSHIP STUDY: AIIA-PCOS-001 ---")

        # 1. Clean existing study if already present
        existing_study = db.query(Study).filter(Study.study_code == "AIIA-PCOS-001").first()
        if existing_study:
            print("AIIA-PCOS-001 already exists. Skipping recreation.")
            return

        admin_user = db.query(User).filter(User.email == "admin@aiia.gov.in").first()
        pi_user = db.query(User).filter(User.email == "pi.sharma@aiia.gov.in").first()
        coord_user = db.query(User).filter(User.email == "coordinator.priya@aiia.gov.in").first()

        # 2. Create Flagship Study
        study = Study(
            study_code="AIIA-PCOS-001",
            title="Multi-Centric Randomized Double-Blind Controlled Clinical Trial Evaluating the Efficacy, Safety, and Quality-of-Life Outcomes of Ayush-PCOS Herbal Formulation in Women of Reproductive Age with Polycystic Ovary Syndrome",
            short_title="Efficacy & Safety Evaluation of Ayush-PCOS Formulation in PCOS",
            study_type="INTERVENTIONAL",
            intervention="Ayush-PCOS Granules (5g BD) vs Standard of Care (Metformin 500mg BD)",
            therapeutic_area="Ayurvedic Endocrinology & Gynecology",
            phase="PHASE_III",
            design="Multi-Centric, Randomized, Double-Blind, Parallel-Group, Active-Controlled Trial",
            status="RECRUITING",
            start_date=date(2026, 1, 15),
            planned_end_date=date(2027, 6, 30),
            target_enrollment=500,
            actual_enrollment=0,
            principal_investigator_id=pi_user.id
        )
        db.add(study)
        db.commit()
        db.refresh(study)
        print("Created Flagship Study: AIIA-PCOS-001")

        # 3. Create Protocol & Protocol Versions (v1.0 & v2.0)
        protocol = Protocol(study_id=study.id)
        db.add(protocol)
        db.commit()

        pv1 = ProtocolVersion(
            protocol_id=protocol.id,
            version_number="v1.0",
            effective_date=date(2026, 1, 10),
            approval_status="SUPERSEDED",
            approval_date=date(2026, 1, 10),
            amendment_reason="Original Approved Clinical Protocol",
            created_by=admin_user.id
        )
        db.add(pv1)
        db.commit()

        pv2 = ProtocolVersion(
            protocol_id=protocol.id,
            version_number="v2.0",
            effective_date=date(2026, 6, 1),
            approval_status="APPROVED",
            approval_date=date(2026, 6, 1),
            amendment_reason="Protocol Amendment: tightened visit window tolerances from +/- 5 days to +/- 3 days and added mandatory Fasting Insulin evaluation",
            created_by=admin_user.id
        )
        db.add(pv2)
        db.commit()
        protocol.current_version_id = pv2.id
        db.commit()

        # Add Protocol Visits for v2.0
        visit_defs = [
            {"name": "Screening (V0)", "num": 0, "day": -7, "lower": -3, "upper": 0, "rules": ["FASTING_GLUCOSE_REQ", "ULTRASOUND_REQ"]},
            {"name": "Baseline Enrollment (V1)", "num": 1, "day": 0, "lower": 0, "upper": 2, "rules": ["SYSBP_REQ", "DIABP_REQ", "WEIGHT_REQ"]},
            {"name": "Week 4 Follow-up (V2)", "num": 2, "day": 28, "lower": -3, "upper": 3, "rules": ["SYSBP_REQ", "DIABP_REQ", "FASTING_GLUCOSE_REQ"]},
            {"name": "Week 8 Follow-up (V3)", "num": 3, "day": 56, "lower": -3, "upper": 3, "rules": ["SYSBP_REQ", "DIABP_REQ"]},
            {"name": "Week 12 Study Completion (V4)", "num": 4, "day": 84, "lower": -3, "upper": 3, "rules": ["SYSBP_REQ", "DIABP_REQ", "ULTRASOUND_REQ", "FASTING_GLUCOSE_REQ"]}
        ]
        created_p_visits = []
        for vd in visit_defs:
            p_vis = ProtocolVisit(
                protocol_version_id=pv2.id,
                visit_name=vd["name"],
                visit_number=vd["num"],
                target_day=vd["day"],
                lower_window_days=vd["lower"],
                upper_window_days=vd["upper"],
                is_mandatory=True
            )
            db.add(p_vis)
            db.commit()
            db.refresh(p_vis)
            created_p_visits.append(p_vis)

            for r_code in vd["rules"]:
                r = ProtocolRule(
                    protocol_visit_id=p_vis.id,
                    rule_type="REQUIRED_ASSESSMENT",
                    rule_code=r_code,
                    parameters={"is_critical": True}
                )
                db.add(r)
            db.commit()
        print("Created Protocol v1.0 and v2.0 with machine-readable visit rules.")

        # 4. Create 8 Clinical Trial Sites
        sites_config = [
            ("S01", "AIIA Apex Hospital, New Delhi", "New Delhi, Delhi", 80),
            ("S02", "National Institute of Ayurveda (NIA)", "Jaipur, Rajasthan", 70),
            ("S03", "Institute of Teaching & Research in Ayurveda (ITRA)", "Jamnagar, Gujarat", 65),
            ("S04", "Faculty of Ayurveda, IMS-BHU", "Varanasi, Uttar Pradesh", 75), # ANOMALY SITE: Identical vitals
            ("S05", "Government Ayurveda Medical College", "Bengaluru, Karnataka", 55),
            ("S06", "All India Institute of Medical Sciences (AIIMS Ayush Wing)", "Rishikesh, Uttarakhand", 50),
            ("S07", "Ayurvedic Research Hospital", "Thiruvananthapuram, Kerala", 60), # ANOMALY SITE: Recruitment lag
            ("S08", "Ch. Brahm Prakash Ayurved Charak Sansthan", "Khera Dabra, New Delhi", 45)
        ]
        site_objs = []
        for scode, sname, loc, target in sites_config:
            s = Site(
                study_id=study.id,
                site_code=scode,
                site_name=sname,
                location=loc,
                target_enrollment=target,
                actual_enrollment=0,
                status="ACTIVE",
                activation_date=date(2026, 1, 20)
            )
            db.add(s)
            db.commit()
            db.refresh(s)
            site_objs.append(s)
        print(f"Created {len(site_objs)} clinical trial sites.")

        # 5. Regulatory & Compliance Records (Ethics & CTRI)
        ethics = EthicsSubmission(
            study_id=study.id,
            committee_name="AIIA Institutional Ethics Committee (IEC-AIIA)",
            submission_date=date(2026, 1, 5),
            approval_status="APPROVED",
            approval_date=date(2026, 1, 14),
            expiry_date=date(2027, 1, 13),
            document_reference="IEC/AIIA/2026/EC-042"
        )
        db.add(ethics)

        ctri = CTRIRecord(
            study_id=study.id,
            ctri_number="CTRI/2026/02/081940",
            registration_date=date(2026, 2, 1),
            last_updated_date=date(2026, 6, 2),
            next_update_due=date(2026, 12, 1),
            registration_status="VERIFIED"
        )
        db.add(ctri)

        c_ver = ConsentVersion(
            study_id=study.id,
            version_number="v2.0",
            effective_date=date(2026, 6, 1),
            is_active=True
        )
        db.add(c_ver)
        db.commit()
        db.refresh(c_ver)
        print("Created Ethics Clearance (IEC/AIIA/2026/EC-042) and CTRI Record (CTRI/2026/02/081940).")

        # 6. Seed Cohort of Participants across sites with controlled anomalies
        print("Generating realistic patient cohort...")
        total_enrolled = 0

        for site_idx, site in enumerate(site_objs):
            # Normal sites recruit ~15-25 participants. Site S07 is starved with only 4 participants (Recruitment Lag Anomaly)
            if site.site_code == "S07":
                cohort_size = 4
            elif site.site_code == "S04":
                cohort_size = 20 # Site with identical vitals
            else:
                cohort_size = 18

            for p_num in range(1, cohort_size + 1):
                p_code = f"AIIA-PCOS-{site.site_code}-P{str(p_num).zfill(4)}"
                age = 22 + (p_num % 16)
                p = Participant(
                    participant_code=p_code,
                    study_id=study.id,
                    site_id=site.id,
                    status="ENROLLED",
                    age=age,
                    gender="FEMALE"
                )
                db.add(p)
                db.commit()
                db.refresh(p)

                # Screening
                scr = Screening(
                    participant_id=p.id,
                    screening_date=date(2026, 7, 1) + timedelta(days=p_num),
                    eligibility_status="ELIGIBLE",
                    screened_by=coord_user.id
                )
                db.add(scr)

                # Informed Consent
                c = Consent(
                    participant_id=p.id,
                    study_id=study.id,
                    version_id=c_ver.id,
                    status="CONSENTED",
                    signed_at=datetime(2026, 7, 2, 10, 0, tzinfo=timezone.utc) + timedelta(days=p_num),
                    signer_role="PARTICIPANT",
                    signature_metadata={"ip": "10.0.4.15", "auth_method": "DIGITAL_OTP_AADHAAR"}
                )
                db.add(c)

                # Enrollment (Day 0)
                enroll_date = date(2026, 7, 5) + timedelta(days=p_num)
                enr = Enrollment(
                    participant_id=p.id,
                    enrollment_date=enroll_date,
                    enrolled_by=coord_user.id
                )
                db.add(enr)

                # Randomization (1:1 allocation)
                arm = "ARM_A (Ayush-PCOS Active)" if (p_num % 2 == 1) else "ARM_B (Metformin Control)"
                rand = Randomization(
                    participant_id=p.id,
                    randomization_date=enroll_date,
                    allocation_group=arm,
                    is_blinded=True
                )
                db.add(rand)

                site.actual_enrollment += 1
                total_enrolled += 1

                # Generate Visits for this participant
                v1_sched = enroll_date
                v2_sched = enroll_date + timedelta(days=28)
                v3_sched = enroll_date + timedelta(days=56)

                # V1: Baseline Visit (Completed)
                v1 = Visit(
                    participant_id=p.id,
                    protocol_visit_id=created_p_visits[1].id,
                    scheduled_date=v1_sched,
                    actual_date=v1_sched,
                    study_day=0,
                    status="COMPLETED"
                )
                db.add(v1)
                db.commit()
                db.refresh(v1)

                # CONTROLLED ANOMALY: At Site S04, inject identical Blood Pressure (120/80 mmHg) for all subjects!
                if site.site_code == "S04":
                    sys_val = 120.0
                    dia_val = 80.0
                else:
                    sys_val = 114.0 + (p_num % 14)
                    dia_val = 72.0 + (p_num % 10)

                db.add(VisitAssessment(visit_id=v1.id, assessment_type="VITALS", assessment_name="SYSBP", numeric_value=sys_val, unit="mmHg"))
                db.add(VisitAssessment(visit_id=v1.id, assessment_type="VITALS", assessment_name="DIABP", numeric_value=dia_val, unit="mmHg"))
                db.add(VisitAssessment(visit_id=v1.id, assessment_type="VITALS", assessment_name="WEIGHT", numeric_value=58.5 + (p_num % 8), unit="kg"))

                # V2: Week 4 Visit
                # Controlled anomaly: Subject #3 attends on Day 42 (Late visit -> OUT_OF_WINDOW)
                if p_num == 3:
                    v2_actual = enroll_date + timedelta(days=42) # Day 42 (allowed 25-31)
                    v2 = Visit(
                        participant_id=p.id,
                        protocol_visit_id=created_p_visits[2].id,
                        scheduled_date=v2_sched,
                        actual_date=v2_actual,
                        study_day=42,
                        status="OUT_OF_WINDOW"
                    )
                    db.add(v2)
                    db.commit()
                    db.refresh(v2)

                    # Auto Protocol Deviation
                    db.add(ProtocolDeviation(
                        study_id=study.id,
                        site_id=site.id,
                        participant_id=p.id,
                        visit_id=v2.id,
                        deviation_type="OUT_OF_WINDOW_VISIT",
                        severity="MAJOR",
                        description=f"Visit V2 attended on Study Day 42 (Window Day 25 to 31). Variance: +14 days.",
                        status="OPEN"
                    ))
                else:
                    v2 = Visit(
                        participant_id=p.id,
                        protocol_visit_id=created_p_visits[2].id,
                        scheduled_date=v2_sched,
                        actual_date=v2_sched,
                        study_day=28,
                        status="COMPLETED"
                    )
                    db.add(v2)
                    db.commit()
                    db.refresh(v2)
                    db.add(VisitAssessment(visit_id=v2.id, assessment_type="VITALS", assessment_name="SYSBP", numeric_value=sys_val + 2, unit="mmHg"))
                    db.add(VisitAssessment(visit_id=v2.id, assessment_type="VITALS", assessment_name="DIABP", numeric_value=dia_val, unit="mmHg"))
                    db.add(VisitAssessment(visit_id=v2.id, assessment_type="LAB", assessment_name="FASTING_GLUCOSE", numeric_value=92.0 + (p_num % 12), unit="mg/dL"))

                # V3: Upcoming Scheduled Visit
                v3 = Visit(
                    participant_id=p.id,
                    protocol_visit_id=created_p_visits[3].id,
                    scheduled_date=v3_sched,
                    status="SCHEDULED"
                )
                db.add(v3)
                db.commit()

        study.actual_enrollment = total_enrolled
        db.commit()
        print(f"Enrolled {total_enrolled} participants across 8 sites.")

        # 7. INJECT SAE with Active Regulatory Deadline Pressure
        print("Injecting flagship Serious Adverse Event with approaching 24h deadline...")
        flagship_patient = db.query(Participant).filter(Participant.participant_code == "AIIA-PCOS-S01-P0001").first()

        now_utc = datetime.now(timezone.utc)
        ae_onset = date.today() - timedelta(days=1)
        # Deadline set to 5 hours from now to showcase URGENT deadline countdown!
        urgent_24h_deadline = now_utc + timedelta(hours=5, minutes=24)
        detailed_7d_deadline = now_utc + timedelta(days=6)

        ae_flagship = AdverseEvent(
            study_id=study.id,
            site_id=flagship_patient.site_id,
            participant_id=flagship_patient.id,
            event_term="Severe Abdominal Cramps with Hepatic Transaminitis",
            meddra_pt_code="10000084",
            meddra_soc="Gastrointestinal disorders",
            onset_date=ae_onset,
            severity="SEVERE",
            is_serious=True,
            suspected_drug="Ayush-PCOS Herbal Formulation",
            causality="PROBABLE",
            outcome="RECOVERING",
            reported_by=pi_user.id,
            reported_at=now_utc - timedelta(hours=18, minutes=36)
        )
        db.add(ae_flagship)
        db.commit()
        db.refresh(ae_flagship)

        sae_flagship = SeriousAdverseEvent(
            adverse_event_id=ae_flagship.id,
            criteria_hospitalization=True,
            criteria_disability=False,
            initial_report_deadline=urgent_24h_deadline,
            detailed_report_deadline=detailed_7d_deadline,
            status="UNDER_REVIEW"
        )
        db.add(sae_flagship)

        # Critical alert for leadership & PV
        db.add(Alert(
            study_id=study.id,
            site_id=flagship_patient.site_id,
            category="SAFETY",
            severity="CRITICAL",
            title="CRITICAL: SAE Regulatory Deadline Approaching (5h 24m remaining)",
            message=(
                f"Severe Abdominal Cramps reported for {flagship_patient.participant_code}. "
                f"Initial CDSCO regulatory report due within 24 hours. Immediate medical review required."
            )
        ))
        db.commit()

        # 8. INJECT Additional Similar AEs to trigger Safety Signal Prioritization Engine
        print("Injecting safety signal events...")
        for p_idx in [2, 4, 6, 8]:
            p_case = db.query(Participant).filter(Participant.participant_code == f"AIIA-PCOS-S01-P{str(p_idx).zfill(4)}").first()
            if p_case:
                db.add(AdverseEvent(
                    study_id=study.id,
                    site_id=p_case.site_id,
                    participant_id=p_case.id,
                    event_term="Severe Abdominal Cramps",
                    meddra_pt_code="10000084",
                    meddra_soc="Gastrointestinal disorders",
                    onset_date=date.today() - timedelta(days=p_idx),
                    severity="SEVERE",
                    is_serious=False,
                    suspected_drug="Ayush-PCOS Herbal Formulation",
                    causality="POSSIBLE",
                    outcome="RECOVERED",
                    reported_by=pi_user.id
                ))
        db.commit()

        # Run Safety Signal Engine to compute disproportionality PRR
        PVService.evaluate_safety_signals(db=db, study_id=study.id)

        # 9. INJECT Data Quality Queries with Aging Metrics
        print("Injecting data discrepancy queries...")
        sample_p = db.query(Participant).filter(Participant.participant_code == "AIIA-PCOS-S04-P0002").first()
        if sample_p:
            db.add(DataQuery(
                study_id=study.id,
                site_id=sample_p.site_id,
                participant_id=sample_p.id,
                field_name="SYSBP",
                description="Repeated identical Systolic BP measurement (120.0 mmHg) detected. Please verify source clinic log sheet.",
                severity="HIGH",
                status="OPEN",
                created_at=now_utc - timedelta(days=6),
                due_at=now_utc - timedelta(days=1) # OVERDUE QUERY!
            ))
            db.add(DataQuery(
                study_id=study.id,
                site_id=sample_p.site_id,
                participant_id=sample_p.id,
                field_name="FASTING_GLUCOSE",
                description="Glucose measurement recorded as 999 mg/dL exceeds physiological maximum. Suspected transcription error.",
                severity="CRITICAL",
                status="ASSIGNED",
                created_at=now_utc - timedelta(days=2),
                due_at=now_utc + timedelta(days=3)
            ))
            db.commit()

        # 10. Audit Chain Verification
        AuditService.record(
            db=db,
            action="FLAGSHIP_STUDY_INITIALIZED",
            entity_type="Study",
            entity_id=str(study.id),
            user_id=str(admin_user.id),
            user_role="ADMIN",
            new_value={"study_code": study.study_code, "enrolled_cohort": total_enrolled},
            change_reason="SIH 2026 Flagship demonstration study data seed"
        )

        is_valid, count, reason = AuditService.verify_integrity(db=db)
        print(f"\n=======================================================")
        print(f"FLAGSHIP STUDY INITIALIZED SUCCESSFULLY!")
        print(f"Study Code: {study.study_code}")
        print(f"Sites: {len(site_objs)} sites (including Site 4 identical vitals & Site 7 recruitment lag)")
        print(f"Enrolled Cohort: {total_enrolled} participants")
        print(f"Active SAE Countdown: Initial report due in 5h 24m")
        print(f"Audit Trail Integrity: {'VERIFIED (100% Cryptographic Match)' if is_valid else 'FAILED: ' + str(reason)}")
        print(f"Total Audit Blocks: {count} hash-chained records")
        print(f"=======================================================")

    finally:
        db.close()


if __name__ == "__main__":
    seed_flagship_study()
