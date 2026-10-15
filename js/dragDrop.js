/**
 * HTML5 drag and drop, wired with event delegation: five listeners on the
 * board handle every card and column, including cards created later by
 * re-renders.
 *
 * This module only deals with the browser's drag events. It reports a drop
 * through the onDrop callback and leaves the state change to the caller.
 */

const DRAGGING_CLASS = 'card--dragging';
const DROP_TARGET_CLASS = 'column--drop-target';

function clearDropTargets(board) {
  board.querySelectorAll(`.${DROP_TARGET_CLASS}`).forEach((column) => {
    column.classList.remove(DROP_TARGET_CLASS);
  });
}

/**
 * @param {HTMLElement} board
 * @param {(taskId: string, status: string) => void} onDrop
 */
export function initDragAndDrop(board, onDrop) {
  board.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.card');
    if (!card) {
      return;
    }
    // The task id travels with the drag; Firefox won't start a drag without data
    event.dataTransfer.setData('text/plain', card.dataset.id);
    event.dataTransfer.effectAllowed = 'move';
    card.classList.add(DRAGGING_CLASS);
  });

  board.addEventListener('dragend', (event) => {
    event.target.closest('.card')?.classList.remove(DRAGGING_CLASS);
    clearDropTargets(board);
  });

  board.addEventListener('dragover', (event) => {
    const column = event.target.closest('.column');
    if (!column) {
      return;
    }
    // Browsers reject drops by default; cancelling dragover marks the column as a valid target
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    column.classList.add(DROP_TARGET_CLASS);
  });

  board.addEventListener('dragleave', (event) => {
    const column = event.target.closest('.column');
    // dragleave also fires when moving between a column's own children,
    // so only un-highlight when the pointer has really left the column
    if (column && !column.contains(event.relatedTarget)) {
      column.classList.remove(DROP_TARGET_CLASS);
    }
  });

  board.addEventListener('drop', (event) => {
    const column = event.target.closest('.column');
    if (!column) {
      return;
    }
    event.preventDefault();
    clearDropTargets(board);
    onDrop(event.dataTransfer.getData('text/plain'), column.dataset.status);
  });
}
