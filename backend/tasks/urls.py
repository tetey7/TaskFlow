from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"tasks", views.TaskViewSet, basename="tasks")

urlpatterns = [
    path("health/", views.health, name="health"),
] + router.urls
