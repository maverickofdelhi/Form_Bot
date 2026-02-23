/**
 * FormBot Astral - Main Controller
 * Optimized for Local Bridge execution
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('submission-form');
    const executeBtn = document.getElementById('execute-btn');
    const aiToggle = document.getElementById('ai-toggle');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const logContainer = document.getElementById('log-container');
    const clearLogsBtn = document.getElementById('clear-logs');
    const statUplinks = document.getElementById('stat-uplinks');

    // State
    let currentMode = 'stealth';
    let isRunning = false;
    let uplinks = parseInt(localStorage.getItem('fb_uplinks') || '0');

    statUplinks.textContent = uplinks;

    // Mode Selection
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');
            addLog(`Core Mode updated: ${currentMode.toUpperCase()}`, 'INFO');
        });
    });

    // Logging Engine
    function addLog(msg, level = 'INFO') {
        const placeholder = logContainer.querySelector('.placeholder');
        if (placeholder) placeholder.remove();

        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `
            <span class="log-lvl lvl-${level.toLowerCase()}">[${level}]</span>
            <span class="log-msg">${msg}</span>
        `;
        logContainer.appendChild(line);
        logContainer.scrollTop = logContainer.scrollHeight;

        if (logContainer.children.length > 100) logContainer.children[0].remove();
    }

    clearLogsBtn.addEventListener('click', () => {
        logContainer.innerHTML = '<div class="placeholder">Awaiting link...</div>';
    });

    // Orchestrator
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isRunning) return;

        const url = document.getElementById('form-url').value;
        const count = parseInt(document.getElementById('response-count').value) || 1;
        const useAi = aiToggle.checked;

        isRunning = true;
        setLoadingState(true);

        addLog(`Initiating deployment: ${url}`, 'INFO');

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    count,
                    use_persona: useAi,
                    mode: currentMode
                })
            });

            const data = await response.json();

            if (data.success) {
                addLog(`Orchestrator: ${data.message}`, 'SUCCESS');
                addLog(`Terminal check: Logs will appear in your Python console.`, 'INFO');

                // Update stats
                uplinks += count;
                localStorage.setItem('fb_uplinks', uplinks);
                statUplinks.textContent = uplinks;

                // We don't stop 'isRunning' immediately for Stealth mode because it's a long process
                // But since the current API is fire-and-forget (background thread), we reset the button
                setTimeout(() => stopExecution(), 2000);
            } else {
                addLog(`Engine Error: ${data.error}`, 'ERROR');
                stopExecution();
            }
        } catch (err) {
            console.error(err);
            addLog("System Alert: Local bridge not detected. Run 'python run_web.py' first.", 'ERROR');
            stopExecution();
        }
    });

    function stopExecution() {
        isRunning = false;
        setLoadingState(false);
    }

    function setLoadingState(loading) {
        const btnText = executeBtn.querySelector('.btn-text');
        const icon = executeBtn.querySelector('i');

        if (loading) {
            executeBtn.style.opacity = '0.6';
            executeBtn.style.cursor = 'wait';
            btnText.textContent = 'EXECUTING...';
            icon.setAttribute('data-lucide', 'refresh-ccw');
            icon.classList.add('animate-spin');
        } else {
            executeBtn.style.opacity = '1';
            executeBtn.style.cursor = 'pointer';
            btnText.textContent = 'INITIALIZE DEPLOYMENT';
            icon.setAttribute('data-lucide', 'arrow-right');
            icon.classList.remove('animate-spin');
        }
        lucide.createIcons();
    }
});
