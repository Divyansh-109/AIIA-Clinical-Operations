from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: str
    full_name: str
    role: str
    permissions: List[str] = []


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SwitchRoleRequest(BaseModel):
    target_role: str  # ADMIN, LEADERSHIP, PI, STUDY_COORDINATOR, MONITOR, ETHICS_COMMITTEE, PHARMACOVIGILANCE, REGULATOR


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str
    role: str
    organization_id: Optional[UUID] = None
    is_active: bool
