/**
 * FormBot Astral - Universal Controller
 * Logic for 'Zero-Setup' execution on Vercel/Any PC
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const form = document.getElementById('submission-form');
    const executeBtn = document.getElementById('execute-btn');
    const aiToggle = document.getElementById('ai-toggle');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const logContainer = document.getElementById('log-container');
    const clearLogsBtn = document.getElementById('clear-logs');
    const statUplinks = document.getElementById('stat-uplinks');

    // System State
    let currentMode = 'stealth';
    let isRunning = false;
    let uplinks = parseInt(localStorage.getItem('fb_uplinks') || '0');

    statUplinks.textContent = uplinks;

    // Mode Selector
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');
            addLog(`Target execution mode: ${currentMode.toUpperCase()}`, 'INFO');
        });
    });

    // Logging Utility
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

        if (logContainer.children.length > 50) logContainer.children[0].remove();
    }

    clearLogsBtn.addEventListener('click', () => {
        logContainer.innerHTML = '<div class="placeholder">Awaiting link...</div>';
    });

    // Main Deployment Logic
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isRunning) return;

        const url = document.getElementById('form-url').value;
        const count = parseInt(document.getElementById('response-count').value) || 1;
        const useAi = aiToggle.checked;

        isRunning = true;
        setLoadingState(true);

        addLog(`System check: Initiating universal deployment...`, 'INFO');

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, count, use_persona: useAi, mode: currentMode })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                addLog(`Orchestration Complete: ${data.message}`, 'SUCCESS');
                if (data.environment === 'Serverless') {
                    addLog("Note: Running on Vercel Cloud (Universal Mode).", 'DEBUG');
                }

                uplinks += count;
                localStorage.setItem('fb_uplinks', uplinks);
                statUplinks.textContent = uplinks;
                stopExecution();
            } else {
                // Handle environment-specific blockers (like Selenium on Vercel)
                if (response.status === 403 && currentMode === 'stealth') {
                    addLog(`Environment Restriction: Stealth Mode (Selenium) is unavailable on Vercel.`, 'ERROR');
                    addLog(`Recommendation: Switching to WARP MODE for direct package filling.`, 'INFO');

                    // Auto-switch UI to help the user
                    modeBtns[1].click();
                } else {
                    addLog(`Engine Error: ${data.error || 'Connection failed'}`, 'ERROR');
                }
                stopExecution();
            }
        } catch (err) {
            console.error('Network failure:', err);
            addLog("Uplink Lost: Ensure 'python run_web.py' is running if offline.", 'ERROR');
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
            btnText.textContent = 'DEPLOYING...';
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
