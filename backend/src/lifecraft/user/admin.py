from django.contrib import admin
from .models import Profile,AdvisorRequest,Appointment,BugReport


admin.site.register(Profile)
admin.site.register(AdvisorRequest)
admin.site.register(Appointment)
admin.site.register(BugReport)


