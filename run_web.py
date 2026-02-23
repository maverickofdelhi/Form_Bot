import os
import sys
import json
import threading
from flask import Flask, request, jsonify, send_from_directory

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from form_bot import run_bot, run_speed_bot

app = Flask(__name__, static_folder='dashboard_vanilla')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/submit', methods=['POST'])
def submit():
    data = request.json
    url = data.get('url')
    count = int(data.get('count', 1))
    use_persona = data.get('use_persona', True)
    mode = data.get('mode', 'stealth')

    if not url:
        return jsonify({'success': False, 'error': 'URL is required'}), 400

    def background_task():
        try:
            print(f"[*] Starting {mode.upper()} deployment for: {url}")
            
            # Simple logging for terminal
            def web_log(msg):
                print(f"[BOT]: {msg}")

            if mode == 'warp':
                run_speed_bot(url, count, use_ai=use_persona, log_callback=web_log)
            else:
                run_bot(url, count, use_ai=use_persona, log_callback=web_log)
                
            print(f"[*] Deployment complete.")
        except Exception as e:
            print(f"[!] Engine Error: {e}")

    # Run the bot in a background thread to keep UI responsive
    thread = threading.Thread(target=background_task)
    thread.start()

    return jsonify({
        'success': True, 
        'message': f'Deployment initiated using {mode.upper()} mode.',
        'details': f'Job started for {count} cycles.'
    })

if __name__ == '__main__':
    print("--------------------------------------------------")
    print("FormBot Studio | Local Orchestrator Bridge")
    print("--------------------------------------------------")
    print(f"Dashboard: http://localhost:5000")
    print("Status: ENGINE READY")
    print("--------------------------------------------------")
    app.run(port=5000, debug=False)
