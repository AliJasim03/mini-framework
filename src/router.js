/**
 * Mini-Framework Router
 * Provides client-side routing functionality.
 */

import { setState, getState } from './index.js';

export class Router {
    /**
     * Create a new router
     * @param {Array} routes - Array of route objects { path, component }
     */
    constructor(routes) {
        this.routes = routes;
        this.currentPath = window.location.pathname;
        this.init();
    }

    /**
     * Initialize the router
     */
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRouteChange(window.location.pathname);
        });

        // Handle initial route
        this.handleRouteChange(this.currentPath);

        // Update state with current route
        setState({
            router: {
                currentPath: this.currentPath
            }
        });
    }

    /**
     * Handle route changes
     * @param {string} path - The new path
     */
    handleRouteChange(path) {
        this.currentPath = path;

        // Update state with new route
        setState({
            router: {
                currentPath: path
            }
        });
    }

    /**
     * Navigate to a new path
     * @param {string} path - Path to navigate to
     * @param {Object} state - State to pass to history
     */
    navigate(path, state = {}) {
        // Update browser history
        window.history.pushState(state, '', path);

        // Handle route change
        this.handleRouteChange(path);
    }

    /**
     * Get the current component based on path
     * @returns {Function} Component function for the current route
     */
    getCurrentComponent() {
        const route = this.routes.find(route => {
            // Simple route matching
            return route.path === this.currentPath;
        });

        return route ? route.component : null;
    }

    /**
     * Create a link element with automatic navigation
     * @param {string} path - Path to link to
     * @param {Object} attrs - Additional attributes
     * @param {Array} children - Child elements
     * @returns {Object} Virtual DOM node
     */
    createLink(path, attrs = {}, children = []) {
        const onClick = (e) => {
            e.preventDefault();
            this.navigate(path);
        };

        return {
            tag: 'a',
            attrs: {
                href: path,
                onClick,
                ...attrs
            },
            children
        };
    }
}