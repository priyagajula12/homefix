from django.contrib import admin
from .models import (
    CustomUser,
    Category,
    SubService,
    CustomerProfile,
    ProviderProfile,
    Booking,
    Review
)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_customer', 'is_provider', 'is_staff', 'is_active')
    list_filter = ('is_customer', 'is_provider', 'is_staff', 'is_active')
    search_fields = ('email',)
    ordering = ('email',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(SubService)
class SubServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'base_price')
    list_filter = ('category',)
    search_fields = ('name', 'category__name')

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'user', 'phone_number')
    search_fields = ('full_name', 'user__email', 'phone_number')

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'category', 'phone_number', 'experience_years', 'is_approved')
    list_filter = ('category', 'is_approved')
    search_fields = ('full_name', 'user__email', 'phone_number', 'service_areas')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'provider', 'sub_service', 'scheduled_date', 'status', 'created_at')
    list_filter = ('status', 'scheduled_date')
    search_fields = ('customer__full_name', 'provider__full_name', 'service_address')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'rating', 'created_at')
    list_filter = ('rating',)
