/**
 * FormBot Astral - Main Controller
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

    // Mode Selection Logic
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');

            addLog(`Switching core to: ${currentMode.toUpperCase()} MODE`, 'INFO');
        });
    });

    // Logging Core
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

        // Max 50 logs for minimalism
        if (logContainer.children.length > 50) logContainer.children[0].remove();
    }

    clearLogsBtn.addEventListener('click', () => {
        logContainer.innerHTML = '<div class="placeholder">Awaiting link...</div>';
    });

    // Operation Controller
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isRunning) return;

        const url = document.getElementById('form-url').value;
        const count = parseInt(document.getElementById('response-count').value) || 1;
        const useAi = aiToggle.checked;

        isRunning = true;
        setLoadingState(true);

        addLog(`Deployment started: ${url}`, 'INFO');
        addLog(`Protocol: ${currentMode.toUpperCase()}, Reps: ${count}, AI: ${useAi}`, 'DEBUG');

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
                addLog(`Success: Cloud orchestration complete.`, 'SUCCESS');
                uplinks += count;
                localStorage.setItem('fb_uplinks', uplinks);
                statUplinks.textContent = uplinks;
            } else {
                addLog(`Error: ${data.error || 'Execution failed.'}`, 'ERROR');
            }
        } catch (err) {
            console.error(err);
            addLog("System Alert: API connection failed. Simulating local execution.", 'DEBUG');

            // Simulation Visuals
            let progress = 0;
            const sim = setInterval(() => {
                progress++;
                addLog(`Processing request ${progress}/${count}...`, 'INFO');
                if (progress >= count) {
                    clearInterval(sim);
                    addLog("Simulation Task Finished.", 'SUCCESS');
                    stopExecution();
                }
            }, 1000);
            return;
        } finally {
            // Only stop if not in simulation
            setTimeout(() => {
                if (isRunning) stopExecution();
            }, 1000);
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
