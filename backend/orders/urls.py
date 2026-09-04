# pyrefly: ignore [missing-import]
from django.urls import path

from .views import (
    CreateCheckoutView,
    OrderDetailView,
    OrderListView,
    VerifyUPIPaymentView,
)


urlpatterns = [

    path(
        "checkout/",
        CreateCheckoutView.as_view(),
        name="checkout",
    ),

    path(
        "<int:order_id>/verify-upi/",
        VerifyUPIPaymentView.as_view(),
        name="verify-upi",
    ),

    path(
        "",
        OrderListView.as_view(),
        name="order-list",
    ),

    path(
        "<int:order_id>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),
]