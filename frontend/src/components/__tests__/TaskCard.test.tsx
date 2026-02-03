import { render, screen, fireEvent, waitFor } from '@/test-utils'
import TaskCard from '../TaskCard'
import { Task } from '@/types/task'

// Mock fetch globally
global.fetch = jest.fn()

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

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockTask, title: 'Updated Title' }),
    })

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
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/tasks/${mockTask.id}/`,
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('Updated Title'),
        })
      )
    })
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
