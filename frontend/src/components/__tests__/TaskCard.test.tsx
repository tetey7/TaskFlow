import { render, screen, fireEvent, waitFor } from '@/test-utils'
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

    const { container } = render(
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

  it('updates task title when edited inline', async () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

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
      />
    )

    const title = screen.getByText('Test Task')
    fireEvent.doubleClick(title)

    const input = screen.getByDisplayValue('Test Task')
    fireEvent.change(input, { target: { value: 'Updated Title' } })
    fireEvent.blur(input)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(mockTask.id, {
        ...mockTask,
        title: 'Updated Title',
      })
    })
  })

  it('calls onTaskUpdate with updated task data after successful inline edit', async () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()
    const mockOnToggleComplete = jest.fn()
    const mockOnTaskUpdate = jest.fn()

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
      />
    )

    const title = screen.getByText('Test Task')
    fireEvent.doubleClick(title)

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

    // Verify onEdit modal was NOT called (inline edit shouldn't trigger modal)
    expect(mockOnEdit).not.toHaveBeenCalled()
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
