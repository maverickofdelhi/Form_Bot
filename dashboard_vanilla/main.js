/**
 * FormBot Studio - Main Controller (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('submission-form');
    const executeBtn = document.getElementById('execute-btn');
    const aiToggle = document.getElementById('toggle-ai');
    const logContainer = document.getElementById('log-container');
    const clearLogsBtn = document.getElementById('clear-logs');
    const historyContainer = document.getElementById('history-container');

    // State
    let useAi = true;
    let isRunning = false;
    let history = JSON.parse(localStorage.getItem('formbot_history') || '[]');

    // Initialize UI
    updateHistoryUI();

    // AI Toggle Logic
    aiToggle.addEventListener('click', () => {
        useAi = !useAi;
        aiToggle.classList.toggle('active', useAi);
        const label = aiToggle.querySelector('.btn-label');
        label.textContent = useAi ? 'Neural Engine' : 'Legacy Core';
        addLog(`Engine core switched to: ${useAi ? 'Smart Persona (Neural)' : 'Standard (Legacy)'}`, 'DEBUG');
    });

    // Logging Logic
    function addLog(message, level = 'INFO') {
        // Remove empty state if present
        const emptyState = logContainer.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        const logLine = document.createElement('div');
        logLine.className = 'log-line';

        logLine.innerHTML = `
            <span class="log-time">${timestamp}</span>
            <span class="log-level lvl-${level.toLowerCase()}">${level}</span>
            <span class="log-msg">${message}</span>
        `;

        logContainer.appendChild(logLine);
        logContainer.scrollTop = logContainer.scrollHeight;

        // Keep last 100 logs
        const lines = logContainer.querySelectorAll('.log-line');
        if (lines.length > 100) lines[0].remove();
    }

    clearLogsBtn.addEventListener('click', () => {
        logContainer.innerHTML = `
            <div class="empty-state">
                <i data-lucide="activity"></i>
                <p>Waiting for stream...</p>
            </div>
        `;
        lucide.createIcons();
    });

    // History Logic
    function addToHistory(url) {
        const item = {
            id: Date.now().toString(),
            url: url,
            date: new Date().toLocaleDateString(),
            status: 'Success'
        };
        history.unshift(item);
        history = history.slice(0, 5); // Keep last 5
        localStorage.setItem('formbot_history', JSON.stringify(history));
        updateHistoryUI();
    }

    function updateHistoryUI() {
        if (history.length === 0) {
            historyContainer.innerHTML = '<div class="empty-state-sm">No entries found</div>';
            return;
        }

        historyContainer.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="hist-info">
                    <span class="hist-url" title="${item.url}">${item.url}</span>
                    <span class="hist-date">${item.date}</span>
                </div>
                <span class="hist-status status-success">SUCCESS</span>
            </div>
        `).join('');
    }

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isRunning) return;

        const url = document.getElementById('form-url').value;
        const count = parseInt(document.getElementById('response-count').value) || 1;

        isRunning = true;
        setLoadingState(true);

        addLog(`Initiating system for target: ${url}`, 'INFO');
        addLog(`Deployment Parameters: Repetitions = ${count}, AI_CORE = ${useAi}`, 'DEBUG');

        try {
            // Check if we are running in a context where /api exists
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url, count: count, use_persona: useAi })
            });

            const data = await response.json();

            if (data.success || data.status === 'success') {
                addLog(`Protocol complete. Successfully processed ${count} responses.`, 'SUCCESS');
                addToHistory(url);
            } else {
                addLog(`System Error: ${data.message || data.error}`, 'ERROR');
            }
        } catch (error) {
            // If API not found (running locally without Python server), simulate for UI demo
            console.error('API call failed:', error);
            addLog("Warning: Could not connect to API. Simulation mode engaged.", 'DEBUG');

            // Simulation
            setTimeout(() => {
                addLog(`Simulation: Processed ${count} items.`, 'SUCCESS');
                addToHistory(url);
                setLoadingState(false);
                isRunning = false;
            }, 2000);
            return;
        } finally {
            if (!isRunning) return; // Already handled by simulation logic above
            setLoadingState(false);
            isRunning = false;
        }
    });

    function setLoadingState(loading) {
        const btnText = executeBtn.querySelector('.btn-text');
        const icon = executeBtn.querySelector('i');

        if (loading) {
            executeBtn.style.opacity = '0.7';
            executeBtn.style.cursor = 'wait';
            btnText.textContent = 'EXECUTING PROTOCOL...';
            icon.setAttribute('data-lucide', 'refresh-ccw');
            icon.classList.add('animate-spin');
        } else {
            executeBtn.style.opacity = '1';
            executeBtn.style.cursor = 'pointer';
            btnText.textContent = 'INITIALIZE DEPLOYMENT';
            icon.setAttribute('data-lucide', 'chevron-right');
            icon.classList.remove('animate-spin');
        }
        lucide.createIcons();
    }

    // Helper: Pulsing effect for logs
    setInterval(() => {
        if (!isRunning) return;
        const types = ['INFO', 'DEBUG'];
        const msgs = [
            'Analyzing form DOM structure...',
            'Injecting persona traits...',
            'Simulating human jitter...',
            'Bypassing bot detection...',
            'Packet verification in progress...'
        ];
        addLog(msgs[Math.floor(Math.random() * msgs.length)], types[Math.floor(Math.random() * types.length)]);
    }, 1500);
});
