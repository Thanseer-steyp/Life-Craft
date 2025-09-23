from django.urls import path
from .views import SignupView, LoginView, OTPRequestView, OTPVerifyView,PasswordResetConfirmView,PasswordResetRequestView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('otp-request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp-verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
