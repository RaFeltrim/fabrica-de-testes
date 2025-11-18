import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import ResultsChart from './ResultsChart';
import ResultsList from './ResultsList';
import PipelineControls from './PipelineControls';
import FailureAnalysis from './FailureAnalysis';
import LoadingSkeleton from './LoadingSkeleton';
import ToastNotification from './ToastNotification';
import ExportButton from './ExportButton';
import './Dashboard.css';

const Dashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastPipelineRun, setLastPipelineRun] = useState({
    timestamp: null,
    status: 'idle' // idle, running, success, failed
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.fetchResults();
      setResults(response.data || []);
      
      // Show success toast when refreshing
      if (results.length > 0) {
        setToast({
          message: 'Dashboard updated successfully!',
          type: 'success',
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Error loading test results. Check if backend is running.');
      setToast({
        message: 'Failed to load test results',
        type: 'error',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && results.length === 0) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-top">
            <div>
              <h1>🎯 QA Environment - Production Monitor</h1>
              <p className="subtitle">Enterprise Test Automation Dashboard</p>
            </div>
            <div className="environment-badge production">Production</div>
          </div>
          <div className="header-controls">
            <button className="refresh-btn" disabled>
              🔄 Refresh Data
            </button>
            <div className="last-update">Loading...</div>
          </div>
        </header>
        <div className="dashboard-content">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
      
      <header className="dashboard-header">
        <div className="header-top">
          <div>
            <h1>🎯 QA Environment - Production Monitor</h1>
            <p className="subtitle">Enterprise Test Automation Dashboard</p>
          </div>
          <div className="environment-badge production">Production</div>
        </div>
        <div className="header-controls">
          <div className="control-group">
            <button className="refresh-btn" onClick={fetchResults} disabled={loading}>
              {loading ? '⏳ Refreshing...' : '🔄 Refresh Data'}
            </button>
            <ExportButton />
          </div>
          <div className="pipeline-status">
            {lastPipelineRun.timestamp && (
              <div className={`pipeline-indicator ${lastPipelineRun.status}`}>
                <span className="status-icon">
                  {lastPipelineRun.status === 'running' && '⏳'}
                  {lastPipelineRun.status === 'success' && '✅'}
                  {lastPipelineRun.status === 'failed' && '❌'}
                  {lastPipelineRun.status === 'idle' && '⏸️'}
                </span>
                <span className="status-text">
                  Last run: {new Date(lastPipelineRun.timestamp).toLocaleString('en-US')}
                </span>
              </div>
            )}
          </div>
          <div className="last-update">Last update: {new Date().toLocaleString('en-US')}</div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="dashboard-content">
        <ResultsChart results={results} />
        <FailureAnalysis results={results} />
        <PipelineControls onPipelineRun={setLastPipelineRun} />
        <ResultsList results={results} />
      </div>

      <footer className="dashboard-footer">
        <p>Total de execuções: {results.length} | Última atualização: {new Date().toLocaleString('pt-BR')}</p>
      </footer>
    </div>
  );
};

export default Dashboard;
