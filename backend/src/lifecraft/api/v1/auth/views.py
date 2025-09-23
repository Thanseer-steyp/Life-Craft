from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from register.models import EmailOTP
from .serializers import SignupSerializer, LoginSerializer, PasswordResetConfirmSerializer, PasswordResetRequestSerializer


class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "status_code": 6000,
                "message": "Account created successfully",
                "data": {
                    "username": user.username,
                    "email": user.email,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        "status_code": 6000,
                        "message": "Login successful",
                        "data": {
                            "username": user.username,
                            "email": user.email,
                            "access": str(refresh.access_token),
                            "refresh": str(refresh)
                        }
                    })
                else:
                    raise Exception()
            except:
                return Response({"status_code": 6001, "error": "Invalid credentials"},
                                status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class OTPRequestView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not User.objects.filter(email=email).exists():
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        otp_obj, created = EmailOTP.objects.get_or_create(email=email)

        # ✅ check cooldown
        if not created and otp_obj.last_sent and timezone.now() - otp_obj.last_sent < timedelta(seconds=30):
            remaining = 30 - (timezone.now() - otp_obj.last_sent).seconds
            return Response({"error": f"Please wait {remaining} seconds before resending OTP"}, status=400)

        otp = otp_obj.generate_otp()

        try:
            send_mail(
                subject="Your OTP Code",
                message=f"Your OTP is {otp}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)

        return Response({"message": "OTP sent successfully"}, status=200)


class OTPVerifyView(APIView):
    def post(self, request):
        email = request.data.get("email")
        entered_otp = request.data.get("otp")
        if not email or not entered_otp:
            return Response({"error": "Email and OTP are required"}, status=400)

        try:
            otp_obj = EmailOTP.objects.get(email=email)
        except EmailOTP.DoesNotExist:
            return Response({"error": "OTP not requested for this email"}, status=400)

        if otp_obj.otp == entered_otp:
            otp_obj.validated = True
            otp_obj.save()
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "OTP verified successfully",
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            })
        return Response({"error": "Invalid OTP"}, status=400)



class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            otp_obj, _ = EmailOTP.objects.get_or_create(email=email)
            otp = otp_obj.generate_otp()

            try:
                send_mail(
                    subject="Password Reset OTP",
                    message=f"Your password reset OTP is {otp}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)

            return Response({"message": "Password reset OTP sent to email"})
        return Response(serializer.errors, status=400)


class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']

            try:
                otp_obj = EmailOTP.objects.get(email=email)
            except EmailOTP.DoesNotExist:
                return Response({"error": "OTP not requested for this email"}, status=400)

            # Validate OTP
            if otp_obj.otp != otp:
                return Response({"error": "Invalid OTP"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            # Reset password
            user.set_password(new_password)
            user.save()

            # Invalidate OTP after success
            otp_obj.delete()

            return Response({"message": "Password reset successful"})
        return Response(serializer.errors, status=400)