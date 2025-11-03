from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("tasks/", views.list_tasks, name="tasks-list"),
]
