import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './ResultsChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ResultsChart = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="results-chart">
        <h2>📊 Visão Geral</h2>
        <p className="no-data">Nenhum dado disponível para exibir.</p>
      </div>
    );
  }

  const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
  const totalTests = totalPassed + totalFailed;
  const uniqueProjects = [...new Set(results.map(r => r.suite_name))].length;
  const avgPassRate = results.length > 0 ? ((totalPassed / totalTests) * 100) : 0;

  // Framework distribution
  const frameworkCounts = results.reduce((acc, result) => {
    const framework = result.framework || 'Unknown';
    acc[framework] = (acc[framework] || 0) + 1;
    return acc;
  }, {});

  // Project category distribution
  const categoryCounts = results.reduce((acc, result) => {
    const category = result.project_category || 'General';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: ['✅ Passou', '❌ Falhou'],
    datasets: [
      {
        label: 'Resultados dos Testes',
        data: [totalPassed, totalFailed],
        backgroundColor: [
          'rgba(39, 174, 96, 0.8)',
          'rgba(231, 76, 60, 0.8)',
        ],
        borderColor: [
          'rgba(39, 174, 96, 1)',
          'rgba(231, 76, 60, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / totalTests) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

  return (
    <div className="results-chart">
      <h2>📊 Visão Geral dos Testes</h2>
      <div className="chart-container">
        <Pie data={data} options={options} />
      </div>
      <div className="stats-summary">
        <div className="stat-card total">
          <h3>{totalTests}</h3>
          <p>Total Tests</p>
        </div>
        <div className="stat-card passed">
          <h3>{totalPassed}</h3>
          <p>Passed</p>
        </div>
        <div className="stat-card failed">
          <h3>{totalFailed}</h3>
          <p>Failed</p>
        </div>
        <div className="stat-card rate">
          <h3>{avgPassRate.toFixed(1)}%</h3>
          <p>Success Rate</p>
        </div>
        <div className="stat-card projects">
          <h3>{uniqueProjects}</h3>
          <p>Test Suites</p>
        </div>
        <div className="stat-card frameworks">
          <h3>{Object.keys(frameworkCounts).length}</h3>
          <p>Frameworks</p>
        </div>
        <div className="stat-card categories">
          <h3>{Object.keys(categoryCounts).length}</h3>
          <p>Categories</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;
