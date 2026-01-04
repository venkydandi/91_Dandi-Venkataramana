// ========================================
// Cross-Domain Intelligence Engine
// ========================================

const Intelligence = {
    insights: [],

    init() {
        this.analyzeAll();
    },

    // Main analysis function
    analyzeAll() {
        this.insights = [];

        // Run all pattern detection algorithms
        this.detectFinanceStressConnection();
        this.detectSleepProductivityConnection();
        this.detectStressSpendingConnection();
        this.detectBurnoutRisk();
        this.detectAcademicPressure();

        // Render insights
        this.render();
    },

    // Pattern 1: Financial stress → Mental strain → Reduced focus
    detectFinanceStressConnection() {
        const finance = Storage.getRecentFinance(7);
        const health = Storage.getRecentHealth(7);
        const education = Storage.getRecentEducation(7);

        if (finance.length < 3 || health.length < 3 || education.length < 3) return;

        const weeklySpending = Utils.sum(finance.map(e => e.amount));
        const avgStress = Utils.average(health.map(e => e.stressLevel));
        const avgFocus = Utils.average(education.map(e => e.focusLevel));

        // High spending + high stress + low focus
        if (weeklySpending > Finance.budgetLimits.weekly && avgStress >= 7 && avgFocus < 6) {
            this.insights.push({
                id: 'finance-stress-focus',
                title: 'Financial Stress Affecting Focus',
                severity: 'high',
                icon: '💸',
                description: `Your high spending this week (${Utils.formatCurrency(weeklySpending)}) is correlating with elevated stress levels (${avgStress.toFixed(1)}/10) and reduced study focus (${avgFocus.toFixed(1)}/10). Financial worries may be impacting your academic performance.`,
                connections: [
                    { domain: 'Finance', metric: `${Utils.formatCurrency(weeklySpending)} spent` },
                    { domain: 'Health', metric: `Stress: ${avgStress.toFixed(1)}/10` },
                    { domain: 'Education', metric: `Focus: ${avgFocus.toFixed(1)}/10` }
                ],
                recommendations: [
                    'Review your budget and identify areas to cut back',
                    'Practice stress-relief techniques like meditation or exercise',
                    'Break study sessions into smaller, manageable chunks',
                    'Consider talking to a financial advisor or counselor'
                ]
            });
        }
    },

    // Pattern 2: Poor sleep → Low productivity → Academic decline
    detectSleepProductivityConnection() {
        const health = Storage.getRecentHealth(7);
        const education = Storage.getRecentEducation(7);

        if (health.length < 3 || education.length < 3) return;

        const avgSleep = Utils.average(health.map(e => e.sleepHours));
        const avgSleepQuality = Utils.average(health.map(e => e.sleepQuality));
        const totalStudyHours = Utils.sum(education.map(e => e.duration));
        const avgFocus = Utils.average(education.map(e => e.focusLevel));

        // Poor sleep + low study hours or low focus
        if ((avgSleep < 6.5 || avgSleepQuality < 6) && (totalStudyHours < 10 || avgFocus < 6)) {
            this.insights.push({
                id: 'sleep-productivity',
                title: 'Sleep Quality Impacting Productivity',
                severity: 'medium',
                icon: '😴',
                description: `Your sleep patterns (${avgSleep.toFixed(1)}h average, quality: ${avgSleepQuality.toFixed(1)}/10) are affecting your study productivity. You've only studied ${totalStudyHours.toFixed(1)} hours this week with an average focus of ${avgFocus.toFixed(1)}/10.`,
                connections: [
                    { domain: 'Health', metric: `Sleep: ${avgSleep.toFixed(1)}h` },
                    { domain: 'Health', metric: `Quality: ${avgSleepQuality.toFixed(1)}/10` },
                    { domain: 'Education', metric: `Study: ${totalStudyHours.toFixed(1)}h` },
                    { domain: 'Education', metric: `Focus: ${avgFocus.toFixed(1)}/10` }
                ],
                recommendations: [
                    'Establish a consistent sleep schedule (aim for 7-8 hours)',
                    'Avoid screens 1 hour before bedtime',
                    'Create a relaxing bedtime routine',
                    'Study during your peak energy hours (usually morning)'
                ]
            });
        }
    },

    // Pattern 3: Academic pressure → Stress → Impulsive spending
    detectStressSpendingConnection() {
        const education = Storage.getRecentEducation(7);
        const health = Storage.getRecentHealth(7);
        const finance = Storage.getRecentFinance(7);

        if (education.length < 3 || health.length < 3 || finance.length < 3) return;

        const totalStudyHours = Utils.sum(education.map(e => e.duration));
        const avgStress = Utils.average(health.map(e => e.stressLevel));
        const entertainmentSpending = finance
            .filter(e => e.category === 'entertainment' || e.category === 'shopping')
            .reduce((sum, e) => sum + e.amount, 0);

        // High study hours + high stress + high entertainment spending
        if (totalStudyHours > 25 && avgStress >= 7 && entertainmentSpending > 100) {
            this.insights.push({
                id: 'stress-spending',
                title: 'Stress-Induced Spending Pattern',
                severity: 'medium',
                icon: '🛍️',
                description: `High academic workload (${totalStudyHours.toFixed(1)}h study) combined with elevated stress (${avgStress.toFixed(1)}/10) is correlating with increased entertainment/shopping spending (${Utils.formatCurrency(entertainmentSpending)}). This suggests stress-relief spending.`,
                connections: [
                    { domain: 'Education', metric: `${totalStudyHours.toFixed(1)}h study` },
                    { domain: 'Health', metric: `Stress: ${avgStress.toFixed(1)}/10` },
                    { domain: 'Finance', metric: `${Utils.formatCurrency(entertainmentSpending)} spent` }
                ],
                recommendations: [
                    'Find free stress-relief activities (walking, yoga, music)',
                    'Set a strict entertainment budget and stick to it',
                    'Practice the 24-hour rule before non-essential purchases',
                    'Join study groups for social support without spending'
                ]
            });
        }
    },

    // Pattern 4: Comprehensive burnout risk
    detectBurnoutRisk() {
        const health = Storage.getRecentHealth(7);
        const education = Storage.getRecentEducation(7);

        if (health.length < 5 || education.length < 5) return;

        const avgSleep = Utils.average(health.map(e => e.sleepHours));
        const avgStress = Utils.average(health.map(e => e.stressLevel));
        const avgSleepQuality = Utils.average(health.map(e => e.sleepQuality));
        const totalStudyHours = Utils.sum(education.map(e => e.duration));
        const avgFocus = Utils.average(education.map(e => e.focusLevel));

        // Multiple burnout indicators
        const burnoutScore =
            (avgSleep < 6 ? 2 : 0) +
            (avgStress >= 8 ? 3 : avgStress >= 7 ? 2 : 0) +
            (avgSleepQuality < 5 ? 2 : 0) +
            (totalStudyHours > 35 ? 2 : 0) +
            (avgFocus < 5 ? 2 : 0);

        if (burnoutScore >= 6) {
            this.insights.push({
                id: 'burnout-risk',
                title: '⚠️ High Burnout Risk Detected',
                severity: 'high',
                icon: '🔥',
                description: `Multiple indicators suggest you're at high risk of burnout: insufficient sleep (${avgSleep.toFixed(1)}h), high stress (${avgStress.toFixed(1)}/10), poor sleep quality (${avgSleepQuality.toFixed(1)}/10), and declining focus (${avgFocus.toFixed(1)}/10). Immediate action recommended.`,
                connections: [
                    { domain: 'Health', metric: `Sleep: ${avgSleep.toFixed(1)}h` },
                    { domain: 'Health', metric: `Stress: ${avgStress.toFixed(1)}/10` },
                    { domain: 'Health', metric: `Quality: ${avgSleepQuality.toFixed(1)}/10` },
                    { domain: 'Education', metric: `Focus: ${avgFocus.toFixed(1)}/10` }
                ],
                recommendations: [
                    '🚨 Take a break day - rest is productive!',
                    'Reduce study hours and focus on quality over quantity',
                    'Prioritize 8 hours of sleep every night',
                    'Talk to a counselor or trusted friend',
                    'Practice daily stress management (meditation, exercise)'
                ]
            });
        }
    },

    // Pattern 5: Academic pressure detection
    detectAcademicPressure() {
        const education = Storage.getRecentEducation(7);
        const health = Storage.getRecentHealth(7);

        if (education.length < 5 || health.length < 3) return;

        const totalStudyHours = Utils.sum(education.map(e => e.duration));
        const avgFocus = Utils.average(education.map(e => e.focusLevel));
        const recentMoods = health.slice(-3).map(e => e.mood);
        const negativeModds = recentMoods.filter(m => m === 'low' || m === 'stressed').length;

        // Very high study hours with declining focus and negative moods
        if (totalStudyHours > 30 && avgFocus < 7 && negativeModds >= 2) {
            this.insights.push({
                id: 'academic-pressure',
                title: 'Academic Pressure Building',
                severity: 'medium',
                icon: '📚',
                description: `You've been studying intensively (${totalStudyHours.toFixed(1)}h this week), but your focus is declining (${avgFocus.toFixed(1)}/10) and your mood has been negative. This suggests diminishing returns from extended study.`,
                connections: [
                    { domain: 'Education', metric: `${totalStudyHours.toFixed(1)}h study` },
                    { domain: 'Education', metric: `Focus: ${avgFocus.toFixed(1)}/10` },
                    { domain: 'Health', metric: `Mood: Recently negative` }
                ],
                recommendations: [
                    'Use the Pomodoro technique (25min study, 5min break)',
                    'Take regular breaks to maintain focus',
                    'Vary your study methods to stay engaged',
                    'Reward yourself after completing study goals'
                ]
            });
        }
    },

    render() {
        this.renderInsightsSection();
        this.renderDashboardHighlight();
    },

    renderInsightsSection() {
        const container = document.getElementById('insightsContainer');
        if (!container) return;

        if (this.insights.length === 0) {
            container.innerHTML = `
                <div class="insight-card">
                    <div class="insight-header">
                        <span class="insight-icon">✨</span>
                        <h3 class="insight-title">No Cross-Domain Patterns Detected</h3>
                    </div>
                    <p class="insight-description">
                        Keep logging your education, health, and finance data. 
                        Once we have enough information, we'll identify meaningful connections 
                        and provide personalized insights to help you optimize your life.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.insights.map(insight => `
            <div class="insight-card">
                <div class="insight-header">
                    <span class="insight-icon">${insight.icon}</span>
                    <h3 class="insight-title">${insight.title}</h3>
                    <span class="insight-severity ${insight.severity}">${insight.severity}</span>
                </div>
                <p class="insight-description">${insight.description}</p>
                <div class="insight-connections">
                    ${insight.connections.map(conn => `
                        <div class="connection-badge">
                            <strong>${conn.domain}:</strong> ${conn.metric}
                        </div>
                    `).join('')}
                </div>
                <div class="insight-recommendations">
                    <h4>💡 Recommendations</h4>
                    <ul>
                        ${insight.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    },

    renderDashboardHighlight() {
        const container = document.getElementById('insightsHighlight');
        if (!container) return;

        const highPriorityInsights = this.insights.filter(i => i.severity === 'high');

        if (highPriorityInsights.length === 0) {
            container.innerHTML = '';
            return;
        }

        const insight = highPriorityInsights[0];
        container.innerHTML = `
            <div class="insight-card" style="border-left: 4px solid var(--danger-500);">
                <div class="insight-header">
                    <span class="insight-icon">${insight.icon}</span>
                    <h3 class="insight-title">${insight.title}</h3>
                    <span class="insight-severity ${insight.severity}">${insight.severity}</span>
                </div>
                <p class="insight-description">${insight.description}</p>
                <div style="margin-top: 1rem;">
                    <a href="#insights" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
                        View All Insights
                    </a>
                </div>
            </div>
        `;
    },

    getInsightsSummary() {
        return {
            total: this.insights.length,
            high: this.insights.filter(i => i.severity === 'high').length,
            medium: this.insights.filter(i => i.severity === 'medium').length,
            low: this.insights.filter(i => i.severity === 'low').length
        };
    }
};
