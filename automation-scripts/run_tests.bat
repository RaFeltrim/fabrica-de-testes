@echo off
REM QADash - Automation Test Runner
REM This script runs Robot Framework tests and posts results to QADash API

echo ============================================
echo  QADash - Running Automation Tests
echo ============================================
echo.

REM Run Robot Framework tests
echo [1/2] Executing Robot Framework tests...
robot --outputdir . tests\saucedemo.robot

REM Check if tests executed successfully
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Tests executed successfully!
) else (
    echo.
    echo [WARNING] Some tests failed, but continuing...
)

echo.
echo [2/2] Posting results to QADash API...
python post_results.py

echo.
echo ============================================
echo  Test execution complete!
echo  Open http://localhost:5173 to view results
echo ============================================
pause
