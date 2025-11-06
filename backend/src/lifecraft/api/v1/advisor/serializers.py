from rest_framework import serializers
from advisor.models import Advisor,AdvisorAvailability,AdvisorReview
from user.models import Appointment
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







class AdvisorReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = AdvisorReview
        fields = ["id", "user", "user_id", "review", "created_at"]


class AppointmentWithRatingSerializer(serializers.ModelSerializer):
    rating_given = serializers.SerializerMethodField()
    rating_value = serializers.SerializerMethodField()
    advisor_name = serializers.CharField(source="advisor.full_name", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "advisor_name",
            "preferred_day",
            "preferred_time",
            "communication_method",
            "status",
            "is_attended",
            "rating_given",
            "rating_value",
        ]

    def get_rating_given(self, obj):
        # Return True if rating exists
        return hasattr(obj, "rating")

    def get_rating_value(self, obj):
        # Return rating value if exists, else None
        return getattr(obj.rating, "rating", None) if hasattr(obj, "rating") else None
