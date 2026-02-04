import { Task } from '@/types/task';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status,
      response.statusText
    );
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}

export const tasksApi = {
  /**
   * Fetch all tasks
   */
  getAll: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE}/tasks/`);
    return handleResponse<Task[]>(response);
  },

  /**
   * Create a new task
   */
  create: async (
    task: Omit<Task, 'id' | 'created_at' | 'sort_order'>
  ): Promise<Task> => {
    const response = await fetch(`${API_BASE}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Update an existing task
   */
  update: async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE}/tasks/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(response);
  },

  /**
   * Delete a task
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/tasks/${id}/`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  /**
   * Reorder tasks
   */
  reorder: async (
    tasks: Array<{ id: number; sort_order: number }>
  ): Promise<void> => {
    const response = await fetch(`${API_BASE}/tasks/reorder/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_orders: tasks }),
    });
    return handleResponse<void>(response);
  },
};

export { ApiError };
