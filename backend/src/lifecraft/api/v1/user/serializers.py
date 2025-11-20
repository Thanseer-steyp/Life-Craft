from rest_framework import serializers
from django.contrib.auth.models import User
from user.models import Profile,AdvisorRequest,Appointment
from chatroom.models import ChatRoom, Message
from datetime import date


class ProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    retirement_time_left = serializers.SerializerMethodField()



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
            "age",                          
            "retirement_time_left",  
            "country",
            "state",
            "job",
            "monthly_income",
            "interests",
            "bio",
            "retirement_planning_age",
            "post_retirement_life_plans",
            "post_retirement_location_preferences",
            "dreams",
            "profile_picture",
        ]
        read_only_fields = ["id", "full_name", "username", "email","age","retirement_time_left"]

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

    def calculate_age_components(self, dob):
        today = date.today()

        years = today.year - dob.year
        months = today.month - dob.month
        days = today.day - dob.day

        if days < 0:
            # days in previous month
            prev_month_days = (date(today.year, today.month, 1) - date(today.year if today.month > 1 else today.year - 1,
                                today.month - 1 if today.month > 1 else 12,
                                1)).days
            days += prev_month_days
            months -= 1

        if months < 0:
            months += 12
            years -= 1

        return years, months, days

    def get_age(self, obj):
        if not obj.dob:
            return None

        years, months, days = self.calculate_age_components(obj.dob)
        return f"{years} years {months} months {days} days"


    def get_retirement_time_left(self, obj):
        if not obj.dob or not obj.retirement_planning_age:
            return None

        # retirement date = dob + retirement_age
        retirement_year = obj.dob.year + int(obj.retirement_planning_age)
        retirement_date = date(retirement_year, obj.dob.month, obj.dob.day)

        if retirement_date < date.today():
            return "Already retired"

        years = retirement_date.year - date.today().year
        months = retirement_date.month - date.today().month
        days = retirement_date.day - date.today().day

        if days < 0:
            prev_month_days = (date(date.today().year, date.today().month, 1) -
                            date(date.today().year if date.today().month > 1 else date.today().year - 1,
                                    date.today().month - 1 if date.today().month > 1 else 12,
                                    1)).days
            days += prev_month_days
            months -= 1

        if months < 0:
            months += 12
            years -= 1

        return f"{years} years {months} months {days} days"



    

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
            "is_attended",
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
