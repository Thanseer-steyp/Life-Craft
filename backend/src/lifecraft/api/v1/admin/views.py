from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from api.v1.user.serializers import AdvisorRequestSerializer
from user.models import AdvisorRequest
from api.v1.advisor.serializers import AdvisorSerializer
from advisor.models import Advisor



class AdminAdvisorRequestsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        pending_requests = AdvisorRequest.objects.filter(status='pending')
        serializer = AdvisorRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        request_id = request.data.get('id')
        action = request.data.get('action')  # "accept" or "decline"

        try:
            advisor_request = AdvisorRequest.objects.get(id=request_id)
        except AdvisorRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == "accept":
            if advisor_request.status != "pending":
                return Response({"error": "Request already processed"}, status=status.HTTP_400_BAD_REQUEST)

            # Create Advisor with all fields from AdvisorRequest
            advisor = Advisor.objects.create(
                user=advisor_request.user,
                profile_photo=advisor_request.profile_photo,
                full_name=advisor_request.full_name,
                age=advisor_request.age,
                gender=advisor_request.gender,
                email=advisor_request.email,
                phone_number=advisor_request.phone_number,
                country_address=advisor_request.country_address,
                state_address=advisor_request.state_address,
                language_preferences=advisor_request.language_preferences,
                advisor_type=advisor_request.advisor_type,
                experience_years=advisor_request.experience_years,
                company=advisor_request.company,
                designation=advisor_request.designation,
                highest_qualification=advisor_request.highest_qualification,
                specialized_in=advisor_request.specialized_in,
                educational_certificate=advisor_request.educational_certificate,
                previous_companies=advisor_request.previous_companies,
                resume=advisor_request.resume,
                govt_id_type=advisor_request.govt_id_type,
                govt_id_proof_id=advisor_request.govt_id_proof_id,
                govt_id_file=advisor_request.govt_id_file,
                confirm_details=advisor_request.confirm_details,
            )

            # Delete request after acceptance
            advisor_request.delete()

            serializer = AdvisorSerializer(advisor)
            return Response(
                {"message": "Advisor request accepted and deleted", "advisor": serializer.data},
                status=status.HTTP_200_OK
            )

        elif action == "decline":
            advisor_request.status = "declined"
            advisor_request.save()
            return Response({"message": "Advisor request declined"}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)