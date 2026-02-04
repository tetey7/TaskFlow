from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter(trailing_slash=False)
router.register(r"tasks", views.TaskViewSet, basename="tasks")

urlpatterns = [
    path("health/", views.health, name="health"),
] + router.urls
