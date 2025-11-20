from django.urls import path
from .views import (ProfileSetupView,AdvisorRequestView,ClientsListView, ClientDetailView,
BookAppointmentView,UserAppointmentsView,ChatRoomView,MarkMessagesReadView,CheckAppointmentStatusView,MarkAppointmentAttendedView)

urlpatterns = [
    path("profile-setup/", ProfileSetupView.as_view(), name="profile-setup"),
    path("book-appointment/", BookAppointmentView.as_view(), name="book-appointment"),
    path("become-advisor/", AdvisorRequestView.as_view(), name="become-advisor"),
    path('clients-list/', ClientsListView.as_view(), name='clients-list'),
    path('client/<int:id>/', ClientDetailView.as_view(), name='client-data'),
    path("my-appointments/", UserAppointmentsView.as_view(), name="user-appointments"),
    path("check-appointment/<int:advisor_id>/", CheckAppointmentStatusView.as_view(), name="check-appointment"),
    path("chat/<int:appointment_id>/", ChatRoomView.as_view(), name="chat-room"),
    path("chat/<int:appointment_id>/read/", MarkMessagesReadView.as_view(), name="chat-mark-read"),
    path("appointment/<int:appointment_id>/attended/", MarkAppointmentAttendedView.as_view(), name="mark-appointment-attended"),
]



