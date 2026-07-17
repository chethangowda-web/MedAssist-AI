@echo off
cd /d "K:\MedAssist AI\backend"
start /B "" "K:\MedAssist AI\backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8003 > server_out.log 2> server_err.log
echo Server PID: %ERRORLEVEL%
