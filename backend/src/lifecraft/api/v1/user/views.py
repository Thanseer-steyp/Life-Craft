from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import ProfileSerializer,UserDashboardSerializer,DreamSetupSerializer,AdvisorRequestSerializer
from user.models import AdvisorRequest



class ProfileSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        if profile:
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class UserDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDashboardSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)



class DreamSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        dreams = DreamSetup.objects.filter(user=request.user)
        serializer = DreamSetupSerializer(dreams, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DreamSetupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class AdvisorRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        exists = AdvisorRequest.objects.filter(user=request.user).exists()
        return Response({"requested": exists}, status=200)

    def post(self, request):
        profile = getattr(request.user, "profile", None)
        age = getattr(profile, "age", None)
        if age is None:
            return Response(
                {"error": "Please complete your profile to submit advisor request"},
                status=400,
            )

        # Manually add name and age into serializer context
        data = request.data.copy()
        data["name"] = request.user.first_name or request.user.username
        data["age"] = age

        serializer = AdvisorRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"message": "Advisor request submitted successfully"}, status=201
            )
        return Response(serializer.errors, status=400)



