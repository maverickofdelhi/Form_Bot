import customtkinter as ctk
import threading
from form_bot import run_bot, run_speed_bot

ctk.set_appearance_mode("Dark")  # Modes: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue" (standard), "green", "dark-blue"

class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Window Setup
        self.title("Form Bot Control Panel")
        self.geometry("600x550")

        # Layout
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(6, weight=1) # Log area expands

        # 1. Header
        self.logo_label = ctk.CTkLabel(self, text="Form Bot", font=ctk.CTkFont(size=24, weight="bold"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))

        # 2. Input Frame
        self.input_frame = ctk.CTkFrame(self)
        self.input_frame.grid(row=1, column=0, padx=20, pady=10, sticky="ew")
        self.input_frame.grid_columnconfigure(1, weight=1)

        # URL Input
        self.url_label = ctk.CTkLabel(self.input_frame, text="Form URL:")
        self.url_label.grid(row=0, column=0, padx=10, pady=10, sticky="w")
        
        self.url_entry = ctk.CTkEntry(self.input_frame, placeholder_text="https://forms.office.com/...")
        self.url_entry.grid(row=0, column=1, padx=10, pady=10, sticky="ew")
        # Default value for convenience
        self.url_entry.insert(0, "https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAMAAMtT-PVUMDcwVU1DWU8xOVZINzFTQURaSldXWTVYUy4u")

        # Count Input
        self.count_label = ctk.CTkLabel(self.input_frame, text="Response Count:")
        self.count_label.grid(row=1, column=0, padx=10, pady=10, sticky="w")
        
        self.count_entry = ctk.CTkEntry(self.input_frame, placeholder_text="1")
        self.count_entry.grid(row=1, column=1, padx=10, pady=10, sticky="ew")
        self.count_entry.insert(0, "1")

        # Preset Buttons
        self.preset_frame = ctk.CTkFrame(self)
        self.preset_frame.grid(row=2, column=0, padx=20, pady=5, sticky="ew")
        
        self.ms_btn = ctk.CTkButton(self.preset_frame, text="MS Form (Default)", command=lambda: self.load_url("ms"), width=150)
        self.ms_btn.grid(row=0, column=0, padx=5, pady=5)
        
        self.github_btn = ctk.CTkButton(self.preset_frame, text="GitHub Form", command=lambda: self.load_url("github"), width=150)
        self.github_btn.grid(row=0, column=1, padx=5, pady=5)

        # 3. Action Buttons
        self.controls_frame = ctk.CTkFrame(self)
        self.controls_frame.grid(row=3, column=0, padx=20, pady=5, sticky="ew")

        self.speed_var = ctk.BooleanVar(value=False)
        self.speed_checkbox = ctk.CTkCheckBox(self.controls_frame, text="High Speed Mode", variable=self.speed_var)
        self.speed_checkbox.grid(row=0, column=0, padx=10, pady=5, sticky="w")

        self.ai_var = ctk.BooleanVar(value=False)
        self.ai_switch = ctk.CTkSwitch(self.controls_frame, text="Smart Persona Mode", variable=self.ai_var)
        self.ai_switch.grid(row=0, column=1, padx=10, pady=5, sticky="w")

        self.persona_status_label = ctk.CTkLabel(self.controls_frame, text="Status: Standard (Random)", font=ctk.CTkFont(size=12))
        self.persona_status_label.grid(row=1, column=0, columnspan=2, padx=10, pady=0, sticky="w")
        
        self.update_persona_status()

        # 3b. Persona Card (New)
        self.persona_card = ctk.CTkFrame(self, fg_color="transparent")
        self.persona_card.grid(row=4, column=0, padx=20, pady=5, sticky="ew")
        self.persona_card.grid_columnconfigure(0, weight=1)
        
        self.persona_display = ctk.CTkLabel(self.persona_card, text="Waiting for Persona...", font=ctk.CTkFont(size=11, slant="italic"), text_color="gray")
        self.persona_display.grid(row=0, column=0, padx=10, pady=5)

        # 4. Progress Bar (New)
        self.progress_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.progress_frame.grid(row=5, column=0, padx=20, pady=5, sticky="ew")
        
        self.progress_bar = ctk.CTkProgressBar(self.progress_frame, width=500)
        self.progress_bar.set(0)
        self.progress_bar.grid(row=0, column=0, padx=10, pady=5, sticky="ew")
        self.progress_label = ctk.CTkLabel(self.progress_frame, text="Progress: 0%", font=ctk.CTkFont(size=10))
        self.progress_label.grid(row=1, column=0, pady=0)

        self.start_button = ctk.CTkButton(self, text="Start Bot", command=self.start_bot_thread, font=ctk.CTkFont(weight="bold"))
        self.start_button.grid(row=6, column=0, padx=20, pady=10)

        # 5. Log Area
        self.log_textbox = ctk.CTkTextbox(self, width=500, height=150)
        self.log_textbox.grid(row=7, column=0, padx=20, pady=(10, 20), sticky="nsew")
        self.log("Ready to start.")

    def load_url(self, type):
        """Loads a preset URL."""
        self.url_entry.delete(0, "end")
        if type == "ms":
            self.url_entry.insert(0, "https://forms.office.com/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAMAAMtT-PVUMDcwVU1DWU8xOVZINzFTQURaSldXWTVYUy4u")
        elif type == "github":
            self.url_entry.insert(0, "https://divyansh1920.github.io/MRAQuestionnaire/")
        self.log(f"Loaded {type} form URL.")

    def log(self, message):
        """Append message to log textbox safely."""
        self.log_textbox.insert("end", message + "\n")
        self.log_textbox.see("end")

    def start_bot_thread(self):
        """Starts the bot in a separate thread to keep UI responsive."""
        url = self.url_entry.get()
        try:
            count = int(self.count_entry.get())
        except ValueError:
            self.log("Error: Invalid Response Count (must be integer).")
            return

        if not url:
            self.log("Error: Please enter a URL.")
            return

        self.start_button.configure(state="disabled", text="Running...")
        self.progress_bar.set(0)
        self.progress_label.configure(text="Progress: 0%")
        
        # Define thread function
        def thread_target():
            try:
                # Progress callback
                def update_progress(current, total):
                    perc = int((current / total) * 100)
                    self.after(0, lambda: self.progress_bar.set(current / total))
                    self.after(0, lambda: self.progress_label.configure(text=f"Progress: {perc}%"))

                # Persona callback
                def update_persona(details):
                    self.after(0, lambda: self.persona_display.configure(text=details, text_color="#4da6ff"))

                if self.speed_var.get():
                    run_speed_bot(url, count, use_ai=self.ai_var.get(), log_callback=self.log_safe, progress_callback=update_progress, persona_callback=update_persona)
                else:
                    run_bot(url, count, use_ai=self.ai_var.get(), log_callback=self.log_safe, progress_callback=update_progress, persona_callback=update_persona)
            except Exception as e:
                self.log_safe(f"Critical Error: {e}")
            finally:
                self.reset_ui()

        threading.Thread(target=thread_target, daemon=True).start()

    def log_safe(self, message):
        """Thread-safe logging helper."""
        self.after(0, lambda: self.log(message))

    def reset_ui(self):
        """Re-enable button after run."""
        self.after(0, lambda: self.start_button.configure(state="normal", text="Start Bot"))
        self.after(0, lambda: self.log("Batch completed."))

    def update_persona_status(self):
        """Updates the status label based on AI mode."""
        if self.ai_var.get():
            self.persona_status_label.configure(text="Status: Smart Persona (Active)", text_color="green")
        else:
            self.persona_status_label.configure(text="Status: Standard (Random)", text_color="white")
        
        # Check again in 1 second for switch state
        self.after(1000, self.update_persona_status)

if __name__ == "__main__":
    app = App()
    app.mainloop()
