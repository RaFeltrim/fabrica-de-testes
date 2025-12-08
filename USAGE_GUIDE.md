# Quick Start Guide - Using QADash with ANY Project

## Goal
QADash is your centralized dashboard for test results from **any testing framework**.

## Setup (One-Time)

### 1. Start QADash Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev
```

Dashboard will be at: **http://localhost:5173**

---

## Usage Scenarios

### Scenario 1: Robot Framework Project
```bash
# In your Robot project directory
robot --outputdir ./results my_tests.robot

# Copy post_results.py from QADash/automation-scripts/
cp path/to/qadash/automation-scripts/post_results.py .

# Send results
python post_results.py
```

### Scenario 2: Jest/Vitest Project
Use the generic sender:
```bash
# After running tests, get your results (e.g., 50 total, 48 passed, 2 failed)
python path/to/send_to_qadash.py "My App Tests" 50 48 2
```

Or copy `examples/jest-qadash-reporter.js` to your project.

### Scenario 3: Cypress Project
```bash
# After Cypress run, extract results and send:
python path/to/send_to_qadash.py "Cypress E2E - Cliente X" 30 28 2
```

### Scenario 4: Postman/Newman
```bash
# Run Newman with JSON reporter
newman run collection.json --reporters json

# Parse JSON and send to QADash
python path/to/send_to_qadash.py "API Tests" 100 95 5
```

### Scenario 5: Any Framework (Manual)
Just send a POST request:
```bash
curl -X POST http://localhost:3001/api/v1/results \
  -H "Content-Type: application/json" \
  -d '{
    "suite_name": "My Custom Tests",
    "total": 15,
    "passed": 13,
    "failed": 2
  }'
```

---

## Integration Tips

### For Multiple Clients (Workana)
Use descriptive suite names:
- "Cliente A - Login Tests"
- "Cliente B - API Tests"  
- "Cliente C - E2E Flow"

### For CI/CD Pipelines
Add the curl command to your pipeline:
```yaml
# GitHub Actions example
- name: Send results to QADash
  run: |
    curl -X POST http://your-qadash-server/api/v1/results \
      -H "Content-Type: application/json" \
      -d '{"suite_name":"${{ github.repository }}","total":$TOTAL,"passed":$PASSED,"failed":$FAILED}'
```

---

## File Locations

**Copy these to your test projects:**

1. `send_to_qadash.py` - Generic sender (works with any framework)
2. `post_results.py` - Robot Framework specific
3. `examples/jest-qadash-reporter.js` - Jest integration
4. `examples/pytest_qadash_hook.py` - Pytest integration

---

## Troubleshooting

**Problem:** "Cannot connect to QADash API"  
**Solution:** Make sure backend is running on http://localhost:3001

**Problem:** "Dashboard shows no data"  
**Solution:** Check if results were posted successfully (status 201)

**Problem:** "Want to clear old data"  
**Solution:** Delete `backend/database/qadash.db` and run `npm run migrate`

---

## Next Steps

1. Integrate with your current test projects
2. Customize suite names for different clients
3. Add to your CI/CD pipeline
4. Show the dashboard to clients for status reports
