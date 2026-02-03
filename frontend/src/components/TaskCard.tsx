'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/task';
import { tasksApi } from '@/lib/api';
import { EditIcon, DeleteIcon } from './icons';
import { cn } from '@/lib/utils';

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

// Shared styles for editing inputs
const EDIT_STYLES = {
  input: 'text-xl font-semibold w-full border-2 border-blue-500 rounded px-2 py-1 focus:outline-none text-gray-900',
  textarea: 'text-gray-900 mt-2 w-full border-2 border-blue-500 rounded px-2 py-1 focus:outline-none resize-none',
  title: 'text-xl font-semibold cursor-text',
  description: 'text-gray-600 mt-2 cursor-text',
  priorityButton: 'w-full text-left px-4 py-2 text-sm font-medium',
  actionButton: 'p-2 text-gray-600 rounded-md transition-colors',
} as const;

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

  const updateField = (field: keyof EditableTaskFields, value: string) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const cancelEdit = (field: keyof EditableTaskFields) => {
    setEditedValues(prev => ({ ...prev, [field]: task[field] }));
    setEditingField(null);
  };

  const saveField = async (field: keyof EditableTaskFields) => {
    const value = editedValues[field];
    const originalValue = task[field];

    if (value.trim() && value !== originalValue) {
      await saveTask({ ...task, [field]: value });
    } else {
      setEditedValues(prev => ({ ...prev, [field]: originalValue }));
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
                onChange={(e) => updateField('title', e.target.value)}
                onBlur={() => saveField('title')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveField('title');
                  if (e.key === 'Escape') cancelEdit('title');
                }}
                className={EDIT_STYLES.input}
              />
            ) : (
              <h2
                onDoubleClick={() => setEditingField('title')}
                className={cn(EDIT_STYLES.title, {
                  'text-gray-500 line-through': task.completed,
                  'text-gray-900': !task.completed,
                })}
              >
                {task.title}
              </h2>
            )}

            {editingField === 'description' ? (
              <textarea
                ref={refs.description}
                value={editedValues.description}
                onChange={(e) => updateField('description', e.target.value)}
                onBlur={() => saveField('description')}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelEdit('description');
                }}
                className={EDIT_STYLES.textarea}
                rows={3}
              />
            ) : (
              <p
                onDoubleClick={() => setEditingField('description')}
                className={EDIT_STYLES.description}
              >
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-4 mt-4">
              <div ref={refs.priority} className="relative">
                <span
                  onDoubleClick={() => setEditingField('priority')}
                  className={cn(
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
                      className={cn(EDIT_STYLES.priorityButton, 'hover:bg-green-50 text-green-800')}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => handlePriorityChange('medium')}
                      className={cn(EDIT_STYLES.priorityButton, 'hover:bg-yellow-50 text-yellow-800')}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => handlePriorityChange('high')}
                      className={cn(EDIT_STYLES.priorityButton, 'hover:bg-red-50 text-red-800')}
                    >
                      High
                    </button>
                  </div>
                )}
              </div>
              <span
                className={cn('text-sm', {
                  'text-green-600': task.completed,
                  'text-gray-500': !task.completed,
                })}
              >
                {task.completed ? '✓ Completed' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className={cn(EDIT_STYLES.actionButton, 'hover:text-blue-600 hover:bg-blue-50')}
            title="Edit task"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(task)}
            className={cn(EDIT_STYLES.actionButton, 'hover:text-red-600 hover:bg-red-50')}
            title="Delete task"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
