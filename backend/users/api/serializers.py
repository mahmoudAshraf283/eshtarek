from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Tenant, SubscriptionPlan, Subscription
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    tenant_name = serializers.CharField(write_only=True)
    is_tenant_owner = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = ("username", "email", "password", "tenant_name", "is_tenant_owner")

    def create(self, validated_data):
        tenant_name = validated_data.pop('tenant_name')
        password = validated_data.pop('password')
        is_tenant_owner = validated_data.pop('is_tenant_owner', False)
        
        tenant, _ = Tenant.objects.get_or_create(name=tenant_name)
        
        # Check user limits if tenant has subscription
        if hasattr(tenant, 'subscription') and not is_tenant_owner:
            current_user_count = tenant.user_set.count()
            max_users = tenant.subscription.plan.max_users
            
            if current_user_count >= max_users:
                raise serializers.ValidationError(
                    f"This tenant has reached its maximum user limit of {max_users}"
                )
        
        user = User.objects.create(
            **validated_data,
            tenant=tenant,
            role='tenant_owner' if is_tenant_owner else 'tenant_user'
        )
        
        user.set_password(password)
        user.save()
        
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token["username"] = user.username
        token["is_superuser"] = user.is_superuser
        token["is_staff"] = user.is_staff
        token["role"] = user.role
        
        if user.tenant:
            token["tenant_name"] = user.tenant.name
            if hasattr(user.tenant, 'subscription'):
                token["subscription"] = {
                    "plan_id": user.tenant.subscription.plan.id,
                    "plan_name": user.tenant.subscription.plan.name,
                    "status": "active" if user.tenant.subscription.active else "inactive",
                    "features": user.tenant.subscription.plan.features.split(','),
                    "end_date": user.tenant.subscription.end_date.isoformat() if user.tenant.subscription.end_date else None
                }
        
        return token

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'price', 'description', 'max_users']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'