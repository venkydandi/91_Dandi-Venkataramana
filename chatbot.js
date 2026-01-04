// ========================================
// AI Chatbot - Mentor Logic
// ========================================

const Chatbot = {
    isOpen: false,
    context: {},

    init() {
        this.setupEventListeners();
        this.loadHistory();
        this.updateContext();

        // Send welcome message if first time
        const history = Storage.getChatHistory();
        if (history.length === 0) {
            this.addBotMessage("Hello! I'm your AI Life Mentor. I'm here to help you balance education, health, and finances. How are you feeling today?");
        }
    },

    setupEventListeners() {
        const toggleBtn = document.getElementById('chatToggleBtn');
        const closeBtn = document.getElementById('chatCloseBtn');
        const form = document.getElementById('chatForm');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    },

    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('chatPanel');
        if (panel) {
            panel.classList.toggle('open', this.isOpen);
        }

        if (this.isOpen) {
            this.scrollToBottom();
            document.getElementById('chatInput')?.focus();
        }
    },

    open() {
        this.isOpen = true;
        const panel = document.getElementById('chatPanel');
        if (panel) {
            panel.classList.add('open');
        }
        this.scrollToBottom();
        document.getElementById('chatInput')?.focus();
    },

    close() {
        this.isOpen = false;
        const panel = document.getElementById('chatPanel');
        if (panel) {
            panel.classList.remove('open');
        }
    },

    handleSubmit() {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message
        this.addUserMessage(message);
        input.value = '';

        // Update context before generating response
        this.updateContext();

        // Generate and add bot response
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addBotMessage(response);
        }, 500);
    },

    addUserMessage(text) {
        this.addMessage(text, 'user');
        Storage.saveChatMessage({ role: 'user', content: text });
    },

    addBotMessage(text) {
        this.addMessage(text, 'bot');
        Storage.saveChatMessage({ role: 'bot', content: text });
    },

    addMessage(text, role) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${role}`;
        avatar.textContent = role === 'bot' ? '🤖' : '👤';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        container.appendChild(messageDiv);
        this.scrollToBottom();
    },

    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    },

    loadHistory() {
        const history = Storage.getChatHistory();
        const container = document.getElementById('chatMessages');
        if (!container) return;

        container.innerHTML = '';

        // Load last 20 messages
        history.slice(-20).forEach(msg => {
            this.addMessage(msg.content, msg.role);
        });
    },

    updateContext() {
        // Gather current state from all modules
        this.context = {
            education: Education.getMetrics(),
            health: Health.getMetrics(),
            finance: Finance.getMetrics(),
            insights: Intelligence.getInsightsSummary(),
            burnout: Health.detectBurnout(),
            focusIssues: Education.detectFocusIssues(),
            overspending: Finance.detectOverspending()
        };
    },

    generateResponse(userMessage) {
        const msg = userMessage.toLowerCase();

        // Greeting responses
        if (msg.match(/\b(hi|hello|hey|good morning|good evening)\b/)) {
            return this.getGreetingResponse();
        }

        // Feeling/mood check
        if (msg.match(/\b(feeling|feel|mood|how am i|doing)\b/)) {
            return this.getMoodResponse();
        }

        // Study/education queries
        if (msg.match(/\b(study|studies|studying|learn|learning|focus|education|academic)\b/)) {
            return this.getEducationResponse();
        }

        // Health/wellness queries
        if (msg.match(/\b(sleep|stress|health|wellness|tired|exhausted|burnout)\b/)) {
            return this.getHealthResponse();
        }

        // Finance queries
        if (msg.match(/\b(money|spending|budget|finance|expense|save|saving)\b/)) {
            return this.getFinanceResponse();
        }

        // Help/guidance
        if (msg.match(/\b(help|advice|suggest|recommend|what should|guide)\b/)) {
            return this.getGuidanceResponse();
        }

        // Motivation
        if (msg.match(/\b(motivate|motivation|inspire|encourage)\b/)) {
            return this.getMotivationResponse();
        }

        // Default response with context
        return this.getContextualResponse();
    },

    getGreetingResponse() {
        const greetings = [
            "Hello! How can I support you today?",
            "Hi there! Ready to tackle the day together?",
            "Hey! What's on your mind?",
            "Hello! I'm here to help you balance your life. What would you like to discuss?"
        ];

        const greeting = greetings[Math.floor(Math.random() * greetings.length)];

        // Add context if there are urgent issues
        if (this.context.burnout?.severity === 'high') {
            return greeting + " I noticed you might be experiencing burnout. Let's talk about it.";
        }

        return greeting;
    },

    getMoodResponse() {
        const { health, education, finance } = this.context;

        let response = "Based on your recent data, ";

        if (this.context.burnout?.severity === 'high') {
            response += "I'm concerned about your well-being. Your stress levels are high and sleep quality is poor. ";
            response += "It's important to prioritize rest and self-care right now. ";
            response += "Would you like some specific suggestions for managing stress?";
        } else if (parseFloat(health.avgStress) >= 7) {
            response += "you seem to be under significant stress. ";
            response += "Remember to take breaks and practice relaxation techniques. ";
            response += "What's been causing the most stress lately?";
        } else if (parseFloat(health.avgSleep) < 6.5) {
            response += "you're not getting enough sleep. ";
            response += "Quality sleep is crucial for both your health and academic performance. ";
            response += "Can we work on improving your sleep routine?";
        } else {
            response += "you're doing reasonably well! ";
            response += "Keep maintaining your balance across education, health, and finances. ";
            response += "Is there anything specific you'd like to improve?";
        }

        return response;
    },

    getEducationResponse() {
        const { education } = this.context;

        if (parseFloat(education.avgFocus) < 6) {
            return `I see your focus has been lower than usual (${education.avgFocus}/10). This could be related to sleep quality or stress levels. Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break. Also, make sure you're studying during your peak energy hours.`;
        }

        if (parseFloat(education.todayHours) === 0) {
            return "You haven't logged any study sessions today. Even 30 minutes of focused study can make a difference. What subject would you like to tackle first?";
        }

        if (parseFloat(education.totalHours) > 35) {
            return `You've been studying a lot this week (${education.totalHours} hours). While dedication is admirable, remember that quality matters more than quantity. Make sure you're taking breaks and getting enough rest to maintain your focus.`;
        }

        return `You've studied ${education.totalHours} hours this week with an average focus of ${education.avgFocus}/10. Keep up the good work! Remember to take regular breaks to maintain your productivity.`;
    },

    getHealthResponse() {
        const { health } = this.context;

        if (this.context.burnout) {
            return `⚠️ I'm detecting signs of burnout. Your average stress is ${health.avgStress}/10 and you're sleeping ${health.avgSleep} hours per night. Please prioritize rest. Consider: 1) Taking a full rest day, 2) Reducing your workload temporarily, 3) Talking to a counselor. Your well-being is the foundation of everything else.`;
        }

        if (parseFloat(health.avgSleep) < 6) {
            return `Your sleep average is ${health.avgSleep} hours, which is below the recommended 7-8 hours. Poor sleep affects focus, mood, and overall health. Try: establishing a consistent bedtime, avoiding screens before bed, and creating a relaxing evening routine.`;
        }

        if (parseFloat(health.avgStress) >= 7) {
            return `Your stress levels are elevated (${health.avgStress}/10). Try these stress-relief techniques: deep breathing exercises, short walks, meditation, or talking to a friend. Remember, managing stress is not a luxury—it's essential for your success.`;
        }

        return `Your health metrics look good! Sleep: ${health.avgSleep}h average, Stress: ${health.avgStress}/10. Keep maintaining these healthy habits.`;
    },

    getFinanceResponse() {
        const { finance } = this.context;

        if (this.context.overspending) {
            return `I noticed you've exceeded your budget recently. Your weekly spending is $${finance.weeklyTotal}. Consider: 1) Reviewing your expenses to find areas to cut back, 2) Setting daily spending limits, 3) Finding free alternatives for entertainment. Financial stress can impact your mental health and focus.`;
        }

        if (parseFloat(finance.avgDaily) > 40) {
            return `Your average daily spending is $${finance.avgDaily}, which is quite high. Try the 24-hour rule: wait 24 hours before making non-essential purchases. This helps reduce impulse buying and saves money.`;
        }

        return `Your spending this week is $${finance.weeklyTotal}. You're managing your finances well! Continue tracking your expenses to maintain awareness of your spending patterns.`;
    },

    getGuidanceResponse() {
        // Provide guidance based on highest priority issue
        if (this.context.insights.high > 0) {
            return "I've detected some important patterns in your data. Check the Insights section for detailed cross-domain analysis. The most urgent issue is affecting multiple areas of your life, and I have specific recommendations to help you address it.";
        }

        if (this.context.burnout) {
            return "My top recommendation right now is to address your burnout risk. Take a rest day, reduce your workload, and prioritize sleep. Everything else can wait—your health cannot.";
        }

        if (this.context.focusIssues) {
            return "Your focus has been declining. This is often related to sleep quality or stress. Make sure you're getting 7-8 hours of sleep, taking regular breaks during study, and managing stress through exercise or relaxation techniques.";
        }

        return "You're doing well overall! To optimize further: maintain consistent sleep schedules, use focused study techniques like Pomodoro, track your spending to avoid financial stress, and remember to take breaks. Balance is key!";
    },

    getMotivationResponse() {
        const motivations = [
            "You're doing great! Every small step forward is progress. Keep going! 💪",
            "Remember: you're not just surviving, you're building the foundation for your future. Stay strong! ✨",
            "Challenges are opportunities in disguise. You've got this! 🌟",
            "Your dedication to tracking and improving your life is already a huge achievement. Be proud! 🎯",
            "Progress isn't always linear. Some days are harder than others, and that's okay. Keep moving forward! 🚀"
        ];

        return motivations[Math.floor(Math.random() * motivations.length)];
    },

    getContextualResponse() {
        // Provide a response based on overall context
        const issues = [];

        if (this.context.burnout) issues.push("burnout risk");
        if (this.context.focusIssues) issues.push("declining focus");
        if (this.context.overspending) issues.push("budget concerns");

        if (issues.length > 0) {
            return `I'm here to help you with ${issues.join(', ')}. What would you like to discuss? I can provide specific advice on any aspect of your education, health, or finances.`;
        }

        return "I'm here to support you in balancing education, health, and finances. You can ask me about your study habits, sleep patterns, stress levels, spending, or request general guidance. What's on your mind?";
    }
};
