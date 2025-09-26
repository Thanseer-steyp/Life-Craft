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
    class Meta:
        model = AdvisorRequest
        fields = [
            "id",
            "profile_photo",
            "full_name",
            "age",
            "gender",
            "email",
            "phone_number",
            "country_address",
            "state_address",
            "language_preferences",
            "advisor_type",
            "experience_years",
            "company",
            "designation",
            "highest_qualification",
            "specialized_in",
            "educational_certificate",
            "previous_companies",
            "resume",
            "govt_id_type",
            "govt_id_file",
            "govt_id_proof_id",
            "confirm_details",
            "submitted_at",
            "status",
        ]
        read_only_fields = ["id", "submitted_at", "status"]

    def validate_confirm_details(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must confirm that all details are correct."
            )
        return value


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "sender_id",
            "sender_name",
            "receiver",
            "content",
            "created_at",
            "is_read",
        ]





class UserSerializer(serializers.ModelSerializer):
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
            "id",
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
        read_only_fields = ["id"]