from django.urls import path
from .views import AdvisorListView

urlpatterns = [
    path("advisors-list/", AdvisorListView.as_view(), name="advisor-list"),
]
