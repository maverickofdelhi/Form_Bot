from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from form_bot import run_bot, run_speed_bot

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)

        url = data.get('url', '')
        count = data.get('count', 1)
        use_persona = data.get('use_persona', True)
        mode = data.get('mode', 'stealth')

        if not url:
            self._send_error(400, "Target URL is required.")
            return

        try:
            def web_log(msg):
                print(f"[BOT LOG]: {msg}")

            # Check environment capabilities
            has_selenium = False
            try:
                import selenium
                has_selenium = True
            except ImportError:
                pass

            # Environment sensing logic
            if mode == 'stealth' and not has_selenium:
                # If stealth requested but no selenium, try to fallback or warn
                self._send_error(403, "Stealth Mode requires Selenium. Warp Mode is available for this form.")
                return

            if mode == 'warp':
                run_speed_bot(url, count, use_ai=use_persona, log_callback=web_log)
                msg = f"Warp deployment successful for {count} cycles."
            else:
                run_bot(url, count, use_ai=use_persona, log_callback=web_log)
                msg = f"Stealth deployment successful for {count} cycles."

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': True, 
                'message': msg,
                'mode': mode,
                'environment': 'Serverless' if not has_selenium else 'Local'
            }).encode())

        except Exception as e:
            self._send_error(500, str(e))

    def _send_error(self, code, message):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'success': False, 'error': message}).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("FormBot Universal API v3.0 ACTIVE".encode())
