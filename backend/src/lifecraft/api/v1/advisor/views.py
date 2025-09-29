from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from advisor.models import Advisor
from rest_framework import permissions, status
from .serializers import AdvisorSerializer
from user.models import Appointment
from api.v1.user.serializers import AppointmentSerializer


class AdvisorListView(APIView):
    def get(self, request):
        advisors = Advisor.objects.all()
        serializer = AdvisorSerializer(advisors, many=True)
        return Response(serializer.data)

class AppointmentInboxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            advisor = Advisor.objects.get(user=request.user)
        except Advisor.DoesNotExist:
            return Response({"error": "Not an advisor"}, status=status.HTTP_403_FORBIDDEN)

        appointments = Appointment.objects.filter(advisor=advisor).order_by("-created_at")
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class ManageAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        try:
            advisor = Advisor.objects.get(user=request.user)
        except Advisor.DoesNotExist:
            return Response({"error": "Not an advisor"}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id, advisor=advisor)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")  # "accept" or "decline"

        if action == "decline":
            appointment.status = "declined"
            appointment.save()
            return Response({"message": "Appointment declined"}, status=status.HTTP_200_OK)

        if action == "accept":
            appointment.status = "accepted"
            appointment.preferred_day = request.data.get("preferred_day")
            appointment.preferred_time = request.data.get("preferred_time")
            appointment.communication_method = request.data.get("communication_method")
            appointment.save()
            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)