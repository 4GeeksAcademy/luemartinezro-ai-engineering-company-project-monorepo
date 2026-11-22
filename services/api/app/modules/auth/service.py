"""
Auth module — Business logic layer.

Handles login credential validation, token generation, password reset,
and password change flows.
"""

from app.core.errors import bad_request, unauthorized
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.email import send_password_reset_email
from app.modules.auth.repository import ResetTokenRepository
from app.modules.auth.schemas import LoginRequest
from app.modules.users.service import UserService


class AuthService:
    """Authentication business logic."""

    def __init__(self):
        self.user_service = UserService()
        self.reset_token_repo = ResetTokenRepository()

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

    def request_password_reset(self, email: str, request) -> None:
        """
        Generate a reset token and send a reset link via email.

        Always succeeds silently if the email is not found (prevents enumeration).
        """
        from app.core.settings import settings

        user = self.user_service.get_user_by_email(email)
        if user is None:
            # Silently return — don't reveal whether the email exists
            return

        # Invalidate any prior unused tokens for this user
        self.reset_token_repo.invalidate_all_for_user(user["id"])

        # Generate a new reset token
        plain_token = self.reset_token_repo.create(
            user_id=user["id"],
            expiry_minutes=settings.RESET_TOKEN_EXPIRE_MINUTES,
        )

        # Build the reset link using the FRONTEND_URL setting if available,
        # otherwise derive it from the request's base URL.
        if settings.FRONTEND_URL:
            base = settings.FRONTEND_URL.rstrip("/")
        else:
            base_url = str(request.base_url).rstrip("/")
            # Fallback: replace API port (8000) with backoffice port (3001)
            # for local development without a FRONTEND_URL env var.
            base = base_url.replace(":8000", ":3001")

        reset_link = f"{base}/reset-password?token={plain_token}"

        # Send the email
        send_password_reset_email(to_email=email, reset_link=reset_link)

    def reset_password(self, token: str, new_password: str) -> None:
        """
        Validate a reset token and update the user's password.

        Raises 400 if the token is invalid, expired, or already used.
        The token is invalidated after a successful reset.
        """
        token_doc = self.reset_token_repo.find_valid(token)
        if token_doc is None:
            raise bad_request("Invalid, expired, or already-used reset token")

        user_id = token_doc["user_id"]

        # Update the user's password
        hashed = hash_password(new_password)
        self.user_service.repo.update(user_id, {"hashed_password": hashed})

        # Invalidate the token so it cannot be reused
        self.reset_token_repo.mark_as_used(token_doc["id"])

        # Also invalidate any other unused tokens for this user
        self.reset_token_repo.invalidate_all_for_user(user_id)

    def change_password(self, user_id: int, current_password: str, new_password: str) -> None:
        """
        Change the password for an authenticated user.

        Verifies the current password before updating.
        Raises 400 if the current password is wrong.
        """
        user = self.user_service.get_user_by_id(user_id)

        if not verify_password(current_password, user["hashed_password"]):
            raise bad_request("Current password is incorrect")

        hashed = hash_password(new_password)
        self.user_service.repo.update(user_id, {"hashed_password": hashed})