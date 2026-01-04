// ========================================
// Utility Functions
// ========================================

const Utils = {
    // Date formatting
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    },

    formatDateTime(date) {
        const d = new Date(date);
        return d.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },

    getRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return this.formatDate(date);
    },

    // Get date range
    getDateRange(days) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return { start, end };
    },

    // Get today's date string
    getTodayString() {
        return new Date().toISOString().split('T')[0];
    },

    // Data validation
    validateNumber(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    },

    validateRequired(value) {
        return value !== null && value !== undefined && value !== '';
    },

    // Array helpers
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    },

    sortBy(array, key, descending = false) {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal < bVal) return descending ? 1 : -1;
            if (aVal > bVal) return descending ? -1 : 1;
            return 0;
        });
    },

    // Calculate average
    average(array) {
        if (array.length === 0) return 0;
        return array.reduce((sum, val) => sum + val, 0) / array.length;
    },

    // Calculate sum
    sum(array) {
        return array.reduce((sum, val) => sum + val, 0);
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Truncate text
    truncate(text, length) {
        if (text.length <= length) return text;
        return text.substr(0, length) + '...';
    },

    // Capitalize first letter
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
};

// ========================================
// Notification System
// ========================================

const Notifications = {
    container: null,

    init() {
        this.container = document.getElementById('notificationContainer');
    },

    show(message, type = 'info', duration = 5000) {
        if (!this.container) this.init();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-title">${icons[type] || ''} ${Utils.capitalize(type)}</div>
            <div class="notification-message">${message}</div>
        `;

        this.container.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 300ms ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        return notification;
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Modal System
// ========================================

const Modal = {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    create(title, content, buttons = []) {
        const modalId = 'modal-' + Utils.generateId();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';

        const buttonHTML = buttons.map(btn => 
            `<button class="btn ${btn.class || 'btn-primary'}" data-action="${btn.action}">${btn.text}</button>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">${title}</h2>
                <div class="modal-body">${content}</div>
                <div class="modal-buttons" style="display: flex; gap: 1rem; justify-content: flex-end;">
                    ${buttonHTML}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle button clicks
        modal.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const button = buttons.find(b => b.action === action);
                if (button && button.onClick) {
                    button.onClick();
                }
                this.hide(modalId);
                setTimeout(() => modal.remove(), 300);
            });
        });

        return modalId;
    }
};

// ========================================
// DOM Helpers
// ========================================

const DOM = {
    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    },

    clearElement(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.innerHTML = '';
        }
    },

    show(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove('hidden');
        }
    },

    hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    },

    toggle(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.toggle('hidden');
        }
    }
};
