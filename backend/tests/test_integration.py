"""
Integration tests for the tasks API.

Tests complete workflows involving multiple API calls and database operations.
"""

import pytest
from django.urls import reverse
from rest_framework import status

from tasks.models import Task


@pytest.mark.django_db
class TestTaskWorkflows:
    """Integration tests for complete task management workflows."""

    def test_complete_task_lifecycle(self, api_client):
        """Test creating, updating, completing, and deleting a task."""
        # 1. Create a task
        create_url = reverse("tasks-list")
        create_data = {
            "title": "Integration Test Task",
            "description": "Testing full lifecycle",
            "priority": "high",
            "completed": False,
        }
        create_response = api_client.post(
            create_url, create_data, format="json"
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        task_id = create_response.data["id"]

        # 2. Verify task was created
        list_response = api_client.get(create_url)
        assert list_response.status_code == status.HTTP_200_OK
        assert len(list_response.data) == 1
        assert list_response.data[0]["title"] == "Integration Test Task"

        # 3. Update the task
        update_url = reverse("tasks-detail", kwargs={"pk": task_id})
        update_data = {
            "title": "Updated Integration Test",
            "description": "Updated description",
            "priority": "medium",
            "completed": False,
        }
        update_response = api_client.put(
            update_url, update_data, format="json"
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.data["title"] == "Updated Integration Test"

        # 4. Mark as completed
        complete_response = api_client.patch(
            update_url, {"completed": True}, format="json"
        )
        assert complete_response.status_code == status.HTTP_200_OK
        assert complete_response.data["completed"] is True

        # 5. Verify in database
        task = Task.objects.get(id=task_id)
        assert task.completed is True
        assert task.title == "Updated Integration Test"

        # 6. Delete the task
        delete_response = api_client.delete(update_url)
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

        # 7. Verify deletion
        assert Task.objects.filter(id=task_id).count() == 0

    def test_bulk_task_operations(self, api_client):
        """Test creating and managing multiple tasks."""
        # Create multiple tasks
        tasks_data = [
            {"title": "Task 1", "priority": "low", "completed": False},
            {"title": "Task 2", "priority": "medium", "completed": False},
            {"title": "Task 3", "priority": "high", "completed": False},
        ]

        created_ids = []
        for task_data in tasks_data:
            response = api_client.post(
                reverse("tasks-list"), task_data, format="json"
            )
            assert response.status_code == status.HTTP_201_CREATED
            created_ids.append(response.data["id"])

        # Verify all tasks exist
        list_response = api_client.get(reverse("tasks-list"))
        assert len(list_response.data) == 3

        # Complete all tasks
        for task_id in created_ids:
            response = api_client.patch(
                reverse("tasks-detail", kwargs={"pk": task_id}),
                {"completed": True},
                format="json",
            )
            assert response.status_code == status.HTTP_200_OK

        # Verify all completed in database
        assert Task.objects.filter(completed=True).count() == 3

    def test_task_reordering_workflow(self, api_client):
        """Test complete reordering workflow with multiple tasks."""
        # Create tasks with initial order
        task1 = Task.objects.create(title="First", sort_order=0)
        task2 = Task.objects.create(title="Second", sort_order=1)
        task3 = Task.objects.create(title="Third", sort_order=2)

        # Verify initial order
        tasks = list(Task.objects.all())
        assert tasks[0].title == "First"
        assert tasks[1].title == "Second"
        assert tasks[2].title == "Third"

        # Reorder: Third -> First -> Second
        reorder_url = reverse("tasks-reorder")
        reorder_data = {
            "task_orders": [
                {"id": task3.id, "sort_order": 0},
                {"id": task1.id, "sort_order": 1},
                {"id": task2.id, "sort_order": 2},
            ]
        }
        response = api_client.post(reorder_url, reorder_data, format="json")
        assert response.status_code == status.HTTP_200_OK

        # Verify new order in database by refreshing and checking sort_order
        task1.refresh_from_db()
        task2.refresh_from_db()
        task3.refresh_from_db()

        assert task3.sort_order == 0
        assert task1.sort_order == 1
        assert task2.sort_order == 2

        # Verify via API (ordered by sort_order)
        list_response = api_client.get(reverse("tasks-list"))
        assert list_response.data[0]["title"] == "Third"
        assert list_response.data[1]["title"] == "First"
        assert list_response.data[2]["title"] == "Second"

    def test_task_filtering_and_search(self, api_client):
        """Test filtering tasks by different criteria."""
        # Create diverse tasks
        Task.objects.create(
            title="Urgent Bug Fix", priority="high", completed=False
        )
        Task.objects.create(
            title="Code Review", priority="medium", completed=True
        )
        Task.objects.create(
            title="Documentation", priority="low", completed=False
        )

        # Get all tasks
        all_tasks = api_client.get(reverse("tasks-list"))
        assert len(all_tasks.data) == 3

        # Verify we can filter in database
        high_priority = Task.objects.filter(priority="high")
        assert high_priority.count() == 1
        assert high_priority.first().title == "Urgent Bug Fix"

        completed_tasks = Task.objects.filter(completed=True)
        assert completed_tasks.count() == 1
        assert completed_tasks.first().title == "Code Review"

    def test_concurrent_task_updates(self, api_client):
        """Test handling concurrent updates to the same task."""
        # Create a task
        task = Task.objects.create(
            title="Concurrent Test", priority="medium", completed=False
        )

        # Simulate two concurrent updates
        url = reverse("tasks-detail", kwargs={"pk": task.id})

        # First update
        response1 = api_client.patch(url, {"priority": "high"}, format="json")
        assert response1.status_code == status.HTTP_200_OK

        # Second update (should work, last write wins)
        response2 = api_client.patch(url, {"completed": True}, format="json")
        assert response2.status_code == status.HTTP_200_OK

        # Verify final state
        task.refresh_from_db()
        assert task.priority == "high"
        assert task.completed is True

    def test_error_recovery_workflow(self, api_client):
        """Test system behavior with invalid operations."""
        # Try to update non-existent task
        response = api_client.patch(
            reverse("tasks-detail", kwargs={"pk": 99999}),
            {"completed": True},
            format="json",
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

        # Try to create task with invalid data
        response = api_client.post(
            reverse("tasks-list"),
            {"title": "", "priority": "invalid"},  # Invalid priority
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # Verify database is clean (no partial data)
        assert Task.objects.count() == 0


@pytest.mark.django_db
class TestDatabaseIntegrity:
    """Integration tests for database constraints and integrity."""

    def test_task_ordering_consistency(self, api_client):
        """Test that task ordering remains consistent across operations."""
        # Create tasks
        for i in range(5):
            Task.objects.create(title=f"Task {i}", sort_order=i)

        # Verify ordering
        tasks = list(Task.objects.all())
        for i, task in enumerate(tasks):
            assert task.sort_order == i

        # Update one task
        task = tasks[2]
        task.title = "Updated Task"
        task.save()

        # Verify ordering still intact
        tasks = list(Task.objects.all())
        for i, task in enumerate(tasks):
            assert task.sort_order == i

    def test_cascade_operations(self, api_client):
        """Test that related operations work correctly."""
        # Create task
        task = Task.objects.create(title="Test Task")

        # Delete task
        task_id = task.id
        task.delete()

        # Verify complete deletion
        assert Task.objects.filter(id=task_id).count() == 0


@pytest.mark.django_db
class TestAPIConsistency:
    """Integration tests for API response consistency."""

    def test_response_format_consistency(self, api_client):
        """Test that API responses have consistent format."""
        # Create task
        create_response = api_client.post(
            reverse("tasks-list"),
            {"title": "Test", "priority": "medium", "completed": False},
            format="json",
        )

        # Verify response structure
        assert "id" in create_response.data
        assert "title" in create_response.data
        assert "priority" in create_response.data
        assert "completed" in create_response.data
        assert "created_at" in create_response.data

        # Get task
        task_id = create_response.data["id"]
        get_response = api_client.get(
            reverse("tasks-detail", kwargs={"pk": task_id})
        )

        # Verify same structure
        assert set(create_response.data.keys()) == set(
            get_response.data.keys()
        )

    def test_timestamp_handling(self, api_client):
        """Test that timestamps are handled correctly."""
        # Create task
        response = api_client.post(
            reverse("tasks-list"),
            {"title": "Timestamp Test", "priority": "low", "completed": False},
            format="json",
        )

        created_at = response.data["created_at"]
        assert created_at is not None

        # Update task
        task_id = response.data["id"]
        update_response = api_client.patch(
            reverse("tasks-detail", kwargs={"pk": task_id}),
            {"title": "Updated"},
            format="json",
        )

        # created_at should not change
        assert update_response.data["created_at"] == created_at
