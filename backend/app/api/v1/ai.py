from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.identity import User
from app.services.ai_assistant_service import AIAssistantService

router = APIRouter(prefix="/ai", tags=["Explainable AI Assistants"])


class NarrativeExtractRequest(BaseModel):
    narrative_text: str


class ConceptTranslateRequest(BaseModel):
    source_concept: str


@router.post("/extract-narrative")
def extract_ae_narrative(
    req: NarrativeExtractRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Explainable AI: Clinical AE Narrative Extractor (Section 18).
    Extracts structured AE fields from physician/nurse progress notes with confidence ratings.
    """
    if not req.narrative_text.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Narrative text cannot be empty.")
    return AIAssistantService.extract_ae_narrative(narrative_text=req.narrative_text)


@router.post("/translate-concept")
def translate_clinical_concept(
    req: ConceptTranslateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Clinical Data Translator (Section 38):
    Maps incoming FHIR / EHR clinical concepts to canonical CDISC SDTM variables with confidence scoring.
    """
    return AIAssistantService.translate_clinical_concept(source_concept=req.source_concept)
