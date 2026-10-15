/**
 * Turns state into DOM. Rendering is a pure function of (tasks, search
 * query): it rebuilds each column's list from scratch, so the DOM can
 * never drift out of sync with the data.
 *
 * All user text is inserted with textContent, never innerHTML, so a task
 * titled "<img src=x onerror=alert(1)>" is shown as text rather than
 * executed (XSS prevention).
 */

import { STATUSES, STATUS_LABELS, getAdjacentStatus } from './store.js';

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

/** Small helper so card-building code reads as structure, not boilerplate. */
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

/** References a symbol from the SVG sprite in index.html. */
function createIcon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#icon-${name}`);
  svg.append(use);
  return svg;
}

function getTodayString() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD as a *local* date. new Date('2026-10-20') would be
 * read as UTC midnight and can display as the previous day in the Americas.
 */
function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function createDueDate(task) {
  // ISO date strings compare correctly as plain strings
  const isOverdue = task.status !== 'done' && task.dueDate < getTodayString();
  const formatted = dateFormatter.format(parseLocalDate(task.dueDate));

  const time = createElement('time', isOverdue ? 'card__due card__due--overdue' : 'card__due');
  time.dateTime = task.dueDate;
  time.append(createIcon('calendar'), isOverdue ? `Overdue · ${formatted}` : `Due ${formatted}`);
  return time;
}

function createActionButton({ action, icon, label, disabled = false }) {
  const button = createElement('button', `card__action card__action--${action}`);
  button.type = 'button';
  button.dataset.action = action;
  button.setAttribute('aria-label', label);
  button.title = label;
  button.disabled = disabled;
  button.append(createIcon(icon));
  return button;
}

function createCardActions(task) {
  const previousStatus = getAdjacentStatus(task.status, -1);
  const nextStatus = getAdjacentStatus(task.status, 1);

  const actions = createElement('div', 'card__actions');
  actions.append(
    createActionButton({
      action: 'move-left',
      icon: 'arrow-left',
      label: previousStatus ? `Move "${task.title}" to ${STATUS_LABELS[previousStatus]}` : 'Already in the first column',
      disabled: !previousStatus,
    }),
    createActionButton({ action: 'edit', icon: 'edit', label: `Edit "${task.title}"` }),
    createActionButton({ action: 'delete', icon: 'trash', label: `Delete "${task.title}"` }),
    createActionButton({
      action: 'move-right',
      icon: 'arrow-right',
      label: nextStatus ? `Move "${task.title}" to ${STATUS_LABELS[nextStatus]}` : 'Already in the last column',
      disabled: !nextStatus,
    }),
  );
  return actions;
}

function createCard(task) {
  const card = createElement('li', 'card');
  card.dataset.id = task.id;
  card.draggable = true;

  const meta = createElement('div', 'card__meta');
  meta.append(createElement('span', `priority priority--${task.priority}`, PRIORITY_LABELS[task.priority]));
  if (task.dueDate) {
    meta.append(createDueDate(task));
  }

  card.append(meta, createElement('h3', 'card__title', task.title));
  if (task.description) {
    card.append(createElement('p', 'card__description', task.description));
  }
  card.append(createCardActions(task));
  return card;
}

function createEmptyMessage(isSearching) {
  const text = isSearching ? 'No matching tasks' : 'No tasks yet — drag one here';
  return createElement('li', 'column__empty', text);
}

function matchesQuery(task, query) {
  return `${task.title} ${task.description}`.toLowerCase().includes(query);
}

function renderColumn(column, tasks, query) {
  const visibleTasks = tasks.filter((task) => matchesQuery(task, query));
  const count = column.querySelector('[data-role="count"]');
  const list = column.querySelector('[data-role="list"]');

  count.textContent = visibleTasks.length;
  count.setAttribute('aria-label', `${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'}`);

  const items = visibleTasks.length > 0 ? visibleTasks.map(createCard) : [createEmptyMessage(query !== '')];
  list.replaceChildren(...items);
}

/** Renders every column of the board for the given tasks and search query. */
export function renderBoard(board, tasks, query = '') {
  const normalisedQuery = query.trim().toLowerCase();

  STATUSES.forEach((status) => {
    const column = board.querySelector(`.column[data-status="${status}"]`);
    const columnTasks = tasks.filter((task) => task.status === status);
    renderColumn(column, columnTasks, normalisedQuery);
  });
}
