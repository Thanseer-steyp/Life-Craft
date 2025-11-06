from django.contrib import admin
from .models import Advisor,AdvisorAvailability,AdvisorRating,AdvisorReview

admin.site.register(Advisor)
admin.site.register(AdvisorAvailability)
admin.site.register(AdvisorRating)
admin.site.register(AdvisorReview)