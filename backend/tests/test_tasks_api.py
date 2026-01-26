import pytest
from django.urls import reverse

from tasks.models import Task


@pytest.mark.django_db
class TestTaskAPI:
    """Test cases for Task API endpoints."""

    def test_health_endpoint(self, api_client):
        """Test the health check endpoint."""
        url = reverse("health")
        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data == {"status": "ok"}

    def test_list_tasks_empty(self, api_client):
        """Test listing tasks when none exist."""
        url = reverse("tasks-list")
        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data == []

    def test_list_tasks_with_data(self, api_client, sample_task):
        """Test listing tasks with existing data."""
        url = reverse("tasks-list")
        response = api_client.get(url)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Test Task"

    def test_create_task(self, api_client):
        """Test creating a new task."""
        url = reverse("tasks-list")
        data = {
            "title": "New Task",
            "description": "New Description",
            "priority": "high",
            "completed": False,
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == 201
        assert Task.objects.count() == 1
        assert Task.objects.first().title == "New Task"

    def test_retrieve_task(self, api_client, sample_task):
        """Test retrieving a single task."""
        url = reverse("tasks-detail", kwargs={"pk": sample_task.pk})
        response = api_client.get(url)

        assert response.status_code == 200
        assert response.data["title"] == "Test Task"

    def test_update_task(self, api_client, sample_task):
        """Test updating a task."""
        url = reverse("tasks-detail", kwargs={"pk": sample_task.pk})
        data = {
            "title": "Updated Task",
            "description": "Updated",
            "priority": "low",
            "completed": True,
        }
        response = api_client.put(url, data, format="json")

        assert response.status_code == 200
        assert response.data["title"] == "Updated Task"

    def test_partial_update_task(self, api_client, sample_task):
        """Test partially updating a task."""
        url = reverse("tasks-detail", kwargs={"pk": sample_task.pk})
        response = api_client.patch(url, {"completed": True}, format="json")

        assert response.status_code == 200
        assert response.data["completed"] is True

    def test_delete_task(self, api_client, sample_task):
        """Test deleting a task."""
        url = reverse("tasks-detail", kwargs={"pk": sample_task.pk})
        response = api_client.delete(url)

        assert response.status_code == 204
        assert Task.objects.count() == 0
