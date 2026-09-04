# pyrefly: ignore [missing-import]
from django.contrib import admin, messages

from .models import Order, OrderItem
from .services import (
    cancel_order,
    update_order_status,
    verify_upi_payment,
)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

    readonly_fields = (
        "product_name",
        "size",
        "color",
        "price",
        "quantity",
        "total",
    )


# --------------------------------
# UPI verification
# --------------------------------

@admin.action(
    description="Verify selected UPI payments"
)
def verify_selected_upi_payments(
    modeladmin,
    request,
    queryset,
):
    verified = 0

    for order in queryset:

        try:
            verify_upi_payment(order.id)
            verified += 1

        except ValueError as error:
            modeladmin.message_user(
                request,
                f"Order #{order.id}: {error}",
                level=messages.ERROR,
            )

    if verified:
        modeladmin.message_user(
            request,
            f"{verified} UPI payment(s) verified.",
            level=messages.SUCCESS,
        )


# --------------------------------
# Move to processing
# --------------------------------

@admin.action(
    description="Move selected orders to processing"
)
def mark_processing(
    modeladmin,
    request,
    queryset,
):
    updated = 0

    for order in queryset:

        try:
            update_order_status(
                order.id,
                Order.Status.PROCESSING,
            )

            updated += 1

        except ValueError as error:
            modeladmin.message_user(
                request,
                f"Order #{order.id}: {error}",
                level=messages.ERROR,
            )

    if updated:
        modeladmin.message_user(
            request,
            f"{updated} order(s) moved to processing.",
            level=messages.SUCCESS,
        )


# --------------------------------
# Mark shipped
# --------------------------------

@admin.action(
    description="Mark selected orders as shipped"
)
def mark_shipped(
    modeladmin,
    request,
    queryset,
):
    updated = 0

    for order in queryset:

        try:
            update_order_status(
                order.id,
                Order.Status.SHIPPED,
            )

            updated += 1

        except ValueError as error:
            modeladmin.message_user(
                request,
                f"Order #{order.id}: {error}",
                level=messages.ERROR,
            )

    if updated:
        modeladmin.message_user(
            request,
            f"{updated} order(s) marked as shipped.",
            level=messages.SUCCESS,
        )


# --------------------------------
# Mark delivered
# --------------------------------

@admin.action(
    description="Mark selected orders as delivered"
)
def mark_delivered(
    modeladmin,
    request,
    queryset,
):
    updated = 0

    for order in queryset:

        try:
            update_order_status(
                order.id,
                Order.Status.DELIVERED,
            )

            updated += 1

        except ValueError as error:
            modeladmin.message_user(
                request,
                f"Order #{order.id}: {error}",
                level=messages.ERROR,
            )

    if updated:
        modeladmin.message_user(
            request,
            f"{updated} order(s) marked as delivered.",
            level=messages.SUCCESS,
        )


# --------------------------------
# Cancel orders
# --------------------------------

@admin.action(
    description="Cancel selected orders"
)
def cancel_selected_orders(
    modeladmin,
    request,
    queryset,
):
    cancelled = 0

    for order in queryset:

        try:
            cancel_order(order.id)
            cancelled += 1

        except ValueError as error:
            modeladmin.message_user(
                request,
                f"Order #{order.id}: {error}",
                level=messages.ERROR,
            )

    if cancelled:
        modeladmin.message_user(
            request,
            f"{cancelled} order(s) cancelled.",
            level=messages.SUCCESS,
        )


# --------------------------------
# Order Admin
# --------------------------------

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "status",
        "payment_method",
        "payment_status",
        "total",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_method",
        "payment_status",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "shipping_name",
        "shipping_phone",
    )

    # --------------------------------
    # These values should not be
    # edited manually.
    # --------------------------------

    readonly_fields = (
        "user",
        "status",
        "payment_method",
        "payment_status",
        "subtotal",
        "discount",
        "shipping_cost",
        "total",
        "shipping_name",
        "shipping_phone",
        "shipping_address",
        "shipping_city",
        "shipping_state",
        "shipping_postal_code",
        "created_at",
        "updated_at",
    )

    inlines = (
        OrderItemInline,
    )

    actions = (
        verify_selected_upi_payments,
        mark_processing,
        mark_shipped,
        mark_delivered,
        cancel_selected_orders,
    )

    ordering = (
        "-created_at",
    )