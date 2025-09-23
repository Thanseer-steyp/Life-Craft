from django.db import models
from django.utils import timezone
import random

class EmailOTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    count = models.IntegerField(default=0)   # how many OTPs generated
    validated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  # first record creation
    last_sent = models.DateTimeField(default=timezone.now)  # ✅ track last OTP send time

    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.count += 1
        self.validated = False
        self.last_sent = timezone.now()  # ✅ update timestamp each send
        self.save()
        return self.otp
