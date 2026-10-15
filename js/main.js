/**
 * Entry point: connects the store, renderer, dialogs and drag and drop.
 *
 * Data flow: a user action calls a store function -> the store saves and
 * notifies -> refresh() re-renders the board. Event handlers never touch
 * card DOM directly.
 */

import {
  STATUS_LABELS,
  addTask,
  deleteTask,
  getAdjacentStatus,
  getTask,
  getTasks,
  initStore,
  moveTask,
  resetTasks,
  subscribe,
  updateTask,
} from './store.js';
import { renderBoard } from './render.js';
import { initDragAndDrop } from './dragDrop.js';
import { confirmAction, initModals, openTaskDialog } from './modal.js';
import { initThemeToggle } from './theme.js';

const board = document.querySelector('#board');
const searchInput = document.querySelector('#search');
const addTaskButton = document.querySelector('#add-task');
const resetButton = document.querySelector('#reset-board');
const themeToggle = document.querySelector('#theme-toggle');
const announcer = document.querySelector('#announcer');

// The search query is UI state, not task data, so it lives here and is never saved
let searchQuery = '';

function refresh() {
  renderBoard(board, getTasks(), searchQuery);
}

/** Reads a message to screen-reader users via the aria-live region. */
function announce(message) {
  announcer.textContent = message;
}

/**
 * Re-renders replace every card element, so focus would otherwise be lost.
 * This puts focus back on the matching control of the re-rendered card,
 * falling back to another button if that one is now disabled.
 */
function focusCardControl(taskId, preferredAction) {
  const card = board.querySelector(`.card[data-id="${taskId}"]`);
  if (!card) {
    return;
  }
  const preferred = card.querySelector(`[data-action="${preferredAction}"]`);
  const target = preferred && !preferred.disabled ? preferred : card.querySelector('[data-action="edit"]');
  target.focus();
}

function moveAndAnnounce(taskId, status) {
  if (moveTask(taskId, status)) {
    announce(`Moved "${getTask(taskId).title}" to ${STATUS_LABELS[status]}.`);
  }
}

async function handleAddTask() {
  const values = await openTaskDialog();
  if (!values) {
    return;
  }
  const task = addTask(values);
  announce(`Added "${task.title}" to ${STATUS_LABELS[task.status]}.`);
  focusCardControl(task.id, 'edit');
}

async function handleEditTask(taskId) {
  const values = await openTaskDialog(getTask(taskId));
  if (!values) {
    return;
  }
  updateTask(taskId, values);
  focusCardControl(taskId, 'edit');
}

async function handleDeleteTask(taskId) {
  const { title } = getTask(taskId);
  const confirmed = await confirmAction({
    title: 'Delete task?',
    message: `"${title}" will be permanently removed.`,
    confirmLabel: 'Delete',
  });
  if (!confirmed) {
    return;
  }
  deleteTask(taskId);
  announce(`Deleted "${title}".`);
  // The card (and its delete button) no longer exist, so move focus somewhere predictable
  addTaskButton.focus();
}

function handleMove(taskId, direction) {
  const status = getAdjacentStatus(getTask(taskId).status, direction);
  moveAndAnnounce(taskId, status);
  focusCardControl(taskId, direction < 0 ? 'move-left' : 'move-right');
}

/**
 * One click listener for the whole board (event delegation) instead of
 * four listeners per card. It keeps working for cards added later, and
 * re-renders don't have to re-attach anything.
 */
function handleBoardClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }
  const taskId = button.closest('.card').dataset.id;

  const actions = {
    'move-left': () => handleMove(taskId, -1),
    'move-right': () => handleMove(taskId, 1),
    edit: () => handleEditTask(taskId),
    delete: () => handleDeleteTask(taskId),
  };
  actions[button.dataset.action]?.();
}

function handleSearch() {
  searchQuery = searchInput.value;
  refresh();
}

async function handleReset() {
  const confirmed = await confirmAction({
    title: 'Reset board?',
    message: 'All your tasks will be replaced with the example tasks.',
    confirmLabel: 'Reset',
  });
  if (!confirmed) {
    return;
  }
  searchInput.value = '';
  searchQuery = '';
  resetTasks();
  announce('Board reset to the example tasks.');
}

function init() {
  subscribe(refresh);
  initModals();
  initThemeToggle(themeToggle);
  initDragAndDrop(board, moveAndAnnounce);

  board.addEventListener('click', handleBoardClick);
  searchInput.addEventListener('input', handleSearch);
  addTaskButton.addEventListener('click', handleAddTask);
  resetButton.addEventListener('click', handleReset);

  initStore();
}

init();
