/**
 * Mini-Framework Core
 * A lightweight JavaScript framework with DOM abstraction, state management,
 * event handling, and routing functionality.
 */

// State management
let _state = {};
let _listeners = [];

/**
 * Update the application state
 * @param {Object} newState - The new state to merge with the existing state
 */
export function setState(newState) {
    _state = { ..._state, ...newState };
    _listeners.forEach(listener => listener(_state));
}

/**
 * Get the current application state
 * @returns {Object} The current state
 */
export function getState() {
    return _state;
}

/**
 * Subscribe to state changes
 * @param {Function} listener - Function to call when state changes
 * @returns {Function} Function to unsubscribe the listener
 */
export function subscribe(listener) {
    _listeners.push(listener);
    return () => {
        _listeners = _listeners.filter(l => l !== listener);
    };
}

/**
 * Create a virtual DOM element
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Element attributes
 * @param {Array} children - Child elements or text
 * @returns {Object} Virtual DOM node
 */
export function createElement(tag, attrs = {}, children = []) {
    // Ensure children is always an array
    const normalizedChildren = Array.isArray(children) ? children : [children];

    return {
        tag,
        attrs,
        children: normalizedChildren,
        key: attrs.key || null
    };
}

/**
 * Render a virtual DOM node to a real DOM element
 * @param {Object|string} vNode - Virtual DOM node or text string
 * @returns {HTMLElement|Text} Real DOM node
 */
export function render(vNode) {
    // Handle text nodes
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(vNode);
    }

    // Create DOM element
    const element = document.createElement(vNode.tag);

    // Set attributes and attach event handlers
    Object.entries(vNode.attrs || {}).forEach(([key, value]) => {
        if (key === 'key') {
            // Skip key attribute, it's only for internal use
            return;
        } else if (key === 'style' && typeof value === 'object') {
            // Handle style objects
            Object.entries(value).forEach(([prop, val]) => {
                element.style[prop] = val;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            // Handle event listeners
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            // Handle regular attributes
            element.setAttribute(key, value);
        }
    });

    // Render and append children
    (vNode.children || []).forEach(child => {
        element.appendChild(render(child));
    });

    return element;
}

/**
 * Mount a rendered element to a DOM node
 * @param {HTMLElement} element - Element to mount
 * @param {HTMLElement} container - Container to mount to
 */
export function mount(element, container) {
    container.innerHTML = '';
    container.appendChild(element);
}

/**
 * Initialize the application with a root component
 * @param {Function} component - Root component function
 * @param {string} rootId - ID of the root DOM element
 */
export function createApp(component, rootId = 'root') {
    const rootElement = document.getElementById(rootId);

    if (!rootElement) {
        console.error(`Element with id "${rootId}" not found`);
        return;
    }

    // Function to render the app
    const renderApp = () => {
        const vNode = component(getState());
        const realNode = render(vNode);
        mount(realNode, rootElement);
    };

    // Subscribe to state changes to trigger re-renders
    subscribe(renderApp);

    // Initial render
    renderApp();

    return {
        setState,
        getState
    };
}

// Export the Router class for routing functionality
export { Router } from './router.js';