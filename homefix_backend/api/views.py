from rest_framework import viewsets, generics, permissions
from .models import CustomUser, Category, SubService, CustomerProfile, ProviderProfile, Booking,Review,ProviderWork
from .serializers import (
    CustomUserSerializer, 
    CategorySerializer, 
    SubServiceSerializer,
    CustomerProfileSerializer, 
    ProviderProfileSerializer, 
    BookingSerializer,
    ReviewSerializer,
    ProviderWorkSerializer
)
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# 1. User Registration Endpoint
class UserRegistrationView(generics.CreateAPIView):
    """
    Handles POST requests to create a new user. 
    Inheriting from CreateAPIView automatically wires up the creation logic.
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can register

# 2. Categories Endpoint (Read-Only)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Customers and Providers just need to view categories, not create them.
    ReadOnlyModelViewSet restricts this endpoint to GET requests.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

# 3. Provider Profiles Endpoint
class ProviderProfileViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet automatically creates endpoints for GET (list/detail), 
    POST (create), PUT (update), and DELETE.
    """
    queryset = ProviderProfile.objects.all()
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.AllowAny] # We will lock this down with tokens later

# 4. Customer Profiles Endpoint
class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.AllowAny]

# 5. Bookings Endpoint
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

# 6. Reviews Endpoint
class ReviewViewSet(viewsets.ModelViewSet):
    """
    Allows customers to post reviews for completed bookings.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

# 7. Login Endpoint
class CustomAuthToken(ObtainAuthToken):
    """
    Takes an email and password, verifies them, and returns a secure token
    along with the user's role flags to help React route them properly.
    """
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Verify the user against the database
        user = authenticate(request, email=email, password=password)
        
        if not user:
            raise AuthenticationFailed("Invalid email or password")
            
        # Get or generate the security token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'is_customer': user.is_customer,
            'is_provider': user.is_provider
        })

@api_view(['POST'])
def password_reset_request(request):  # Fixed parameter name to 'request'
    email = request.data.get('email')
    try:
        user = CustomUser.objects.get(email=email) # Changed from User to CustomUser
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        reset_link = f"http://localhost:5173/reset-password?uid={uid}&token={token}"
        print(f"\n--- PASSWORD RESET LINK FOR {email} ---\n{reset_link}\n------------------------------------------\n")
        
        return Response({"message": "Password reset link generated. Check your Django terminal!"}, status=status.HTTP_200_OK)
    except CustomUser.DoesNotExist: # Changed from User to CustomUser
        return Response({"message": "If an account with that email exists, a reset link has been sent."}, status=status.HTTP_200_OK)

@api_view(['POST'])
def password_reset_confirm(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = CustomUser.objects.get(pk=user_id) # Changed from User to CustomUser
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password reset successfully!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
    except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist): # Changed from User to CustomUser
        return Response({"error": "Invalid token or user ID."}, status=status.HTTP_400_BAD_REQUEST)



# 7. Provider Past Works Endpoint
class ProviderWorkViewSet(viewsets.ModelViewSet):
    queryset = ProviderWork.objects.all()
    serializer_class = ProviderWorkSerializer