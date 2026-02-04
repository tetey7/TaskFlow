import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../useTasks';
import { tasksApi } from '@/lib/api';

jest.mock('@/lib/api');

describe('useTasks', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      priority: 'high',
      completed: false,
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      priority: 'medium',
      completed: true,
      sort_order: 1,
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress act warnings - we're using waitFor which handles async updates correctly
    jest.spyOn(console, 'error').mockImplementation((message) => {
      if (typeof message === 'string' && message.includes('not wrapped in act')) {
        return;
      }
      console.warn(message);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with empty tasks and loading state', () => {
    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue([]);

    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should fetch tasks on mount', async () => {
    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual(mockTasks);
    expect(tasksApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (tasksApi.getAll as jest.Mock) = jest.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tasks).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('should refresh tasks', async () => {
    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue([...mockTasks, {
      id: 3,
      title: 'Task 3',
      description: 'Description 3',
      priority: 'low',
      completed: false,
      sort_order: 2,
      created_at: '2024-01-03T00:00:00Z',
    }]);

    await act(async () => {
      await result.current.fetchTasks();
    });

    expect(result.current.tasks).toHaveLength(3);
  });

  it('should handle reorder', async () => {
    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue(mockTasks);
    (tasksApi.reorder as jest.Mock) = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const reorderedTasks = [
      { id: 2, sort_order: 0 },
      { id: 1, sort_order: 1 },
    ];

    await act(async () => {
      await result.current.handleDragEnd({ active: { id: '2' }, over: { id: '1' } } as any);
    });

    expect(tasksApi.reorder).toHaveBeenCalled();
  });

  it('should handle reorder error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue(mockTasks);
    (tasksApi.reorder as jest.Mock) = jest.fn().mockRejectedValue(new Error('Reorder failed'));

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const reorderedTasks = [
      { id: 2, sort_order: 0 },
      { id: 1, sort_order: 1 },
    ];

    await act(async () => {
      await result.current.handleDragEnd({ active: { id: '2' }, over: { id: '1' } } as any);
    });

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('should update task in local state', async () => {
    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedTask = { ...mockTasks[0], title: 'Updated Task 1' };

    act(() => {
      result.current.updateTask(updatedTask);
    });

    expect(result.current.tasks[0].title).toBe('Updated Task 1');
  });

  it('should not update non-existent task', async () => {
    (tasksApi.getAll as jest.Mock) = jest.fn().mockResolvedValue(mockTasks);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const nonExistentTask = {
      id: 999,
      title: 'Non-existent',
      description: '',
      priority: 'low',
      completed: false,
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
    };

    act(() => {
      result.current.updateTask(nonExistentTask);
    });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.find(t => t.id === 999)).toBeUndefined();
  });
});
