// ========================================
// Dashboard Module
// ========================================

const Dashboard = {
    init() {
        this.update();
    },

    update() {
        this.renderMetrics();
        this.renderRecentActivity();

        // Trigger intelligence analysis
        if (window.Intelligence) {
            Intelligence.analyzeAll();
        }
    },

    renderMetrics() {
        const container = document.getElementById('metricsGrid');
        if (!container) return;

        const eduMetrics = Education.getMetrics();
        const healthMetrics = Health.getMetrics();
        const financeMetrics = Finance.getMetrics();
        const insightsSummary = Intelligence.getInsightsSummary();

        const metrics = [
            {
                icon: '📚',
                value: eduMetrics.totalHours,
                label: 'Study Hours (7d)',
                gradient: 'var(--gradient-primary)',
                change: null
            },
            {
                icon: '🎯',
                value: eduMetrics.avgFocus,
                label: 'Avg Focus Level',
                gradient: 'var(--gradient-primary)',
                change: parseFloat(eduMetrics.avgFocus) >= 7 ? { value: 'Good', positive: true } : { value: 'Low', positive: false }
            },
            {
                icon: '😴',
                value: healthMetrics.avgSleep + 'h',
                label: 'Avg Sleep',
                gradient: 'var(--gradient-secondary)',
                change: parseFloat(healthMetrics.avgSleep) >= 7 ? { value: 'Healthy', positive: true } : { value: 'Low', positive: false }
            },
            {
                icon: '💚',
                value: healthMetrics.avgStress,
                label: 'Stress Level',
                gradient: 'var(--gradient-secondary)',
                change: parseFloat(healthMetrics.avgStress) <= 5 ? { value: 'Low', positive: true } : { value: 'High', positive: false }
            },
            {
                icon: '💰',
                value: '$' + financeMetrics.weeklyTotal,
                label: 'Weekly Spending',
                gradient: 'var(--gradient-success)',
                change: null
            },
            {
                icon: '🔗',
                value: insightsSummary.total,
                label: 'Active Insights',
                gradient: 'var(--gradient-danger)',
                change: insightsSummary.high > 0 ? { value: `${insightsSummary.high} High`, positive: false } : null
            }
        ];

        container.innerHTML = metrics.map(metric => `
            <div class="metric-card">
                <div class="metric-icon">${metric.icon}</div>
                <div class="metric-value">${metric.value}</div>
                <div class="metric-label">${metric.label}</div>
                ${metric.change ? `
                    <div class="metric-change ${metric.change.positive ? 'positive' : 'negative'}">
                        ${metric.change.positive ? '↑' : '↓'} ${metric.change.value}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    renderRecentActivity() {
        const container = document.getElementById('activityFeed');
        if (!container) return;

        // Gather recent activities from all modules
        const activities = [];

        // Education activities
        const recentStudy = Storage.getRecentEducation(3);
        recentStudy.forEach(entry => {
            activities.push({
                icon: '📚',
                title: `Studied ${entry.subject}`,
                time: entry.timestamp,
                meta: `${entry.duration}h • Focus: ${entry.focusLevel}/10`
            });
        });

        // Health activities
        const recentHealth = Storage.getRecentHealth(3);
        recentHealth.forEach(entry => {
            const moodEmojis = {
                excellent: '😄',
                good: '🙂',
                okay: '😐',
                low: '😔',
                stressed: '😰'
            };
            activities.push({
                icon: moodEmojis[entry.mood] || '💚',
                title: `Health check-in`,
                time: entry.timestamp,
                meta: `Sleep: ${entry.sleepHours}h • Stress: ${entry.stressLevel}/10`
            });
        });

        // Finance activities
        const recentFinance = Storage.getRecentFinance(3);
        recentFinance.forEach(entry => {
            activities.push({
                icon: '💰',
                title: `Spent on ${entry.notes}`,
                time: entry.timestamp,
                meta: `${Utils.formatCurrency(entry.amount)} • ${Utils.capitalize(entry.category)}`
            });
        });

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        if (activities.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No recent activity. Start logging your data!</div>';
            return;
        }

        container.innerHTML = activities.slice(0, 8).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${Utils.getRelativeTime(activity.time)} • ${activity.meta}</div>
                </div>
            </div>
        `).join('');
    }
};
