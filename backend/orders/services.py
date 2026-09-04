# pyrefly: ignore [missing-import]
from django.db import transaction

from products.models import ProductVariant

from .models import Order


@transaction.atomic
def verify_upi_payment(order_id: int):

    # --------------------------------
    # Lock the order
    # --------------------------------

    try:
        order = (
            Order.objects
            .select_for_update()
            .get(
                id=order_id
            )
        )

    except Order.DoesNotExist:
        raise ValueError(
            "Order not found"
        )

    # --------------------------------
    # Make sure this is a UPI order
    # --------------------------------

    if (
        order.payment_method
        != Order.PaymentMethod.UPI
    ):
        raise ValueError(
            "This is not a UPI order"
        )

    # --------------------------------
    # Make sure payment is pending
    # --------------------------------

    if (
        order.payment_status
        != Order.PaymentStatus.PENDING
    ):
        raise ValueError(
            "Payment is not pending"
        )

    # --------------------------------
    # Get variant IDs
    # --------------------------------

    variant_ids = list(
        order.items.values_list(
            "variant_id",
            flat=True,
        )
    )

    # --------------------------------
    # Lock inventory rows
    # --------------------------------

    variants = (
        ProductVariant.objects
        .select_related("product")
        .select_for_update()
        .filter(
            id__in=variant_ids
        )
        .order_by("id")
    )

    variant_map = {
        variant.id: variant
        for variant in variants
    }

    # --------------------------------
    # Validate stock
    # --------------------------------

    for item in order.items.all():

        variant = variant_map.get(
            item.variant_id
        )

        if not variant:

            raise ValueError(
                f"Variant for "
                f"{item.product_name} "
                "no longer exists"
            )

        if not variant.is_active:

            raise ValueError(
                f"{item.product_name} "
                "is no longer available"
            )

        if variant.stock < item.quantity:

            raise ValueError(
                f"Insufficient stock for "
                f"{item.product_name}. "
                f"Available: {variant.stock}, "
                f"Required: {item.quantity}"
            )

    # --------------------------------
    # Reduce inventory
    # --------------------------------

    for item in order.items.all():

        variant = variant_map[
            item.variant_id
        ]

        variant.stock -= item.quantity

        variant.save(
            update_fields=[
                "stock"
            ]
        )

    # --------------------------------
    # Update order
    # --------------------------------

    order.payment_status = (
        Order.PaymentStatus.PAID
    )

    order.status = (
        Order.Status.CONFIRMED
    )

    order.save(
        update_fields=[
            "payment_status",
            "status",
            "updated_at",
        ]
    )

    return order



from products.models import ProductVariant

from .models import Order


@transaction.atomic
def update_order_status(
    order_id: int,
    new_status: str,
):
    """
    Update an order's status while enforcing
    valid status transitions.
    """

    order = (
        Order.objects
        .select_for_update()
        .get(
            id=order_id
        )
    )

    current_status = order.status

    valid_transitions = {
        Order.Status.PENDING: [
            Order.Status.CONFIRMED,
            Order.Status.CANCELLED,
        ],

        Order.Status.CONFIRMED: [
            Order.Status.PROCESSING,
            Order.Status.CANCELLED,
        ],

        Order.Status.PROCESSING: [
            Order.Status.SHIPPED,
            Order.Status.CANCELLED,
        ],

        Order.Status.SHIPPED: [
            Order.Status.DELIVERED,
        ],

        Order.Status.DELIVERED: [],

        Order.Status.CANCELLED: [],
    }

    allowed_statuses = valid_transitions.get(
        current_status,
        []
    )

    if new_status not in allowed_statuses:
        raise ValueError(
            f"Cannot change order status from "
            f"{current_status} to {new_status}"
        )

    order.status = new_status

    order.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return order



@transaction.atomic
def cancel_order(
    order_id: int,
):
    """
    Cancel an order and restore inventory
    when inventory had already been deducted.
    """

    order = (
        Order.objects
        .select_for_update()
        .get(
            id=order_id
        )
    )

    cancellable_statuses = [
        Order.Status.PENDING,
        Order.Status.CONFIRMED,
        Order.Status.PROCESSING,
    ]

    if order.status not in cancellable_statuses:
        raise ValueError(
            "This order cannot be cancelled."
        )

    variant_ids = list(
        order.items.values_list(
            "variant_id",
            flat=True,
        )
    )

    variants = (
        ProductVariant.objects
        .select_for_update()
        .filter(
            id__in=variant_ids
        )
        .order_by("id")
    )

    variant_map = {
        variant.id: variant
        for variant in variants
    }

    # --------------------------------
    # Restore stock only if the order
    # had already consumed inventory.
    #
    # UPI pending orders have NOT consumed
    # inventory yet.
    # --------------------------------

    should_restore_stock = (
        order.status != Order.Status.PENDING
        or order.payment_status
        == Order.PaymentStatus.PAID
    )

    if should_restore_stock:

        for item in order.items.all():

            variant = variant_map.get(
                item.variant_id
            )

            if variant:

                variant.stock += (
                    item.quantity
                )

                variant.save(
                    update_fields=[
                        "stock"
                    ]
                )

    order.status = (
        Order.Status.CANCELLED
    )

    # If payment was already received,
    # mark it as refunded for the MVP.
    #
    # Actual money refund processing is NOT
    # implemented here because we're using
    # manual UPI/COD.
    if (
        order.payment_status
        == Order.PaymentStatus.PAID
    ):

        order.payment_status = (
            Order.PaymentStatus.REFUNDED
        )

    order.save(
        update_fields=[
            "status",
            "payment_status",
            "updated_at",
        ]
    )

    return order