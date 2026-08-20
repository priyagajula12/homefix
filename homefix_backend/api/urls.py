from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView,
    CategoryViewSet,
    ProviderProfileViewSet,
    CustomerProfileViewSet,
    BookingViewSet,
    CustomAuthToken,password_reset_request, password_reset_confirm,
    ReviewViewSet,
    ProviderWorkViewSet
)

# The DefaultRouter automatically generates the URLs for our ViewSets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'providers', ProviderProfileViewSet, basename='provider')
router.register(r'customers', CustomerProfileViewSet, basename='customer')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet)
router.register(r'provider-works',ProviderWorkViewSet)

urlpatterns = [
    # Registration is a single endpoint, so we use a standard path
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('password-reset/', password_reset_request, name='password_reset_request'),
    path('password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
    # We include all the automatically generated ViewSet routes here
    path('', include(router.urls)),
]