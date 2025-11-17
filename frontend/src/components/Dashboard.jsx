import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import ResultsChart from './ResultsChart';
import ResultsList from './ResultsList';
import './Dashboard.css';

const Dashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalExecutions: 0,
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    successRate: 0,
    uniqueProjects: 0
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.fetchResults();
      const data = response.data || [];
      setResults(data);
      setLastUpdate(new Date());
      calculateStats(data);
      
      // Fetch detected projects
      const projectsResponse = await apiService.fetchProjects();
      setProjects(projectsResponse.data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Check if backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalExecutions = data.length;
    const totalTests = data.reduce((sum, r) => sum + r.total, 0);
    const totalPassed = data.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = data.reduce((sum, r) => sum + r.failed, 0);
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
    const uniqueProjects = new Set(data.map(r => r.suite_name)).size;

    setStats({
      totalExecutions,
      totalTests,
      totalPassed,
      totalFailed,
      successRate,
      uniqueProjects
    });
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && results.length === 0) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading test results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>QADash</h1>
            <p className="subtitle">Test Automation Dashboard</p>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={fetchResults} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              {loading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        {lastUpdate && (
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </header>

      {error && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon executions">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalExecutions}</div>
            <div className="stat-label">Test Executions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon projects">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-13zM1 1.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-13z"/>
              <path d="M6.5 3.5A1.5 1.5 0 0 1 8 2h5.5a.5.5 0 0 1 0 1H8a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3zM8 8h5.5a.5.5 0 0 1 0 1H8a.5.5 0 0 1 0-1zm0 3h5.5a.5.5 0 0 1 0 1H8a.5.5 0 0 1 0-1z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.uniqueProjects}</div>
            <div className="stat-label">Unique Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon tests">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalTests}</div>
            <div className="stat-label">Total Tests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {projects.length > 0 && (
          <div className="detected-projects">
            <h2>Detected Projects in Workspace ({projects.length})</h2>
            <div className="projects-grid">
              {projects.map((project, index) => (
                <div key={index} className="project-card">
                  <div className="project-header">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-13z"/>
                    </svg>
                    <h3>{project.name}</h3>
                  </div>
                  <div className="project-details">
                    <div className="project-detail">
                      <span className="label">Type:</span>
                      <span className="value">{project.type}</span>
                    </div>
                    <div className="project-detail">
                      <span className="label">Frameworks:</span>
                      <span className="value">{project.frameworks || 'none'}</span>
                    </div>
                    <div className="project-detail">
                      <span className="label">Suggested Suite:</span>
                      <span className="value suggested">{project.suggestedSuiteName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <ResultsChart results={results} />
        <ResultsList results={results} />
      </div>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <strong>QADash</strong> - Multi-Project Test Automation Dashboard
          </div>
          <div className="footer-right">
            {stats.totalPassed} passed · {stats.totalFailed} failed · {stats.totalExecutions} executions
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
