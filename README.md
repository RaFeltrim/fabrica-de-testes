# QADash - Professional Test Automation Dashboard

## About the Project

QADash is a **professional-grade SaaS dashboard** designed for QA engineers and freelancers to manage multiple projects and centralize test automation results from ANY testing framework (Robot Framework, Cypress, Playwright, Jest, Vitest, etc.).

**Main Function**: Centralize and visualize automated test results from ALL your projects in a single, professional dashboard.

### Recent Improvements (November 2025)

**Complete UI Redesign**
- Modern, professional interface (no more "AI-generated" look)
- Clean design with gradient accents
- SVG icons instead of emojis
- Fully responsive layout

**Enhanced Data Visualization**
- 4 key metric cards with real-time stats
- Dual chart system (Doughnut + Bar chart)
- Project-wise comparison view
- Color-coded progress bars
- Historical trend analysis with time-series charts

**Advanced Features**
- Advanced filtering with persistence (date range, project, framework, status)
- Sort by date, project, or success rate
- Visual status badges
- Smart empty states
- Real-time WebSocket updates
- Export to CSV and PDF with professional templates

**Real-Time Updates**
- WebSocket integration for instant dashboard updates
- Connection status indicator with pulse animation
- Toast notifications for new test results
- Automatic refresh every 30 seconds as fallback

**Export & Reporting**
- CSV export with detailed test data
- PDF reports with executive summary and charts
- Scheduled exports (daily/weekly/monthly)
- Automatic cleanup of old exports

**CI/CD Integration**
- GitHub Actions webhook support
- Jenkins integration
- GitLab CI webhook endpoint
- Generic webhook for custom CI/CD platforms
- Signature verification for security

### MVP - Module 4: Automation Dashboard

This MVP focuses on the core "killer feature": receiving automated test results and displaying them in a real-time professional dashboard.

## Key Features

### Dashboard & Visualization
- **Real-time Metrics**: 4 key metric cards (executions, projects, total tests, success rate)
- **Multiple Chart Types**: Doughnut chart, bar chart, and historical trend line charts
- **Advanced Filtering**: Filter by date range, project, framework, and status
- **Filter Persistence**: Filters saved in localStorage for better UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### Historical Analysis
- **Trend Visualization**: View test results trends over time
- **Flexible Grouping**: Group data by hour, day, week, or month
- **Customizable Time Ranges**: View trends for 7, 14, 30, 60, or 90 days
- **Project Comparison**: Compare performance across different projects
- **Dual-axis Charts**: See pass rates and test counts simultaneously

### Real-Time Features
- **WebSocket Integration**: Instant dashboard updates when new results arrive
- **Connection Status**: Visual indicator showing real-time connection status
- **Toast Notifications**: Alerts for new test results
- **Auto-refresh**: Fallback polling every 30 seconds
- **Live Updates**: See changes as they happen without manual refresh

### Export & Reporting
- **Multiple Formats**: Export as CSV or PDF
- **Professional PDF Reports**: Executive summary with charts and statistics
- **Scheduled Exports**: Set up daily, weekly, or monthly automated reports
- **Custom Schedules**: Use cron expressions for flexible scheduling
- **Auto-cleanup**: Automatically remove old export files

### CI/CD Integration
- **GitHub Actions**: Direct webhook integration
- **Jenkins Support**: Build notification webhooks
- **GitLab CI**: Pipeline event webhooks
- **Generic Webhook**: Support for any custom CI/CD platform
- **Security**: HMAC signature verification for GitHub, token auth for others
- **Automatic Ingestion**: Test results automatically added to dashboard

### Failure Analysis
- **Top Failures**: Visualize most common failure types
- **Error Clustering**: Group similar errors together
- **Trend Analysis**: See how failure rates change over time
- **Detailed Reports**: Export failure analysis to PDF

## Architecture

```
qadash-mvp/
├── backend/              # REST API with Node.js + Express
│   ├── src/
│   │   ├── controllers/  # Control logic (resultsController.js)
│   │   ├── routes/       # API routes (api.js)
│   │   ├── services/     # DB services (dbService.js)
│   │   ├── app.js        # Express configuration
│   │   └── server.js     # HTTP server
│   └── database/         # SQLite DB and migrations
├── frontend/             # React Dashboard + Vite
│   └── src/
│       ├── components/   # Dashboard, ResultsChart, ResultsList
│       ├── services/     # apiService.js
│       └── App.jsx
└── automation-scripts/   # Robot Framework scripts (EXAMPLE)
    ├── tests/            # Your Robot tests (saucedemo.robot)
    ├── post_results.py   # Script to send results to QADash
    └── run_tests.bat     # Execution script
```

## Technology Stack

- **Backend**: Node.js, Express, SQLite, Knex.js, Socket.IO, PDFKit, Node-Cron
- **Frontend**: React, Vite, Chart.js, Axios, Socket.IO Client
- **Automação**: Robot Framework, Python
- **Database**: SQLite
- **Real-time**: WebSocket (Socket.IO)
- **Security**: HMAC signature verification, token authentication

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the `backend` directory for optional security features:

```env
# Server Configuration
PORT=3001

# Webhook Security (Optional but recommended)
GITHUB_WEBHOOK_SECRET=your_github_secret
JENKINS_WEBHOOK_TOKEN=your_jenkins_token
GITLAB_WEBHOOK_TOKEN=your_gitlab_token
```

**Note**: These are optional. The system works without them, but they add security to webhook endpoints.

### Webhook Configuration

To set up webhooks in your CI/CD platform:

1. **GitHub Actions**: Settings → Webhooks → Add webhook
   - Payload URL: `http://your-server:3001/api/v1/webhooks/github`
   - Content type: `application/json`
   - Secret: (your GITHUB_WEBHOOK_SECRET)
   - Events: Select "Workflow runs"

2. **Jenkins**: Configure build trigger
   - Use "Trigger builds remotely"
   - Add build step to POST to: `http://your-server:3001/api/v1/webhooks/jenkins`
   - Include header: `Authorization: Bearer YOUR_TOKEN`

3. **GitLab CI**: Settings → Webhooks
   - URL: `http://your-server:3001/api/v1/webhooks/gitlab`
   - Secret Token: (your GITLAB_WEBHOOK_TOKEN)
   - Trigger: Pipeline events

## Quick Start

### Easy Way (Recommended)
Double-click `start-qadash.bat` in the project root - it will:
1. Install dependencies if needed
2. Create database if needed
3. Start both backend and frontend
4. Open the dashboard in your browser

### Manual Way

#### Prerequisites
- Node.js 18+
- Python 3.8+ (optional, for Robot Framework integration)

#### Backend Setup
```bash
cd backend
npm install
npm run migrate
npm run dev
```
The backend will be running at: **http://localhost:3001**

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at: **http://localhost:5173**

### Automation Setup (Example)
```bash
cd automation-scripts
pip install -r requirements.txt
```

## Usage Guide - Integrating with Your Project

### Option 1: Robot Framework

1. **Run your Robot Framework tests** (in any project):
```bash
robot --outputdir ./results my_tests.robot
```

2. **Copy the `post_results.py` script** to your results directory

3. **Run the script** to send to QADash:
```bash
python post_results.py
```

### Option 2: Any Framework (via API)

Send a POST request to the QADash API:

```bash
curl -X POST http://localhost:3001/api/v1/results \
  -H "Content-Type: application/json" \
  -d '{
    "suite_name": "My API Tests",
    "total": 25,
    "passed": 23,
    "failed": 2
  }'
```

### Option 3: Jest/Cypress/etc Integration

Create a custom script that parses your results and sends to:
- **Endpoint**: `POST http://localhost:3001/api/v1/results`
- **Body**: `{ suite_name, total, passed, failed }`

## API Endpoints

### Test Results

#### POST /api/v1/results
Receives test results

**Request Body**:
```json
{
  "suite_name": "Login Tests",
  "total": 10,
  "passed": 8,
  "failed": 2,
  "framework": "Playwright",
  "test_type": "E2E",
  "project_category": "Frontend"
}
```

**Response** (201 Created):
```json
{
  "message": "Test result saved successfully",
  "data": {
    "id": 1,
    "suite_name": "Login Tests",
    "total": 10,
    "passed": 8,
    "failed": 2
  }
}
```

#### GET /api/v1/results
Returns all saved results

**Query Parameters**:
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)

**Response** (200 OK):
```json
{
  "message": "Results retrieved successfully",
  "count": 2,
  "data": [
    {
      "id": 2,
      "suite_name": "API Tests",
      "framework": "Jest",
      "total": 15,
      "passed": 15,
      "failed": 0,
      "created_at": "2025-11-17 12:30:00"
    }
  ]
}
```

### Trend Analysis

#### GET /api/v1/trends
Get aggregated trend data over time

**Query Parameters**:
- `grouping`: Time grouping (hour/day/week/month) - default: day
- `days`: Number of days to look back (1-365) - default: 30

**Response**:
```json
{
  "message": "Trend data retrieved successfully",
  "grouping": "day",
  "days": 30,
  "data": [
    {
      "date_group": "2025-11-18",
      "execution_count": 5,
      "total_tests": 150,
      "total_passed": 145,
      "total_failed": 5,
      "avg_pass_rate": 96.67
    }
  ]
}
```

#### GET /api/v1/trends/projects
Get project-specific trend data

**Query Parameters**:
- `project`: Project name (optional, default: all)
- `days`: Number of days (1-365) - default: 30

### Export

#### GET /api/v1/export/csv
Export test results as CSV file

**Query Parameters**:
- `startDate`: Optional start date filter
- `endDate`: Optional end date filter

#### GET /api/v1/export/pdf
Export test results as PDF report with charts and statistics

**Query Parameters**:
- `startDate`: Optional start date filter
- `endDate`: Optional end date filter

### Scheduled Exports

#### GET /api/v1/schedules
List all scheduled export jobs

#### POST /api/v1/schedules
Create a new scheduled export job

**Request Body**:
```json
{
  "id": "daily-report",
  "schedule": "0 0 * * *",
  "format": "csv",
  "filename": "daily-report",
  "enabled": true
}
```

**Cron Schedule Examples**:
- `0 0 * * *` - Daily at midnight
- `0 1 * * 0` - Weekly on Sunday at 1 AM
- `0 9 * * 1-5` - Weekdays at 9 AM

#### DELETE /api/v1/schedules/:id
Stop and remove a scheduled export job

### CI/CD Webhooks

#### GET /api/v1/webhooks
Get webhook configuration documentation

#### POST /api/v1/webhooks/github
Receive GitHub Actions workflow events

**Headers**:
- `X-GitHub-Event`: workflow_run
- `X-Hub-Signature-256`: HMAC signature (if secret configured)

**Environment Variable**: `GITHUB_WEBHOOK_SECRET`

#### POST /api/v1/webhooks/jenkins
Receive Jenkins build notifications

**Headers**:
- `Authorization`: Bearer YOUR_TOKEN

**Environment Variable**: `JENKINS_WEBHOOK_TOKEN`

#### POST /api/v1/webhooks/gitlab
Receive GitLab CI pipeline events

**Headers**:
- `X-Gitlab-Token`: YOUR_TOKEN

**Environment Variable**: `GITLAB_WEBHOOK_TOKEN`

#### POST /api/v1/webhooks/generic
Generic webhook endpoint for custom integrations

**Request Body**:
```json
{
  "suite_name": "My Test Suite",
  "framework": "Custom",
  "test_type": "Integration",
  "total": 100,
  "passed": 95,
  "failed": 5
}
```

## Testing the System (End-to-End)

### Quick Test - Manual Submission
```bash
# Terminal 1: Backend running
cd backend && npm run dev

# Terminal 2: Frontend running  
cd frontend && npm run dev

# Terminal 3: Send test result
curl -X POST http://localhost:3001/api/v1/results \
  -H "Content-Type: application/json" \
  -d '{"suite_name":"Manual Test","total":5,"passed":4,"failed":1}'
```

### Test with Robot Framework (Example Included)
```bash
cd automation-scripts
run_tests.bat
```

This will:
1. Execute the tests from `saucedemo.robot`
2. Parse the `output.xml`
3. Send results to QADash
4. Update the dashboard automatically

## Advanced Usage Examples

### Setting Up Scheduled Reports

Create a daily CSV export at midnight:
```bash
curl -X POST http://localhost:3001/api/v1/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "daily-report",
    "schedule": "0 0 * * *",
    "format": "csv",
    "filename": "daily-qa-report",
    "enabled": true
  }'
```

### Viewing Trend Data

Get last 30 days of trends grouped by day:
```bash
curl "http://localhost:3001/api/v1/trends?grouping=day&days=30"
```

Get weekly trends:
```bash
curl "http://localhost:3001/api/v1/trends?grouping=week&days=90"
```

### Exporting Reports

Download CSV report:
```bash
curl "http://localhost:3001/api/v1/export/csv" -o report.csv
```

Download PDF report with date range:
```bash
curl "http://localhost:3001/api/v1/export/pdf?startDate=2025-11-01&endDate=2025-11-18" -o report.pdf
```

### CI/CD Integration Examples

#### GitHub Actions Workflow
```yaml
name: Run Tests and Report to QADash

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Tests
        run: npm test
        
      - name: Send Results to QADash
        if: always()
        run: |
          curl -X POST http://your-qadash-server:3001/api/v1/webhooks/generic \
            -H "Content-Type: application/json" \
            -d "{
              \"suite_name\": \"${{ github.repository }} - ${{ github.workflow }}\",
              \"framework\": \"GitHub Actions\",
              \"test_type\": \"CI/CD\",
              \"total\": 100,
              \"passed\": 95,
              \"failed\": 5
            }"
```

#### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Report to QADash') {
            steps {
                script {
                    sh """
                        curl -X POST http://your-qadash-server:3001/api/v1/webhooks/jenkins \
                        -H "Content-Type: application/json" \
                        -H "Authorization: Bearer ${JENKINS_WEBHOOK_TOKEN}" \
                        -d '{"name": "${JOB_NAME}", "build": {"number": "${BUILD_NUMBER}", "result": "${currentBuild.result}"}}'
                    """
                }
            }
        }
    }
}
```

#### GitLab CI
Add to `.gitlab-ci.yml`:
```yaml
test:
  script:
    - npm test
  after_script:
    - |
      curl -X POST http://your-qadash-server:3001/api/v1/webhooks/generic \
        -H "Content-Type: application/json" \
        -d "{
          \"suite_name\": \"$CI_PROJECT_NAME - $CI_PIPELINE_ID\",
          \"framework\": \"GitLab CI\",
          \"test_type\": \"CI/CD\",
          \"total\": 100,
          \"passed\": 95,
          \"failed\": 5
        }"
```

## Dashboard Features

### Modern Professional Design
- **4 Key Metric Cards**:
  - Test Executions (total runs)
  - Unique Projects (number of different projects)
  - Total Tests (cumulative count)
  - Success Rate (overall pass percentage)

### Advanced Data Visualization
- **Historical Trends**: Line chart showing test results over time
  - Configurable grouping (hour/day/week/month)
  - Selectable time ranges (7-90 days)
  - Dual-axis chart (pass rate % + test counts)
  - Summary statistics below chart
- **Doughnut Chart**: Overall pass/fail ratio with center percentage
- **Bar Chart**: Project-wise comparison (top 5 projects)
- **Failure Analysis**: Top 5 recurring failures with bar chart
- **Interactive Tooltips**: Detailed information on hover

### Smart Filtering System
- **Date Range Filters**: 
  - Quick filters (All time, Today, Last 7 days, Last 30 days)
  - Custom date range picker
- **Project Filter**: Filter by specific test suite
- **Framework Filter**: Filter by testing framework
- **Status Filter**: Show all, passed only, or failed only
- **Filter Persistence**: Filters saved in localStorage
- **Results Counter**: Shows filtered vs total results

### Smart Results Table
- **Sorting**: By date, project name, or success rate
- **Visual Indicators**:
  - Green/red left borders for quick status recognition
  - Progress bars with color gradients
  - Status badges with checkmark/x icons
  - Framework badges with color coding
  - Category tags for project classification

### Real-time Updates
- **WebSocket Connection**: Live updates without refresh
- **Connection Status**: Visual pulse indicator showing connection state
- **Toast Notifications**: Alerts when new test results arrive
- **Auto-refresh**: Fallback polling every 30 seconds
- **Manual refresh**: Button in header
- **Last update timestamp**: Always visible

### Export Capabilities
- **CSV Export**: Download data as spreadsheet
- **PDF Reports**: Professional reports with charts and statistics
- **Scheduled Exports**: Automated daily/weekly/monthly reports
- **Auto-cleanup**: Old exports automatically removed

### Responsive Design
- Desktop optimized (full feature set)
- Tablet friendly (adapted layouts)
- Mobile compatible (touch-optimized)
- **Professional Visual Design**: Color-coded indicators (green=passed, red=failed)
- **Cross-browser**: Works on Chrome, Firefox, Safari, Edge

## Use Cases

### For QA Freelancers on Workana:
1. **Multiple Clients**: Each test suite can represent a different client
2. **Professional Reports**: Show the dashboard to clients
3. **Historical Data**: Track quality evolution over time
4. **Productivity**: Centralize results from Robot, Cypress, Jest, etc.

### For Portfolio Projects:
- Demonstrates Full-Stack knowledge
- Shows test automation expertise
- Proves system integration capability
- Evidences product vision (SaaS)

## Developed by Rafael Feltrim

**Contact**: rafeltrim@gmail.com

This project demonstrates competencies in:
- Full-Stack Software Engineering (React + Node.js)
- Manual QA and Automation (Robot Framework)
- Test Tool Integration
- REST API and Data Visualization
- Database Management (SQLite + Knex.js)
- DevOps and CI/CD readiness
