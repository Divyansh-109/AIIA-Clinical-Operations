import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.identity import Organization, Role, Permission, User

ROLES_DATA = [
    {"name": "ADMIN", "description": "System administrator with full configuration and user provisioning rights."},
    {"name": "LEADERSHIP", "description": "Institutional leadership with executive oversight across portfolio, recruitment risk, and safety signals."},
    {"name": "PI", "description": "Principal Investigator with study-level clinical operations, deviation approvals, and participant oversight."},
    {"name": "STUDY_COORDINATOR", "description": "Clinical coordinator managing participant screening, enrollment, visit data entry, and query resolutions."},
    {"name": "MONITOR", "description": "Clinical research associate performing source data verification, site visits, and deviation oversight."},
    {"name": "ETHICS_COMMITTEE", "description": "Institutional Ethics Committee reviewing protocols, amendments, and consent documents."},
    {"name": "PHARMACOVIGILANCE", "description": "Central safety officer tracking adverse events, SAE 24h/7d regulatory deadlines, and signals."},
    {"name": "REGULATOR", "description": "CDSCO / regulatory auditor with read-only access to study status, CTRI milestones, safety, and audit logs."},
]

PERMISSIONS_DATA = [
    ("users:manage", "Admin"),
    ("system:config", "Admin"),
    ("study:create", "Study"),
    ("study:read", "Study"),
    ("study:update_lifecycle", "Study"),
    ("protocol:amend", "Protocol"),
    ("protocol:read", "Protocol"),
    ("site:manage", "Site"),
    ("participant:screen", "Clinical Ops"),
    ("participant:enroll", "Clinical Ops"),
    ("participant:view_pii", "Privacy"),
    ("visit:record", "Clinical Ops"),
    ("visit:verify_sdv", "Monitoring"),
    ("deviation:view", "Protocol"),
    ("deviation:signoff", "Protocol"),
    ("query:create", "Data Quality"),
    ("query:respond", "Data Quality"),
    ("query:close", "Data Quality"),
    ("ae:create", "Safety"),
    ("sae:review", "Safety"),
    ("sae:submit_regulatory", "Safety"),
    ("signal:evaluate", "Safety"),
    ("ethics:review", "Compliance"),
    ("ethics:approve", "Compliance"),
    ("ctri:manage", "Compliance"),
    ("kpi:read_portfolio", "Intelligence"),
    ("trust_engine:view", "Intelligence"),
    ("simulation:run", "Intelligence"),
    ("fhir:export", "Interop"),
    ("cdisc:export", "Interop"),
    ("audit:read", "Audit"),
    ("audit:verify_hash", "Audit"),
]

USERS_DATA = [
    {"email": "admin@aiia.gov.in", "name": "Prof. R. K. Singhal (Admin)", "role": "ADMIN"},
    {"email": "director@aiia.gov.in", "name": "Dr. Tanuja Nesari (Director & Leadership)", "role": "LEADERSHIP"},
    {"email": "pi.sharma@aiia.gov.in", "name": "Dr. Anand Sharma (Principal Investigator)", "role": "PI"},
    {"email": "coordinator.priya@aiia.gov.in", "name": "Priya Verma (Lead Study Coordinator)", "role": "STUDY_COORDINATOR"},
    {"email": "monitor.cra@cro-partner.in", "name": "Vikram Malhotra (Senior Clinical Monitor)", "role": "MONITOR"},
    {"email": "ethics.chair@aiia.gov.in", "name": "Dr. M. S. Baghel (IEC Chairperson)", "role": "ETHICS_COMMITTEE"},
    {"email": "pv.officer@aiia.gov.in", "name": "Dr. Sneha Patil (National Pharmacovigilance Officer)", "role": "PHARMACOVIGILANCE"},
    {"email": "regulator@cdsco.gov.in", "name": "CDSCO Clinical Trial Inspectorate", "role": "REGULATOR"},
]


def seed():
    db = SessionLocal()
    try:
        # 1. Organization
        org = db.query(Organization).filter_by(org_code="AIIA_DELHI").first()
        if not org:
            org = Organization(
                name="All India Institute of Ayurveda (AIIA)",
                org_code="AIIA_DELHI",
                org_type="Academic & Clinical Research Institute"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            print("Seeded Organization: AIIA")

        # 2. Permissions
        perm_map = {}
        for code, category in PERMISSIONS_DATA:
            p = db.query(Permission).filter_by(code=code).first()
            if not p:
                p = Permission(code=code, category=category)
                db.add(p)
                db.commit()
                db.refresh(p)
            perm_map[code] = p
        print(f"Seeded {len(perm_map)} Permissions.")

        # 3. Roles
        role_map = {}
        for r_info in ROLES_DATA:
            role = db.query(Role).filter_by(name=r_info["name"]).first()
            if not role:
                role = Role(name=r_info["name"], description=r_info["description"])
                db.add(role)
                db.commit()
                db.refresh(role)
            role_map[role.name] = role
        print(f"Seeded {len(role_map)} Roles.")

        # 4. Users
        default_pwd_hash = get_password_hash("password123")
        for u_info in USERS_DATA:
            user = db.query(User).filter_by(email=u_info["email"]).first()
            if not user:
                user = User(
                    email=u_info["email"],
                    hashed_password=default_pwd_hash,
                    full_name=u_info["name"],
                    role_id=role_map[u_info["role"]].id,
                    organization_id=org.id,
                    is_active=True
                )
                db.add(user)
                db.commit()
                print(f"Seeded User: {u_info['name']} ({u_info['role']}) -> {u_info['email']}")

        print("Base Identity & RBAC Seeding Completed Successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
