# End-to-End (E2E) Testing Guide

## Overview

E2E tests verify the complete application stack working together:
- **Frontend** (Next.js/React UI)
- **API Layer** (HTTP requests)
- **Backend** (Django REST Framework)
- **Database** (PostgreSQL)

## Test Framework: Playwright

We use [Playwright](https://playwright.dev/) for E2E testing because:
- ✅ Modern, fast, and reliable
- ✅ Built-in TypeScript support
- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Can test both UI and API
- ✅ Excellent debugging tools
- ✅ Auto-wait for elements

## Test Structure

### Test Files

- **`e2e/task-management.spec.ts`** - Complete task management workflows (10 tests)

### Test Categories

1. **UI Workflows** - User interactions through the browser
   - Create, read, update, delete tasks
   - Drag and drop reordering
   - Inline editing
   - Form validation

2. **API Integration** - Direct API testing
   - Health check endpoint
   - Create tasks via API, verify in UI
   - Response format validation

3. **Data Persistence** - Database verification
   - Data survives page reloads
   - Concurrent updates across tabs
   - Error recovery

## Running E2E Tests

### Prerequisites

**Both frontend and backend must be running:**

```bash
# Terminal 1: Start backend
docker-compose up backend

# Terminal 2: Start frontend (Playwright will do this automatically)
# But you can also start it manually:
cd frontend
npm run dev
```

### Run Tests

```bash
cd frontend

# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/task-management.spec.ts

# Run specific test
npx playwright test -g "should create a new task"
```

### View Test Report

```bash
npx playwright show-report
```

## Test Examples

### Basic UI Test

```typescript
test('should create a new task through UI', async ({ page }) => {
  await page.goto('/tasks');

  // Click "Add Task" button
  await page.click('button:has-text("Add Task")');

  // Fill form
  await page.fill('input[name="title"]', 'New Task');
  await page.click('button[type="submit"]');

  // Verify task appears
  await expect(page.locator('text=New Task')).toBeVisible();
});
```

### API + UI Test

```typescript
test('should create via API and verify in UI', async ({ request, page }) => {
  // Create via API
  const response = await request.post('http://localhost:8000/api/tasks/', {
    data: { title: 'API Task', priority: 'high', completed: false },
  });

  expect(response.ok()).toBeTruthy();

  // Verify in UI
  await page.goto('/tasks');
  await expect(page.locator('text=API Task')).toBeVisible();
});
```

### Multi-Tab Test

```typescript
test('should sync across tabs', async ({ page, context }) => {
  // Create task in first tab
  await page.goto('/tasks');
  // ... create task ...

  // Open second tab
  const newPage = await context.newPage();
  await newPage.goto('/tasks');

  // Both tabs should show the task
  await expect(page.locator('text=Task')).toBeVisible();
  await expect(newPage.locator('text=Task')).toBeVisible();
});
```

## Test Best Practices

### 1. Use Data Attributes for Stable Selectors

```tsx
// In your component
<div data-testid="task-card">...</div>

// In your test
await page.locator('[data-testid="task-card"]').click();
```

### 2. Wait for Network Idle

```typescript
await page.goto('/tasks');
await page.waitForLoadState('networkidle');
```

### 3. Use Explicit Waits

```typescript
// Wait for element
await page.waitForSelector('text=Task Created');

// Wait for API response
await page.waitForResponse(response =>
  response.url().includes('/api/tasks/') && response.status() === 200
);
```

### 4. Clean Up Test Data

```typescript
test.afterEach(async ({ request }) => {
  // Clean up tasks created during test
  const response = await request.get('http://localhost:8000/api/tasks/');
  const tasks = await response.json();

  for (const task of tasks) {
    await request.delete(`http://localhost:8000/api/tasks/${task.id}/`);
  }
});
```

### 5. Test Error Scenarios

```typescript
test('should handle API errors', async ({ page }) => {
  // Simulate network error or invalid data
  await page.route('**/api/tasks/', route => route.abort());

  // Try to create task
  await page.click('button:has-text("Add Task")');

  // Should show error message
  await expect(page.locator('text=Error')).toBeVisible();
});
```

## Debugging E2E Tests

### 1. Use Playwright Inspector

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can:
- Step through tests
- Inspect DOM
- View network requests
- See screenshots

### 2. Add Debug Statements

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/tasks');

  // Pause execution
  await page.pause();

  // Take screenshot
  await page.screenshot({ path: 'debug.png' });

  // Log page content
  console.log(await page.content());
});
```

### 3. View Trace

Traces are automatically captured on first retry. View them:

```bash
npx playwright show-trace trace.zip
```

### 4. Slow Down Tests

```typescript
test.use({
  launchOptions: {
    slowMo: 1000 // 1 second delay between actions
  }
});
```

## CI/CD Integration

### GitHub Actions (Configured ✅)

E2E tests are **already configured** to run on CI/CD! See:
- **`.github/workflows/e2e-tests.yml`** - Dedicated E2E test workflow
- **`.github/workflows/ci.yml`** - Complete CI/CD pipeline (all tests)

### What Runs on CI/CD

**On every push and pull request:**

1. **Backend Tests** (Job 1)
   - Linting (black, isort, flake8)
   - Unit tests (13 tests)
   - Integration tests (10 tests)
   - Coverage report to Codecov

2. **Frontend Tests** (Job 2)
   - Linting (ESLint)
   - Unit tests (9 tests)
   - Coverage report to Codecov

3. **E2E Tests** (Job 3) - Runs after jobs 1 & 2 pass
   - Starts PostgreSQL database
   - Runs Django backend
   - Builds Next.js frontend
   - Runs Playwright E2E tests (10 tests)
   - Uploads test reports and screenshots

4. **Build Verification** (Job 4)
   - Verifies production build works

### CI/CD Features

✅ **Parallel execution** - Backend and frontend tests run simultaneously
✅ **PostgreSQL database** - Real database, not SQLite
✅ **Test artifacts** - Playwright reports and screenshots uploaded
✅ **Coverage tracking** - Codecov integration
✅ **Failure screenshots** - Automatic screenshots on test failure
✅ **Smart caching** - pip and npm caches for faster builds

### Viewing Test Results

**On GitHub:**
1. Go to your repository
2. Click "Actions" tab
3. Click on a workflow run
4. View test results and download artifacts

**Playwright Report:**
- Download "playwright-report" artifact
- Extract and open `index.html` in browser
- Interactive report with traces, screenshots, and videos

**Test Screenshots (on failure):**
- Download "test-screenshots" artifact
- View screenshots of failed tests

### Environment Variables for CI

The workflows use these environment variables:
```yaml
DATABASE_URL: postgresql://taskflow:taskflow_password@localhost:5432/taskflow_db
SECRET_KEY: test-secret-key-for-ci
DEBUG: 'True'
CI: true
```

### Customizing CI/CD

**To run E2E tests only on main branch:**
```yaml
# In .github/workflows/e2e-tests.yml
on:
  push:
    branches: [main]
```

**To skip E2E tests in PR:**
Add `[skip e2e]` to your commit message

**To run on schedule:**
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

## Test Coverage

### Current E2E Tests (10 tests)

**Task Management Workflows:**
- ✅ Create task through UI
- ✅ Complete CRUD workflow
- ✅ Reorder tasks via drag & drop
- ✅ Filter tasks by priority
- ✅ Handle API errors gracefully
- ✅ Persist data after reload
- ✅ Update task inline
- ✅ Handle concurrent operations

**API Integration:**
- ✅ Backend health check
- ✅ Create via API, verify in UI

### Coverage Goals

- **Unit Tests** - Individual components (9 tests)
- **Integration Tests** - Backend workflows (10 tests)
- **E2E Tests** - Full stack workflows (10 tests)
- **Total Coverage** - 29 tests across all layers

## Common Issues

### Issue: Tests Fail with "Timeout"

**Solution:** Ensure backend is running and accessible:
```bash
curl http://localhost:8000/api/health/
```

### Issue: "Target closed" Error

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 30000, // 30 seconds
}
```

### Issue: Flaky Tests

**Solution:** Use auto-waiting and explicit waits:
```typescript
// Bad
await page.click('button');
await expect(page.locator('text=Success')).toBeVisible();

// Good
await page.click('button');
await page.waitForLoadState('networkidle');
await expect(page.locator('text=Success')).toBeVisible();
```

### Issue: Database State Pollution

**Solution:** Clean up after each test:
```typescript
test.afterEach(async ({ request }) => {
  // Delete all test tasks
  const tasks = await request.get('http://localhost:8000/api/tasks/');
  // ... delete each task
});
```

## Performance

Current E2E test performance:
- **10 tests:** ~15-30 seconds (depends on network/DB)
- **Parallel execution:** Supported (configure in `playwright.config.ts`)
- **Headless mode:** Faster than headed mode

## Adding New E2E Tests

1. Create test in `e2e/` directory
2. Use descriptive test names
3. Test complete user workflows
4. Verify both UI and data state
5. Add cleanup in `afterEach`
6. Run locally before committing

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Example: Complete E2E Test

```typescript
test('complete task lifecycle', async ({ page, request }) => {
  // 1. Setup - Navigate to app
  await page.goto('/tasks');
  await page.waitForLoadState('networkidle');

  // 2. Create - Add new task via UI
  await page.click('button:has-text("Add Task")');
  await page.fill('input[name="title"]', 'E2E Test');
  await page.fill('textarea[name="description"]', 'Testing E2E');
  await page.selectOption('select[name="priority"]', 'high');
  await page.click('button[type="submit"]');

  // 3. Verify - Task appears in UI
  await page.waitForSelector('text=E2E Test');
  const taskCard = page.locator('text=E2E Test').first();
  await expect(taskCard).toBeVisible();

  // 4. Verify - Task exists in backend
  const apiResponse = await request.get('http://localhost:8000/api/tasks/');
  const tasks = await apiResponse.json();
  const createdTask = tasks.find(t => t.title === 'E2E Test');
  expect(createdTask).toBeDefined();
  expect(createdTask.priority).toBe('high');

  // 5. Update - Edit the task
  await taskCard.click();
  await page.click('button[aria-label="Edit task"]');
  await page.fill('input[name="title"]', 'Updated E2E Test');
  await page.click('button[type="submit"]');

  // 6. Verify - Update reflected
  await expect(page.locator('text=Updated E2E Test')).toBeVisible();

  // 7. Complete - Mark as done
  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();
  await expect(checkbox).toBeChecked();

  // 8. Delete - Remove task
  await page.click('button[aria-label="Delete task"]');
  await page.click('button:has-text("Delete Task")');

  // 9. Verify - Task removed
  await expect(page.locator('text=Updated E2E Test')).not.toBeVisible();

  // 10. Cleanup - Verify database is clean
  const finalResponse = await request.get('http://localhost:8000/api/tasks/');
  const finalTasks = await finalResponse.json();
  const deletedTask = finalTasks.find(t => t.title.includes('E2E Test'));
  expect(deletedTask).toBeUndefined();
});
```
