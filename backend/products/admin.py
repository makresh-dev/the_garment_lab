# pyrefly: ignore [missing-import]
from django.contrib import admin

from .models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
)


# --------------------------------
# Product Images
# --------------------------------

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

    fields = (
        "image",
        "alt_text",
        "is_primary",
    )


# --------------------------------
# Product Variants
# --------------------------------

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

    fields = (
        "size",
        "color",
        "sku",
        "stock",
        "price_override",
        "is_active",
    )


# --------------------------------
# Category
# --------------------------------

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "slug",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }


# --------------------------------
# Product
# --------------------------------

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "brand",
        "category",
        "price",
        "discount_price",
        "is_active",
        "created_at",
    )

    list_filter = (
        "category",
        "brand",
        "is_active",
    )

    search_fields = (
        "name",
        "brand",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    inlines = [
        ProductVariantInline,
        ProductImageInline,
    ]

    fieldsets = (
        (
            "Product Information",
            {
                "fields": (
                    "category",
                    "name",
                    "slug",
                    "brand",
                    "description",
                )
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "price",
                    "discount_price",
                )
            },
        ),
        (
            "Availability",
            {
                "fields": (
                    "is_active",
                )
            },
        ),
    )


# --------------------------------
# Product Image
# --------------------------------

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "is_primary",
        "created_at",
    )

    list_filter = (
        "is_primary",
    )

    search_fields = (
        "product__name",
    )


# --------------------------------
# Product Variant
# --------------------------------

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "sku",
        "size",
        "color",
        "stock",
        "price_override",
        "is_active",
    )

    list_filter = (
        "size",
        "color",
        "is_active",
    )

    search_fields = (
        "sku",
        "product__name",
    )