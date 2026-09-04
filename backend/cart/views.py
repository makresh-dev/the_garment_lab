# pyrefly: ignore [missing-import]
from decimal import Decimal
# pyrefly: ignore [missing-import]
from django.db import transaction
# pyrefly: ignore [missing-import]
from django.db.models import Prefetch
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView

from products.models import ProductVariant

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(
            user=user
        )

        return cart

    def get(self, request):
        cart = self.get_cart(request.user)

        cart = (
            Cart.objects
            .prefetch_related(
                "items__variant__product"
            )
            .get(pk=cart.pk)
        )

        serializer = CartSerializer(cart)

        return Response(serializer.data)
    

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        variant_id = request.data.get(
            "variant_id"
        )

        quantity = request.data.get(
            "quantity",
            1
        )

        if not variant_id:
            return Response(
                {
                    "error": "variant_id is required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {
                    "error": "quantity must be an integer"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {
                    "error": "quantity must be greater than 0"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            variant = ProductVariant.objects.get(
                id=variant_id,
                is_active=True,
                product__is_active=True,
            )
        except ProductVariant.DoesNotExist:
            return Response(
                {
                    "error": "Product variant not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        cart, _ = Cart.objects.get_or_create(
            user=request.user
        )

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            defaults={
                "quantity": quantity
            }
        )

        if not created:
            new_quantity = (
                item.quantity + quantity
            )

            if new_quantity > variant.stock:
                return Response(
                    {
                        "error": (
                            "Requested quantity exceeds "
                            "available stock"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            item.quantity = new_quantity
            item.save(
                update_fields=[
                    "quantity",
                    "updated_at",
                ]
            )

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )

class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        quantity = request.data.get("quantity")

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {
                    "error": "quantity must be an integer"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {
                    "error": "quantity must be greater than 0"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = CartItem.objects.select_related(
                "variant"
            ).get(
                id=item_id,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response(
                {
                    "error": "Cart item not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if quantity > item.variant.stock:
            return Response(
                {
                    "error": "Requested quantity exceeds stock"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity

        item.save(
            update_fields=[
                "quantity",
                "updated_at",
            ]
        )

        return Response(
            CartSerializer(item.cart).data
        )

class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user,
            )
        except CartItem.DoesNotExist:
            return Response(
                {
                    "error": "Cart item not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        cart = item.cart

        item.delete()

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_200_OK,
        )


class GuestCartView(APIView):

    permission_classes = []

    def post(self, request):

        items = request.data.get(
            "items",
            []
        )

        if not isinstance(items, list):
            return Response(
                {
                    "error":
                        "items must be a list"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = []
        total = Decimal("0.00")

        variant_ids = [
            item.get("variant_id")
            for item in items
            if item.get("variant_id")
        ]

        variants = (
            ProductVariant.objects
            .select_related("product")
            .filter(
                id__in=variant_ids,
                is_active=True,
                product__is_active=True,
            )
        )

        variant_map = {
            variant.id: variant
            for variant in variants
        }

        for item in items:

            variant_id = item.get(
                "variant_id"
            )

            quantity = item.get(
                "quantity",
                1
            )

            try:
                quantity = int(quantity)
            except (
                TypeError,
                ValueError,
            ):
                continue

            if quantity <= 0:
                continue

            variant = variant_map.get(
                variant_id
            )

            if not variant:
                continue

            if quantity > variant.stock:
                quantity = variant.stock

            price = (
                variant.price_override
                if variant.price_override
                is not None
                else variant.product.price
            )

            item_total = (
                price * quantity
            )

            total += item_total

            result.append(
                {
                    "variant_id":
                        variant.id,

                    "quantity":
                        quantity,

                    "product_name":
                        variant.product.name,

                    "brand":
                        variant.product.brand,

                    "slug":
                        variant.product.slug,

                    "size":
                        variant.size,

                    "color":
                        variant.color,

                    "price":
                        str(price),

                    "stock":
                        variant.stock,

                    "total":
                        str(item_total),
                }
            )

        return Response(
            {
                "items": result,
                "total": str(total),
            }
        )


class MergeGuestCartView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        items = request.data.get("items", [])

        if not isinstance(items, list):
            return Response(
                {
                    "error": "items must be a list"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)

        variant_ids = []
        for guest_item in items:
            variant_id = guest_item.get("variant_id")
            if variant_id is not None:
                try:
                    variant_ids.append(int(variant_id))
                except (TypeError, ValueError):
                    pass

        if not variant_ids:
            return Response(
                {
                    "error": "No valid variant IDs provided"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        variants = ProductVariant.objects.select_related("product").filter(
            id__in=variant_ids,
            is_active=True,
            product__is_active=True,
        )

        variant_map = {variant.id: variant for variant in variants}
        current_cart_items = CartItem.objects.filter(
            cart=cart,
            variant_id__in=variant_map.keys()
        )
        existing_quantities = {
            item.variant_id: item.quantity for item in current_cart_items
        }

        for guest_item in items:
            variant_id = guest_item.get("variant_id")
            quantity = guest_item.get("quantity", 1)

            try:
                variant_id = int(variant_id)
                quantity = int(quantity)
            except (TypeError, ValueError):
                continue

            if quantity <= 0:
                continue

            if variant_id not in variant_map:
                continue

            variant = variant_map[variant_id]

            if quantity > variant.stock:
                return Response(
                    {
                        "error": f"Only {variant.stock} units of {variant.product.name} are available"
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            existing_quantity = existing_quantities.get(variant_id, 0)
            new_quantity = existing_quantity + quantity

            if new_quantity > variant.stock:
                return Response(
                    {
                        "error": f"Only {variant.stock} units of {variant.product.name} are available"
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            existing_item = current_cart_items.filter(variant=variant).first()
            if existing_item:
                existing_item.quantity = new_quantity
                existing_item.save(
                    update_fields=["quantity", "updated_at"]
                )
            else:
                CartItem.objects.create(
                    cart=cart,
                    variant=variant,
                    quantity=quantity,
                )

        return Response(
            {
                "message": "Guest cart merged successfully"
            },
            status=status.HTTP_200_OK,
        )
