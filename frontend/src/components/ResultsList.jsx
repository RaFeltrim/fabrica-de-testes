import React from 'react';
import './ResultsList.css';

const ResultsList = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="results-list">
        <h2>📋 Histórico de Execuções</h2>
        <p className="no-data">Nenhum resultado de teste encontrado.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPassRate = (passed, total) => {
    return total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="results-list">
      <h2>📋 Histórico de Execuções</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Test Suite</th>
            <th>Framework</th>
            <th>Type</th>
            <th>Total</th>
            <th>✅ Passed</th>
            <th>❌ Failed</th>
            <th>% Success</th>
            <th>Category</th>
            <th>Date/Time</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className={result.failed > 0 ? 'has-failures' : 'all-passed'}>
              <td className="suite-name">{result.suite_name}</td>
              <td className="framework">
                <span className={`framework-badge ${result.framework?.toLowerCase().replace(/[\s\/]+/g, '-') || 'unknown'}`}>
                  {result.framework || 'Unknown'}
                </span>
              </td>
              <td className="test-type">{result.test_type || 'Unknown'}</td>
              <td>{result.total}</td>
              <td className="passed">{result.passed}</td>
              <td className="failed">{result.failed}</td>
              <td className="pass-rate">{getPassRate(result.passed, result.total)}%</td>
              <td className="category">
                <span className={`category-tag ${result.project_category?.toLowerCase() || 'general'}`}>
                  {result.project_category || 'General'}
                </span>
              </td>
              <td>{formatDate(result.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsList;
