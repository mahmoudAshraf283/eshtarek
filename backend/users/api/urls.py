from django.urls import path
from .views import (
    RegisterView, CustomTokenObtainPairView, LogoutView,
    SubscriptionPlanListView, CreateSubscriptionView,
)
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('subscription-plans/', SubscriptionPlanListView.as_view(), name='subscription-plans'),
    path('subscriptions/', CreateSubscriptionView.as_view(), name='create-subscription'),
]