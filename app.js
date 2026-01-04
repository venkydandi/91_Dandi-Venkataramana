// ========================================
// Main Application Controller
// ========================================

(function () {
    'use strict';

    // App state
    const App = {
        currentSection: 'dashboard',

        init() {
            console.log('🧠 AI Personal Life Mentor - Initializing...');

            // Check disclaimer acceptance
            this.checkDisclaimer();

            // Initialize all modules
            this.initializeModules();

            // Setup navigation
            this.setupNavigation();

            // Setup sidebar toggle for mobile
            this.setupSidebarToggle();

            console.log('✅ Application initialized successfully');
        },

        checkDisclaimer() {
            const profile = Storage.getUserProfile();

            if (!profile.disclaimerAccepted) {
                const modal = document.getElementById('disclaimerModal');
                if (modal) {
                    modal.classList.add('active');

                    const acceptBtn = document.getElementById('acceptDisclaimer');
                    if (acceptBtn) {
                        acceptBtn.addEventListener('click', () => {
                            Storage.updateUserProfile({ disclaimerAccepted: true });
                            modal.classList.remove('active');
                            Notifications.success('Welcome to AI Personal Life Mentor!');
                        });
                    }
                }
            }
        },

        initializeModules() {
            // Initialize utilities
            Notifications.init();

            // Initialize core modules
            if (window.Education) Education.init();
            if (window.Health) Health.init();
            if (window.Finance) Finance.init();
            if (window.Intelligence) Intelligence.init();
            if (window.Dashboard) Dashboard.init();
            if (window.Chatbot) Chatbot.init();

            console.log('📦 All modules initialized');
        },

        setupNavigation() {
            const navItems = document.querySelectorAll('.nav-item');

            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = item.dataset.section;
                    this.navigateTo(section);
                });
            });

            // Handle hash navigation
            window.addEventListener('hashchange', () => {
                const hash = window.location.hash.slice(1);
                if (hash) {
                    this.navigateTo(hash);
                }
            });

            // Navigate to hash on load
            const initialHash = window.location.hash.slice(1);
            if (initialHash) {
                this.navigateTo(initialHash);
            }
        },

        navigateTo(sectionId) {
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.section === sectionId);
            });

            // Update active section
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.toggle('active', section.id === sectionId);
            });

            // Update current section
            this.currentSection = sectionId;

            // Update URL hash
            window.location.hash = sectionId;

            // Refresh section data
            this.refreshSection(sectionId);

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('open');
                }
            }
        },

        refreshSection(sectionId) {
            switch (sectionId) {
                case 'dashboard':
                    if (window.Dashboard) Dashboard.update();
                    break;
                case 'education':
                    if (window.Education) Education.render();
                    break;
                case 'health':
                    if (window.Health) Health.render();
                    break;
                case 'finance':
                    if (window.Finance) Finance.render();
                    break;
                case 'insights':
                    if (window.Intelligence) Intelligence.render();
                    break;
            }
        },

        setupSidebarToggle() {
            const toggleBtn = document.getElementById('sidebarToggle');
            const sidebar = document.getElementById('sidebar');

            if (toggleBtn && sidebar) {
                toggleBtn.addEventListener('click', () => {
                    sidebar.classList.toggle('open');
                });

                // Close sidebar when clicking outside on mobile
                document.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        if (!sidebar.contains(e.target) && sidebar.classList.contains('open')) {
                            sidebar.classList.remove('open');
                        }
                    }
                });
            }
        }
    };

    // Initialize app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

    // Expose App globally for debugging
    window.App = App;

})();
