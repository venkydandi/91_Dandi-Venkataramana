// ========================================
// Health Module
// ========================================

const Health = {
    init() {
        this.setupEventListeners();
        this.render();
    },

    setupEventListeners() {
        const form = document.getElementById('healthForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
    },

    handleSubmit(e) {
        const sleepHours = parseFloat(document.getElementById('sleepHours').value);
        const sleepQuality = parseInt(document.getElementById('sleepQuality').value);
        const stressLevel = parseInt(document.getElementById('stressLevel').value);
        const mood = document.getElementById('mood').value;
        const notes = document.getElementById('healthNotes').value;

        if (!Utils.validateNumber(sleepHours, 0, 16) ||
            !Utils.validateNumber(sleepQuality, 1, 10) ||
            !Utils.validateNumber(stressLevel, 1, 10) ||
            !Utils.validateRequired(mood)) {
            Notifications.error('Please fill in all required fields correctly');
            return;
        }

        const entry = {
            sleepHours,
            sleepQuality,
            stressLevel,
            mood,
            notes
        };

        if (Storage.saveHealthEntry(entry)) {
            Notifications.success('Health data logged successfully!');
            e.target.reset();
            this.render();

            // Check for burnout risk
            const burnout = this.detectBurnout();
            if (burnout) {
                Notifications.warning(burnout.message, 8000);
            }

            // Trigger intelligence analysis
            if (window.Intelligence) {
                Intelligence.analyzeAll();
            }

            // Update dashboard
            if (window.Dashboard) {
                Dashboard.update();
            }
        } else {
            Notifications.error('Failed to save health data');
        }
    },

    render() {
        this.renderList();
        this.renderChart();
    },

    renderList() {
        const container = document.getElementById('healthList');
        if (!container) return;

        const data = Storage.getRecentHealth(30);

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No health data logged yet. Start tracking your wellness!</div>';
            return;
        }

        const sortedData = Utils.sortBy(data, 'timestamp', true);

        const moodEmojis = {
            excellent: '😄',
            good: '🙂',
            okay: '😐',
            low: '😔',
            stressed: '😰'
        };

        container.innerHTML = sortedData.slice(0, 10).map(entry => `
            <div class="data-item">
                <div class="data-item-info">
                    <div class="data-item-title">
                        ${moodEmojis[entry.mood] || '😐'} ${Utils.capitalize(entry.mood)}
                    </div>
                    <div class="data-item-meta">
                        ${Utils.formatDateTime(entry.timestamp)}<br>
                        Sleep: ${entry.sleepHours}h (Quality: ${entry.sleepQuality}/10) • 
                        Stress: ${entry.stressLevel}/10
                        ${entry.notes ? `<br><em style="color: var(--text-muted);">${entry.notes}</em>` : ''}
                    </div>
                </div>
                <div class="data-item-value" style="font-size: 2rem;">${moodEmojis[entry.mood] || '😐'}</div>
            </div>
        `).join('');
    },

    renderChart() {
        const container = document.getElementById('healthChart');
        if (!container) return;

        const data = Storage.getRecentHealth(7);

        if (data.length === 0) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">No data to display</div>';
            return;
        }

        const sortedData = Utils.sortBy(data, 'timestamp');

        const chartData = sortedData.map(entry => ({
            label: Utils.formatDate(entry.timestamp),
            value: entry.sleepHours
        }));

        Charts.renderLineChart(container, chartData, {
            color: '#14b8a6',
            label: 'Sleep Hours'
        });
    },

    getMetrics() {
        const recent = Storage.getRecentHealth(7);
        const today = Storage.getTodayHealth();

        const avgSleep = recent.length > 0 ? Utils.average(recent.map(e => e.sleepHours)) : 0;
        const avgStress = recent.length > 0 ? Utils.average(recent.map(e => e.stressLevel)) : 0;
        const avgSleepQuality = recent.length > 0 ? Utils.average(recent.map(e => e.sleepQuality)) : 0;

        const todayEntry = today.length > 0 ? today[today.length - 1] : null;
        const todayMood = todayEntry ? todayEntry.mood : 'N/A';

        return {
            avgSleep: avgSleep.toFixed(1),
            avgStress: avgStress.toFixed(1),
            avgSleepQuality: avgSleepQuality.toFixed(1),
            todayMood
        };
    },

    // Detect burnout risk
    detectBurnout() {
        const recent = Storage.getRecentHealth(7);
        if (recent.length < 3) return null;

        const avgSleep = Utils.average(recent.map(e => e.sleepHours));
        const avgStress = Utils.average(recent.map(e => e.stressLevel));
        const avgSleepQuality = Utils.average(recent.map(e => e.sleepQuality));

        // High stress + poor sleep + low quality = burnout risk
        if (avgStress >= 7 && (avgSleep < 6 || avgSleepQuality < 5)) {
            return {
                severity: 'high',
                message: '⚠️ Burnout risk detected! High stress with poor sleep quality.',
                avgStress: avgStress.toFixed(1),
                avgSleep: avgSleep.toFixed(1),
                avgSleepQuality: avgSleepQuality.toFixed(1)
            };
        }

        // Moderate stress with poor sleep
        if (avgStress >= 6 && avgSleep < 6.5) {
            return {
                severity: 'medium',
                message: 'Your stress and sleep patterns suggest you need more rest.',
                avgStress: avgStress.toFixed(1),
                avgSleep: avgSleep.toFixed(1)
            };
        }

        return null;
    },

    // Get sleep pattern analysis
    getSleepPattern() {
        const recent = Storage.getRecentHealth(7);
        if (recent.length === 0) return null;

        const avgSleep = Utils.average(recent.map(e => e.sleepHours));
        const avgQuality = Utils.average(recent.map(e => e.sleepQuality));

        let pattern = 'good';
        if (avgSleep < 6 || avgQuality < 5) pattern = 'poor';
        else if (avgSleep < 7 || avgQuality < 7) pattern = 'fair';

        return {
            pattern,
            avgSleep: avgSleep.toFixed(1),
            avgQuality: avgQuality.toFixed(1)
        };
    }
};
