from rest_framework import serializers
from user.models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "age", "retirement_age", "bio", "interests", "profile_image"]
        read_only_fields = ["id"]
