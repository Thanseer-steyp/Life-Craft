from django.urls import path
from .views import ( 
    SignupRequestView,
    LoginView,
    LoginOTPRequestView,
    LoginOTPVerificationView,PasswordResetConfirmView,
    PasswordResetOTPRequestView,SignupView,
    SignupOTPResendView,
)

urlpatterns = [
    path('signup-request/', SignupRequestView.as_view(), name='signup-request'),  # 🔹 add this
    path('signup-otp-verification/', SignupView.as_view(), name='signup-otp-verification'),
    path('signup-otp-resend/', SignupOTPResendView.as_view(), name='signup-otp-resend'),
    path('login/', LoginView.as_view(), name='login'),
    path('login-otp-request/', LoginOTPRequestView.as_view(), name='login-otp-request'),
    path('login-otp-verification/', LoginOTPVerificationView.as_view(), name='login-otp-verification'),
    path('password-reset-otp/', PasswordResetOTPRequestView.as_view(), name='password-reset-otp'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
