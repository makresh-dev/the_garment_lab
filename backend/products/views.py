from django_filters.rest_framework import DjangoFilterBackend
from .permissions import IsAdminOrReadOnly
# pyrefly: ignore [missing-import]
from rest_framework import filters, viewsets


from .filters import ProductFilter
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [
        IsAdminOrReadOnly
    ]

    lookup_field = "slug"
    
    queryset = (
        Product.objects
        .filter(is_active=True)
        .select_related("category")
        .prefetch_related(
            "images",
            "variants",
        )
    )

    serializer_class = ProductSerializer

    

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = ProductFilter

    search_fields = [
        "name",
        "brand",
        "description",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "name",
    ]

    ordering = [
        "-created_at"
    ]