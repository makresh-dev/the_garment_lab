# pyrefly: ignore [missing-import]
from rest_framework import serializers

from .models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "is_active",
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "alt_text",
            "is_primary",
        ]


class ProductVariantSerializer(
    serializers.ModelSerializer
):
    product = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant

        fields = [
            "id",
            "size",
            "color",
            "sku",
            "stock",
            "price_override",
            "is_active",
            "product",
        ]

    def get_product(self, obj):
        return {
            "id": obj.product.id,
            "name": obj.product.name,
            "slug": obj.product.slug,
            "brand": obj.product.brand,
            "price": str(obj.product.price),
            "discount_price": (
                str(obj.product.discount_price)
                if obj.product.discount_price
                is not None
                else None
            ),
        }


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "brand",
            "price",
            "discount_price",
            "category",
            "images",
            "variants",
            "is_active",
            "created_at",
            "updated_at",
        ]