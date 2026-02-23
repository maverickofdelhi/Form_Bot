import customtkinter as ctk
import threading
import time
from datetime import datetime
from form_bot import run_bot, run_speed_bot

# Design Tokens: Astral Minimal
COLOR_BG = "#f8fafc"
COLOR_CARD = "#ffffff"
COLOR_ACCENT = "#2563eb"
COLOR_TEXT = "#0f172a"
COLOR_TEXT_MUTED = "#64748b"
COLOR_BORDER = "#e2e8f0"
COLOR_SUCCESS = "#059669"
COLOR_ERROR = "#dc2626"

ctk.set_appearance_mode("Light")
ctk.set_default_color_theme("blue")

class AstralGUI(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Window Config
        self.title("FormBot | Astral Desktop")
        self.geometry("900x650")
        self.configure(fg_color=COLOR_BG)

        # Layout Logic
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Sidebar
        self.sidebar = ctk.CTkFrame(self, width=200, corner_radius=0, fg_color="#fff", border_color=COLOR_BORDER, border_width=1)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(4, weight=1)

        self.brand_lbl = ctk.CTkLabel(self.sidebar, text="FormBot", font=ctk.CTkFont(size=22, weight="bold"), text_color=COLOR_ACCENT)
        self.brand_lbl.grid(row=0, column=0, padx=20, pady=(30, 20))

        self.status_badge = ctk.CTkLabel(self.sidebar, text="● READY", font=ctk.CTkFont(size=11, weight="bold"), text_color=COLOR_SUCCESS)
        self.status_badge.grid(row=1, column=0, padx=20, pady=10)

        # Modes
        self.mode_lbl = ctk.CTkLabel(self.sidebar, text="EXECUTION CORE", font=ctk.CTkFont(size=10, weight="bold"), text_color=COLOR_TEXT_MUTED)
        self.mode_lbl.grid(row=2, column=0, padx=20, pady=(20, 5), sticky="w")

        self.mode_var = ctk.StringVar(value="stealth")
        self.stealth_radio = ctk.CTkRadioButton(self.sidebar, text="Stealth Mode", variable=self.mode_var, value="stealth", font=ctk.CTkFont(size=13))
        self.stealth_radio.grid(row=3, column=0, padx=20, pady=10, sticky="w")

        self.warp_radio = ctk.CTkRadioButton(self.sidebar, text="Warp Mode", variable=self.mode_var, value="warp", font=ctk.CTkFont(size=13))
        self.warp_radio.grid(row=4, column=0, padx=20, pady=10, sticky="nw")

        # Main Content
        self.main_container = ctk.CTkFrame(self, fg_color="transparent")
        self.main_container.grid(row=0, column=1, sticky="nsew", padx=30, pady=30)
        self.main_container.grid_columnconfigure(0, weight=1)
        self.main_container.grid_rowconfigure(2, weight=1)

        # Header
        self.header_lbl = ctk.CTkLabel(self.main_container, text="Deploy Protocol", font=ctk.CTkFont(size=24, weight="bold"), text_color=COLOR_TEXT)
        self.header_lbl.grid(row=0, column=0, sticky="w")
        
        self.sub_lbl = ctk.CTkLabel(self.main_container, text="Automated human-imitation form orchestration.", font=ctk.CTkFont(size=13), text_color=COLOR_TEXT_MUTED)
        self.sub_lbl.grid(row=1, column=0, sticky="w", pady=(0, 30))

        # Deck Card
        self.deck = ctk.CTkFrame(self.main_container, fg_color=COLOR_CARD, border_color=COLOR_BORDER, border_width=1, corner_radius=12)
        self.deck.grid(row=2, column=0, sticky="nsew", pady=(0, 20))
        self.deck.grid_columnconfigure(0, weight=1)

        # Inputs
        self.url_lbl = ctk.CTkLabel(self.deck, text="TARGET URL", font=ctk.CTkFont(size=10, weight="bold"), text_color=COLOR_TEXT_MUTED)
        self.url_lbl.grid(row=0, column=0, padx=30, pady=(30, 0), sticky="w")
        
        self.url_entry = ctk.CTkEntry(self.deck, placeholder_text="Enter form URL...", height=45, fg_color=COLOR_BG, border_color=COLOR_BORDER, corner_radius=8)
        self.url_entry.grid(row=1, column=0, padx=30, pady=(5, 20), sticky="ew")
        self.url_entry.insert(0, "https://divyansh1920.github.io/MRA/")

        self.config_frame = ctk.CTkFrame(self.deck, fg_color="transparent")
        self.config_frame.grid(row=2, column=0, padx=30, pady=(0, 20), sticky="ew")
        self.config_frame.grid_columnconfigure(0, weight=1)

        self.count_lbl = ctk.CTkLabel(self.config_frame, text="QUANTITY", font=ctk.CTkFont(size=10, weight="bold"), text_color=COLOR_TEXT_MUTED)
        self.count_lbl.grid(row=0, column=0, sticky="w")

        self.count_entry = ctk.CTkEntry(self.config_frame, width=120, height=45, fg_color=COLOR_BG, border_color=COLOR_BORDER, corner_radius=8)
        self.count_entry.grid(row=1, column=0, sticky="w", pady=(5, 0))
        self.count_entry.insert(0, "1")

        self.ai_var = ctk.BooleanVar(value=True)
        self.ai_switch = ctk.CTkSwitch(self.config_frame, text="Neural Persona Engine", variable=self.ai_var, font=ctk.CTkFont(size=13))
        self.ai_switch.grid(row=1, column=1, padx=(20, 0), sticky="e")

        # Action Button
        self.exec_btn = ctk.CTkButton(self.deck, text="START BOT", height=60, fg_color=COLOR_SUCCESS, hover_color="#047857", font=ctk.CTkFont(size=16, weight="bold"), corner_radius=10, command=self.start_deployment)
        self.exec_btn.grid(row=3, column=0, padx=30, pady=(10, 30), sticky="ew")

        # Telemetry Feed
        self.telemetry_card = ctk.CTkFrame(self.main_container, fg_color=COLOR_CARD, border_color=COLOR_BORDER, border_width=1, corner_radius=12)
        self.telemetry_card.grid(row=3, column=0, sticky="nsew")
        self.telemetry_card.grid_columnconfigure(0, weight=1)
        self.telemetry_card.grid_rowconfigure(1, weight=1)

        self.feed_header = ctk.CTkFrame(self.telemetry_card, fg_color="transparent")
        self.feed_header.grid(row=0, column=0, sticky="ew", padx=20, pady=10)
        self.feed_header.grid_columnconfigure(0, weight=1)

        self.feed_lbl = ctk.CTkLabel(self.feed_header, text="TELEMETRY FEED", font=ctk.CTkFont(size=10, weight="bold"), text_color=COLOR_TEXT_MUTED)
        self.feed_lbl.grid(row=0, column=0, sticky="w")

        self.clear_btn = ctk.CTkButton(self.feed_header, text="Clear", width=60, height=22, fg_color="transparent", text_color=COLOR_ACCENT, hover_color=COLOR_BG, font=ctk.CTkFont(size=11, weight="bold"), command=self.clear_logs)
        self.clear_btn.grid(row=0, column=1, sticky="e")

        self.log_area = ctk.CTkTextbox(self.telemetry_card, fg_color="#f1f5f9", text_color=COLOR_TEXT, font=ctk.CTkFont(family="Consolas", size=11), border_width=0)
        self.log_area.grid(row=1, column=0, sticky="nsew", padx=15, pady=(0, 15))
        
        self.log("System initialized. Awaiting uplink parameters.", "INFO")

    def log(self, msg, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_area.insert("end", f"[{timestamp}] [{level}] {msg}\n")
        self.log_area.see("end")

    def clear_logs(self):
        self.log_area.delete("1.0", "end")
        self.log("Log buffer cleared.", "DEBUG")

    def start_deployment(self):
        url = self.url_entry.get().strip()
        if not url:
            self.log("Error: Target URL cannot be empty.", "ERROR")
            return

        try:
            count = int(self.count_entry.get())
        except ValueError:
            self.log("Error: Quantity must be a valid integer.", "ERROR")
            return

        mode = self.mode_var.get()
        use_ai = self.ai_var.get()

        self.exec_btn.configure(state="disabled", text="DEPLOYING PROTOCOL...")
        self.status_badge.configure(text="● ACTIVE", text_color=COLOR_ACCENT)
        self.log(f"Initiating {mode.upper()} deployment for {count} cycles.", "INFO")

        def run():
            try:
                # Thread-safe logging
                def safe_log(m):
                    self.after(0, lambda: self.log(m, "INFO"))

                if mode == "warp":
                    run_speed_bot(url, count, use_ai=use_ai, log_callback=safe_log)
                else:
                    run_bot(url, count, use_ai=use_ai, log_callback=safe_log)
                
                self.after(0, lambda: self.log("Orchestration sequence finished successfully.", "SUCCESS"))
            except Exception as e:
                self.after(0, lambda: self.log(f"Critical Engine Failure: {e}", "ERROR"))
            finally:
                self.after(0, self.stop_deployment)

        threading.Thread(target=run, daemon=True).start()

    def stop_deployment(self):
        self.exec_btn.configure(state="normal", text="INITIALIZE DEPLOYMENT")
        self.status_badge.configure(text="● READY", text_color=COLOR_SUCCESS)

if __name__ == "__main__":
    app = AstralGUI()
    app.mainloop()
