from django.urls import path
from .views import AdvisorListView,AppointmentInboxView,ManageAppointmentView,AdvisorAvailabilityView,AdvisorFeeUpdateView,AdvisorRatingsListView,AdvisorRatingView

urlpatterns = [
    path("advisors-list/", AdvisorListView.as_view(), name="advisor-list"),
    path("inbox/", AppointmentInboxView.as_view(), name="advisor-inbox"),
    path("manage-appointment/<int:appointment_id>/", ManageAppointmentView.as_view(), name="manage-appointment"),
    path("availability/", AdvisorAvailabilityView.as_view(), name="advisor-availability"),
    path("update-fee/", AdvisorFeeUpdateView.as_view(), name="advisor-update-fee"),
    path("rate/<int:advisor_id>/", AdvisorRatingView.as_view(), name="advisor-rate"),
    path("ratings/<int:advisor_id>/", AdvisorRatingsListView.as_view(), name="advisor-ratings"),
]
