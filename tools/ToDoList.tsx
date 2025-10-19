import React, { useState, FormEvent } from 'react';
import { TrashIcon } from '../components/icons';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const ToDoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    const newTask: Task = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">To-Do List</h2>
        <p className="mt-1 text-md text-gray-600 dark:text-slate-400">Keep track of your tasks and stay organized.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl mx-auto dark:bg-slate-800 dark:border-slate-700">
        <form onSubmit={addTask} className="flex gap-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          />
          <button type="submit" className="px-5 py-2 bg-[var(--theme-primary)] text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-colors">
            Add
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {tasks.map(task => (
            <li
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                task.completed ? 'bg-gray-100 text-gray-500 dark:bg-slate-700/50 dark:text-slate-500' : 'bg-white dark:bg-slate-700'
              }`}
            >
              <span
                onClick={() => toggleTask(task.id)}
                className={`cursor-pointer flex-grow ${
                  task.completed ? 'line-through' : 'text-gray-800 dark:text-slate-200'
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-500 hover:bg-red-100 rounded-full dark:hover:bg-red-900/50"
                aria-label="Delete task"
              >
                <TrashIcon className="w-5 h-5"/>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ToDoList;