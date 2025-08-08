from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, SubscriptionPlanSerializer, SubscriptionSerializer
from ..models import Tenant, SubscriptionPlan, Subscription
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:

                pass

            return Response(
                {"message": "Logged out successfully."}, 
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:

            return Response(
                {"message": "Logged out successfully."}, 
                status=status.HTTP_205_RESET_CONTENT
            )

class SubscriptionPlanListView(generics.ListAPIView):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class CreateSubscriptionView(generics.CreateAPIView):
    def create(self, request, *args, **kwargs):
        try:

            if request.user.role != 'tenant_owner':
                return Response(
                    {"error": "Only tenant owners can manage subscriptions."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            plan_id = request.data.get('plan')
            payment_id = request.data.get('payment_id')

            if not plan_id or not payment_id:
                return Response(
                    {"error": "Plan ID and payment ID are required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            plan = SubscriptionPlan.objects.get(id=plan_id)
            tenant = request.user.tenant
            current_user_count = tenant.user_set.count()


            if current_user_count > plan.max_users:
                return Response(
                    {
                        "error": (
                            f"Unable to downgrade to {plan.name} plan. "
                            f"You currently have {current_user_count} users, but this plan "
                            f"only supports {plan.max_users} users. Please remove "
                            f"{current_user_count - plan.max_users} users before downgrading."
                        )
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )


            if hasattr(tenant, 'subscription'):

                subscription = tenant.subscription
                subscription.plan = plan
                subscription.start_date = timezone.now()
                subscription.end_date = timezone.now() + timedelta(days=30)
                subscription.payment_id = payment_id
                subscription.save()
            else:

                subscription = Subscription.objects.create(
                    tenant=tenant,
                    plan=plan,
                    active=True,
                    end_date=timezone.now() + timedelta(days=30),
                    payment_id=payment_id
                )


            refresh = RefreshToken.for_user(request.user)
            token = CustomTokenObtainPairSerializer.get_token(request.user)

            return Response({
                'message': 'Subscription updated successfully.',
                'access': str(token.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

