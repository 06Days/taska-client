// app/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { TaskList, Task } from "@/app/checklist/types/task"; // Added Task import
import Navbar from "@/app/checklist/components/navbar";
import TaskCard from "@/app/checklist/components/TaskCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TaskaList() {
  const [lists, setTaskLists] = useState<TaskList[]>([]);
  const [newListTitle, setNewListTitle] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');

  const loadAll = async () => {
    try {
      const res = await fetch(`${API_URL}/task-lists`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTaskLists(data);
    } catch (e) {
      console.error('Load failed', e);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddList = () => {
    const newList = { title: newListTitle, name: newListName };

    fetch(`${API_URL}/task-lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newList),
    })
      .then((res) => res.json())
      .then((data) => {
        setTaskLists([...lists, data]);
        setNewListTitle('');
        setNewListName('');
      })
      .catch((error) => console.error('Error adding list', error));
  };

  const handleAddTask = (listId: number, title: string, dueDate: string) => {
    const newTask = { title, due_date: dueDate, done: false };

    fetch(`${API_URL}/task-lists/${listId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((data) => {
        setTaskLists(lists.map((list) => 
          list.id === listId ? { ...list, tasks: [...list.tasks, data] } : list
        ));
      })
      .catch((error) => console.error('Error adding task', error));
  };

  const handleDeleteTask = (taskId: number, listId: number) => {
    fetch(`${API_URL}/task-lists/${listId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setTaskLists(lists.map((list) => 
          list.id === listId ? { ...list, tasks: list.tasks.filter((task) => task.id !== taskId) } : list
        ));
      })
      .catch((error) => console.error('Error deleting task', error));
  };

  const toggleTaskDone = (taskId: number, listId: number) => {
    fetch(`${API_URL}/task-lists/${listId}/tasks/${taskId}/toggle`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        setTaskLists(lists.map((list) => 
          list.id === listId ? 
            { ...list, tasks: list.tasks.map((task) => task.id === taskId ? data : task) } : list
        ));
      })
      .catch((error) => console.error('Error toggling task', error));
  };

  const handleReorderTasks = (listId: number, newTasks: Task[], saveToBackend = false) => {
    setTaskLists(lists.map((list) => 
      list.id === listId ? { ...list, tasks: newTasks } : list
    ));

    if (saveToBackend) {
      fetch(`${API_URL}/task-lists/${listId}/tasks/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: newTasks }),
      }).catch((error) => console.error('Error reordering tasks', error));
    }
  };

  return (
    <div className="container py-4">
      <Navbar />
      
      {/* Create New List Section */}
      <div className="card mb-4 p-3 bg-light">
        <h5>Create New List</h5>
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="List Title"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
          />
          <input
            type="text"
            className="form-control"
            placeholder="List Name/Slug"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleAddList}>Add List</button>
        </div>
      </div>

      {/* Render Lists */}
      {lists.map((list) => (
        <TaskCard 
          key={list.id} 
          list={list} 
          onAddTask={handleAddTask} 
          onDeleteTask={handleDeleteTask} 
          onToggleTask={toggleTaskDone} 
          onReorderTasks={handleReorderTasks}
        />
      ))}
    </div>
  );
}