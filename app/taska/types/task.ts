// /types/task.ts
// our interface pattern for loading the tasks and lists from backend
interface Task {
  id?: number;
  title?: string;
  isCompleted: boolean;
  listPosition: number;
  // due_date?: string;
}

interface TaskList {
  id: number;
  title: string;
  name: string;
  tasks: Task[];
}