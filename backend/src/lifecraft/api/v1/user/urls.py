from django.urls import path
from .views import ProfileSetupView,UserDashboardView,DreamSetupView,AdvisorRequestView

urlpatterns = [
    path("profile-setup/", ProfileSetupView.as_view(), name="profile-setup"),
    path("user-dashboard/", UserDashboardView.as_view(), name="user-dashboard"),
    path("dream-setup/", DreamSetupView.as_view(), name="dream-setup"),
    path("become-advisor/", AdvisorRequestView.as_view(), name="become-advisor"),
]