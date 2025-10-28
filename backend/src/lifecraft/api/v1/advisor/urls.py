from django.urls import path
from .views import AdvisorListView,AppointmentInboxView,ManageAppointmentView,AdvisorAvailabilityView

urlpatterns = [
    path("advisors-list/", AdvisorListView.as_view(), name="advisor-list"),
    path("inbox/", AppointmentInboxView.as_view(), name="advisor-inbox"),
    path("manage-appointment/<int:appointment_id>/", ManageAppointmentView.as_view(), name="manage-appointment"),
    path("availability/", AdvisorAvailabilityView.as_view(), name="advisor-availability"),
]
