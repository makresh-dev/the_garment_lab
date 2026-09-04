# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView

from .serializers import RegisterSerializer
from .services import create_email_verification_otp

# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.tokens import RefreshToken

import hashlib

# pyrefly: ignore [missing-import]
from django.contrib.auth import get_user_model

# pyrefly: ignore [missing-import]
from django.db import transaction

# pyrefly: ignore [missing-import]
from django.utils import timezone

# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView

from datetime import timedelta

# pyrefly: ignore [missing-import]
from django.utils import timezone

from .models import EmailVerificationOTP
from .services import create_email_verification_otp


class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        create_email_verification_otp(
            user
        )

        return Response(
            {
                "message":
                    "Registration successful. "
                    "A verification OTP has been sent "
                    "to your email.",

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )


User = get_user_model()


class VerifyEmailOTPView(APIView):

    @transaction.atomic
    def post(self, request):

        username = request.data.get(
            "username"
        )

        otp = request.data.get(
            "otp"
        )

        if not username or not otp:
            return Response(
                {
                    "error":
                        "Username and OTP are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            not otp.isdigit()
            or len(otp) != 6
        ):
            return Response(
                {
                    "error":
                        "OTP must be a 6-digit number."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(
                username=username
            )
        except User.DoesNotExist:
            return Response(
                {
                    "error":
                        "Invalid verification request."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_active:
            return Response(
                {
                    "error":
                        "Account is already verified."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            verification = (
                EmailVerificationOTP.objects
                .select_for_update()
                .get(
                    user=user
                )
            )
        except EmailVerificationOTP.DoesNotExist:
            return Response(
                {
                    "error":
                        "Verification OTP not found."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if timezone.now() > verification.expires_at:
            return Response(
                {
                    "error":
                        "OTP has expired. "
                        "Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verification.attempts >= 5:
            return Response(
                {
                    "error":
                        "Too many incorrect attempts. "
                        "Please request a new OTP."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        submitted_hash = hashlib.sha256(
            otp.encode("utf-8")
        ).hexdigest()

        if (
            submitted_hash
            != verification.otp_hash
        ):
            verification.attempts += 1

            verification.save(
                update_fields=[
                    "attempts"
                ]
            )

            return Response(
                {
                    "error":
                        "Invalid OTP."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------
        # Verification successful
        # ----------------------------

        user.is_active = True

        user.save(
            update_fields=[
                "is_active"
            ]
        )

        verification.delete()

        refresh = RefreshToken.for_user(
            user
        )

        return Response(
            {
                "message":
                    "Email verified successfully.",

                "access":
                    str(refresh.access_token),

                "refresh":
                    str(refresh),

                "user": {
                    "id":
                        user.id,

                    "username":
                        user.username,

                    "email":
                        user.email,
                },
            },
            status=status.HTTP_200_OK,
        )


class ResendEmailOTPView(APIView):

    RESEND_COOLDOWN_SECONDS = 60

    def post(self, request):

        username = request.data.get(
            "username"
        )

        if not username:

            return Response(
                {
                    "error":
                        "Username is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        try:

            user = User.objects.get(
                username=username
            )

        except User.DoesNotExist:

            return Response(
                {
                    "error":
                        "Invalid verification request."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        if user.is_active:

            return Response(
                {
                    "error":
                        "Account is already verified."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


        try:

            verification = (
                EmailVerificationOTP.objects.get(
                    user=user
                )
            )

        except EmailVerificationOTP.DoesNotExist:

            verification = None


        # --------------------------------
        # Server-side resend protection
        # --------------------------------

        if (
            verification
            and verification.last_sent_at
        ):

            now = timezone.now()

            elapsed = (
                now
                - verification.last_sent_at
            ).total_seconds()


            if (
                elapsed
                < self.RESEND_COOLDOWN_SECONDS
            ):

                remaining = max(
                    1,
                    int(
                        self.RESEND_COOLDOWN_SECONDS
                        - elapsed
                    ),
                )

                return Response(
                    {
                        "error":
                            "Please wait before "
                            "requesting another OTP.",

                        "retry_after":
                            remaining,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )


        # --------------------------------
        # Generate and send new OTP
        # --------------------------------

        create_email_verification_otp(
            user
        )


        return Response(
            {
                "message":
                    "A new verification OTP "
                    "has been sent."
            },
            status=status.HTTP_200_OK,
        )