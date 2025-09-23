from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from api.v1.user.serializers import AdvisorRequestSerializer
from user.models import AdvisorRequest
from django.contrib.auth.models import User
from advisor.models import Advisor

class AdminAdvisorRequestsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Fetch only pending requests
        pending_requests = AdvisorRequest.objects.filter(status='pending')
        serializer = AdvisorRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Accept or Decline action
        request_id = request.data.get('id')
        action = request.data.get('action')  # "accept" or "decline"

        try:
            advisor_request = AdvisorRequest.objects.get(id=request_id)
        except AdvisorRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "accept":
            advisor_request.status = "accepted"
            advisor_request.save()

            # Add to Advisors table
            Advisor.objects.create(
                user=advisor_request.user,
                email=advisor_request.user.email,
                username=advisor_request.user.username
            )

            return Response({"message": "Advisor request accepted"}, status=status.HTTP_200_OK)

        elif action == "decline":
            advisor_request.status = "declined"
            advisor_request.save()
            return Response({"message": "Advisor request declined"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

