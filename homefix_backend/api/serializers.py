from rest_framework import serializers
from .models import Review
from .models import CustomUser, Category, SubService, CustomerProfile, ProviderProfile, Booking,ProviderWork

# 1. Category & Service Serializers (For the frontend Dashboard)
class SubServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubService
        fields = ['id', 'name', 'base_price']

class CategorySerializer(serializers.ModelSerializer):
    sub_services = SubServiceSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'sub_services']

# 2. User & Registration Serializer
class CustomUserSerializer(serializers.ModelSerializer):
    # Write-only password so it doesn't get sent back in API responses for security
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'password', 'is_customer', 'is_provider']

    def create(self, validated_data):
        # We override the create method to ensure the password gets hashed securely
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_customer=validated_data.get('is_customer', False),
            is_provider=validated_data.get('is_provider', False)
        )
        return user

# 3. Profile Serializers
class CustomerProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    # ADD THIS: Allows us to pass a user ID when creating a profile
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), 
        source='user', 
        write_only=True
    )

    class Meta:
        model = CustomerProfile
        fields = ['id', 'user', 'user_id', 'full_name', 'phone_number', 'address', 'profile_picture']

class ProviderWorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderWork
        fields = ['id', 'provider', 'image', 'description', 'created_at']

class ProviderProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), 
        source='user', 
        write_only=True
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    # 👇 ADD THIS LINE: It nests the 1-to-Many gallery relationship!
    past_works = ProviderWorkSerializer(many=True, read_only=True)

    class Meta:
        model = ProviderProfile
        # 👇 ADD 'past_works' TO THIS LIST 👇
        fields = [
            'id', 'user', 'user_id', 'full_name', 'phone_number', 'category', 
            'category_name', 'experience_years', 'service_areas', 
            'available_days', 'available_timing', 'is_approved', 'profile_picture', 'past_works','is_available'
        ]

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

# 5. Booking Serializer (Upgraded)
class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    provider_name = serializers.CharField(source='provider.full_name', read_only=True)
    
    # 👇 ADDED: Expose phone numbers so both sides can call each other!
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    provider_phone = serializers.CharField(source='provider.phone_number', read_only=True)
    
    sub_service_name = serializers.CharField(source='sub_service.name', read_only=True)
    sub_service_price = serializers.DecimalField(source='sub_service.base_price', max_digits=8, decimal_places=2, read_only=True)
    # 👇 ADDED: Nests the review inside the booking so React knows if it was already rated!
    review = ReviewSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']