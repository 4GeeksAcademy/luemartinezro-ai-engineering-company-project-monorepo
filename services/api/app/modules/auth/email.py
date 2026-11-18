"""
Auth module — Email service for password reset.

Uses Resend (https://resend.com) to send transactional emails.
The API key is loaded from settings — never hardcoded.
"""

import logging

from app.core.settings import settings

logger = logging.getLogger(__name__)

# Sender address: Resend's onboarding sender works without a custom domain.
# In production, replace with a verified domain.
RESEND_FROM = "onboarding@resend.dev"
RESEND_FROM_NAME = "HealthCore"


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Send a password reset email via Resend.

    Args:
        to_email: Recipient email address.
        reset_link: Full URL including the reset token.

    Returns:
        True if the email was accepted by Resend, False otherwise.
    """
    api_key = settings.RESEND_API_KEY
    if not api_key:
        logger.warning("RESEND_API_KEY is not set — skipping email to %s", to_email)
        logger.info("Simulated email to %s: %s", to_email, reset_link)
        return False

    try:
        import resend

        resend.api_key = api_key

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f6f9; }}
    .container {{ max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }}
    .header {{ background: #0016a2; padding: 24px; text-align: center; }}
    .header h1 {{ color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; }}
    .body {{ padding: 32px 24px; }}
    .body p {{ color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }}
    .btn {{ display: block; width: 100%; text-align: center; background: #0069ff; color: #ffffff !important; text-decoration: none; padding: 14px 0; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 24px 0; }}
    .btn:hover {{ background: #0031c4; }}
    .footer {{ padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }}
    .footer p {{ color: #9ca3af; font-size: 12px; margin: 0; }}
    .footer a {{ color: #0069ff; text-decoration: none; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HealthCore</h1>
    </div>
    <div class="body">
      <p><strong>Password Reset Request</strong></p>
      <p>We received a request to reset your password for your HealthCore account. Click the button below to set a new password. This link expires in 30 minutes.</p>
      <a href="{reset_link}" class="btn">Reset Password</a>
      <p style="font-size: 13px; color: #6b7280;">If you didn't request this, you can safely ignore this email. Your password won't change unless you click the link above.</p>
      <p style="font-size: 13px; color: #6b7280;">If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="font-size: 12px; color: #0069ff; word-break: break-all;">{reset_link}</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 HealthCore. All rights reserved.</p>
      <p>This is an automated message from HealthCore Digital.</p>
    </div>
  </div>
</body>
</html>"""

        params = {
            "from": f"{RESEND_FROM_NAME} <{RESEND_FROM}>",
            "to": [to_email],
            "subject": "Reset your HealthCore password",
            "html": html_content,
        }

        response = resend.Emails.send(params)
        logger.info("Password reset email sent to %s — response: %s", to_email, response)
        return True

    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", to_email, exc)
        return False