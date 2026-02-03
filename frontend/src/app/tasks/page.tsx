'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Header from '@/components/Header';
import TaskFormModal from '@/components/TaskFormModal';
import DeleteTaskModal from '@/components/DeleteTaskModal';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
}

function SortableTaskCard({ task, onEdit, onDelete, onToggleComplete, onTaskUpdate }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
        onTaskUpdate={onTaskUpdate}
      />
    </div>
  );
}

export default function TasksPage() {
  const { tasks, loading, fetchTasks, updateTask, toggleComplete, handleDragEnd } = useTasks();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const handleNewTask = () => {
    setFormMode('create');
    setSelectedTask(null);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setFormMode('edit');
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewTask={handleNewTask} />

      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchTasks}
        task={selectedTask}
        mode={formMode}
      />

      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchTasks}
        taskId={selectedTask?.id || null}
        taskTitle={selectedTask?.title || ''}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your tasks and stay organized</p>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No tasks yet. Create your first task to get started!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {tasks.map(task => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggleComplete={toggleComplete}
                    onTaskUpdate={updateTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
}
