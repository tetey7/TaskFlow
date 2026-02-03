import { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task } from '@/types/task';
import { tasksApi } from '@/lib/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  }, []);

  const toggleComplete = useCallback(
    async (task: Task) => {
      // Optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );

      try {
        await tasksApi.update(task.id, {
          ...task,
          completed: !task.completed,
        });
      } catch (err) {
        console.error('Error toggling task completion:', err);
        // Revert on error
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, completed: task.completed } : t
          )
        );
        setError('Failed to update task');
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);

        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        const updatedTasks = newTasks.map((task, index) => ({
          ...task,
          sort_order: index,
        }));

        // Optimistic update
        setTasks(updatedTasks);

        try {
          const taskOrders = updatedTasks.map((task) => ({
            id: task.id,
            sort_order: task.sort_order,
          }));

          await tasksApi.reorder(taskOrders);
        } catch (err) {
          console.error('Error reordering tasks:', err);
          setError('Failed to reorder tasks');
          // Refetch to get correct order
          fetchTasks();
        }
      }
    },
    [tasks, fetchTasks]
  );

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTask,
    toggleComplete,
    handleDragEnd,
  };
}
