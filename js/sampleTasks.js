/**
 * Example tasks shown on a first visit (and after "Reset board") so new
 * visitors immediately see what the board can do.
 */

/** Returns a YYYY-MM-DD string relative to today, so due dates never look stale. */
function daysFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createSampleTasks() {
  const tasks = [
    {
      title: 'Design the landing page',
      description: 'Sketch a wireframe and pick a colour palette.',
      priority: 'high',
      dueDate: daysFromToday(3),
      status: 'todo',
    },
    {
      title: 'Write unit tests for the store',
      description: 'Cover addTask, updateTask, deleteTask and moveTask.',
      priority: 'medium',
      dueDate: '',
      status: 'todo',
    },
    {
      title: 'Update project README',
      description: '',
      priority: 'low',
      dueDate: daysFromToday(-1),
      status: 'todo',
    },
    {
      title: 'Build drag-and-drop',
      description: 'Use the native HTML5 API, with button fallbacks for keyboard and touch users.',
      priority: 'high',
      dueDate: daysFromToday(1),
      status: 'in-progress',
    },
    {
      title: 'Responsive layout',
      description: 'Stack columns on mobile, side by side on desktop.',
      priority: 'medium',
      dueDate: '',
      status: 'in-progress',
    },
    {
      title: 'Set up the repository',
      description: 'git init, .gitignore and first commit.',
      priority: 'low',
      dueDate: '',
      status: 'done',
    },
  ];

  return tasks.map((task) => ({ id: crypto.randomUUID(), ...task }));
}
