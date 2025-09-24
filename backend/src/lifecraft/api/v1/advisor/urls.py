from django.urls import path
from .views import AdvisorListView,InboxView

urlpatterns = [
    path("advisors-list/", AdvisorListView.as_view(), name="advisor-list"),
    path("inbox/", InboxView.as_view(), name="advisor-inbox"),
]
