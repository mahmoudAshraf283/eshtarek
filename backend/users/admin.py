from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Tenant, SubscriptionPlan, Subscription

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'tenant', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active', 'tenant')
    search_fields = ('username', 'email', 'tenant__name')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Custom fields', {'fields': ('role', 'tenant')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'tenant'),
        }),
    )

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'subscription_status', 'user_count')
    search_fields = ('name',)
    list_filter = ('created_at', 'subscription__active')
    
    def subscription_status(self, obj):
        if hasattr(obj, 'subscription'):
            status = "Active" if obj.subscription.active else "Inactive"
            plan = obj.subscription.plan.name
            color = 'green' if obj.subscription.active else 'red'
            return format_html(
                '<span style="color: {}">{} - {}</span>',
                color, status, plan
            )
        return "No subscription"
    
    def user_count(self, obj):
        count = obj.user_set.count()
        if hasattr(obj, 'subscription'):
            max_users = obj.subscription.plan.max_users
            return format_html('{} / {}', count, max_users)
        return format_html('{}', count)

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'max_users', 'active_subscriptions', 'total_revenue')
    list_filter = ('name', 'price')
    search_fields = ('name', 'description')

    def active_subscriptions(self, obj):
        count = obj.subscription_set.filter(active=True).count()
        return format_html('<b>{}</b> active', count)
    
    def total_revenue(self, obj):
        active_subs = obj.subscription_set.filter(active=True).count()
        revenue = float(obj.price) * active_subs
        return format_html('${:.2} /month', revenue)

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'plan', 'start_date', 'end_date', 'active', 'usage_status')
    list_filter = ('active', 'plan', 'start_date')
    search_fields = ('tenant__name', 'plan__name')
    
    def usage_status(self, obj):
        user_count = obj.tenant.user_set.count()
        max_users = obj.plan.max_users
        percentage = (user_count / max_users) * 100 if max_users > 0 else 0
        
        if percentage < 80:
            color = 'green'
        elif percentage < 100:
            color = 'orange'
        else:
            color = 'red'
            
        return format_html(
            '<div style="color: {}">{} / {} users ({}%)</div>',
            color, user_count, max_users, int(percentage)
        )
