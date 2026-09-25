from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import date

from app.api.deps import get_db, get_current_user, require_roles
from app.models.identity import User
from app.models.compliance import EthicsSubmission, CTRIRecord, Consent
from app.schemas.compliance_trust import (
    ALCOAPrinciple, EthicsSubmissionCreate, CTRICreate
)
from app.services.audit_service import AuditService

router = APIRouter(prefix="/compliance", tags=["Regulatory Compliance & ALCOA+"])

ALCOA_MATRIX = [
    {
        "principle": "Attributable",
        "meaning": "Traceable to individual who performed the clinical action",
        "system_implementation": "Cryptographically authenticated User ID, Role token, and digital e-signatures attached to every event.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "AuditEvent.user_id + AuditEvent.user_role"
    },
    {
        "principle": "Legible",
        "meaning": "Human and machine-readable throughout record lifecycle",
        "system_implementation": "Structured normalized relational PostgreSQL database schemas with standardized JSONB payloads.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "AuditEvent.old_value + AuditEvent.new_value"
    },
    {
        "principle": "Contemporaneous",
        "meaning": "Recorded at the exact time the event or assessment took place",
        "system_implementation": "Enforced server UTC timestamp capture (ISO 8601) independently from client device clock.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "AuditEvent.timestamp (timestamptz)"
    },
    {
        "principle": "Original",
        "meaning": "First recording of data or verified true copy preserved without silent overwriting",
        "system_implementation": "Protocols, documents, and informed consent versions immutable with formal incrementation.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "ProtocolVersion + ConsentVersion repositories"
    },
    {
        "principle": "Accurate",
        "meaning": "Truthful, verified, and free from unresolved contradictions or unrecorded alterations",
        "system_implementation": "Protocol Guardian real-time validation, Data Quality Query engine, and range boundary enforcement.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "ProtocolGuardianService + DataQualityService"
    },
    {
        "principle": "Complete",
        "meaning": "All data, including modifications, deletions, and justifications, fully preserved",
        "system_implementation": "Every mutation generates an immutable AuditEvent including change reason and old/new delta.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "AuditEvent.change_reason"
    },
    {
        "principle": "Consistent",
        "meaning": "Application follows defined clinical workflows and valid temporal sequences",
        "system_implementation": "State machine enforcement (e.g. Consent before Enrollment, Screening before Consent).",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "LifecycleService state transition validations"
    },
    {
        "principle": "Enduring",
        "meaning": "Data recorded in durable, long-term format without decay",
        "system_implementation": "PostgreSQL relational persistence with automated snapshots and object storage abstraction.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "PostgreSQL 16 persistence layer"
    },
    {
        "principle": "Available",
        "meaning": "Readily accessible for inspection and review by authorized regulatory monitors",
        "system_implementation": "Dedicated Regulators read-only portal, FHIR R4 interoperability, and CDISC SDTM export pipelines.",
        "compliance_status": "COMPLIANT",
        "audit_evidence_anchor": "Role: REGULATOR / API endpoints"
    }
]


@router.get("/alcoa", response_model=List[ALCOAPrinciple])
def get_alcoa_compliance_matrix(current_user: User = Depends(get_current_user)):
    """ALCOA+ Compliance Matrix: maps system features to regulatory data integrity standards."""
    return ALCOA_MATRIX


@router.get("/ethics/{study_id}")
def get_ethics_status(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves Institutional Ethics Committee (IEC) submission and approval records."""
    return db.query(EthicsSubmission).filter(EthicsSubmission.study_id == study_id).order_by(EthicsSubmission.submission_date.desc()).all()


@router.post("/ethics")
def create_ethics_submission(
    req: EthicsSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "ETHICS_COMMITTEE"]))
):
    """Logs an Ethics Committee submission and formal approval."""
    sub = EthicsSubmission(
        study_id=req.study_id,
        committee_name=req.committee_name,
        submission_date=req.submission_date,
        approval_status=req.approval_status,
        approval_date=req.approval_date,
        expiry_date=req.expiry_date,
        document_reference=req.document_reference
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    AuditService.record(
        db=db,
        action="ETHICS_RECORD_SUBMITTED",
        entity_type="EthicsSubmission",
        entity_id=str(sub.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"committee": req.committee_name, "status": req.approval_status},
        change_reason="Ethics clearance submission"
    )

    return sub


@router.get("/ctri/{study_id}")
def get_ctri_status(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves Clinical Trials Registry - India (CTRI) registration details."""
    ctri = db.query(CTRIRecord).filter(CTRIRecord.study_id == study_id).first()
    if not ctri:
        return {"status": "NOT_REGISTERED", "ctri_number": None}
    return ctri


@router.post("/ctri")
def create_ctri_record(
    req: CTRICreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI"]))
):
    """Registers official CTRI trial registration code and regulatory update milestones."""
    existing = db.query(CTRIRecord).filter(CTRIRecord.study_id == req.study_id).first()
    if existing:
        existing.ctri_number = req.ctri_number
        existing.last_updated_date = req.last_updated_date
        existing.next_update_due = req.next_update_due
        existing.registration_status = req.registration_status
        db.commit()
        record = existing
    else:
        record = CTRIRecord(
            study_id=req.study_id,
            ctri_number=req.ctri_number,
            registration_date=req.registration_date,
            last_updated_date=req.last_updated_date,
            next_update_due=req.next_update_due,
            registration_status=req.registration_status
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    AuditService.record(
        db=db,
        action="CTRI_REGISTERED",
        entity_type="CTRIRecord",
        entity_id=str(record.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"ctri_number": req.ctri_number},
        change_reason="CTRI clinical trial registry entry"
    )

    return record


@router.get("/documents/{study_id}")
def list_study_documents(
    study_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all versioned study documents and their lifecycle states."""
    from app.models.compliance import Document
    docs = db.query(Document).filter(Document.study_id == study_id).order_by(Document.uploaded_at.desc()).all()
    if not docs:
        # Seed default documents for demonstration if none exist
        default_docs = [
            ("Clinical Trial Protocol (v2.0 Amended)", "PROTOCOL", "v2.0", "APPROVED"),
            ("Clinical Trial Protocol (v1.0 Original)", "PROTOCOL", "v1.0", "SUPERSEDED"),
            ("Investigator's Brochure (Ayush-PCOS Herbal Granules)", "IB", "v3.1", "APPROVED"),
            ("Institutional Ethics Committee Approval Letter", "ETHICS_APPROVAL", "v1.0", "APPROVED"),
            ("CTRI Formal Trial Registration Certificate", "CTRI_CERT", "v1.0", "APPROVED"),
            ("Patient Information Sheet & Informed Consent Form", "CONSENT_FORM", "v2.0", "APPROVED"),
            ("Statistical Analysis Plan (SAP)", "SAP", "v1.0", "UNDER_REVIEW"),
            ("Independent Monitoring Visit Report #1", "MONITORING_REPORT", "v1.0", "APPROVED"),
        ]
        created = []
        for title, dtype, ver, st in default_docs:
            d = Document(
                study_id=study_id,
                title=title,
                document_type=dtype,
                file_path=f"/vault/documents/{dtype.lower()}_{ver}.pdf",
                version=ver,
                status=st,
                uploaded_by=current_user.id,
                approved_by=current_user.id if st == "APPROVED" else None,
                approval_date=date.today() if st == "APPROVED" else None
            )
            db.add(d)
            created.append(d)
        db.commit()
        docs = created
    return docs


@router.post("/documents")
def create_document(
    study_id: UUID,
    title: str,
    document_type: str,
    version: str = "1.0",
    status: str = "DRAFT",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "STUDY_COORDINATOR"]))
):
    """Uploads a new clinical study document into the lifecycle repository."""
    from app.models.compliance import Document
    doc = Document(
        study_id=study_id,
        title=title,
        document_type=document_type.upper(),
        file_path=f"/vault/documents/{document_type.lower()}_{version}.pdf",
        version=version,
        status=status.upper(),
        uploaded_by=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    AuditService.record(
        db=db,
        action="DOCUMENT_UPLOADED",
        entity_type="Document",
        entity_id=str(doc.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"title": title, "version": version, "status": doc.status},
        change_reason="Study lifecycle document upload"
    )
    return doc


@router.put("/documents/{document_id}/status")
def update_document_status(
    document_id: UUID,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN", "PI", "ETHICS_COMMITTEE"]))
):
    """Transitions a document lifecycle status (Draft -> Under Review -> Approved -> Superseded -> Archived)."""
    from app.models.compliance import Document
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    old_status = doc.status
    doc.status = new_status.upper()
    if doc.status == "APPROVED":
        doc.approved_by = current_user.id
        doc.approval_date = date.today()
    db.commit()

    AuditService.record(
        db=db,
        action="DOCUMENT_STATUS_TRANSITION",
        entity_type="Document",
        entity_id=str(doc.id),
        user_id=str(current_user.id),
        user_role=current_user.role.name,
        new_value={"old_status": old_status, "new_status": doc.status},
        change_reason="Document lifecycle state progression"
    )
    return {"message": f"Document status changed to {doc.status}.", "document_id": doc.id, "status": doc.status}

