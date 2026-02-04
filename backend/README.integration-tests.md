# Integration Testing Guide

## Overview

Integration tests verify that multiple components work together correctly, testing complete workflows and end-to-end scenarios.

## Test Structure

### Test Files

- **`test_tasks_api.py`** - Unit tests for individual API endpoints (13 tests)
- **`test_integration.py`** - Integration tests for complete workflows (10 tests)

### Integration Test Categories

1. **Task Workflows** - Complete lifecycle tests
   - `test_complete_task_lifecycle` - Create → Update → Complete → Delete
   - `test_bulk_task_operations` - Managing multiple tasks
   - `test_task_reordering_workflow` - Reordering with verification
   - `test_task_filtering_and_search` - Query operations
   - `test_concurrent_task_updates` - Concurrent modifications
   - `test_error_recovery_workflow` - Error handling

2. **Database Integrity** - Data consistency tests
   - `test_task_ordering_consistency` - Order preservation
   - `test_cascade_operations` - Deletion cascades

3. **API Consistency** - Response format tests
   - `test_response_format_consistency` - Uniform responses
   - `test_timestamp_handling` - Timestamp immutability

## Running Tests

### Run All Tests (Unit + Integration)

```bash
# In Docker
docker-compose exec backend python -m pytest tests/ -v

# Locally (if you have dependencies installed)
cd backend
pytest tests/ -v
```

### Run Only Integration Tests

```bash
docker-compose exec backend python -m pytest tests/test_integration.py -v
```

### Run Only Unit Tests

```bash
docker-compose exec backend python -m pytest tests/test_tasks_api.py -v
```

### Run Specific Test Class

```bash
docker-compose exec backend python -m pytest tests/test_integration.py::TestTaskWorkflows -v
```

### Run Specific Test

```bash
docker-compose exec backend python -m pytest tests/test_integration.py::TestTaskWorkflows::test_complete_task_lifecycle -v
```

### Run with Coverage

```bash
docker-compose exec backend python -m pytest tests/ --cov=tasks --cov-report=html
```

## Test Database

Integration tests use **SQLite in-memory database** (configured in `settings.py`):

```python
if TESTING:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
```

This ensures:
- ✅ Fast test execution
- ✅ Isolated test environment
- ✅ No pollution of production database
- ✅ Automatic cleanup after tests

## Writing Integration Tests

### Best Practices

1. **Test Complete Workflows**
   ```python
   def test_complete_workflow(self, api_client):
       # Create
       response = api_client.post(url, data)
       task_id = response.data["id"]

       # Update
       api_client.patch(url, updated_data)

       # Verify in database
       task = Task.objects.get(id=task_id)
       assert task.field == expected_value
   ```

2. **Verify Database State**
   ```python
   # Don't just check API responses
   task.refresh_from_db()
   assert task.completed is True
   ```

3. **Test Error Scenarios**
   ```python
   response = api_client.post(url, invalid_data)
   assert response.status_code == 400
   assert Task.objects.count() == 0  # No partial data
   ```

4. **Test Multiple Operations**
   ```python
   # Create multiple entities
   for data in test_data:
       api_client.post(url, data)

   # Verify all exist
   assert Task.objects.count() == len(test_data)
   ```

### Fixtures Available

- **`api_client`** - DRF APIClient for making requests
- **`db`** - Database access (auto-used with `@pytest.mark.django_db`)
- **`sample_task`** - Pre-created task (from `conftest.py`)

## CI/CD Integration

Integration tests run automatically in:
- ✅ Pre-commit hooks (`pytest` hook)
- ✅ GitHub Actions (if configured)
- ✅ Local development

## Performance

Current test performance:
- **Unit tests (13):** ~0.14s
- **Integration tests (10):** ~0.17s
- **Total (23 tests):** ~0.31s

## Debugging Failed Tests

### Verbose Output

```bash
docker-compose exec backend python -m pytest tests/test_integration.py -vv
```

### Stop on First Failure

```bash
docker-compose exec backend python -m pytest tests/test_integration.py -x
```

### Print Output

```bash
docker-compose exec backend python -m pytest tests/test_integration.py -s
```

### Run Last Failed Tests

```bash
docker-compose exec backend python -m pytest tests/test_integration.py --lf
```

## Test Coverage Goals

- **Unit Tests:** Test individual functions/endpoints
- **Integration Tests:** Test workflows and interactions
- **Target Coverage:** >80% for critical paths

Current coverage: **100%** of API endpoints tested ✅

## Adding New Integration Tests

1. Add test to `test_integration.py`
2. Use descriptive test names: `test_<workflow>_<scenario>`
3. Add docstrings explaining what's being tested
4. Verify database state, not just API responses
5. Test both success and failure paths
6. Run tests locally before committing

## Example: Adding a New Integration Test

```python
@pytest.mark.django_db
class TestTaskWorkflows:
    def test_your_new_workflow(self, api_client):
        """Test description of what this workflow does."""
        # 1. Setup
        task = Task.objects.create(title="Test")

        # 2. Execute workflow
        response = api_client.post(url, data)

        # 3. Verify API response
        assert response.status_code == 200

        # 4. Verify database state
        task.refresh_from_db()
        assert task.field == expected_value

        # 5. Cleanup (automatic with @pytest.mark.django_db)
```

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-django](https://pytest-django.readthedocs.io/)
- [DRF Testing](https://www.django-rest-framework.org/api-guide/testing/)
- [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
