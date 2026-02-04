import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import TaskCard from '../TaskCard'
import { Task } from '@/types/task'
import { tasksApi } from '@/lib/api'

// Mock fetch globally
global.fetch = jest.fn()

// Mock the API layer
jest.mock('@/lib/api', () => ({
  tasksApi: {
    update: jest.fn(),
  },
}))

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  priority: 'medium',
  due_date: '2024-12-31',
  completed: false,
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
}

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders task information correctly', () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
      />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('displays priority badge with correct color', () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
      />
    )

    const priorityBadge = screen.getByText('medium')
    expect(priorityBadge).toBeInTheDocument()
    expect(priorityBadge).toHaveClass('bg-yellow-100')
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
      />
    )

    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask)
  })

  it('calls onDelete when delete button is clicked', () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
      />
    )

    const deleteButton = screen.getByTitle('Delete task')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockTask)
  })

  it('toggles completed status when checkbox is clicked', async () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockOnToggleComplete).toHaveBeenCalledWith(mockTask)
  })

  it('enters edit mode when title is double-clicked', () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
      />
    )

    const title = screen.getByText('Test Task')
    fireEvent.doubleClick(title)

    const input = screen.getByDisplayValue('Test Task')
    expect(input).toBeInTheDocument()
  })

  it('calls onTaskUpdate with updated task data after successful inline edit', async () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()
    const mockOnEditingChange = jest.fn()

    // Mock successful API update
    const mockUpdate = tasksApi.update as jest.Mock
    mockUpdate.mockResolvedValueOnce({ ...mockTask, title: 'Updated Title' })

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
        onEditingChange={mockOnEditingChange}
      />
    )

    const title = screen.getByText('Test Task')
    fireEvent.doubleClick(title)

    // Verify editing mode was entered
    await waitFor(() => {
      expect(mockOnEditingChange).toHaveBeenCalledWith(true)
    })

    const input = screen.getByDisplayValue('Test Task')
    fireEvent.change(input, { target: { value: 'Updated Title' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        title: 'Updated Title',
      })
    })

    // Verify the API was called with correct data
    expect(mockUpdate).toHaveBeenCalledWith(mockTask.id, {
      ...mockTask,
      title: 'Updated Title',
    })

    // Verify editing mode was exited after save
    await waitFor(() => {
      expect(mockOnEditingChange).toHaveBeenCalledWith(false)
    })

    // Verify card is no longer in edit mode (input should be gone)
    expect(screen.queryByDisplayValue('Updated Title')).not.toBeInTheDocument()

    // Verify onEdit modal was NOT called (inline edit shouldn't trigger modal)
    expect(mockOnEdit).not.toHaveBeenCalled()
  })

  it('exits editing mode and notifies parent when inline edit completes', async () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()
    const mockOnEditingChange = jest.fn()

    // Mock successful API update
    const mockUpdate = tasksApi.update as jest.Mock
    mockUpdate.mockResolvedValueOnce({ ...mockTask, description: 'Updated Description' })

    const { rerender } = render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
        onEditingChange={mockOnEditingChange}
      />
    )

    // Double-click description to edit
    const description = screen.getByText('Test Description')
    fireEvent.doubleClick(description)

    // Verify editing mode was entered
    await waitFor(() => {
      expect(mockOnEditingChange).toHaveBeenCalledWith(true)
    })

    const textarea = screen.getByDisplayValue('Test Description')
    expect(textarea).toBeInTheDocument()

    // Update and save
    fireEvent.change(textarea, { target: { value: 'Updated Description' } })
    fireEvent.blur(textarea)

    // Verify editing mode was exited
    await waitFor(() => {
      expect(mockOnEditingChange).toHaveBeenCalledWith(false)
    })

    // Verify onTaskUpdate was called
    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledWith({
        ...mockTask,
        description: 'Updated Description',
      })
    })

    // Rerender with updated task to simulate parent state update
    rerender(
      <TaskCard
        task={{ ...mockTask, description: 'Updated Description' }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
        onEditingChange={mockOnEditingChange}
      />
    )

    // Verify textarea is gone (not in edit mode anymore)
    expect(screen.queryByDisplayValue('Updated Description')).not.toBeInTheDocument()

    // Verify the updated text is displayed as regular text
    expect(screen.getByText('Updated Description')).toBeInTheDocument()

    // Verify editing state was properly managed (entered and exited)
    expect(mockOnEditingChange).toHaveBeenCalledWith(true)  // Entered editing
    expect(mockOnEditingChange).toHaveBeenCalledWith(false) // Exited editing

    // Verify the last call was false (not in editing mode)
    const lastCall = mockOnEditingChange.mock.calls[mockOnEditingChange.mock.calls.length - 1]
    expect(lastCall[0]).toBe(false)
  })

  it('displays completed task with strikethrough', () => {
    const completedTask = { ...mockTask, completed: true }
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

    render(
      <TaskCard
        task={completedTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleComplete={mockOnToggleComplete}
        onTaskUpdate={mockOnTaskUpdate}
      />
    )

    const title = screen.getByText('Test Task')
    expect(title).toHaveClass('line-through')
  })
})
