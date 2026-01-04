// ========================================
// Finance Module
// ========================================

const Finance = {
    // Budget limits (can be customized)
    budgetLimits: {
        daily: 50,
        weekly: 300,
        monthly: 1000
    },

    init() {
        this.setupEventListeners();
        this.render();
    },

    setupEventListeners() {
        const form = document.getElementById('financeForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
    },

    handleSubmit(e) {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const notes = document.getElementById('expenseNotes').value;

        if (!Utils.validateNumber(amount, 0) || !Utils.validateRequired(category) || !Utils.validateRequired(notes)) {
            Notifications.error('Please fill in all required fields correctly');
            return;
        }

        const entry = {
            amount,
            category,
            notes
        };

        if (Storage.saveFinanceEntry(entry)) {
            Notifications.success(`Expense of $${amount.toFixed(2)} logged!`);
            e.target.reset();
            this.render();

            // Check for overspending
            const overspending = this.detectOverspending();
            if (overspending) {
                Notifications.warning(overspending.message, 8000);
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
            Notifications.error('Failed to save expense');
        }
    },

    render() {
        this.renderList();
        this.renderChart();
    },

    renderList() {
        const container = document.getElementById('financeList');
        if (!container) return;

        const data = Storage.getRecentFinance(30);

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No expenses logged yet. Start tracking your spending!</div>';
            return;
        }

        const sortedData = Utils.sortBy(data, 'timestamp', true);

        const categoryEmojis = {
            food: '🍔',
            transport: '🚗',
            education: '📚',
            entertainment: '🎮',
            health: '💊',
            shopping: '🛍️',
            other: '📦'
        };

        container.innerHTML = sortedData.slice(0, 10).map(entry => `
            <div class="data-item">
                <div class="data-item-info">
                    <div class="data-item-title">
                        ${categoryEmojis[entry.category] || '📦'} ${entry.notes}
                    </div>
                    <div class="data-item-meta">
                        ${Utils.formatDateTime(entry.timestamp)} • 
                        ${Utils.capitalize(entry.category)}
                    </div>
                </div>
                <div class="data-item-value" style="color: var(--danger-500);">
                    ${Utils.formatCurrency(entry.amount)}
                </div>
            </div>
        `).join('');
    },

    renderChart() {
        const container = document.getElementById('financeChart');
        if (!container) return;

        const data = Storage.getRecentFinance(30);

        if (data.length === 0) {
            container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">No data to display</div>';
            return;
        }

        // Group by category
        const grouped = Utils.groupBy(data, 'category');

        const chartData = Object.keys(grouped).map(category => ({
            label: Utils.capitalize(category),
            value: grouped[category].reduce((sum, entry) => sum + entry.amount, 0)
        }));

        Charts.renderPieChart(container, chartData);
    },

    getMetrics() {
        const recent = Storage.getRecentFinance(7);
        const today = Storage.getTodayFinance();
        const monthly = Storage.getRecentFinance(30);

        const weeklyTotal = Utils.sum(recent.map(e => e.amount));
        const todayTotal = Utils.sum(today.map(e => e.amount));
        const monthlyTotal = Utils.sum(monthly.map(e => e.amount));
        const avgDaily = recent.length > 0 ? weeklyTotal / 7 : 0;

        return {
            weeklyTotal: weeklyTotal.toFixed(2),
            todayTotal: todayTotal.toFixed(2),
            monthlyTotal: monthlyTotal.toFixed(2),
            avgDaily: avgDaily.toFixed(2)
        };
    },

    // Detect overspending
    detectOverspending() {
        const today = Storage.getTodayFinance();
        const week = Storage.getRecentFinance(7);
        const month = Storage.getRecentFinance(30);

        const todayTotal = Utils.sum(today.map(e => e.amount));
        const weekTotal = Utils.sum(week.map(e => e.amount));
        const monthTotal = Utils.sum(month.map(e => e.amount));

        if (monthTotal > this.budgetLimits.monthly) {
            return {
                severity: 'high',
                message: `⚠️ Monthly spending (${Utils.formatCurrency(monthTotal)}) exceeded budget!`,
                amount: monthTotal,
                limit: this.budgetLimits.monthly
            };
        }

        if (weekTotal > this.budgetLimits.weekly) {
            return {
                severity: 'medium',
                message: `Weekly spending (${Utils.formatCurrency(weekTotal)}) exceeded budget!`,
                amount: weekTotal,
                limit: this.budgetLimits.weekly
            };
        }

        if (todayTotal > this.budgetLimits.daily) {
            return {
                severity: 'low',
                message: `Today's spending (${Utils.formatCurrency(todayTotal)}) exceeded daily budget.`,
                amount: todayTotal,
                limit: this.budgetLimits.daily
            };
        }

        return null;
    },

    // Get spending pattern
    getSpendingPattern() {
        const recent = Storage.getRecentFinance(7);
        if (recent.length === 0) return null;

        const avgDaily = Utils.sum(recent.map(e => e.amount)) / 7;
        const grouped = Utils.groupBy(recent, 'category');
        const topCategory = Object.keys(grouped).reduce((a, b) =>
            grouped[a].length > grouped[b].length ? a : b
        );

        return {
            avgDaily: avgDaily.toFixed(2),
            topCategory,
            totalExpenses: recent.length
        };
    }
};
