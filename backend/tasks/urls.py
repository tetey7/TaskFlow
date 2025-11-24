from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("tasks/", views.TaskViewSet.as_view({"get": "list", "post": "create"}), name="tasks-list"),
]
