from django.urls import path
from .views import ProfileSetupView,UserDashboardView,DreamSetupView,AdvisorRequestView,ClientsListView, ClientDetailView,BookAppointmentView,UserAppointmentsView

urlpatterns = [
    path("profile-setup/", ProfileSetupView.as_view(), name="profile-setup"),
    path("user-dashboard/", UserDashboardView.as_view(), name="user-dashboard"),
    path("dream-setup/", DreamSetupView.as_view(), name="dream-setup"),
    path("book-appointment/", BookAppointmentView.as_view(), name="book-appointment"),
    path("become-advisor/", AdvisorRequestView.as_view(), name="become-advisor"),
    path('clients-list/', ClientsListView.as_view(), name='clients-list'),
    path('client/<int:id>/', ClientDetailView.as_view(), name='client-data'),
    path("my-appointments/", UserAppointmentsView.as_view(), name="user-appointments"),
]



