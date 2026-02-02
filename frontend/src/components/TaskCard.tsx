'use client';

import { EditIcon, DeleteIcon } from './icons';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  completed: boolean;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <div className="flex-1">
            <h2 className={`text-xl font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h2>
            <p className="text-gray-600 mt-2">{task.description}</p>
            <div className="flex items-center space-x-4 mt-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {task.priority}
              </span>
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
