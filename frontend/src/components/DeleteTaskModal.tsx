'use client';

import { useState } from 'react';
import { tasksApi } from '@/lib/api';
import AlertModal from './AlertModal';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: number | null;
  taskTitle: string;
}

export default function DeleteTaskModal({ isOpen, onClose, onSuccess, taskId, taskTitle }: DeleteTaskModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!taskId) return;

    setIsDeleting(true);

    try {
      await tasksApi.delete(taskId);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Task"
      message={
        <>
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold">"{taskTitle}"</span>?
          </p>
          <p className="text-gray-500 text-sm mt-2">
            This action cannot be undone.
          </p>
        </>
      }
      confirmText="Delete Task"
      isLoading={isDeleting}
      variant="danger"
    />
  );
}
