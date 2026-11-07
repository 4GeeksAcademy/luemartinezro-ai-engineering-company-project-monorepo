"""
Auth module — Business logic layer.

Handles login credential validation and token generation.
"""

from app.core.errors import unauthorized
from app.core.security import create_access_token
from app.modules.auth.schemas import LoginRequest
from app.modules.users.service import UserService


class AuthService:
    """Authentication business logic."""

    def __init__(self):
        self.user_service = UserService()

    def login(self, payload: LoginRequest) -> dict:
        """
        Validate credentials and return a JWT token dict.
        Raises 401 on invalid credentials.
        """
        user = self.user_service.authenticate(payload.email, payload.password)
        if user is None:
            raise unauthorized("Invalid email or password")

        token = create_access_token(subject=str(user["id"]))
        return {"access_token": token, "token_type": "bearer"}