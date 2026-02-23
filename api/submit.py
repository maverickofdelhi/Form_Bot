from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add root to path so we can import our modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from form_bot import run_bot, run_speed_bot

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)

        url = data.get('url')
        count = data.get('count', 1)
        use_persona = data.get('use_persona', True)
        mode = data.get('mode', 'stealth') # 'stealth' (Selenium) or 'warp' (Speed)

        if not url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': 'URL is required'}).encode())
            return

        try:
            def web_log(msg):
                print(f"[BOT LOG]: {msg}")

            # Routing based on mode
            if mode == 'warp':
                run_speed_bot(url, count, use_ai=use_persona, log_callback=web_log)
            else:
                # Note: run_bot requires a browser environment. On Vercel, this usually needs a serverless-chrome binary.
                # If running locally, it uses installed Chrome.
                run_bot(url, count, use_ai=use_persona, log_callback=web_log)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': f'Finished processing {count} responses using {mode.upper()} mode'}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("Form Bot API is running. Mode: Dual Support (Stealth/Warp)".encode())
