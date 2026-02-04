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

    def test_reorder_tasks(self, api_client):
        """Test reordering tasks."""
        # Create multiple tasks
        task1 = Task.objects.create(title="Task 1", sort_order=0)
        task2 = Task.objects.create(title="Task 2", sort_order=1)
        task3 = Task.objects.create(title="Task 3", sort_order=2)

        url = reverse("tasks-reorder")
        data = {
            "task_orders": [
                {"id": task3.id, "sort_order": 0},
                {"id": task1.id, "sort_order": 1},
                {"id": task2.id, "sort_order": 2},
            ]
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        assert response.data == {"status": "success"}

        # Verify the order was updated in the database
        task1.refresh_from_db()
        task2.refresh_from_db()
        task3.refresh_from_db()

        assert task1.sort_order == 1
        assert task2.sort_order == 2
        assert task3.sort_order == 0

    def test_reorder_tasks_empty_list(self, api_client):
        """Test reordering with empty list."""
        url = reverse("tasks-reorder")
        response = api_client.post(url, {"task_orders": []}, format="json")

        assert response.status_code == 200
        assert response.data == {"status": "success"}

    def test_reorder_tasks_missing_field(self, api_client):
        """Test reordering with missing task_orders field."""
        task1 = Task.objects.create(title="Task 1", sort_order=0)

        url = reverse("tasks-reorder")
        response = api_client.post(url, {}, format="json")

        assert response.status_code == 200
        # Should not crash, just do nothing
        task1.refresh_from_db()
        assert task1.sort_order == 0

    def test_reorder_tasks_partial_data(self, api_client):
        """Test reordering with incomplete data (missing id or sort_order)."""
        task1 = Task.objects.create(title="Task 1", sort_order=0)

        url = reverse("tasks-reorder")
        data = {
            "task_orders": [
                {"id": task1.id},  # Missing sort_order
                {"sort_order": 5},  # Missing id
            ]
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        # Should not update tasks with incomplete data
        task1.refresh_from_db()
        assert task1.sort_order == 0

    def test_reorder_tasks_nonexistent_task(self, api_client):
        """Test reordering with non-existent task ID."""
        task1 = Task.objects.create(title="Task 1", sort_order=0)

        url = reverse("tasks-reorder")
        data = {
            "task_orders": [
                {"id": 99999, "sort_order": 0},  # Non-existent ID
                {"id": task1.id, "sort_order": 1},
            ]
        }
        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        # Should update existing task, ignore non-existent
        task1.refresh_from_db()
        assert task1.sort_order == 1
