"""
QADash - Universal Test Results Sender

This script can be used with ANY testing framework to send results to QADash.

Usage:
    python send_results.py "Project Name" <total> <passed> <failed>

Examples:
    python send_results.py "spring-rest-api - Unit Tests" 15 15 0
    python send_results.py "sigeco-condo - E2E Tests" 50 48 2
    python send_results.py "aiometadata - Integration" 30 28 2
"""

import sys
import requests
import json
from datetime import datetime

QADASH_API_URL = "http://localhost:3001/api/v1/results"

def send_results(suite_name, total, passed, failed):
    """
    Send test results to QADash API
    
    Args:
        suite_name (str): Name of the test suite/project
        total (int): Total number of tests
        passed (int): Number of passed tests
        failed (int): Number of failed tests
    """
    
    # Validate inputs
    try:
        total = int(total)
        passed = int(passed)
        failed = int(failed)
    except ValueError:
        print("❌ Error: total, passed, and failed must be numbers")
        return False
    
    if total != passed + failed:
        print(f"⚠️  Warning: total ({total}) != passed ({passed}) + failed ({failed})")
        print(f"   Adjusting total to {passed + failed}")
        total = passed + failed
    
    # Prepare data
    data = {
        "suite_name": suite_name,
        "total": total,
        "passed": passed,
        "failed": failed
    }
    
    # Send to API
    try:
        print(f"📤 Sending results to QADash...")
        print(f"   Suite: {suite_name}")
        print(f"   Total: {total} | Passed: {passed} | Failed: {failed}")
        
        response = requests.post(
            QADASH_API_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps(data),
            timeout=5
        )
        
        if response.status_code == 201:
            print(f"✅ Success! Results saved to QADash")
            print(f"   View dashboard: http://localhost:5173")
            return True
        else:
            print(f"❌ Error: API returned status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Error: Cannot connect to QADash API at {QADASH_API_URL}")
        print(f"   Make sure the backend is running:")
        print(f"   cd backend && npm run dev")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Main entry point"""
    
    print("=" * 60)
    print("  QADash - Universal Test Results Sender")
    print("=" * 60)
    print()
    
    # Check arguments
    if len(sys.argv) != 5:
        print("Usage:")
        print('  python send_results.py "Suite Name" <total> <passed> <failed>')
        print()
        print("Examples:")
        print('  python send_results.py "spring-rest-api - Unit" 15 15 0')
        print('  python send_results.py "sigeco-condo - E2E" 50 48 2')
        print('  python send_results.py "MyProject - Tests" 100 95 5')
        print()
        sys.exit(1)
    
    suite_name = sys.argv[1]
    total = sys.argv[2]
    passed = sys.argv[3]
    failed = sys.argv[4]
    
    # Send results
    success = send_results(suite_name, total, passed, failed)
    
    print()
    print("=" * 60)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
