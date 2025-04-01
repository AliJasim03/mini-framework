/**
 * TodoMVC App built with Mini-Framework
 */
import {
    createElement,
    getState,
    setState,
    createApp,
    Router
} from '../../src/index.js';

// Initialize app state
setState({
    todos: JSON.parse(localStorage.getItem('todos') || '[]'),
    filter: window.location.hash.replace('#/', '') || 'all',
    editing: null
});

// Save todos to localStorage whenever state changes
const unsubscribe = subscribe(state => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
});

// Set up routes
const router = new Router([
    { path: '/', component: () => TodoApp },
    { path: '/active', component: () => TodoApp },
    { path: '/completed', component: () => TodoApp }
]);

// Helper functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function addTodo(text) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const newTodo = {
        id: generateId(),
        text: trimmedText,
        completed: false
    };

    setState({
        todos: [...getState().todos, newTodo]
    });
}

function toggleTodo(id) {
    const { todos } = getState();
    const newTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    setState({ todos: newTodos });
}

function updateTodo(id, text) {
    const { todos } = getState();
    const newTodos = todos.map(todo =>
        todo.id === id ? { ...todo, text: text.trim() } : todo
    );

    setState({
        todos: newTodos,
        editing: null
    });
}

function removeTodo(id) {
    const { todos } = getState();
    setState({
        todos: todos.filter(todo => todo.id !== id)
    });
}

function clearCompleted() {
    const { todos } = getState();
    setState({
        todos: todos.filter(todo => !todo.completed)
    });
}

function setFilter(filter) {
    setState({ filter });
    window.location.hash = filter === 'all' ? '' : `/${filter}`;
}

function toggleAll(completed) {
    const { todos } = getState();
    const newTodos = todos.map(todo => ({ ...todo, completed }));
    setState({ todos: newTodos });
}

function startEditing(id) {
    setState({ editing: id });
}

// Filter todos based on current filter
function getFilteredTodos() {
    const { todos, filter } = getState();

    switch (filter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// TodoApp component
function TodoApp() {
    const { todos, filter, editing } = getState();
    const filteredTodos = getFilteredTodos();
    const activeTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);
    const allCompleted = todos.length > 0 && activeTodos.length === 0;

    return createElement('div', { class: 'todoapp' }, [
        // Header
        createElement('header', { class: 'header' }, [
            createElement('h1', {}, ['todos']),
            createElement('input', {
                class: 'new-todo',
                placeholder: 'What needs to be done?',
                autofocus: true,
                onKeyDown: (e) => {
                    if (e.key === 'Enter') {
                        addTodo(e.target.value);
                        e.target.value = '';
                    }
                }
            })
        ]),

        // Main section (only show if there are todos)
        todos.length > 0 ? createElement('section', { class: 'main' }, [
            createElement('input', {
                id: 'toggle-all',
                class: 'toggle-all',
                type: 'checkbox',
                checked: allCompleted,
                onChange: (e) => toggleAll(e.target.checked)
            }),
            createElement('label', { for: 'toggle-all' }, ['Mark all as complete']),

            // Todo list
            createElement('ul', { class: 'todo-list' },
                filteredTodos.map(todo => createElement('li', {
                    key: todo.id,
                    class: `${todo.completed ? 'completed' : ''} ${editing === todo.id ? 'editing' : ''}`
                }, [
                    // View mode
                    createElement('div', { class: 'view' }, [
                        createElement('input', {
                            class: 'toggle',
                            type: 'checkbox',
                            checked: todo.completed,
                            onChange: () => toggleTodo(todo.id)
                        }),
                        createElement('label', {
                            onDblClick: () => startEditing(todo.id)
                        }, [todo.text]),
                        createElement('button', {
                            class: 'destroy',
                            onClick: () => removeTodo(todo.id)
                        })
                    ]),

                    // Edit mode
                    editing === todo.id ? createElement('input', {
                        class: 'edit',
                        value: todo.text,
                        autofocus: true,
                        onBlur: (e) => updateTodo(todo.id, e.target.value),
                        onKeyDown: (e) => {
                            if (e.key === 'Enter') updateTodo(todo.id, e.target.value);
                            if (e.key === 'Escape') setState({ editing: null });
                        }
                    }) : null
                ]))
            )
        ]) : null,

        // Footer (only show if there are todos)
        todos.length > 0 ? createElement('footer', { class: 'footer' }, [
            // Todo count
            createElement('span', { class: 'todo-count' }, [
                createElement('strong', {}, [activeTodos.length.toString()]),
                ` item${activeTodos.length === 1 ? '' : 's'} left`
            ]),

            // Filters
            createElement('ul', { class: 'filters' }, [
                createElement('li', {}, [
                    createElement('a', {
                        class: filter === 'all' ? 'selected' : '',
                        href: '#/',
                        onClick: (e) => {
                            e.preventDefault();
                            setFilter('all');
                        }
                    }, ['All'])
                ]),
                createElement('li', {}, [
                    createElement('a', {
                        class: filter === 'active' ? 'selected' : '',
                        href: '#/active',
                        onClick: (e) => {
                            e.preventDefault();
                            setFilter('active');
                        }
                    }, ['Active'])
                ]),
                createElement('li', {}, [
                    createElement('a', {
                        class: filter === 'completed' ? 'selected' : '',
                        href: '#/completed',
                        onClick: (e) => {
                            e.preventDefault();
                            setFilter('completed');
                        }
                    }, ['Completed'])
                ])
            ]),

            // Clear completed button (only show if there are completed todos)
            completedTodos.length > 0 ? createElement('button', {
                class: 'clear-completed',
                onClick: clearCompleted
            }, ['Clear completed']) : null
        ]) : null
    ]);
}

// Listen for hash changes
window.addEventListener('hashchange', () => {
    const filter = window.location.hash.replace('#/', '') || 'all';
    setState({ filter });
});

// Create and mount the app
const app = createApp(() => TodoApp());

// Define function to handle subscribing to state changes
function subscribe(listener) {
    let currentState = getState();

    function handleStateChange() {
        const nextState = getState();
        if (nextState !== currentState) {
            listener(nextState);
            currentState = nextState;
        }
    }

    // Set up an interval to check for state changes
    const intervalId = setInterval(handleStateChange, 50);

    // Return a function to unsubscribe
    return () => clearInterval(intervalId);
}