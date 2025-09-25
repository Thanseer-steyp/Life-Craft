from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from advisor.models import Advisor
from rest_framework import permissions, status
from .serializers import AdvisorSerializer
from user.models import Message
from api.v1.user.serializers import MessageSerializer


class AdvisorListView(APIView):
    def get(self, request):
        advisors = Advisor.objects.all()
        serializer = AdvisorSerializer(advisors, many=True)
        return Response(serializer.data)

class InboxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            advisor = Advisor.objects.get(user=request.user)
        except Advisor.DoesNotExist:
            return Response({"error": "Not an advisor"}, status=status.HTTP_403_FORBIDDEN)

        messages = Message.objects.filter(receiver=advisor).order_by("-created_at")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)