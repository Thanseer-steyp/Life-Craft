from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from advisor.models import Advisor,AdvisorAvailability
from rest_framework import permissions, status
from .serializers import AdvisorSerializer,AdvisorAvailabilitySerializer
from user.models import Appointment
from chatroom.models import ChatRoom
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
        # Check if current user is an advisor
        try:
            advisor = Advisor.objects.get(user=request.user)
        except Advisor.DoesNotExist:
            return Response({"error": "Not an advisor"}, status=status.HTTP_403_FORBIDDEN)
        try:
            appointment = Appointment.objects.get(id=appointment_id, advisor=advisor)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")

        if action == "decline":
            appointment.status = "declined"
            appointment.decline_message = request.data.get("decline_message", "")
            appointment.save()  
            return Response({"message": "Appointment declined"}, status=status.HTTP_200_OK)

        elif action == "accept":
            appointment.status = "accepted"
            appointment.preferred_time = request.data.get("preferred_time")
            appointment.save() 
            
            chatroom, created = ChatRoom.objects.get_or_create(
                appointment=appointment,
                defaults={
                    "user": appointment.user,
                    "advisor": appointment.advisor.user
                }
            )

            data = AppointmentSerializer(appointment).data
            data['chatroom_id'] = chatroom.id  # return chatroom id to frontend

            return Response(data, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        


class AdvisorAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            advisor = Advisor.objects.get(user=request.user)
        except Advisor.DoesNotExist:
            return Response({"error": "Not an advisor"}, status=403)

        availabilities = AdvisorAvailability.objects.filter(advisor=advisor)
        serializer = AdvisorAvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data, status=200)

    def put(self, request):
        try:
            advisor = Advisor.objects.get(user=request.user)
        except Advisor.DoesNotExist:
            return Response({"error": "Not an advisor"}, status=403)

        day = request.data.get("day")
        if not day:
            return Response({"error": "Day field is required"}, status=400)

        availability, _ = AdvisorAvailability.objects.get_or_create(
            advisor=advisor, day=day
        )

        serializer = AdvisorAvailabilitySerializer(availability, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"{day.capitalize()} availability updated"}, status=200)
        return Response(serializer.errors, status=400)
