/**
 * Promise-based wrappers around the native <dialog> elements.
 *
 * Callers can simply `await openTaskDialog()` or `await confirmAction()`.
 * Native showModal() gives us a focus trap, Escape-to-close and an inert
 * background for free; this module adds validation and focus restoration.
 */

const taskDialog = document.querySelector('#task-dialog');
const taskForm = document.querySelector('#task-form');
const taskDialogTitle = document.querySelector('#task-dialog-title');
const taskSubmit = document.querySelector('#task-submit');
const titleInput = document.querySelector('#task-title');
const titleError = document.querySelector('#task-title-error');

const confirmDialog = document.querySelector('#confirm-dialog');
const confirmTitle = document.querySelector('#confirm-dialog-title');
const confirmMessage = document.querySelector('#confirm-dialog-message');
const confirmButton = document.querySelector('#confirm-dialog-confirm');

/**
 * Opens a dialog modally and resolves with its returnValue once it closes.
 * Focus goes back to whatever opened the dialog, so keyboard users don't
 * get dropped at the top of the page.
 */
function showDialog(dialog) {
  const opener = document.activeElement;
  // Reset so pressing Escape doesn't resolve with the previous result
  dialog.returnValue = '';
  dialog.showModal();

  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
      resolve(dialog.returnValue);
    }, { once: true });
  });
}

function setTitleError(hasError) {
  titleError.hidden = !hasError;
  titleInput.setAttribute('aria-invalid', String(hasError));
}

/** Blocks submission (which would close the dialog) when the title is empty. */
function handleTaskSubmit(event) {
  if (titleInput.value.trim() === '') {
    event.preventDefault();
    setTitleError(true);
    titleInput.focus();
  }
}

function fillTaskForm(task) {
  taskForm.reset();
  setTitleError(false);
  if (task) {
    taskForm.elements.title.value = task.title;
    taskForm.elements.description.value = task.description;
    taskForm.elements.priority.value = task.priority;
    taskForm.elements.dueDate.value = task.dueDate;
  }
}

function readTaskForm() {
  const { title, description, priority, dueDate } = taskForm.elements;
  return {
    title: title.value.trim(),
    description: description.value.trim(),
    priority: priority.value,
    dueDate: dueDate.value,
  };
}

/** Attaches the dialogs' permanent listeners. Call once on startup. */
export function initModals() {
  taskForm.addEventListener('submit', handleTaskSubmit);
  titleInput.addEventListener('input', () => setTitleError(false));
  taskDialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    taskDialog.close('cancel');
  });
}

/**
 * Shows the add/edit form. Pass a task to edit it, or nothing to add one.
 * Resolves with the form values, or null if the user cancelled.
 */
export async function openTaskDialog(task = null) {
  taskDialogTitle.textContent = task ? 'Edit task' : 'Add task';
  taskSubmit.textContent = task ? 'Save changes' : 'Add task';
  fillTaskForm(task);

  const result = await showDialog(taskDialog);
  return result === 'save' ? readTaskForm() : null;
}

/** Asks the user to confirm a destructive action. Resolves true if confirmed. */
export async function confirmAction({ title, message, confirmLabel }) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmButton.textContent = confirmLabel;

  const result = await showDialog(confirmDialog);
  return result === 'confirm';
}
