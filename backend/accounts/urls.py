# pyrefly: ignore [missing-import]
from django.urls import path

from .views import (
    RegisterView,
    VerifyEmailOTPView,
    ResendEmailOTPView,
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "verify-otp/",
        VerifyEmailOTPView.as_view(),
        name="verify-otp",
    ),

    path(
        "resend-otp/",
        ResendEmailOTPView.as_view(),
        name="resend-otp",
    ),
]