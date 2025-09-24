from django.db import models
from django.contrib.auth.models import User

class Advisor(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10,null=True, blank=True)
    education = models.CharField(max_length=255,null=True, blank=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    adhar_number = models.CharField(max_length=12,null=True, blank=True)
    phone_number = models.CharField(max_length=20,null=True, blank=True)
    photo = models.ImageField(upload_to="advisor_photos/", null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.email})"

