'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Task } from '@/types/task';
import { tasksApi } from '@/lib/api';
import { EditIcon, DeleteIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

// Define which Task fields are editable inline
type EditableTaskFields = Pick<Task, 'title' | 'description' | 'priority'>;
type EditingField = keyof EditableTaskFields | null;

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete, onTaskUpdate, onEditingChange }: TaskCardProps) {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [editedValues, setEditedValues] = useState<EditableTaskFields>({
    title: task.title,
    description: task.description,
    priority: task.priority,
  });

  const refs = {
    title: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    priority: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    if (editingField === 'title' && refs.title.current) {
      refs.title.current.focus();
      refs.title.current.select();
    } else if (editingField === 'description' && refs.description.current) {
      refs.description.current.focus();
      refs.description.current.select();
    }
  }, [editingField]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refs.priority.current && !refs.priority.current.contains(event.target as Node)) {
        setEditingField(null);
      }
    };

    if (editingField === 'priority') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingField]);

  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(editingField !== null);
    }
  }, [editingField, onEditingChange]);

  const handleTitleSave = async () => {
    if (editedValues.title.trim() && editedValues.title !== task.title) {
      await saveTask({ ...task, title: editedValues.title });
    } else {
      setEditedValues(prev => ({ ...prev, title: task.title }));
    }
    setEditingField(null);
  };

  const handleDescriptionSave = async () => {
    if (editedValues.description.trim() && editedValues.description !== task.description) {
      await saveTask({ ...task, description: editedValues.description });
    } else {
      setEditedValues(prev => ({ ...prev, description: task.description }));
    }
    setEditingField(null);
  };

  const handlePriorityChange = async (newPriority: string) => {
    setEditingField(null);
    if (newPriority !== task.priority) {
      await saveTask({ ...task, priority: newPriority });
    }
  };

  const saveTask = async (updatedTask: Task) => {
    try {
      await tasksApi.update(task.id, updatedTask);

      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setEditedValues({
        title: task.title,
        description: task.description,
        priority: task.priority,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow select-none">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <div className="flex-1">
            {editingField === 'title' ? (
              <input
                ref={refs.title}
                type="text"
                value={editedValues.title}
                onChange={(e) => setEditedValues(prev => ({ ...prev, title: e.target.value }))}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setEditedValues(prev => ({ ...prev, title: task.title }));
                    setEditingField(null);
                  }
                }}
                className="text-xl font-semibold w-full border-2 border-blue-500 rounded px-2 py-1 focus:outline-none text-gray-900"
              />
            ) : (
              <h2
                onDoubleClick={() => setEditingField('title')}
                className={`text-xl font-semibold cursor-text ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}
              >
                {task.title}
              </h2>
            )}

            {editingField === 'description' ? (
              <textarea
                ref={refs.description}
                value={editedValues.description}
                onChange={(e) => setEditedValues(prev => ({ ...prev, description: e.target.value }))}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditedValues(prev => ({ ...prev, description: task.description }));
                    setEditingField(null);
                  }
                }}
                className="text-gray-900 mt-2 w-full border-2 border-blue-500 rounded px-2 py-1 focus:outline-none resize-none"
                rows={3}
              />
            ) : (
              <p
                onDoubleClick={() => setEditingField('description')}
                className="text-gray-600 mt-2 cursor-text"
              >
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-4 mt-4">
              <div ref={refs.priority} className="relative">
                <span
                  onDoubleClick={() => setEditingField('priority')}
                  className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium cursor-pointer',
                    {
                      'bg-red-100 text-red-800': task.priority === 'high',
                      'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                      'bg-green-100 text-green-800': task.priority === 'low',
                    }
                  )}
                >
                  {task.priority}
                </span>

                {editingField === 'priority' && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => handlePriorityChange('low')}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-green-800 font-medium"
                    >
                      Low
                    </button>
                    <button
                      onClick={() => handlePriorityChange('medium')}
                      className="w-full text-left px-4 py-2 hover:bg-yellow-50 text-sm text-yellow-800 font-medium"
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => handlePriorityChange('high')}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-800 font-medium"
                    >
                      High
                    </button>
                  </div>
                )}
              </div>
              <span
                className={`text-sm ${
                  task.completed ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {task.completed ? '✓ Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit task"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete task"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
