"""
Example: Pytest Hook for QADash
Add this to your conftest.py to send pytest results to QADash
"""
import requests
import pytest

def pytest_sessionfinish(session, exitstatus):
    """Called after whole test run finished, right before returning the exit status"""
    
    # Get test statistics
    passed = len([r for r in session.items if r.rep_call and r.rep_call.passed]) if hasattr(session, 'items') else 0
    failed = len([r for r in session.items if r.rep_call and r.rep_call.failed]) if hasattr(session, 'items') else 0
    
    # Alternative: use session.testscollected and session.testsfailed
    total = session.testscollected
    failed = session.testsfailed
    passed = total - failed
    
    payload = {
        'suite_name': 'Pytest Suite',
        'total': total,
        'passed': passed,
        'failed': failed
    }
    
    try:
        response = requests.post(
            'http://localhost:3001/api/v1/results',
            json=payload,
            timeout=5
        )
        if response.status_code == 201:
            print('\n✅ Results posted to QADash!')
        else:
            print(f'\n❌ Error posting to QADash: {response.status_code}')
    except Exception as e:
        print(f'\n❌ Error posting to QADash: {e}')

# Usage:
# Just add this to your conftest.py file
# Then run: pytest
