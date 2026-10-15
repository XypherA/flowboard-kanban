/**
 * Persistence layer. The only module that touches localStorage, so the
 * storage mechanism could be swapped (e.g. for an API) without changing
 * the rest of the app.
 */

const STORAGE_KEY = 'flowboard.tasks';

function isTask(value) {
  return Boolean(value) && typeof value.id === 'string' && typeof value.title === 'string';
}

/**
 * Returns the saved tasks, or null if nothing has been saved yet.
 * null (not []) lets the app tell a first visit apart from a board the
 * user has deliberately emptied.
 */
export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw);
    // Guard against corrupted or hand-edited data breaking the render
    return Array.isArray(parsed) ? parsed.filter(isTask) : null;
  } catch {
    // Invalid JSON or storage blocked by the browser: start fresh
    return null;
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Quota exceeded or storage disabled (some private modes). The board
    // keeps working in memory; changes just won't survive a refresh.
  }
}
