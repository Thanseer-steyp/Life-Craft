from django.urls import path
from .views import ProfileSetupView,UserDashboardView,DreamSetupView,AdvisorRequestView,SendMessageView,ClientsListView, ClientDetailView

urlpatterns = [
    path("profile-setup/", ProfileSetupView.as_view(), name="profile-setup"),
    path("user-dashboard/", UserDashboardView.as_view(), name="user-dashboard"),
    path("dream-setup/", DreamSetupView.as_view(), name="dream-setup"),
    path("become-advisor/", AdvisorRequestView.as_view(), name="become-advisor"),
    path("send-message/", SendMessageView.as_view(), name="send-message"),
    path('clients-list/', ClientsListView.as_view(), name='clients-list'),
    path('client/<int:id>/', ClientDetailView.as_view(), name='client-data'),
]



