from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
# 1. Custom User Model
class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    is_customer = models.BooleanField(default=False)
    is_provider = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

# 2. Service Architecture
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class SubService(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='sub_services')
    name = models.CharField(max_length=200)
    base_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.category.name} - {self.name}"

# 3. User Profiles
class CustomerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='customer_profile')
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    def __str__(self):
        return self.full_name

class ProviderProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='provider_profile')
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='providers')
    experience_years = models.PositiveIntegerField(default=0)
    service_areas = models.TextField(help_text="E.g., Mumbai, Navi Mumbai, Thane")
    available_days = models.CharField(max_length=100, help_text="E.g., Mon, Tue, Wed")
    available_timing = models.CharField(max_length=50, help_text="E.g., 09:00 AM - 05:00 PM")
    is_approved = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.full_name} ({self.category.name if self.category else 'Unassigned'})"

# 4. Transactions
class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ]

    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='bookings')
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='bookings')
    sub_service = models.ForeignKey(SubService, on_delete=models.SET_NULL, null=True)
    service_address = models.TextField(help_text="The exact address where the provider needs to go")
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    job_notes = models.TextField(blank=True, help_text="Specific issues or landmark details")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking #{self.id} - {self.status}"

class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for Booking #{self.booking.id} - {self.rating} Stars"


class ProviderWork(models.Model):
    # 'related_name' is the magic word that lets us grab the images directly from the provider's profile!
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='past_works')
    image = models.ImageField(upload_to='portfolio_pics/')
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Portfolio Image for {self.provider.full_name}"