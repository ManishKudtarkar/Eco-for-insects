"""
Simple Static File Server for EcoPredict Frontend
Serves HTML, CSS, JS from the frontend folder
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import sys

class FrontendHandler(SimpleHTTPRequestHandler):
    """Custom handler to serve frontend files"""
    
    def end_headers(self):
        """Add CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        return super().do_GET()
    
    def log_message(self, format, *args):
        """Log messages to console"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def run_server(port=3000, frontend_dir='frontend'):
    """Run the frontend server"""
    # Change to frontend directory
    frontend_path = Path(__file__).parent / frontend_dir
    
    if not frontend_path.exists():
        print(f"❌ Frontend directory not found: {frontend_path}")
        sys.exit(1)
    
    os.chdir(frontend_path)
    
    # Create server
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, FrontendHandler)
    
    print(f"✅ EcoPredict Frontend Server Started")
    print(f"📱 URL: http://127.0.0.1:{port}")
    print(f"📁 Serving: {frontend_path}")
    print(f"🛑 Press Ctrl+C to stop\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        sys.exit(0)


if __name__ == '__main__':
    run_server()
