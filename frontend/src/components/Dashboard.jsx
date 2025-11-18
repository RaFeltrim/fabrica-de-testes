import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import socketService from '../services/socketService';
import ResultsChart from './ResultsChart';
import ResultsList from './ResultsList';
import PipelineControls from './PipelineControls';
import FailureAnalysis from './FailureAnalysis';
import LoadingSkeleton from './LoadingSkeleton';
import ToastNotification from './ToastNotification';
import ExportButton from './ExportButton';
import TrendChart from './TrendChart';
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

  // Load filters from localStorage or use defaults
  const loadFilters = () => {
    const saved = localStorage.getItem('qadash-filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
    return {
      dateRange: 'all', // 'all', 'today', 'week', 'month'
      status: 'all', // 'all', 'passed', 'failed'
      project: 'all',
      framework: 'all',
      startDate: '',
      endDate: ''
    };
  };

  const [filters, setFilters] = useState(loadFilters());
  const [wsStatus, setWsStatus] = useState({ connected: false, message: '' });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qadash-filters', JSON.stringify(filters));
  }, [filters]);

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

  // Filter results based on current filter settings
  const getFilteredResults = () => {
    let filtered = [...results];

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(r => new Date(r.created_at) >= startDate);
      }
    }

    // Filter by custom date range
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      
      filtered = filtered.filter(r => {
        const date = new Date(r.created_at);
        return date >= start && date <= end;
      });
    }

    // Filter by status
    if (filters.status === 'passed') {
      filtered = filtered.filter(r => r.failed === 0);
    } else if (filters.status === 'failed') {
      filtered = filtered.filter(r => r.failed > 0);
    }

    // Filter by project
    if (filters.project !== 'all') {
      filtered = filtered.filter(r => r.suite_name === filters.project);
    }

    // Filter by framework
    if (filters.framework !== 'all') {
      filtered = filtered.filter(r => r.framework === filters.framework);
    }

    return filtered;
  };

  const filteredResults = getFilteredResults();

  // Get unique projects and frameworks for filter dropdowns
  const uniqueProjects = [...new Set(results.map(r => r.suite_name))].sort();
  const uniqueFrameworks = [...new Set(results.map(r => r.framework).filter(Boolean))].sort();

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: 'all',
      status: 'all',
      project: 'all',
      framework: 'all',
      startDate: '',
      endDate: ''
    };
    setFilters(defaultFilters);
    localStorage.setItem('qadash-filters', JSON.stringify(defaultFilters));
  };

  useEffect(() => {
    fetchResults();
    
    // Connect to WebSocket
    socketService.connect();

    // Listen for connection status changes
    const unsubscribeStatus = socketService.on('connection-status', (data) => {
      setWsStatus({
        connected: data.status === 'connected',
        message: data.status === 'connected' 
          ? 'Real-time updates active' 
          : 'Disconnected - Using polling'
      });
    });

    // Listen for new test results
    const unsubscribeResults = socketService.on('new-test-result', (data) => {
      console.log('📡 New test result received via WebSocket');
      // Refresh results when new data arrives
      fetchResults();
      
      // Show notification
      setToast({
        message: `New test result: ${data.data.suite_name}`,
        type: 'info',
        duration: 5000
      });
    });

    // Fallback: Refresh data every 30 seconds (in case WebSocket fails)
    const interval = setInterval(fetchResults, 30000);

    // Cleanup
    return () => {
      clearInterval(interval);
      unsubscribeStatus();
      unsubscribeResults();
      socketService.disconnect();
    };
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
          <div className="status-indicators">
            <div className={`websocket-status ${wsStatus.connected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              <span className="status-text">{wsStatus.message || 'Connecting...'}</span>
            </div>
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
        {/* Filter Panel */}
        <div className="filter-panel">
          <div className="filter-header">
            <h3>🔍 Filters</h3>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
          
          <div className="filter-grid">
            {/* Date Range Quick Filter */}
            <div className="filter-group">
              <label>Date Range</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => updateFilter('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Custom Date Range */}
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filters.status} 
                onChange={(e) => updateFilter('status', e.target.value)}
              >
                <option value="all">All Tests</option>
                <option value="passed">Passed Only</option>
                <option value="failed">Failed Only</option>
              </select>
            </div>

            {/* Project Filter */}
            <div className="filter-group">
              <label>Project</label>
              <select 
                value={filters.project} 
                onChange={(e) => updateFilter('project', e.target.value)}
              >
                <option value="all">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Framework Filter */}
            <div className="filter-group">
              <label>Framework</label>
              <select 
                value={filters.framework} 
                onChange={(e) => updateFilter('framework', e.target.value)}
              >
                <option value="all">All Frameworks</option>
                {uniqueFrameworks.map(framework => (
                  <option key={framework} value={framework}>{framework}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-summary">
            Showing {filteredResults.length} of {results.length} results
          </div>
        </div>

        <TrendChart />
        <ResultsChart results={filteredResults} />
        <FailureAnalysis results={filteredResults} />
        <PipelineControls onPipelineRun={setLastPipelineRun} />
        <ResultsList results={filteredResults} />
      </div>

      <footer className="dashboard-footer">
        <p>Total de execuções: {results.length} | Última atualização: {new Date().toLocaleString('pt-BR')}</p>
      </footer>
    </div>
  );
};

export default Dashboard;
