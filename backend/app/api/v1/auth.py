from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models.identity import User, Role
from app.schemas.auth import Token, LoginRequest, SwitchRoleRequest, UserResponse

router = APIRouter(prefix="/auth", tags=["Identity & RBAC"])


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive JWT access token."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account.")

    role_name = user.role.name
    perms = [p.code for p in user.role.permissions] if user.role.permissions else []
    token = create_access_token(
        subject=user.id,
        role=role_name,
        email=user.email,
        full_name=user.full_name
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=role_name,
        permissions=perms
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve current authenticated user profile."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.name,
        organization_id=current_user.organization_id,
        is_active=current_user.is_active
    )


@router.post("/switch-role", response_model=Token)
def switch_role(
    req: SwitchRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    SIH Evaluator Demo Switcher:
    Instantly switch context to an authorized representative user of another role.
    """
    target_role = db.query(Role).filter(Role.name == req.target_role.upper()).first()
    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{req.target_role}' not found."
        )

    # Find the representative seeded user for that role
    rep_user = db.query(User).filter(User.role_id == target_role.id).first()
    if not rep_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No representative user found for role '{req.target_role}'."
        )

    perms = [p.code for p in target_role.permissions] if target_role.permissions else []
    token = create_access_token(
        subject=rep_user.id,
        role=target_role.name,
        email=rep_user.email,
        full_name=rep_user.full_name
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=rep_user.id,
        email=rep_user.email,
        full_name=rep_user.full_name,
        role=target_role.name,
        permissions=perms
    )


@router.get("/available-roles")
def list_available_roles(db: Session = Depends(get_db)):
    """Returns all 8 system roles for UI role-switcher."""
    roles = db.query(Role).order_by(Role.name).all()
    return [{"name": r.name, "description": r.description} for r in roles]
