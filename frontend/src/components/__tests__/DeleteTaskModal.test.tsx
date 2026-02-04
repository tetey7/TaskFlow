import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import DeleteTaskModal from '../DeleteTaskModal';
import { tasksApi } from '@/lib/api';

jest.mock('@/lib/api');

describe('DeleteTaskModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <DeleteTaskModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        taskId={1}
        taskTitle="Test Task"
      />
    );

    expect(screen.queryByText('Delete Task')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        taskId={1}
        taskTitle="Test Task"
      />
    );

    expect(screen.getByRole('heading', { name: /delete task/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('"Test Task"')).toBeInTheDocument();
  });

  it('should call onClose when Cancel is clicked', () => {
    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        taskId={1}
        taskTitle="Test Task"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call delete API and onSuccess when confirmed', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (tasksApi.delete as jest.Mock) = mockDelete;

    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        taskId={1}
        taskTitle="Test Task"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete task/i }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should not call delete when taskId is null', async () => {
    const mockDelete = jest.fn();
    (tasksApi.delete as jest.Mock) = mockDelete;

    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        taskId={null}
        taskTitle="Test Task"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /delete task/i }));

    await waitFor(() => {
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  it('should disable button while deleting', async () => {
    const mockDelete = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    (tasksApi.delete as jest.Mock) = mockDelete;

    render(
      <DeleteTaskModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        taskId={1}
        taskTitle="Test Task"
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
  });
});
