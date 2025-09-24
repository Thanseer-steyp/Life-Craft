from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from advisor.models import Advisor


class AdvisorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advisor
        fields = "__all__" 
