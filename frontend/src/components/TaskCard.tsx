'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/types/task';
import { tasksApi } from '@/lib/api';
import { EditIcon, DeleteIcon } from './icons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete, onTaskUpdate }: TaskCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedPriority, setEditedPriority] = useState(task.priority);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setIsEditingPriority(false);
      }
    };

    if (isEditingPriority) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingPriority]);

  const handleTitleSave = async () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      await saveTask({ ...task, title: editedTitle });
    } else {
      setEditedTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = async () => {
    if (editedDescription.trim() && editedDescription !== task.description) {
      await saveTask({ ...task, description: editedDescription });
    } else {
      setEditedDescription(task.description);
    }
    setIsEditingDescription(false);
  };

  const handlePriorityChange = async (newPriority: string) => {
    setEditedPriority(newPriority);
    setIsEditingPriority(false);
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
      setEditedTitle(task.title);
      setEditedDescription(task.description);
      setEditedPriority(task.priority);
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
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setEditedTitle(task.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl font-semibold w-full border-2 border-blue-500 rounded px-2 py-1 focus:outline-none text-gray-900"
              />
            ) : (
              <h2
                onDoubleClick={() => setIsEditingTitle(true)}
                className={`text-xl font-semibold cursor-text ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}
              >
                {task.title}
              </h2>
            )}

            {isEditingDescription ? (
              <textarea
                ref={descriptionInputRef}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setEditedDescription(task.description);
                    setIsEditingDescription(false);
                  }
                }}
                className="text-gray-900 mt-2 w-full border-2 border-blue-500 rounded px-2 py-1 focus:outline-none resize-none"
                rows={3}
              />
            ) : (
              <p
                onDoubleClick={() => setIsEditingDescription(true)}
                className="text-gray-600 mt-2 cursor-text"
              >
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-4 mt-4">
              <div ref={priorityRef} className="relative">
                <span
                  onDoubleClick={() => setIsEditingPriority(true)}
                  className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {task.priority}
                </span>

                {isEditingPriority && (
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
