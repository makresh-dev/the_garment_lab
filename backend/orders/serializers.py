# pyrefly: ignore [missing-import]
from rest_framework import serializers

from .models import Order, OrderItem


class OrderItemSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "size",
            "color",
            "price",
            "quantity",
            "total",
        ]


class OrderSerializer(
    serializers.ModelSerializer
):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
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
            "items",
            "created_at",
        ]