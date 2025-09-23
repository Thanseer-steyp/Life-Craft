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
