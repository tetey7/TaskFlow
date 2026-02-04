'use client';

import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api';
import FormModal from './FormModal';

interface Task {
  id?: number;
  title: string;
  description: string;
  priority: string;
  completed: boolean;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
  mode: 'create' | 'edit';
}

export default function TaskFormModal({ isOpen, onClose, onSuccess, task, mode }: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setCompleted(task.completed);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCompleted(false);
    }
    setError('');
  }, [task, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        priority,
        completed,
      };

      if (mode === 'edit' && task?.id) {
        await tasksApi.update(task.id, taskData);
      } else {
        await tasksApi.create(taskData);
      }

      setTitle('');
      setDescription('');
      setPriority('medium');
      setCompleted(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError(`Failed to ${mode} task. Please try again.`);
      console.error(`Error ${mode}ing task:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={mode === 'edit' ? 'Edit Task' : 'Create New Task'}
      submitText={mode === 'edit' ? 'Update Task' : 'Create Task'}
      isSubmitting={isSubmitting}
      error={error}
    >
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {mode === 'edit' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="completed" className="ml-2 text-sm font-medium text-gray-700">
                    Mark as completed
                  </label>
                </div>
              )}
            </div>
    </FormModal>
  );
}
