"""
Users router — /users endpoints.

- POST /users (public) — register a new user (with optional initial profile)
- GET  /users (protected: admin, manager) — list all users
- GET  /users/{id} (protected: admin or self) — get user by ID
- PUT  /users/{id} (protected: admin or self) — update credentials
- DELETE /users/{id} (protected: admin) — delete user and linked profile
"""

from fastapi import APIRouter, Depends

from app.core.errors import forbidden
from app.core.security import get_current_user
from app.modules.users.schemas import UserCreate, UserResponse, UserUpdate
from app.modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(payload: UserCreate):
    """Register a new user. Accepts optional profile fields (name, phone, address)."""
    service = UserService()
    user = service.create_user(payload)
    return _to_response(user)


@router.get("", response_model=list[UserResponse])
async def list_users(current_user: dict = Depends(get_current_user)):
    """List all users. Requires admin or manager role."""
    if current_user["role"] not in ("admin", "manager"):
        raise forbidden("Only admin or manager can list users")
    service = UserService()
    users = service.get_all_users()
    return [_to_response(u) for u in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """Get a user by ID. Users can only access their own record unless admin."""
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise forbidden("You can only access your own user record")
    service = UserService()
    user = service.get_user_by_id(user_id)
    return _to_response(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update credential fields. Users can update themselves; role changes require admin."""
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise forbidden("You can only update your own user record")
    # Only admin can change role
    if payload.role is not None and current_user["role"] != "admin":
        raise forbidden("Only admin can change user role")

    service = UserService()
    user = service.update_user(user_id, payload)
    return _to_response(user)


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a user and linked profile. Admin only."""
    if current_user["role"] != "admin":
        raise forbidden("Only admin can delete users")
    service = UserService()
    service.delete_user(user_id)


# ── Helpers ──


def _to_response(user: dict) -> UserResponse:
    """Convert a user dict from TinyDB into a UserResponse."""
    return UserResponse(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        is_active=user.get("is_active", True),
        created_at=user.get("created_at", ""),
    )