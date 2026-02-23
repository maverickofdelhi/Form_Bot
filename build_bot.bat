@echo off
echo Building Form Bot...
pyinstaller --noconsole --onefile --name "FormBot" --collect-all customtkinter gui_app.py
echo Build Complete. find FormBot.exe in the dist folder.
pause
