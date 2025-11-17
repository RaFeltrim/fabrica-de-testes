@echo off
REM QADash - Send Test Results (Windows Batch Version)
REM 
REM Usage: send_results.bat "Project Name" total passed failed
REM Example: send_results.bat "MyProject - Tests" 50 48 2

setlocal

if "%~4"=="" (
    echo ============================================================
    echo   QADash - Send Test Results
    echo ============================================================
    echo.
    echo Usage:
    echo   send_results.bat "Suite Name" total passed failed
    echo.
    echo Examples:
    echo   send_results.bat "spring-rest-api - Unit Tests" 15 15 0
    echo   send_results.bat "sigeco-condo - E2E Tests" 50 48 2
    echo   send_results.bat "MyProject - Tests" 100 95 5
    echo.
    echo ============================================================
    exit /b 1
)

set "SUITE_NAME=%~1"
set "TOTAL=%~2"
set "PASSED=%~3"
set "FAILED=%~4"

echo ============================================================
echo   QADash - Sending Test Results
echo ============================================================
echo.
echo Suite:  %SUITE_NAME%
echo Total:  %TOTAL%
echo Passed: %PASSED%
echo Failed: %FAILED%
echo.
echo Sending to http://localhost:3001/api/v1/results
echo.

curl -X POST http://localhost:3001/api/v1/results ^
  -H "Content-Type: application/json" ^
  -d "{\"suite_name\":\"%SUITE_NAME%\",\"total\":%TOTAL%,\"passed\":%PASSED%,\"failed\":%FAILED%}" ^
  -w "\n\nHTTP Status: %%{http_code}\n"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   SUCCESS! Results sent to QADash
    echo   View dashboard: http://localhost:5173
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo   ERROR! Failed to send results
    echo   Make sure QADash backend is running:
    echo   cd backend ^&^& npm run dev
    echo ============================================================
)

echo.
pause
