
from .views import MergeGuestCartView
# pyrefly: ignore [missing-import]
from django.urls import path

from .views import (
    AddToCartView,
    CartView,
    GuestCartView,
    MergeGuestCartView,
    RemoveCartItemView,
    UpdateCartItemView,
)


urlpatterns = [
    path(
        "",
        CartView.as_view(),
        name="cart",
    ),

    path(
        "add/",
        AddToCartView.as_view(),
        name="cart-add",
    ),

    path(
        "items/<int:item_id>/",
        UpdateCartItemView.as_view(),
        name="cart-update",
    ),

    path(
        "items/<int:item_id>/remove/",
        RemoveCartItemView.as_view(),
        name="cart-remove",
    ),

    path(
        "guest/",
        GuestCartView.as_view(),
        name="guest-cart",
    ),

   path(
    "merge/",
    MergeGuestCartView.as_view(),
    name="merge-guest-cart",
),
]