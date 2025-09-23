from django.db import models
from django.contrib.auth.models import User

class Advisor(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.username} ({self.email})"
