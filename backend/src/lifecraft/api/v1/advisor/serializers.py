from rest_framework import serializers
from advisor.models import Advisor,AdvisorAvailability,AdvisorRating
from django.db import models


class AdvisorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvisorAvailability
        fields = ["id", "day", "is_available", "total_slots", "time_range"]


class AdvisorSerializer(serializers.ModelSerializer):
    availability = AdvisorAvailabilitySerializer(
        many=True, read_only=True, source="availabilities"
    )
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Advisor
        fields = "__all__" 
        extra_fields = ["average_rating"]

    def get_average_rating(self, obj):
        avg = obj.ratings.aggregate(models.Avg('rating'))['rating__avg']
        return round(avg or 0, 2)







class AdvisorRatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)  # ✅ Add this

    class Meta:
        model = AdvisorRating
        fields = ["id", "advisor", "user", "user_id", "rating", "review", "created_at"]
