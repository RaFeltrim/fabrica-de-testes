import React, { useState } from 'react';
import './ResultsList.css';

const ResultsList = ({ results }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  if (!results || results.length === 0) {
    return (
      <div className="results-list">
        <h2>Test Execution History</h2>
        <div className="no-data-container">
          <svg width="64" height="64" viewBox="0 0 16 16" fill="#cbd5e0">
            <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"/>
            <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"/>
          </svg>
          <p>No test results found</p>
          <span>Execute tests to see results here</span>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPassRate = (passed, total) => {
    return total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  };

  const getStatusClass = (passed, total) => {
    const rate = (passed / total) * 100;
    if (rate === 100) return 'status-success';
    if (rate >= 80) return 'status-warning';
    return 'status-danger';
  };

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    if (filter === 'passed') return result.failed === 0;
    if (filter === 'failed') return result.failed > 0;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'project') {
      return a.suite_name.localeCompare(b.suite_name);
    }
    if (sortBy === 'rate') {
      const rateA = getPassRate(a.passed, a.total);
      const rateB = getPassRate(b.passed, b.total);
      return rateB - rateA;
    }
    return 0;
  });

  return (
    <div className="results-list">
      <div className="list-header">
        <h2>Test Execution History</h2>
        <div className="list-controls">
          <div className="filter-group">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Results ({results.length})</option>
              <option value="passed">Passed ({results.filter(r => r.failed === 0).length})</option>
              <option value="failed">Failed ({results.filter(r => r.failed > 0).length})</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="project">Project Name</option>
              <option value="rate">Success Rate</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Project / Suite</th>
              <th className="text-center">Total</th>
              <th className="text-center">Passed</th>
              <th className="text-center">Failed</th>
              <th className="text-center">Success Rate</th>
              <th>Executed At</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result) => {
              const passRate = getPassRate(result.passed, result.total);
              const statusClass = getStatusClass(result.passed, result.total);
              
              return (
                <tr key={result.id} className={result.failed > 0 ? 'has-failures' : 'all-passed'}>
                  <td className="suite-name">
                    <div className="project-info">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 14.5 0h-13z"/>
                      </svg>
                      <span>{result.suite_name}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-neutral">{result.total}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-success">{result.passed}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge badge-danger">{result.failed}</span>
                  </td>
                  <td className="text-center">
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${statusClass}`}
                          style={{ width: `${passRate}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{passRate}%</span>
                    </div>
                  </td>
                  <td className="timestamp">{formatDate(result.created_at)}</td>
                  <td className="text-center">
                    <span className={`status-badge ${statusClass}`}>
                      {result.failed === 0 ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                          </svg>
                          Pass
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                          </svg>
                          Fail
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedResults.length === 0 && (
        <div className="no-results-message">
          No results match the selected filter
        </div>
      )}
    </div>
  );
};

export default ResultsList;
