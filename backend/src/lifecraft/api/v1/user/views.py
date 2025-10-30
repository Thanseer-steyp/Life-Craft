from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import ProfileSerializer,AdvisorRequestSerializer,UserSerializer,AppointmentSerializer,UserDashboardSerializer
from user.models import AdvisorRequest,Appointment,Profile
from rest_framework.permissions import IsAuthenticated
from advisor.models import Advisor
from rest_framework.generics import ListAPIView, RetrieveAPIView
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from chatroom.models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer



class ProfileSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, context={"user": request.user})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            # Return empty/default structure instead of creating a profile
            return Response(
                {"message": "Profile not set up yet."}, status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, data=request.data, partial=True, context={"user": request.user})
        except Profile.DoesNotExist:
            # Create a new profile only when user submits data
            serializer = ProfileSerializer(data=request.data, context={"user": request.user})

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




class UserDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDashboardSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)



class AdvisorRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        exists = AdvisorRequest.objects.filter(user=request.user).exists()
        return Response({"requested": exists}, status=200)

    def post(self, request):
        data = request.data.copy()

        # ✅ Use full_name (not first_name)
        if not data.get("full_name"):
            # Use first_name + last_name from user if available
            full_name = f"{request.user.first_name}"
            data["full_name"] = request.user.first_name

        # ✅ Fix incorrect method call
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
        preferred_day = request.data.get("preferred_day")
        communication_method = request.data.get("communication_method")  # ✅ get from request

        try:
            advisor = Advisor.objects.get(id=advisor_id)
        except Advisor.DoesNotExist:
            return Response({"error": "Advisor not found"}, status=404)

        # ✅ Create appointment with preferred_day
        appointment = Appointment.objects.create(
            user=request.user,
            advisor=advisor,
            preferred_day=preferred_day,
            communication_method=communication_method,  # ✅ save selected date
        )

        # ✅ Send confirmation email
        send_mail(
            subject="Appointment Request Confirmation",
            message=f"""
            Dear {request.user.get_full_name() or request.user.username},

            Your appointment request with advisor {advisor.user.get_full_name() or advisor.user.username} 
            has been successfully submitted for {preferred_day} via {communication_method}.

            Our team or your advisor will reach out to confirm the exact schedule shortly.  
            Please keep an eye on your email for further updates.

            Best regards,  
            The Support Team
            """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[request.user.email],
            fail_silently=False,
        )

        return Response(AppointmentSerializer(appointment).data, status=201)

    
class CheckAppointmentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, advisor_id):
        try:
            appointment = Appointment.objects.filter(
                user=request.user, advisor__id=advisor_id
            ).order_by("-created_at").first()

            if not appointment:
                return Response({"status": None}, status=status.HTTP_200_OK)

            return Response({"status": appointment.status}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class UserAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.filter(user=request.user).order_by("-created_at")
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ChatRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        try:
            chatroom, created = ChatRoom.objects.get_or_create(
                appointment_id=appointment_id,
                defaults={
                    "user": Appointment.objects.get(id=appointment_id).user,
                    "advisor": Appointment.objects.get(id=appointment_id).advisor,
                }
            )
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found"}, status=404)

        if request.user not in [chatroom.user, chatroom.advisor]:
            return Response({"detail": "Access denied"}, status=403)

        serializer = ChatRoomSerializer(chatroom)
        return Response(serializer.data)

    def post(self, request, appointment_id):
        try:
            chatroom = ChatRoom.objects.get(appointment_id=appointment_id)
        except ChatRoom.DoesNotExist:
            return Response({"detail": "Chatroom not found"}, status=404)

        if request.user not in [chatroom.user, chatroom.advisor]:
            return Response({"detail": "Access denied"}, status=403)

        content = request.data.get("content")
        if not content:
            return Response({"detail": "Message content is required"}, status=400)

        message = Message.objects.create(
            chatroom=chatroom,
            sender=request.user,
            content=content
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=201)


class MarkMessagesReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        try:
            chatroom = ChatRoom.objects.get(appointment_id=appointment_id)
        except ChatRoom.DoesNotExist:
            return Response({"detail": "Chatroom not found"}, status=404)

        # Only user or advisor of this chatroom can mark messages as read
        if request.user not in [chatroom.user, chatroom.advisor]:
            return Response({"detail": "Access denied"}, status=403)

        # Mark all messages from the other user as read
        Message.objects.filter(
            chatroom=chatroom
        ).exclude(sender=request.user).update(is_read=True)

        return Response({"detail": "Messages marked as read"}, status=200)
