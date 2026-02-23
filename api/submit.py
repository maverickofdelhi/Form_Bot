from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add root to path so we can import our modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from form_bot import run_speed_bot

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)

        url = data.get('url')
        count = data.get('count', 1)
        use_persona = data.get('use_persona', True)

        if not url:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': 'URL is required'}).encode())
            return

        try:
            # We use a non-blocking log callback for the web
            def web_log(msg):
                print(f"[BOT LOG]: {msg}")

            # Trigger the speed bot (HTTP requests version)
            # This is synchronous in the serverless function context
            run_speed_bot(url, count, use_ai=use_persona, log_callback=web_log)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': f'Finished processing {count} responses'}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write("Form Bot API is running.".encode())
