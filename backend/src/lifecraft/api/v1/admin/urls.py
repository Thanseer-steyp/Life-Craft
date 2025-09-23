from django.urls import path
from .views import (AdminAdvisorRequestsView)

urlpatterns = [
    path('advisor-requests/', AdminAdvisorRequestsView.as_view(), name='admin-advisor-requests'),
]
