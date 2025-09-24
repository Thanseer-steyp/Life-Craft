from rest_framework import serializers
from django.contrib.auth.models import User
from user.models import Profile,DreamSetup,AdvisorRequest,Message

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["id", "age", "retirement_age", "bio", "interests", "profile_image"]
        read_only_fields = ["id"]


class UserDashboardSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(source="profile.age", read_only=True)
    retirement_age = serializers.IntegerField(source="profile.retirement_age", read_only=True)
    bio = serializers.CharField(source="profile.bio", read_only=True)
    interests = serializers.CharField(source="profile.interests", read_only=True)
    profile_image = serializers.ImageField(source="profile.profile_image", read_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "age",
            "retirement_age",
            "bio",
            "interests",
            "profile_image",
        ]


class DreamSetupSerializer(serializers.ModelSerializer):
    class Meta:
        model = DreamSetup
        fields = [
            "id",
            "dream_name",
            "budget",
            "timeline_months",
            "current_savings",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

class DreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DreamSetup
        fields = [
            "id",
            "dream_name",
            "budget",
            "timeline_months",
            "current_savings",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class UserDashboardSerializer(serializers.ModelSerializer):
    # Profile fields
    age = serializers.IntegerField(source="profile.age", read_only=True)
    retirement_age = serializers.IntegerField(source="profile.retirement_age", read_only=True)
    bio = serializers.CharField(source="profile.bio", read_only=True)
    interests = serializers.CharField(source="profile.interests", read_only=True)
    profile_image = serializers.ImageField(source="profile.profile_image", read_only=True)

    # Nested dreams
    dreams = DreamSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "age",
            "retirement_age",
            "bio",
            "interests",
            "profile_image",
            "dreams",
        ]


class AdvisorRequestSerializer(serializers.ModelSerializer):
    experience_years = serializers.IntegerField()

    class Meta:
        model = AdvisorRequest
        fields = [
            "id",
            "name",
            "age",
            "gender",
            "education",
            "experience_years",
            "adhar_number",
            "phone_number",
            "photo",
            "submitted_at",
        ]
        read_only_fields = ["id", "submitted_at",]


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "receiver", "content", "created_at", "is_read"]