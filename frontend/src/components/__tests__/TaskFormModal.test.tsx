import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import TaskFormModal from '../TaskFormModal';
import { tasksApi } from '@/lib/api';

jest.mock('@/lib/api');

describe('TaskFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form when no task is provided', () => {
      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    });

    it('should have empty form fields in create mode', () => {
      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement;

      expect(titleInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
      expect(prioritySelect.value).toBe('medium');
    });

    it('should create task successfully', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        id: 1,
        title: 'New Task',
        description: 'New Description',
        priority: 'high',
        completed: false,
      });
      (tasksApi.create as jest.Mock) = mockCreate;

      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'New Task' },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'New Description' },
      });
      fireEvent.change(screen.getByLabelText(/priority/i), {
        target: { value: 'high' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New Description',
          priority: 'high',
          completed: false,
        });
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show error when create fails', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      (tasksApi.create as jest.Mock) = mockCreate;

      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'New Task' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const mockTask = {
      id: 1,
      title: 'Existing Task',
      description: 'Existing Description',
      priority: 'medium' as const,
      completed: false,
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should render edit form when task is provided', () => {
      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={mockTask}
          mode="edit"
        />
      );

      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    });

    it('should populate form fields with task data', () => {
      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={mockTask}
          mode="edit"
        />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement;

      expect(titleInput.value).toBe('Existing Task');
      expect(descriptionInput.value).toBe('Existing Description');
      expect(prioritySelect.value).toBe('medium');
    });

    it('should update task successfully', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({
        ...mockTask,
        title: 'Updated Task',
        description: 'Updated Description',
        priority: 'high',
      });
      (tasksApi.update as jest.Mock) = mockUpdate;

      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={mockTask}
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Updated Task' },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: 'Updated Description' },
      });
      fireEvent.change(screen.getByLabelText(/priority/i), {
        target: { value: 'high' },
      });

      fireEvent.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(1, {
          title: 'Updated Task',
          description: 'Updated Description',
          priority: 'high',
          completed: false,
        });
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show error when update fails', async () => {
      const mockUpdate = jest.fn().mockRejectedValue(new Error('API Error'));
      (tasksApi.update as jest.Mock) = mockUpdate;

      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={mockTask}
          mode="edit"
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Updated Task' },
      });

      fireEvent.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to update task/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should not submit with empty title', async () => {
      const mockCreate = jest.fn();
      (tasksApi.create as jest.Mock) = mockCreate;

      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockCreate).not.toHaveBeenCalled();
      });
    });

    it('should allow empty description', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        id: 1,
        title: 'Task',
        description: '',
        priority: 'medium',
        completed: false,
      });
      (tasksApi.create as jest.Mock) = mockCreate;

      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Task' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          title: 'Task',
          description: '',
          priority: 'medium',
          completed: false,
        });
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should not render when isOpen is false', () => {
      render(
        <TaskFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
    });

    it('should call onClose when Cancel is clicked', () => {
      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form when modal closes and reopens', () => {
      const { rerender } = render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test' },
      });

      rerender(
        <TaskFormModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      rerender(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      expect(titleInput.value).toBe('');
    });
  });

  describe('Loading States', () => {
    it('should disable submit button while creating', async () => {
      const mockCreate = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      (tasksApi.create as jest.Mock) = mockCreate;

      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: 'Test' },
      });

      const submitButton = screen.getByRole('button', { name: /create/i });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Priority Options', () => {
    it('should render all priority options', () => {
      render(
        <TaskFormModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          task={null}
          mode="create"
        />
      );

      const prioritySelect = screen.getByLabelText(/priority/i);
      const options = prioritySelect.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('Low');
      expect(options[1]).toHaveTextContent('Medium');
      expect(options[2]).toHaveTextContent('High');
    });
  });
});
