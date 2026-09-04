import hashlib
import secrets
from datetime import timedelta

# pyrefly: ignore [missing-import]
from django.core.mail import EmailMultiAlternatives
# pyrefly: ignore [missing-import]
from django.template.loader import render_to_string
# pyrefly: ignore [missing-import]
from django.utils import timezone


from .models import EmailVerificationOTP


OTP_EXPIRY_MINUTES = 10


def generate_otp():
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str):
    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


def create_email_verification_otp(user):

    otp = generate_otp()

    now = timezone.now()

    verification, _ = (
        EmailVerificationOTP.objects
        .update_or_create(
            user=user,
            defaults={
                "otp_hash": hash_otp(otp),

                "expires_at": (
                    now
                    + timedelta(
                        minutes=OTP_EXPIRY_MINUTES
                    )
                ),

                "attempts": 0,

                "last_sent_at": now,
            },
        )
    )

    send_verification_email(
        user=user,
        otp=otp,
    )

    return verification


def send_verification_email(
    user,
    otp: str,
):

    context = {
        "username": user.username,
        "otp": otp,
        "expiry_minutes":
            OTP_EXPIRY_MINUTES,
    }

    html_content = render_to_string(
        "accounts/email_verification.html",
        context,
    )

    text_content = (
        f"Your SHOPPER. verification code is "
        f"{otp}. "
        f"It expires in "
        f"{OTP_EXPIRY_MINUTES} minutes."
    )

    email = EmailMultiAlternatives(
        subject="SHOPPER. // Email Verification",
        body=text_content,
        from_email=None,
        to=[user.email],
    )

    email.attach_alternative(
        html_content,
        "text/html",
    )

    email.send()