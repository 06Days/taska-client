import { TaskList, Task } from "@/app/checklist/types/task";
import { useState, useRef } from "react";
import { ReactSortable } from "react-sortablejs";
import AddTaskModal from './AddTaskModal';

interface TaskCardProps {
  list: TaskList;
  onAddTask: (listId: number, title: string, dueDate: string) => void;
  onDeleteTask: (taskId: number, listId: number) => void;
  onToggleTask: (taskId: number, listId: number) => void;
  onReorderTasks: (listId: number, newTasks: Task[], saveToBackend?: boolean) => void;
  isEditingMode: boolean;
  toggleEdit: () =>boolean;
}

export default function TaskCard({ list, onAddTask, onDeleteTask, onToggleTask, onReorderTasks, isEditingMode}: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Safely fallback to an empty array to prevent undefined errors
  const tasksData = list?.tasks || [];

  // Keep track of the live tasks array during drag operations
  const latestTasksRef = useRef<Task[]>(tasksData);
  latestTasksRef.current = tasksData;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">{list?.title || 'Task List'}</h5>
        <button 
          className="btn btn-sm btn-primary" 
          onClick={handleOpenModal}
        >
          + Add Task
        </button>
      </div>
    
      <div className="card-body">
        <ReactSortable
          tag="ul"
          className="list-unstyled m-0"
          list={tasksData} // Guaranteed to be an array
          setList={(newTasks) => {
            latestTasksRef.current = newTasks;
            onReorderTasks(list.id, newTasks, false);
          }}
          onEnd={() => {
            onReorderTasks(list.id, latestTasksRef.current, true);
          }}
          animation={150}
        >
          {tasksData.map((task) => (
            <li key={task.id} className="mb-2 d-flex justify-content-between align-items-center">
              <div>
                
                <span className={task.isCompleted ? "text-decoration-line-through text-muted" : ""}>
                  {task.title || task.name}
                </span>
                <input 
                  type="checkbox" 
                  checked={task.isCompleted} 
                  onChange={() => task.id && onToggleTask(task.id, list.id)} 
                  className="me-2"
                />
                <span className="ms-3 text-muted small">{task.due_date}</span>
              </div>
              {
              (task.id && isEditingMode ) && (
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={() => onDeleteTask(task.id!, list.id)}
                >
                  Delete
                </button>
              )
              }
            </li>
          ))}
        </ReactSortable>
      </div>
     
      {isModalOpen && (
        <AddTaskModal
          onClose={handleCloseModal}
          onSubmit={(title, dueDate) => onAddTask(list.id, title, dueDate)}
          listTitle={list?.title}
        />
      )}
    </div>
  );
}
