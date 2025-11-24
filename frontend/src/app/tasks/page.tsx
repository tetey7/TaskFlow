'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from Django API through Next.js proxy
    // Always use trailing slash for Django compatibility
    fetch('/api/tasks/')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Tasks</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="border p-4 mb-2">
            <h2 className="font-bold">{task.title}</h2>
            <p>{task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
