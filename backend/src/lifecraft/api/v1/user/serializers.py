from rest_framework import serializers
from django.contrib.auth.models import User
from user.models import Profile,AdvisorRequest,Appointment
from chatroom.models import ChatRoom, Message





class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "full_name",
            "username",
            "email",
            "dob",
            "gender",
            "marital_status",
            "phone_number",
            "country",
            "state",
            "profile_picture",
            "interests",
            "job",
            "monthly_income",
            "bio",
            "retirement_planning_age",
            "current_savings",
            "expected_savings_at_retirement",
            "post_retirement_travel",
            "post_retirement_hobbies",
            "post_retirement_family_together",
            "post_retirement_social_work",
            "post_retirement_garage",
            "post_retirement_luxury_life",
            "retirement_location_preference",
            "dream_type",
            "top_dream_1",
            "top_dream_2",
            "top_dream_3",
            "top_dream_priorities",
            "dream_description",
            "initial_plan",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "full_name", "username", "email"]

    def get_full_name(self, obj):
        user = self.context.get("user")
        if user:
            return user.get_full_name()
        return None
    
    def get_username(self, obj):
        user = self.context.get("user")
        if user:
            return user.username
        return None

    def get_email(self, obj):
        user = self.context.get("user")
        if user:
            return user.email
        return None
    

class UserDashboardSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "name","profile"]

    def get_name(self, obj):
        full_name = f"{obj.first_name}"
        return full_name



class AdvisorRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvisorRequest
        fields = [
            "id",
            "profile_photo",
            "full_name",
            "dob_year",
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







class UserSerializer(serializers.ModelSerializer):
    # Profile fields
    age = serializers.IntegerField(source="profile.age", read_only=True)
    retirement_age = serializers.IntegerField(source="profile.retirement_age", read_only=True)
    bio = serializers.CharField(source="profile.bio", read_only=True)
    interests = serializers.CharField(source="profile.interests", read_only=True)
    profile_image = serializers.ImageField(source="profile.profile_image", read_only=True)


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
        ]
        read_only_fields = ["id"]

        


class AppointmentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    advisor_name = serializers.CharField(source="advisor.user.username", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "user",
            "user_name",
            "advisor",
            "advisor_name",
            "status",
            "preferred_day",
            "preferred_time",
            "communication_method",
            "decline_message",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]




class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_name", "content", "timestamp","is_read"]

class ChatRoomSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    advisor_name = serializers.CharField(source="advisor.username", read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = [
            "id", "appointment", "user", "advisor",
            "user_name", "advisor_name",
            "messages", "created_at"
        ]
