from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import ProfileSerializer,UserDashboardSerializer,DreamSetupSerializer,AdvisorRequestSerializer,UserSerializer,AppointmentSerializer
from user.models import AdvisorRequest,DreamSetup,Appointment
from rest_framework.permissions import IsAuthenticated
from advisor.models import Advisor
from rest_framework.generics import ListAPIView, RetrieveAPIView
from django.contrib.auth.models import User



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
        data = request.data.copy()

        # Take full_name & email from user if not given
        if not data.get("full_name"):
            data["full_name"] = request.user.get_full_name() or request.user.username
        if not data.get("email"):
            data["email"] = request.user.email

        serializer = AdvisorRequestSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"message": "Advisor request submitted successfully"}, status=201
            )
        return Response(serializer.errors, status=400)







class ClientsListView(ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        advisor_user_ids = Advisor.objects.values_list("user_id", flat=True)
        return (
            User.objects.exclude(id__in=advisor_user_ids)
                        .exclude(is_superuser=True)
        )


class ClientDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = "id"


class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        advisor_id = request.data.get("advisor_id")
        try:
            advisor = Advisor.objects.get(id=advisor_id)
        except Advisor.DoesNotExist:
            return Response({"error": "Advisor not found"}, status=404)

        appointment = Appointment.objects.create(
            user=request.user,
            advisor=advisor,
        )
        return Response(AppointmentSerializer(appointment).data, status=201)
    

class UserAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.filter(user=request.user).order_by("-created_at")
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)