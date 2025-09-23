# views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from advisor.models import Advisor

class AdvisorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        advisors = Advisor.objects.all()
        emails = [a.email for a in advisors]
        return Response({"emails": emails})
