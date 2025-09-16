from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import SignupSerializer, LoginSerializer

User = get_user_model()

class SignupView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
         # Check if username exists
        if username and User.objects.filter(username=username).exists():
            return Response(
                {
                    "status_code" : 6001,
                    "error": "Username already taken",
                    "data" : {},
                    },
                status=status.HTTP_409_CONFLICT  
            )

        # Check if email exists
        if email and User.objects.filter(email=email).exists():
            return Response(
                {
                    "status_code" : 6001,
                    "error": "Email already exists",
                    "data" : {},
                    },
                status=status.HTTP_409_CONFLICT
            )
        
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "status_code" : 6000,
                "message": "Account created successfully",
                "data" : {
                    "first_name": user.first_name,
                    "username": user.username,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }
                
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(**serializer.validated_data)
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'status_code' : 6000,
                    "message": "Logged in successfully",
                    'data': {
                        'first_name': user.first_name,
                        'username': user.username,
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                })
            return Response({
                "status_code" : 6001,
                'error': 'Invalid credentials',
                'data': {}}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





