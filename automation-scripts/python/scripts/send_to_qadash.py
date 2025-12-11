#!/usr/bin/env python3
"""
Generic Test Results Sender for QADash
Use this to send any test results to QADash
"""
import sys
import requests
import argparse

API_URL = "http://localhost:3001/api/v1/results"

def send_results(suite_name, total, passed, failed):
    """Send test results to QADash API"""
    
    payload = {
        'suite_name': suite_name,
        'total': total,
        'passed': passed,
        'failed': failed
    }
    
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 201:
            print(f"✅ Results posted successfully to QADash!")
            print(f"📊 Suite: {suite_name}")
            print(f"   Total: {total} | Passed: {passed} | Failed: {failed}")
            print(f"\n🌐 View dashboard: http://localhost:5173")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to QADash API")
        print(f"   Make sure backend is running: {API_URL}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Send test results to QADash',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Send Jest results
  python send_to_qadash.py "My Jest Tests" 50 48 2
  
  # Send Cypress results  
  python send_to_qadash.py "Cypress E2E" 30 30 0
  
  # Send Postman/Newman results
  python send_to_qadash.py "API Tests" 100 95 5
        """
    )
    
    parser.add_argument('suite_name', help='Name of the test suite')
    parser.add_argument('total', type=int, help='Total number of tests')
    parser.add_argument('passed', type=int, help='Number of passed tests')
    parser.add_argument('failed', type=int, help='Number of failed tests')
    
    args = parser.parse_args()
    
    # Validation
    if args.total != args.passed + args.failed:
        print(f"⚠️  Warning: total ({args.total}) != passed ({args.passed}) + failed ({args.failed})")
        print("   Continuing anyway...")
    
    success = send_results(args.suite_name, args.total, args.passed, args.failed)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
