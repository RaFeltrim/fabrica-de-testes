#!/usr/bin/env python3
"""
Post Robot Framework test results to QADash API
"""
import os
import sys
import json
import requests
from xml.etree import ElementTree as ET

API_URL = "http://localhost:3001/api/v1/results"
OUTPUT_XML = "output.xml"

def parse_robot_output(xml_file):
    """Parse Robot Framework output.xml file"""
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        # Get suite information
        suite = root.find('suite')
        suite_name = suite.get('name', 'Unknown Suite')
        
        # Get statistics
        stats = root.find('.//statistics/total/stat')
        if stats is not None:
            total = int(stats.get('pass', 0)) + int(stats.get('fail', 0))
            passed = int(stats.get('pass', 0))
            failed = int(stats.get('fail', 0))
        else:
            # Fallback: count test cases
            tests = suite.findall('.//test')
            total = len(tests)
            passed = sum(1 for test in tests if test.find('status').get('status') == 'PASS')
            failed = total - passed
        
        return {
            'suite_name': suite_name,
            'total': total,
            'passed': passed,
            'failed': failed
        }
    except Exception as e:
        print(f"Error parsing {xml_file}: {e}")
        sys.exit(1)

def post_results_to_api(results):
    """Send results to QADash API"""
    try:
        response = requests.post(
            API_URL,
            json=results,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 201:
            print("✅ Results posted successfully to QADash!")
            print(f"📊 Suite: {results['suite_name']}")
            print(f"   Total: {results['total']} | Passed: {results['passed']} | Failed: {results['failed']}")
            return True
        else:
            print(f"❌ Error posting results: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to QADash API. Is the backend running?")
        print(f"   API URL: {API_URL}")
        return False
    except Exception as e:
        print(f"❌ Error posting results: {e}")
        return False

def main():
    """Main function"""
    if not os.path.exists(OUTPUT_XML):
        print(f"❌ Error: {OUTPUT_XML} not found!")
        print("   Run Robot Framework tests first.")
        sys.exit(1)
    
    print("🔍 Parsing Robot Framework results...")
    results = parse_robot_output(OUTPUT_XML)
    
    print("📤 Posting results to QADash API...")
    success = post_results_to_api(results)
    
    if success:
        print("\n✨ Done! Check the dashboard at http://localhost:5173")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
