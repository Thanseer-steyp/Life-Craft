from django.urls import path
from .views import ProfileSetupView

urlpatterns = [
    path("profile-setup/", ProfileSetupView.as_view(), name="profile-setup"),
]