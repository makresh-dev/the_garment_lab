# pyrefly: ignore [missing-import]
from decimal import Decimal

# pyrefly: ignore [missing-import]
from django.db import transaction

# pyrefly: ignore [missing-import]
from rest_framework import status

# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated

# pyrefly: ignore [missing-import]
from rest_framework.response import Response

# pyrefly: ignore [missing-import]
from rest_framework.views import APIView

from .services import verify_upi_payment

from cart.models import Cart
from products.models import ProductVariant

from .models import Order, OrderItem
from .serializers import OrderSerializer


class CreateCheckoutView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request):

        # --------------------------------
        # Get checkout data
        # --------------------------------

        shipping_name = request.data.get(
            "shipping_name"
        )

        shipping_phone = request.data.get(
            "shipping_phone"
        )

        shipping_address = request.data.get(
            "shipping_address"
        )

        shipping_city = request.data.get(
            "shipping_city"
        )

        shipping_state = request.data.get(
            "shipping_state"
        )

        shipping_postal_code = request.data.get(
            "shipping_postal_code"
        )

        payment_method = request.data.get(
            "payment_method"
        )

        # --------------------------------
        # Validate payment method
        # --------------------------------

        allowed_payment_methods = [
            Order.PaymentMethod.COD,
            Order.PaymentMethod.UPI,
        ]

        if payment_method not in allowed_payment_methods:

            return Response(
                {
                    "error":
                        "Invalid payment method"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------
        # Validate shipping information
        # --------------------------------

        required_fields = {
            "shipping_name": shipping_name,
            "shipping_phone": shipping_phone,
            "shipping_address": shipping_address,
            "shipping_city": shipping_city,
            "shipping_state": shipping_state,
            "shipping_postal_code":
                shipping_postal_code,
        }

        missing_fields = [
            field
            for field, value
            in required_fields.items()
            if not value
        ]

        if missing_fields:

            return Response(
                {
                    "error":
                        "Missing required fields",

                    "fields":
                        missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------
        # Get cart
        # --------------------------------

        try:

            cart = (
                Cart.objects
                .prefetch_related(
                    "items__variant__product"
                )
                .get(
                    user=request.user
                )
            )

        except Cart.DoesNotExist:

            return Response(
                {
                    "error":
                        "Cart is empty"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_items = list(
            cart.items.all()
        )

        if not cart_items:

            return Response(
                {
                    "error":
                        "Cart is empty"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------
        # Get variant IDs
        # --------------------------------

        variant_ids = [
            item.variant_id
            for item in cart_items
        ]

        # --------------------------------
        # For COD:
        #
        # Lock inventory rows before
        # checking/reducing stock.
        #
        # For UPI:
        #
        # We only check current stock.
        # Stock will be checked AGAIN when
        # admin confirms payment.
        # --------------------------------

        if payment_method == Order.PaymentMethod.COD:

            variants = (
                ProductVariant.objects
                .select_related("product")
                .select_for_update()
                .filter(
                    id__in=variant_ids
                )
            )

        else:

            variants = (
                ProductVariant.objects
                .select_related("product")
                .filter(
                    id__in=variant_ids
                )
            )

        variant_map = {
            variant.id: variant
            for variant in variants
        }

        # --------------------------------
        # Calculate order total
        # --------------------------------

        subtotal = Decimal("0.00")

        order_items = []

        for cart_item in cart_items:

            variant = variant_map.get(
                cart_item.variant_id
            )

            # --------------------------------
            # Variant existence
            # --------------------------------

            if not variant:

                return Response(
                    {
                        "error":
                            "Product variant "
                            "no longer exists"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # --------------------------------
            # Product availability
            # --------------------------------

            if not variant.is_active:

                return Response(
                    {
                        "error":
                            f"{variant.product.name} "
                            "is no longer available"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # --------------------------------
            # Stock validation
            # --------------------------------

            if cart_item.quantity > variant.stock:

                return Response(
                    {
                        "error":
                            f"Only "
                            f"{variant.stock} "
                            f"units of "
                            f"{variant.product.name} "
                            "are available"
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            # --------------------------------
            # Determine actual price
            # --------------------------------

            price = (
                variant.price_override
                if variant.price_override is not None
                else variant.product.price
            )

            item_total = (
                price *
                cart_item.quantity
            )

            subtotal += item_total

            order_items.append(
                {
                    "variant": variant,

                    "product_name":
                        variant.product.name,

                    "size":
                        variant.size,

                    "color":
                        variant.color,

                    "price":
                        price,

                    "quantity":
                        cart_item.quantity,

                    "total":
                        item_total,
                }
            )

        # --------------------------------
        # Calculate final amount
        # --------------------------------

        discount = Decimal("0.00")

        shipping_cost = Decimal("0.00")

        total = (
            subtotal
            - discount
            + shipping_cost
        )

        # --------------------------------
        # Create Order
        # --------------------------------

        order = Order.objects.create(

            user=request.user,

            status=Order.Status.PENDING,

            payment_method=payment_method,

            payment_status=(
                Order.PaymentStatus.PENDING
            ),

            subtotal=subtotal,

            discount=discount,

            shipping_cost=shipping_cost,

            total=total,

            shipping_name=shipping_name,

            shipping_phone=shipping_phone,

            shipping_address=shipping_address,

            shipping_city=shipping_city,

            shipping_state=shipping_state,

            shipping_postal_code=
                shipping_postal_code,
        )

        # --------------------------------
        # Create OrderItems
        # --------------------------------

        for item in order_items:

            OrderItem.objects.create(
                order=order,
                **item,
            )

        # --------------------------------
        # COD
        # --------------------------------

        if payment_method == Order.PaymentMethod.COD:

            # --------------------------------
            # Reduce inventory
            #
            # The variants are locked because
            # we used select_for_update().
            # --------------------------------

            for item in order_items:

                variant = item["variant"]

                variant.stock -= item["quantity"]

                variant.save(
                    update_fields=[
                        "stock"
                    ]
                )

            # --------------------------------
            # Confirm order
            # --------------------------------

            order.status = (
                Order.Status.CONFIRMED
            )

            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        # --------------------------------
        # UPI
        # --------------------------------

        elif payment_method == Order.PaymentMethod.UPI:

            # --------------------------------
            # Don't reduce stock yet.
            #
            # Admin will verify the payment
            # first.
            # --------------------------------

            order.status = (
                Order.Status.PENDING
            )

            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        # --------------------------------
        # Clear cart
        # --------------------------------

        cart.items.all().delete()

        # --------------------------------
        # Return order
        # --------------------------------

        return Response(
            {
                "message":
                    "Order created successfully",

                "order":
                    OrderSerializer(
                        order
                    ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyUPIPaymentView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request, order_id):

                # --------------------------------
                # Check admin permission
                # --------------------------------

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                        "Admin permission required"
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # --------------------------------
        # Lock order
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

            return Response(
                {
                    "error":
                        "Order not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --------------------------------
        # Make sure this is a UPI order
        # --------------------------------

        if (
            order.payment_method
            != Order.PaymentMethod.UPI
        ):

            return Response(
                {
                    "error":
                        "This is not a UPI order"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------
        # Make sure payment is pending
        # --------------------------------

        if (
            order.payment_status
            != Order.PaymentStatus.PENDING
        ):

            return Response(
                {
                    "error":
                        "Payment is not pending"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------
        # Get variants
        # --------------------------------

        variant_ids = list(
            order.items.values_list(
                "variant_id",
                flat=True,
            )
        )

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
        # Check every variant
        # --------------------------------

        for item in order.items.all():

            variant = variant_map.get(
                item.variant_id
            )

            if not variant:

                return Response(
                    {
                        "error":
                            f"Variant for "
                            f"{item.product_name} "
                            "no longer exists"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not variant.is_active:

                return Response(
                    {
                        "error":
                            f"{item.product_name} "
                            "is no longer available"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if variant.stock < item.quantity:

                return Response(
                    {
                        "error":
                            f"Insufficient stock "
                            f"for {item.product_name}. "
                            f"Available: "
                            f"{variant.stock}, "
                            f"Required: "
                            f"{item.quantity}"
                    },
                    status=status.HTTP_409_CONFLICT,
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
        # Mark payment as paid
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

        # --------------------------------
        # Return updated order
        # --------------------------------

        return Response(
            {
                "message":
                    "UPI payment verified successfully",

                "order":
                    OrderSerializer(
                        order
                    ).data,
            },
            status=status.HTTP_200_OK,
        )

class VerifyUPIPaymentView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request,
        order_id,
    ):

        # --------------------------------
        # Admin only
        # --------------------------------

        if not request.user.is_staff:

            return Response(
                {
                    "error":
                        "Admin permission required"
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            order = verify_upi_payment(
                order_id
            )

        except ValueError as error:

            message = str(error)

            if message == "Order not found":

                return Response(
                    {
                        "error": message
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                {
                    "error": message
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message":
                    "UPI payment verified successfully",

                "order":
                    OrderSerializer(
                        order
                    ).data,
            },
            status=status.HTTP_200_OK,
        )


class OrderListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        orders = (
            Order.objects
            .filter(
                user=request.user
            )
            .prefetch_related(
                "items"
            )
            .order_by(
                "-created_at"
            )
        )

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(
            serializer.data
        )


class OrderDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        order_id
    ):

        try:

            order = (
                Order.objects
                .prefetch_related(
                    "items"
                )
                .get(
                    id=order_id,
                    user=request.user,
                )
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "error":
                        "Order not found"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderSerializer(
            order
        )

        return Response(
            serializer.data
        )