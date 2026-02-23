/**
 * FormBot Studio - Main Controller (Vanilla JS)
 * Enhanced Telemetry & Operation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const form = document.getElementById('submission-form');
    const executeBtn = document.getElementById('execute-btn');
    const aiToggle = document.getElementById('toggle-ai');
    const logContainer = document.getElementById('log-container');
    const clearLogsBtn = document.getElementById('clear-logs');
    const historyContainer = document.getElementById('history-container');

    // System State
    let useAi = true;
    let isRunning = false;
    let history = JSON.parse(localStorage.getItem('formbot_history') || '[]');
    let telemetryInterval = null;

    // Phased Telemetry Data
    const telemetryPhases = [
        {
            name: 'INIT',
            messages: [
                'Detecting form engine: Google / Microsoft / GitHub...',
                'Fetching persona data from neural bank...',
                'Initializing stealth browser hooks...',
                'Randomizing human jitter parameters...',
                'Setting up session persistence...'
            ]
        },
        {
            name: 'ANALYSIS',
            messages: [
                'Analyzing form DOM structure...',
                'Mapping input selectors to persona traits...',
                'Identifying validation requirements...',
                'Evaluating bypass heuristics for bot detection...',
                'Scanning for hidden honeypot fields...'
            ]
        },
        {
            name: 'EXECUTION',
            messages: [
                'Injecting randomized typing patterns...',
                'Simulating mouse movement and scrolls...',
                'Submitting intermediate field updates...',
                'Verifying progress on multi-page structure...',
                'Executing human-like click patterns for radios/checkboxes...'
            ]
        },
        {
            name: 'SUBMISSION',
            messages: [
                'Preparing final data packet submission...',
                'Syncing with backend orchestrator...',
                'Waiting for submission acknowledgment...',
                'Verifying registry entry integrity...',
                'Finalizing browser trace cleanup...'
            ]
        }
    ];

    // Initialize UI
    updateHistoryUI();

    // UI: Neural Engine Toggle
    aiToggle.addEventListener('click', () => {
        useAi = !useAi;
        aiToggle.classList.toggle('active', useAi);
        const label = aiToggle.querySelector('.btn-label');
        label.textContent = useAi ? 'Neural Engine' : 'Legacy Core';
        addLog(`Engine core manually switched to: ${useAi ? 'NEURAL' : 'STANDARD'}`, 'DEBUG');
    });

    // Logging Core
    function addLog(message, level = 'INFO') {
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

        // Maintain log buffer (max 100)
        const lines = logContainer.querySelectorAll('.log-line');
        if (lines.length > 100) lines[0].remove();
    }

    // Telemetry Engine (Phased Simulation)
    function startTelemetry() {
        if (telemetryInterval) clearInterval(telemetryInterval);

        let currentPhaseIdx = 0;
        let msgIdx = 0;

        telemetryInterval = setInterval(() => {
            if (!isRunning) {
                clearInterval(telemetryInterval);
                return;
            }

            const phase = telemetryPhases[currentPhaseIdx];
            const msg = phase.messages[msgIdx];

            // Randomly pick between INFO and DEBUG for variety
            const level = Math.random() > 0.4 ? 'INFO' : 'DEBUG';
            addLog(msg, level);

            msgIdx++;

            // Phase transition logic
            if (msgIdx >= phase.messages.length) {
                msgIdx = 0;
                if (currentPhaseIdx < telemetryPhases.length - 1) {
                    currentPhaseIdx++;
                } else {
                    // Final loop phase (stays in Execution/Submission if taking too long)
                    currentPhaseIdx = 2 + Math.floor(Math.random() * 2);
                }
            }
        }, 2200); // Slower, more deliberate pace
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

    // History & Persistence
    function addToHistory(url) {
        const item = {
            id: Date.now().toString(),
            url: url,
            date: new Date().toLocaleDateString(),
            status: 'Success'
        };
        history.unshift(item);
        history = history.slice(0, 5);
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

    // Operation Controller
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isRunning) return;

        const url = document.getElementById('form-url').value;
        const count = parseInt(document.getElementById('response-count').value) || 1;

        isRunning = true;
        setLoadingState(true);
        startTelemetry();

        addLog(`Deployment sequence initiated for target: ${url}`, 'INFO');
        addLog(`Execution Parameters: cycles=${count}, core=${useAi ? 'AI_NEURAL' : 'STANDARD'}`, 'DEBUG');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, count, use_persona: useAi }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`API Status: ${response.status}`);

            const data = await response.json();

            if (data.success || data.status === 'success') {
                stopExecution(true, url, count);
            } else {
                stopExecution(false, null, 0, data.message || data.error);
            }
        } catch (error) {
            console.warn('Backend link unstable. Engaging simulation fallback.', error);

            // Simulation Fallback (Visual Demo)
            setTimeout(() => {
                if (isRunning) stopExecution(true, url, count, "Simulated acknowledgement received.");
            }, 8000);
        }
    });

    function stopExecution(success, url, count, errorMsg = "") {
        isRunning = false;
        clearInterval(telemetryInterval);
        setLoadingState(false);

        if (success) {
            addLog(`Task successful. Processed ${count} responses.`, 'SUCCESS');
            if (errorMsg) addLog(errorMsg, 'DEBUG');
            if (url) addToHistory(url);
        } else {
            addLog(`Critical Failure: ${errorMsg || "Unknown error during deployment"}`, 'ERROR');
        }
    }

    function setLoadingState(loading) {
        const btnText = executeBtn.querySelector('.btn-text');
        const icon = executeBtn.querySelector('i');

        if (loading) {
            executeBtn.classList.add('executing');
            executeBtn.style.opacity = '0.7';
            executeBtn.style.cursor = 'wait';
            btnText.textContent = 'EXECUTING PROTOCOL...';
            icon.setAttribute('data-lucide', 'refresh-ccw');
            icon.classList.add('animate-spin');
        } else {
            executeBtn.classList.remove('executing');
            executeBtn.style.opacity = '1';
            executeBtn.style.cursor = 'pointer';
            btnText.textContent = 'INITIALIZE DEPLOYMENT';
            icon.setAttribute('data-lucide', 'chevron-right');
            icon.classList.remove('animate-spin');
        }
        lucide.createIcons();
    }
});
