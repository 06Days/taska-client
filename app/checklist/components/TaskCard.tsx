import { TaskList, Task } from "@/app/checklist/types/task";
import { useState, useRef } from "react";
import { ReactSortable } from "react-sortablejs";

interface TaskCardProps {
  list: TaskList;
  onAddTask: (listId: number, title: string, dueDate: string) => void;
  onDeleteTask: (taskId: number, listId: number) => void;
  onToggleTask: (taskId: number, listId: number) => void;
  onReorderTasks: (listId: number, newTasks: Task[], saveToBackend?: boolean) => void;
}

export default function TaskCard({ list, onAddTask, onDeleteTask, onToggleTask, onReorderTasks }: TaskCardProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  
  // Keep track of the live tasks array during drag operations
  const latestTasksRef = useRef<Task[]>(list.tasks);
  latestTasksRef.current = list.tasks;

  const handleAddClick = () => {
    if (!taskTitle) return;
    onAddTask(list.id, taskTitle, taskDueDate);
    setTaskTitle('');
    setTaskDueDate('');
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h5 className="card-title mb-0">{list.title}</h5>
      </div>
      <div className="card-body">
        <ReactSortable
          tag="ul"
          className="list-unstyled m-0"
          list={list.tasks}
          setList={(newTasks) => {
            latestTasksRef.current = newTasks;
            onReorderTasks(list.id, newTasks, false);
          }}
          onEnd={() => {
            // Use the ref to grab the actual newly sorted array when dropped
            onReorderTasks(list.id, latestTasksRef.current, true);
          }}
          animation={150}
        >
          {list.tasks.map((task) => (
            <li key={task.id} className="mb-2 d-flex justify-content-between align-items-center">
              <div>
                <input 
                  type="checkbox" 
                  checked={task.isCompleted} 
                  onChange={() => task.id && onToggleTask(task.id, list.id)} 
                  className="me-2"
                />
                <span className={task.isCompleted ? "text-decoration-line-through text-muted" : ""}>
                  {task.title || task.name}
                </span>
                <span className="ms-3 text-muted small">{task.due_date}</span>
              </div>
              {task.id && (
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => onDeleteTask(task.id!, list.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ReactSortable>
      </div>
      <div className="card-footer">
        <div className="mb-2">
          <input
            type="text"
            className="form-control mb-1"
            placeholder="Task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={taskDueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-primary w-100" 
          onClick={handleAddClick}
        >
          Add Task
        </button>
      </div>
    </div>
  );
}