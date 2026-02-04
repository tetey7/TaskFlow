import { test, expect } from '@playwright/test';

/**
 * E2E tests for task management workflows.
 * Tests the complete stack: Frontend UI → API → Backend → Database
 */

test.describe('Task Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page before each test
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new task through UI', async ({ page }) => {
    // Click "New Task" button
    await page.click('button:has-text("New Task")');

    // Fill in the form
    await page.fill('input#title', 'E2E Test Task');
    await page.fill('textarea#description', 'Created via E2E test');
    await page.selectOption('select#priority', 'high');

    // Submit the form
    await page.click('button[type="submit"]:has-text("Create Task")');

    // Wait for modal to close and network to be idle (task created)
    await page.waitForLoadState('networkidle');

    // Wait for task to appear
    await page.waitForSelector('text=E2E Test Task', { timeout: 10000 });

    // Verify task appears in the list
    const taskCard = page.locator('text=E2E Test Task').first();
    await expect(taskCard).toBeVisible();

    // Verify priority badge
    const priorityBadge = page.locator('.bg-red-100:has-text("High")').first();
    await expect(priorityBadge).toBeVisible();
  });

  test('should complete full CRUD workflow', async ({ page }) => {
    // 1. CREATE
    await page.click('button:has-text("New Task")');
    await page.fill('input#title', 'CRUD Test Task');
    await page.fill('textarea#description', 'Testing CRUD operations');
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=CRUD Test Task', { timeout: 10000 });

    // 2. READ - Verify task exists
    const taskCard = page.locator('text=CRUD Test Task').first();
    await expect(taskCard).toBeVisible();

    // 3. UPDATE - Edit the task
    await taskCard.click(); // Click to edit
    await page.click('button[aria-label="Edit task"]');

    await page.fill('input#title', 'Updated CRUD Task');
    await page.click('button[type="submit"]:has-text("Update")');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Updated CRUD Task', { timeout: 10000 });
    await expect(page.locator('text=Updated CRUD Task')).toBeVisible();

    // 4. COMPLETE - Mark as completed
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();

    // Verify strikethrough styling
    const completedTask = page.locator('text=Updated CRUD Task').first();
    await expect(completedTask).toHaveClass(/line-through/);

    // 5. DELETE
    await page.click('button[aria-label="Delete task"]');
    await page.click('button:has-text("Delete Task")'); // Confirm deletion

    // Verify task is removed
    await expect(page.locator('text=Updated CRUD Task')).not.toBeVisible();
  });

  test('should reorder tasks via drag and drop', async ({ page }) => {
    // Create multiple tasks
    const tasks = ['First Task', 'Second Task', 'Third Task'];

    for (const taskTitle of tasks) {
      await page.click('button:has-text("New Task")');
      await page.fill('input#title', taskTitle);
      await page.click('button[type="submit"]:has-text("Create Task")');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector(`text=${taskTitle}`, { timeout: 10000 });
    }

    // Get initial order
    const taskElements = await page.locator('[data-testid="task-card"]').all();
    const initialOrder = await Promise.all(
      taskElements.map(el => el.textContent())
    );

    // Drag first task to last position
    const firstTask = page.locator('text=First Task').first();
    const thirdTask = page.locator('text=Third Task').first();

    await firstTask.dragTo(thirdTask);

    // Wait for reorder API call to complete
    await page.waitForTimeout(500);

    // Verify new order
    const newTaskElements = await page.locator('[data-testid="task-card"]').all();
    const newOrder = await Promise.all(
      newTaskElements.map(el => el.textContent())
    );

    expect(newOrder).not.toEqual(initialOrder);
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Create tasks with different priorities
    const taskData = [
      { title: 'Low Priority Task', priority: 'low' },
      { title: 'Medium Priority Task', priority: 'medium' },
      { title: 'High Priority Task', priority: 'high' },
    ];

    for (const task of taskData) {
      await page.click('button:has-text("New Task")');
      await page.fill('input#title', task.title);
      await page.selectOption('select#priority', task.priority);
      await page.click('button[type="submit"]:has-text("Create Task")');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector(`text=${task.title}`, { timeout: 10000 });
    }

    // Verify all tasks are visible initially
    for (const task of taskData) {
      await expect(page.locator(`text=${task.title}`)).toBeVisible();
    }

    // Test priority badges are correct
    await expect(page.locator('.bg-green-100:has-text("Low")')).toBeVisible();
    await expect(page.locator('.bg-yellow-100:has-text("Medium")')).toBeVisible();
    await expect(page.locator('.bg-red-100:has-text("High")')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Try to create task with empty title (should fail validation)
    await page.click('button:has-text("New Task")');
    await page.fill('input#title', '');
    await page.click('button[type="submit"]:has-text("Create Task")');

    // Should show validation error or prevent submission
    // (Depends on your form validation implementation)
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible(); // Modal should still be open
  });

  test('should persist data after page reload', async ({ page }) => {
    // Create a task
    await page.click('button:has-text("New Task")');
    await page.fill('input#title', 'Persistent Task');
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Persistent Task', { timeout: 10000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify task still exists
    await expect(page.locator('text=Persistent Task')).toBeVisible();
  });

  test('should update task inline', async ({ page }) => {
    // Create a task
    await page.click('button:has-text("New Task")');
    await page.fill('input#title', 'Inline Edit Test');
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Inline Edit Test', { timeout: 10000 });

    // Double-click to edit inline
    const taskTitle = page.locator('text=Inline Edit Test').first();
    await taskTitle.dblclick();

    // Edit the title
    const input = page.locator('input[value="Inline Edit Test"]');
    await input.fill('Edited Inline');
    await input.press('Enter');

    // Verify update
    await page.waitForSelector('text=Edited Inline');
    await expect(page.locator('text=Edited Inline')).toBeVisible();
  });

  test('should handle concurrent operations', async ({ page, context }) => {
    // Create a task
    await page.click('button:has-text("New Task")');
    await page.fill('input#title', 'Concurrent Test');
    await page.click('button[type="submit"]:has-text("Create Task")');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Concurrent Test', { timeout: 10000 });

    // Open same page in new tab
    const newPage = await context.newPage();
    await newPage.goto('/tasks');
    await newPage.waitForLoadState('networkidle');

    // Both pages should show the task
    await expect(page.locator('text=Concurrent Test')).toBeVisible();
    await expect(newPage.locator('text=Concurrent Test')).toBeVisible();

    // Update from first page
    const checkbox1 = page.locator('input[type="checkbox"]').first();
    await checkbox1.check();

    // Refresh second page and verify update
    await newPage.reload();
    await newPage.waitForLoadState('networkidle');

    const checkbox2 = newPage.locator('input[type="checkbox"]').first();
    await expect(checkbox2).toBeChecked();

    await newPage.close();
  });
});

test.describe('API Integration', () => {
  test('should communicate with backend API correctly', async ({ request }) => {
    // Test direct API calls
    const response = await request.get('http://localhost:8000/api/health/');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toEqual({ status: 'ok' });
  });

  test('should create task via API and verify in UI', async ({ request, page }) => {
    // Create task via API
    const response = await request.post('http://localhost:8000/api/tasks/', {
      data: {
        title: 'API Created Task',
        description: 'Created directly via API',
        priority: 'medium',
        completed: false,
      },
    });

    expect(response.ok()).toBeTruthy();
    const task = await response.json();
    expect(task.title).toBe('API Created Task');

    // Verify in UI
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=API Created Task')).toBeVisible();
  });
});
