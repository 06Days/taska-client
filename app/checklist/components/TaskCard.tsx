import { TaskList, Task } from "@/app/checklist/types/task";
import { useState, useRef, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";
import AddTaskModal from './AddTaskModal';
import styles from './TaskCard.module.css';
interface TaskCardProps {
  list: TaskList;
  onAddTask: (listId: number, title: string, dueDate: string) => void;
  onDeleteTask: (taskId: number, listId: number) => void;
  onToggleTask: (taskId: number, listId: number) => void;
  onReorderTasks: (listId: number, newTasks: Task[], saveToBackend?: boolean) => void;
  onUpdateListTitle?: (listId: number, newTitle: string) => void;
  onUpdateTaskTitle?: (taskId: number, listId: number, newTitle: string) => void;
  isEditingMode: boolean;
  toggleEdit: () =>void;
}

export default function TaskCard({ list, onAddTask, onDeleteTask, onToggleTask, onReorderTasks, isEditingMode,onUpdateListTitle,
  onUpdateTaskTitle}: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // for editing the titles of either lists or tasks
  const [isEditingListTitle, setIsEditingListTitle] = useState(false);
  const [listTitleInput, setListTitleInput] = useState(list?.title || '');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskTitleInput, setTaskTitleInput] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  // Safely fallback to an empty array to prevent undefined errors
  const tasksData = list?.tasks || [];

  // Keep track of the live tasks array during drag operations
  const latestTasksRef = useRef<Task[]>(tasksData);
  latestTasksRef.current = tasksData;

  useEffect(() => {
    if (isEditingListTitle || editingTaskId !== null) {
      inputRef.current?.focus();
    }
  }, [isEditingListTitle, editingTaskId]);

  const handleSaveListTitle = () => {
    if (listTitleInput.trim() && listTitleInput !== list.title && onUpdateListTitle) {
      onUpdateListTitle(list.id, listTitleInput.trim());
    }
    setIsEditingListTitle(false);
  };

  const handleSaveTaskTitle = (taskId: number) => {
    if (taskTitleInput.trim() && onUpdateTaskTitle) {
      onUpdateTaskTitle(taskId, list.id, taskTitleInput.trim());
    }
    setEditingTaskId(null);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
return (
    <div className={`card mb-3 ${styles.listcontainer}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        {isEditingListTitle ? (
          <input
            ref={inputRef}
            type="text"
            className="form-control form-control-sm w-50"
            value={listTitleInput}
            onChange={(e) => setListTitleInput(e.target.value)}
            onBlur={handleSaveListTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveListTitle()}
          />
        ) : (
          <h5 
            className="input m-0" 
            role="button" 
            title="Click to edit title"
            onClick={() => {
              setListTitleInput(list.title);
              setIsEditingListTitle(true);
            }}
          >
            {list?.title || 'Task List'}
          </h5>
        )}
        
        <button 
          className="btn btn-sm btn-primary" 
          onClick={() => setIsModalOpen(true)}
        >
          + Add Task
        </button>
      </div>
    
      <div className="card-body">
        <ReactSortable
          tag="ul"
          className="list-unstyled m-0"
          list={tasksData}
          setList={(newTasks) => {
            latestTasksRef.current = newTasks;
            onReorderTasks(list.id, newTasks, false);
          }}
          onEnd={() => {
            onReorderTasks(list.id, latestTasksRef.current, true);
          }}
          animation={150}
        >
          {tasksData.map((task) => {
            const taskId = task.id!;
            const isEditingThisTask = editingTaskId === taskId;
            const displayTitle = task.title || task.name || '';

            return (
              <li key={taskId} className={`mb-2 d-flex justify-content-between align-items-center ${styles.taskitem}`}>
                <div className="d-flex align-items-center flex-grow-1 me-2">
                  <input 
                    type="checkbox" 
                    checked={task.isCompleted} 
                    onChange={() => onToggleTask(taskId, list.id)} 
                    className={`me-2 ${styles.checkmark}`}
                  />
                  
                  {isEditingThisTask ? (
                    <input
                      ref={inputRef}
                      type="text"
                      className="form-control form-control-sm"
                      value={taskTitleInput}
                      onChange={(e) => setTaskTitleInput(e.target.value)}
                      onBlur={() => handleSaveTaskTitle(taskId)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTaskTitle(taskId)}
                    />
                  ) : (
                    <span 
                      role="button"
                      title="Click to edit task"
                      className={`flex-grow-1 ${task.isCompleted ? "text-decoration-line-through text-muted" : ""}`}
                      onClick={() => {
                        setEditingTaskId(taskId);
                        setTaskTitleInput(displayTitle);
                      }}
                    >
                      {displayTitle}
                    </span>
                  )}
                  
                  <span className="ms-3 text-muted small text-nowrap">{task.due_date}</span>
                </div>
                
                {isEditingMode && (
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => onDeleteTask(taskId, list.id)}
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ReactSortable>
      </div>
     
      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(title, dueDate) => onAddTask(list.id, title, dueDate)}
          listTitle={list?.title}
        />
      )}
    </div>
  );
}