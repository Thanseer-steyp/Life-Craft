from django.db import models
from django.contrib.auth.models import User

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
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="advisor_requests")
    name = models.CharField(max_length=255)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10)
    education = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField()
    adhar_number = models.CharField(max_length=20)
    phone_number = models.CharField(max_length=20)
    photo = models.ImageField(upload_to="advisor_photos/", null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.user.username} - Advisor Request"
