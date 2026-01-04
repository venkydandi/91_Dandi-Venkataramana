// ========================================
// Education Module
// ========================================

const Education = {
    init() {
        this.setupEventListeners();
        this.render();
    },

    setupEventListeners() {
        const form = document.getElementById('studyForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
    },

    handleSubmit(e) {
        const subject = document.getElementById('studySubject').value;
        const duration = parseFloat(document.getElementById('studyDuration').value);
        const focusLevel = parseInt(document.getElementById('focusLevel').value);
        const notes = document.getElementById('studyNotes').value;

        if (!Utils.validateRequired(subject) ||
            !Utils.validateNumber(duration, 0.5, 12) ||
            !Utils.validateNumber(focusLevel, 1, 10)) {
            Notifications.error('Please fill in all required fields correctly');
            return;
        }

        const entry = {
            subject,
            duration,
            focusLevel,
            notes
        };

        if (Storage.saveEducationEntry(entry)) {
            Notifications.success('Study session logged successfully!');
            e.target.reset();
            this.render();

            // Trigger intelligence analysis
            if (window.Intelligence) {
                Intelligence.analyzeAll();
            }

            // Update dashboard
            if (window.Dashboard) {
                Dashboard.update();
            }
        } else {
            Notifications.error('Failed to save study session');
        }
    },

    render() {
        this.renderList();
        this.renderChart();
    },

    renderList() {
        const container = document.getElementById('studyList');
        if (!container) return;

        const data = Storage.getRecentEducation(30);

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No study sessions logged yet. Start tracking your learning!</div>';
            return;
        }

        const sortedData = Utils.sortBy(data, 'timestamp', true);

        container.innerHTML = sortedData.slice(0, 10).map(entry => `
            <div class="data-item">
                <div class="data-item-info">
                    <div class="data-item-title">${entry.subject}</div>
                    <div class="data-item-meta">
                        ${Utils.formatDateTime(entry.timestamp)} • 
                        ${entry.duration}h • 
                        Focus: ${entry.focusLevel}/10
                        ${entry.notes ? `<br><em style="color: var(--text-muted);">${entry.notes}</em>` : ''}
                    </div>
                </div>
                <div class="data-item-value">${entry.duration}h</div>
            </div>
        `).join('');
    },

    renderChart() {
        const container = document.getElementById('studyChart');
        if (!container) return;

        const data = Storage.getRecentEducation(7);

        if (data.length === 0) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">No data to display</div>';
            return;
        }

        // Group by date and calculate total hours
        const grouped = Utils.groupBy(data, (entry) => {
            return new Date(entry.timestamp).toISOString().split('T')[0];
        });

        const chartData = Object.keys(grouped).map(date => ({
            label: Utils.formatDate(date),
            value: grouped[date].reduce((sum, entry) => sum + entry.duration, 0)
        }));

        Charts.renderBarChart(container, chartData, {
            colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff']
        });
    },

    getMetrics() {
        const recent = Storage.getRecentEducation(7);
        const today = Storage.getTodayEducation();

        const totalHours = Utils.sum(recent.map(e => e.duration));
        const avgFocus = recent.length > 0 ? Utils.average(recent.map(e => e.focusLevel)) : 0;
        const todayHours = Utils.sum(today.map(e => e.duration));
        const sessionsCount = recent.length;

        return {
            totalHours: totalHours.toFixed(1),
            avgFocus: avgFocus.toFixed(1),
            todayHours: todayHours.toFixed(1),
            sessionsCount
        };
    },

    // Detect focus drops
    detectFocusIssues() {
        const recent = Storage.getRecentEducation(7);
        if (recent.length < 3) return null;

        const avgFocus = Utils.average(recent.map(e => e.focusLevel));
        const recentFocus = Utils.average(recent.slice(-3).map(e => e.focusLevel));

        if (avgFocus > 7 && recentFocus < 6) {
            return {
                severity: 'medium',
                message: 'Your focus levels have dropped recently',
                avgFocus: avgFocus.toFixed(1),
                recentFocus: recentFocus.toFixed(1)
            };
        }

        return null;
    }
};
