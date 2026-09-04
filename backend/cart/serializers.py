# pyrefly: ignore [missing-import]
from rest_framework import serializers

from products.serializers import ProductVariantSerializer

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer(
        read_only=True
    )

    total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "variant",
            "quantity",
            "total",
        ]

    def get_total(self, obj):
        price = (
            obj.variant.price_override
            if obj.variant.price_override is not None
            else obj.variant.product.price
        )

        return price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total",
        ]

    def get_total(self, obj):
        total = 0

        for item in obj.items.all():
            price = (
                item.variant.price_override
                if item.variant.price_override is not None
                else item.variant.product.price
            )

            total += price * item.quantity

        return total