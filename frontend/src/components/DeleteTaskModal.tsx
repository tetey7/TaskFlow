'use client';

import { useState } from 'react';
import { tasksApi } from '@/lib/api';
import Modal from './Modal';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: number | null;
  taskTitle: string;
}

export default function DeleteTaskModal({ isOpen, onClose, onSuccess, taskId, taskTitle }: DeleteTaskModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!taskId) return;

    setError('');
    setIsDeleting(true);

    try {
      await tasksApi.delete(taskId);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-700">
          Are you sure you want to delete <span className="font-semibold">"{taskTitle}"</span>?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Task'}
        </button>
      </div>
    </Modal>
  );
}
