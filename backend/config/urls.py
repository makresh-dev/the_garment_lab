# pyrefly: ignore [missing-import]
from django.conf import settings
# pyrefly: ignore [missing-import]
from django.conf.urls.static import static
# pyrefly: ignore [missing-import]
from django.contrib import admin
# pyrefly: ignore [missing-import]
from django.urls import include, path


# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
) 



urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/",
        include("products.urls")
    ),

    path(
        "api/cart/",
        include("cart.urls")
    ),
    path(
    "api/auth/token/",
    TokenObtainPairView.as_view(),
),

path(
    "api/auth/token/refresh/",
    TokenRefreshView.as_view(),
),
path(
    "api/orders/",
    include("orders.urls")
),
path(
    "api/auth/",
    include("accounts.urls"),
),

]



if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )