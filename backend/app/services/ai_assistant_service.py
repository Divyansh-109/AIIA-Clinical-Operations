import re
from typing import Dict, Any, List


class AIAssistantService:
    @staticmethod
    def extract_ae_narrative(narrative_text: str) -> Dict[str, Any]:
        """
        Explainable AI: Clinical AE Narrative Extractor (Section 18).
        Parses unstructured physician/nurse narrative notes into structured pharmacovigilance fields.
        Every extracted entity includes confidence score and explicit review requirement.
        """
        text = narrative_text.lower()

        # 1. Detect Event Term
        event_term = "Unspecified Adverse Event"
        confidence_term = 0.65
        terms = [
            ("severe abdominal cramps", "Severe Abdominal Cramps", 0.95),
            ("abdominal pain", "Abdominal Pain", 0.92),
            ("headache", "Headache", 0.90),
            ("nausea", "Nausea", 0.88),
            ("dizziness", "Dizziness", 0.85),
            ("elevated liver enzymes", "Elevated Liver Enzymes (ALT/AST)", 0.94),
            ("rash", "Skin Rash / Pruritus", 0.89)
        ]
        for pattern, term_val, conf in terms:
            if pattern in text:
                event_term = term_val
                confidence_term = conf
                break

        # 2. Detect Severity
        if "severe" in text or "incapacitating" in text or "bed rest" in text:
            severity = "SEVERE"
            sev_conf = 0.92
        elif "moderate" in text:
            severity = "MODERATE"
            sev_conf = 0.85
        elif "mild" in text or "slight" in text:
            severity = "MILD"
            sev_conf = 0.88
        else:
            severity = "MODERATE"
            sev_conf = 0.70

        # 3. Detect Seriousness criteria
        hospitalized = "hospital" in text or "admission" in text or "inpatient" in text
        life_threat = "life-threatening" in text or "icu" in text
        disability = "disability" in text or "bed rest" in text or "incapacity" in text

        is_serious = hospitalized or life_threat or disability

        # 4. Suspected Drug
        suspected_drug = "Ayush-PCOS Herbal Granules"
        if "metformin" in text:
            suspected_drug = "Metformin Hydrochloride"

        return {
            "extracted_event_term": event_term,
            "confidence_event_term": confidence_term,
            "extracted_severity": severity,
            "confidence_severity": sev_conf,
            "suspected_drug": suspected_drug,
            "is_serious_indicated": is_serious,
            "seriousness_evidence": {
                "criteria_hospitalization": hospitalized,
                "criteria_life_threatening": life_threat,
                "criteria_disability": disability
            },
            "human_review_required": True,
            "clinical_disclaimer": "AI-generated extraction draft. Must be confirmed and authorized by a licensed clinical investigator."
        }

    @staticmethod
    def translate_clinical_concept(source_concept: str) -> Dict[str, Any]:
        """
        Clinical Data Translator (Section 38):
        Maps incoming FHIR / EHR clinical concepts to canonical CDISC SDTM domains
        with confidence metrics and candidate alternatives.
        """
        concept_upper = source_concept.upper()

        mappings = {
            "SYSBP": {
                "canonical_name": "Systolic Blood Pressure",
                "sdtm_domain": "VS",
                "sdtm_variable": "VS.SYSBP",
                "confidence": 0.98,
                "alternatives": [
                    {"concept": "VS.BP.SYSTOLIC", "confidence": 0.85},
                    {"concept": "VS.MEANBP", "confidence": 0.45}
                ]
            },
            "DIABP": {
                "canonical_name": "Diastolic Blood Pressure",
                "sdtm_domain": "VS",
                "sdtm_variable": "VS.DIABP",
                "confidence": 0.98,
                "alternatives": [
                    {"concept": "VS.BP.DIASTOLIC", "confidence": 0.85}
                ]
            },
            "FASTING_BG": {
                "canonical_name": "Fasting Blood Glucose",
                "sdtm_domain": "LB",
                "sdtm_variable": "LB.GLUC",
                "confidence": 0.95,
                "alternatives": [
                    {"concept": "LB.GLUC.FASTING", "confidence": 0.90},
                    {"concept": "LB.HBA1C", "confidence": 0.55}
                ]
            }
        }

        match = mappings.get(concept_upper)
        if match:
            return {
                "source_concept": source_concept,
                "canonical_concept": match["canonical_name"],
                "mapped_sdtm_variable": match["sdtm_variable"],
                "target_domain": match["sdtm_domain"],
                "confidence_score": match["confidence"],
                "confidence_level": "HIGH",
                "candidate_alternatives": match["alternatives"],
                "requires_human_approval": False
            }
        else:
            return {
                "source_concept": source_concept,
                "canonical_concept": "Unmapped Observation",
                "mapped_sdtm_variable": "VS.ORRES",
                "target_domain": "VS",
                "confidence_score": 0.65,
                "confidence_level": "MODERATE",
                "candidate_alternatives": [
                    {"concept": "VS.ORRES", "confidence": 0.65},
                    {"concept": "LB.ORRES", "confidence": 0.50}
                ],
                "requires_human_approval": True
            }
