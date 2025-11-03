from django.db import models
from django.contrib.auth.models import User
from advisor.models import Advisor


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20,
        choices=[("men", "Men"), ("women", "Women"), ("unisex", "Unisex")],
        blank=True,
        null=True,
    )
    marital_status = models.CharField(max_length=30, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )
    interests = models.TextField(blank=True, null=True)
    job = models.CharField(max_length=100, blank=True, null=True)
    monthly_income = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    bio = models.TextField(blank=True, null=True)

    # --- Retirement Planning ---
    retirement_planning_age = models.PositiveIntegerField(null=True, blank=True)
    current_savings = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    expected_savings_at_retirement = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    # --- Post-Retirement Lifestyle ---
    post_retirement_travel = models.BooleanField(default=False)
    post_retirement_hobbies = models.BooleanField(default=False)
    post_retirement_family_together = models.BooleanField(default=False)
    post_retirement_social_work = models.BooleanField(default=False)
    post_retirement_garage = models.BooleanField(default=False)
    post_retirement_luxury_life = models.BooleanField(default=False)
    retirement_location_preference = models.CharField(
        max_length=255, blank=True, null=True
    )

    # --- Dreams (Pre/Post Retirement) ---
    dream_type = models.CharField(
        max_length=50,
        choices=[
            ("Pre Retirement", "Pre Retirement"),
            ("Post Retirement", "Post Retirement"),
        ],
        blank=True,
        null=True,
    )
    top_dream_1 = models.CharField(max_length=255, blank=True, null=True)
    top_dream_2 = models.CharField(max_length=255, blank=True, null=True)
    top_dream_3 = models.CharField(max_length=255, blank=True, null=True)
    top_dream_priorities = models.TextField(blank=True, null=True)
    dream_description = models.TextField(blank=True, null=True)
    initial_plan = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class AdvisorRequest(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    )

    ADVISOR_TYPES = (
        ("financial", "Financial Advisor"),
        ("lifestyle", "Lifestyle Advisor"),
        ("legal", "Legal Advisor"),
        ("healthcare", "Healthcare Advisor"),
        ("travel", "Travel Advisor"),
        ("automobile", "Automobile Advisor"),
        ("architectural", "Architectural Advisor"),
    )

    QUALIFICATION_LEVELS = (
        ("diploma", "Diploma"),
        ("bachelor", "Bachelor"),
        ("master", "Master"),
        ("phd", "PhD"),
        ("degree", "Degree"),
    )

    GOVT_ID_TYPES = (
        ("passport", "Passport"),
        ("aadhar", "Aadhar"),
        ("license", "License"),
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="advisor_requests"
    )

    profile_photo = models.ImageField(
        upload_to="advisor_photos/", null=True, blank=True
    )
    full_name = models.CharField(max_length=255, null=True, blank=True)
    dob_year = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
    gender = models.CharField(
        max_length=10,
        choices=[("Male", "Male"), ("Female", "Female")],
        null=True,
        blank=True,
    )
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    country_address = models.CharField(max_length=255, null=True, blank=True)
    state_address = models.CharField(max_length=255, null=True, blank=True)
    language_preferences = models.CharField(max_length=255, null=True, blank=True)
    advisor_type = models.CharField(
        max_length=50, choices=ADVISOR_TYPES, null=True, blank=True
    )
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    designation = models.CharField(max_length=255, null=True, blank=True)
    highest_qualification = models.CharField(
        max_length=20, choices=QUALIFICATION_LEVELS, null=True, blank=True
    )
    specialized_in = models.CharField(max_length=255, null=True, blank=True)
    educational_certificate = models.FileField(
        upload_to="advisor_certificates/", null=True, blank=True
    )
    previous_companies = models.TextField(
        help_text="List of companies and roles", null=True, blank=True
    )
    resume = models.FileField(upload_to="advisor_resumes/", null=True, blank=True)
    govt_id_type = models.CharField(
        max_length=20, choices=GOVT_ID_TYPES, null=True, blank=True
    )
    govt_id_proof_id = models.CharField(max_length=30, null=True, blank=True)
    govt_id_file = models.FileField(upload_to="advisor_ids/", null=True, blank=True)

    confirm_details = models.BooleanField(default=False)

    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    def __str__(self):
        return f"{self.user.username} as {self.email} for {self.advisor_type} Advisor"


class Appointment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    )

    COMMUNICATION_CHOICES = (
        ("google_meet", "Google Meet"),
        ("whatsapp_video_call", "WhatsApp Video Call"),
        ("zoom", "Zoom"),
        ("phone_call", "Phone Call"),
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="appointments"
    )
    advisor = models.ForeignKey(
        Advisor, on_delete=models.CASCADE, related_name="appointments"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")

    # Filled by advisor after accepting
    preferred_day = models.DateField(null=True, blank=True)
    preferred_time = models.TimeField(null=True, blank=True)
    communication_method = models.CharField(
        max_length=20, choices=COMMUNICATION_CHOICES, null=True, blank=True
    )

    decline_message = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment: {self.user.username} with {self.advisor.user.username} ({self.status})"
