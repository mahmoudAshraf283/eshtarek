from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('tenant_owner', 'Tenant Owner'),  
        ('tenant_user', 'Tenant User'),
    )
    
    role = models.CharField(max_length=20, choices=ROLES, default='tenant_user')
    tenant = models.ForeignKey(
        'Tenant',
        on_delete=models.CASCADE,
        null=True,  
        blank=True
    )

    def save(self, *args, **kwargs):

        if self.is_superuser or self.is_staff:
            self.role = 'admin'

        elif not self.tenant:
            raise ValueError("Tenant is required for non-admin users")
        super().save(*args, **kwargs)

class Tenant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class SubscriptionPlan(models.Model):
    PLAN_CHOICES = [
        ("free", "Free"),
        ("pro", "Pro"),
        ("enterprise", "Enterprise"),
    ]
    name = models.CharField(max_length=50, choices=PLAN_CHOICES, unique=True)
    max_users = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)
    description = models.TextField(blank=True)
    features = models.TextField(help_text="Comma-separated list of features")
    
    def __str__(self):
        return f"{self.name} (${self.price}/month)"

class Subscription(models.Model):
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name="subscription")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.end_date:

            self.end_date = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tenant} - {self.plan}"
