export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  due_date?: string;
  completed: boolean;
  sort_order: number;
  created_at?: string;
}
