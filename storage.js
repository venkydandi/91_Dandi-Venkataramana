// ========================================
// Storage Layer - LocalStorage Wrapper
// ========================================

const Storage = {
    // Keys
    KEYS: {
        EDUCATION: 'lifementor_education',
        HEALTH: 'lifemental_health',
        FINANCE: 'lifemental_finance',
        CHAT_HISTORY: 'lifemental_chat',
        USER_PROFILE: 'lifemental_profile',
        SETTINGS: 'lifemental_settings'
    },

    // Get data from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    // Set data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    // Clear all app data
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    // Education data methods
    getEducationData() {
        return this.get(this.KEYS.EDUCATION, []);
    },

    saveEducationEntry(entry) {
        const data = this.getEducationData();
        data.push({
            id: Utils.generateId(),
            timestamp: new Date().toISOString(),
            ...entry
        });
        return this.set(this.KEYS.EDUCATION, data);
    },

    // Health data methods
    getHealthData() {
        return this.get(this.KEYS.HEALTH, []);
    },

    saveHealthEntry(entry) {
        const data = this.getHealthData();
        data.push({
            id: Utils.generateId(),
            timestamp: new Date().toISOString(),
            ...entry
        });
        return this.set(this.KEYS.HEALTH, data);
    },

    // Finance data methods
    getFinanceData() {
        return this.get(this.KEYS.FINANCE, []);
    },

    saveFinanceEntry(entry) {
        const data = this.getFinanceData();
        data.push({
            id: Utils.generateId(),
            timestamp: new Date().toISOString(),
            ...entry
        });
        return this.set(this.KEYS.FINANCE, data);
    },

    // Chat history methods
    getChatHistory() {
        return this.get(this.KEYS.CHAT_HISTORY, []);
    },

    saveChatMessage(message) {
        const history = this.getChatHistory();
        history.push({
            id: Utils.generateId(),
            timestamp: new Date().toISOString(),
            ...message
        });
        return this.set(this.KEYS.CHAT_HISTORY, history);
    },

    clearChatHistory() {
        return this.set(this.KEYS.CHAT_HISTORY, []);
    },

    // User profile methods
    getUserProfile() {
        return this.get(this.KEYS.USER_PROFILE, {
            name: 'User',
            joinDate: new Date().toISOString(),
            disclaimerAccepted: false
        });
    },

    updateUserProfile(updates) {
        const profile = this.getUserProfile();
        return this.set(this.KEYS.USER_PROFILE, { ...profile, ...updates });
    },

    // Settings methods
    getSettings() {
        return this.get(this.KEYS.SETTINGS, {
            theme: 'dark',
            notifications: true,
            dailyCheckIn: true
        });
    },

    updateSettings(updates) {
        const settings = this.getSettings();
        return this.set(this.KEYS.SETTINGS, { ...settings, ...updates });
    },

    // Get recent entries (last N days)
    getRecentEducation(days = 7) {
        const data = this.getEducationData();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return data.filter(entry => new Date(entry.timestamp) >= cutoff);
    },

    getRecentHealth(days = 7) {
        const data = this.getHealthData();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return data.filter(entry => new Date(entry.timestamp) >= cutoff);
    },

    getRecentFinance(days = 7) {
        const data = this.getFinanceData();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return data.filter(entry => new Date(entry.timestamp) >= cutoff);
    },

    // Get today's entries
    getTodayEducation() {
        const data = this.getEducationData();
        const today = Utils.getTodayString();
        return data.filter(entry => entry.timestamp.startsWith(today));
    },

    getTodayHealth() {
        const data = this.getHealthData();
        const today = Utils.getTodayString();
        return data.filter(entry => entry.timestamp.startsWith(today));
    },

    getTodayFinance() {
        const data = this.getFinanceData();
        const today = Utils.getTodayString();
        return data.filter(entry => entry.timestamp.startsWith(today));
    },

    // Export all data
    exportData() {
        return {
            education: this.getEducationData(),
            health: this.getHealthData(),
            finance: this.getFinanceData(),
            chat: this.getChatHistory(),
            profile: this.getUserProfile(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        try {
            if (data.education) this.set(this.KEYS.EDUCATION, data.education);
            if (data.health) this.set(this.KEYS.HEALTH, data.health);
            if (data.finance) this.set(this.KEYS.FINANCE, data.finance);
            if (data.chat) this.set(this.KEYS.CHAT_HISTORY, data.chat);
            if (data.profile) this.set(this.KEYS.USER_PROFILE, data.profile);
            if (data.settings) this.set(this.KEYS.SETTINGS, data.settings);
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
};
