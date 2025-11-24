import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    """Provides an API client for testing."""
    return APIClient()


@pytest.fixture
def sample_task(db):
    """Creates a sample task for testing."""
    from tasks.models import Task
    return Task.objects.create(
        title="Test Task",
        description="Test Description",
        priority="medium",
        completed=False
    )