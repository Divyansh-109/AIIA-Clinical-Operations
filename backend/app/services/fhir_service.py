from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.clinical import Participant, VisitAssessment, Visit, Medication
from app.models.pharmacovigilance import AdverseEvent
from app.models.compliance import Consent
from app.models.study import Study


class FHIRService:
    @staticmethod
    def get_patient_resource(db: Session, participant_id: UUID) -> Optional[Dict[str, Any]]:
        """Generates standard FHIR R4 Patient resource."""
        p = db.query(Participant).filter(Participant.id == participant_id).first()
        if not p:
            return None

        return {
            "resourceType": "Patient",
            "id": str(p.id),
            "identifier": [
                {
                    "use": "official",
                    "system": "https://aiia.gov.in/clinical-trials/participants",
                    "value": p.participant_code
                }
            ],
            "active": p.status in ["ENROLLED", "ACTIVE"],
            "gender": p.gender.lower() if p.gender else "unknown",
            "extension": [
                {
                    "url": "https://aiia.gov.in/fhir/StructureDefinition/participant-age",
                    "valueInteger": p.age
                },
                {
                    "url": "https://aiia.gov.in/fhir/StructureDefinition/trial-status",
                    "valueString": p.status
                }
            ],
            "managingOrganization": {
                "reference": f"Organization/{p.study.study_code if p.study else 'AIIA'}",
                "display": "All India Institute of Ayurveda"
            }
        }

    @staticmethod
    def get_observation_resource(db: Session, assessment_id: UUID) -> Optional[Dict[str, Any]]:
        """Generates standard FHIR R4 Observation resource with LOINC terminology mapping."""
        a = db.query(VisitAssessment).filter(VisitAssessment.id == assessment_id).first()
        if not a:
            return None

        # LOINC mapping dictionary
        loinc_map = {
            "SYSBP": {"code": "8480-6", "display": "Systolic blood pressure"},
            "DIABP": {"code": "8462-4", "display": "Diastolic blood pressure"},
            "PULSE": {"code": "8867-4", "display": "Heart rate"},
            "FASTING_BG": {"code": "1558-6", "display": "Fasting glucose in serum or plasma"},
            "WEIGHT": {"code": "29463-7", "display": "Body weight"}
        }
        loinc = loinc_map.get(a.assessment_name.upper(), {"code": "unknown", "display": a.assessment_name})

        resource = {
            "resourceType": "Observation",
            "id": str(a.id),
            "status": "final",
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "vital-signs" if a.assessment_type == "VITALS" else "laboratory",
                            "display": "Vital Signs" if a.assessment_type == "VITALS" else "Laboratory"
                        }
                    ]
                }
            ],
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": loinc["code"],
                        "display": loinc["display"]
                    }
                ],
                "text": a.assessment_name
            },
            "subject": {
                "reference": f"Patient/{a.visit.participant_id if a.visit else 'unknown'}"
            },
            "effectiveDateTime": a.recorded_at.isoformat() if a.recorded_at else None
        }

        if a.numeric_value is not None:
            resource["valueQuantity"] = {
                "value": a.numeric_value,
                "unit": a.unit or "",
                "system": "http://unitsofmeasure.org",
                "code": a.unit or ""
            }
        elif a.text_value:
            resource["valueString"] = a.text_value

        return resource

    @staticmethod
    def get_adverse_event_resource(db: Session, ae_id: UUID) -> Optional[Dict[str, Any]]:
        """Generates standard FHIR R4 AdverseEvent resource."""
        ae = db.query(AdverseEvent).filter(AdverseEvent.id == ae_id).first()
        if not ae:
            return None

        return {
            "resourceType": "AdverseEvent",
            "id": str(ae.id),
            "actuality": "actual",
            "event": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/meddra",
                        "code": ae.meddra_pt_code or "unknown",
                        "display": ae.event_term
                    }
                ],
                "text": ae.event_term
            },
            "subject": {
                "reference": f"Patient/{ae.participant_id}"
            },
            "date": ae.onset_date.isoformat(),
            "seriousness": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/adverse-event-seriousness",
                        "code": "serious" if ae.is_serious else "non-serious",
                        "display": "Serious" if ae.is_serious else "Non-serious"
                    }
                ]
            },
            "severity": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/adverse-event-severity",
                        "code": ae.severity.lower(),
                        "display": ae.severity.capitalize()
                    }
                ]
            },
            "outcome": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/adverse-event-outcome",
                        "code": ae.outcome.lower(),
                        "display": ae.outcome.capitalize()
                    }
                ]
            },
            "suspectEntity": [
                {
                    "instance": {
                        "display": ae.suspected_drug
                    }
                }
            ]
        }

    @staticmethod
    def get_research_study_resource(db: Session, study_id: UUID) -> Optional[Dict[str, Any]]:
        """Generates standard FHIR R4 ResearchStudy resource."""
        study = db.query(Study).filter(Study.id == study_id).first()
        if not study:
            return None

        return {
            "resourceType": "ResearchStudy",
            "id": str(study.id),
            "identifier": [
                {
                    "use": "official",
                    "system": "https://ctri.nic.in",
                    "value": study.study_code
                }
            ],
            "title": study.title,
            "status": study.status.lower(),
            "category": [
                {
                    "coding": [
                        {
                            "system": "https://aiia.gov.in/study-type",
                            "code": study.study_type,
                            "display": study.study_type.capitalize()
                        }
                    ]
                }
            ],
            "phase": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/research-study-phase",
                        "code": study.phase.lower(),
                        "display": study.phase
                    }
                ]
            },
            "description": study.design
        }
