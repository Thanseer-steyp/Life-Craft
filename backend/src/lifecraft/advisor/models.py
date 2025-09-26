from django.db import models
from django.contrib.auth.models import User

class Advisor(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    profile_photo = models.ImageField(upload_to="advisor_photos/", null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    country_address = models.CharField(max_length=255, null=True, blank=True)
    state_address = models.CharField(max_length=255, null=True, blank=True)
    language_preferences = models.CharField(max_length=255, null=True, blank=True)
    advisor_type = models.CharField(max_length=50, null=True, blank=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    designation = models.CharField(max_length=255, null=True, blank=True)
    highest_qualification = models.CharField(max_length=20, null=True, blank=True)
    specialized_in = models.CharField(max_length=255, null=True, blank=True)
    educational_certificate = models.FileField(upload_to="advisor_certificates/", null=True, blank=True)
    previous_companies = models.TextField(null=True, blank=True)
    resume = models.FileField(upload_to="advisor_resumes/", null=True, blank=True)
    govt_id_type = models.CharField(max_length=20, null=True, blank=True)
    govt_id_proof_id = models.CharField(max_length=30, null=True, blank=True)
    govt_id_file = models.FileField(upload_to="advisor_ids/", null=True, blank=True)
    confirm_details = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name or self.user.username} ({self.email})"

