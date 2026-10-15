/**
 * Single source of truth for the board.
 *
 * All changes go through the functions below, and each one ends with
 * commit(): save to storage, then notify the renderer. That gives the app
 * one predictable data flow: update state -> save -> re-render.
 */

import { loadTasks, saveTasks } from './storage.js';
import { createSampleTasks } from './sampleTasks.js';

/** Column order matters: it defines what "move left/right" means. */
export const STATUSES = ['todo', 'in-progress', 'done'];

export const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

let tasks = [];
let onChange = () => {};

function commit() {
  saveTasks(tasks);
  onChange(tasks);
}

/** Registers the function to run after every state change (the renderer). */
export function subscribe(listener) {
  onChange = listener;
}

/** Loads saved tasks, or seeds the board with examples on a first visit. */
export function initStore() {
  tasks = loadTasks() ?? createSampleTasks();
  commit();
}

export function getTasks() {
  return tasks;
}

export function getTask(id) {
  return tasks.find((task) => task.id === id);
}

export function addTask({ title, description, priority, dueDate }) {
  const task = {
    id: crypto.randomUUID(),
    title,
    description,
    priority,
    dueDate,
    status: 'todo',
  };
  // Replace the array instead of mutating it, so a task object is never
  // changed underneath code that is still holding a reference to it
  tasks = [...tasks, task];
  commit();
  return task;
}

export function updateTask(id, changes) {
  tasks = tasks.map((task) => (task.id === id ? { ...task, ...changes } : task));
  commit();
}

export function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  commit();
}

/**
 * Moves a task to another column. It is re-appended to the end of the
 * array so it appears at the bottom of its new column.
 * Returns false when nothing changed (unknown id/status, or same column).
 */
export function moveTask(id, status) {
  const task = getTask(id);
  if (!task || !STATUSES.includes(status) || task.status === status) {
    return false;
  }
  tasks = [...tasks.filter((item) => item.id !== id), { ...task, status }];
  commit();
  return true;
}

/** Replaces the whole board with fresh example tasks. */
export function resetTasks() {
  tasks = createSampleTasks();
  commit();
}

/**
 * Returns the status one column to the left (-1) or right (+1),
 * or null at the edge of the board.
 */
export function getAdjacentStatus(status, direction) {
  return STATUSES[STATUSES.indexOf(status) + direction] ?? null;
}
