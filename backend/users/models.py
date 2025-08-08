from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser

class Tenant(models.Model):
    name = models.CharField(max_length=255, unique=True)
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

    def __str__(self):
        return self.name

class Subscription(models.Model):
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name="subscription")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.tenant} - {self.plan}"

class User(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True, related_name="users")
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("tenant_user", "Tenant User"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="tenant_user")

    def __str__(self):
        return self.username
