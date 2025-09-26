from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from advisor.models import Advisor

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    age = models.PositiveIntegerField(null=True, blank=True)
    retirement_age = models.PositiveIntegerField(null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    interests = models.TextField(blank=True, null=True)  # free text or CSV
    profile_image = models.ImageField(upload_to="profile_images/", blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

class DreamSetup(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dreams")
    dream_name = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    timeline_months = models.PositiveIntegerField()  # time in months
    current_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s dream: {self.dream_name}"


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
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(20), MaxValueValidator(65)],
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
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="pending"
    )

    def __str__(self):
        return f"{self.user.username} - {self.full_name or 'No Name'} ({self.advisor_type or 'No Type'})"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(Advisor, on_delete=models.CASCADE, related_name="received_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}"