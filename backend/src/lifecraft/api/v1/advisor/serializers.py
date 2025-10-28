from rest_framework import serializers
from advisor.models import Advisor,AdvisorAvailability

class AdvisorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvisorAvailability
        fields = ["id", "day", "is_available", "total_slots", "time_range"]


class AdvisorSerializer(serializers.ModelSerializer):
    availability = AdvisorAvailabilitySerializer(
        many=True, read_only=True, source="availabilities"
    )
    
    class Meta:
        model = Advisor
        fields = "__all__" 



