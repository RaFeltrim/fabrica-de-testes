import React from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './ResultsChart.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ResultsChart = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="results-chart">
        <h2>Test Overview</h2>
        <div className="no-data-container">
          <svg width="64" height="64" viewBox="0 0 16 16" fill="#cbd5e0">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          <p>No test data available</p>
          <span>Run tests and send results to see analytics</span>
        </div>
      </div>
    );
  }

  const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
  const totalTests = totalPassed + totalFailed;

  // Doughnut Chart Data
  const doughnutData = {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        label: 'Test Results',
        data: [totalPassed, totalFailed],
        backgroundColor: [
          'rgba(67, 233, 123, 0.8)',
          'rgba(245, 87, 108, 0.8)',
        ],
        borderColor: [
          'rgba(67, 233, 123, 1)',
          'rgba(245, 87, 108, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Get project-wise data for bar chart
  const projectData = {};
  results.forEach(result => {
    const name = result.suite_name;
    if (!projectData[name]) {
      projectData[name] = { passed: 0, failed: 0 };
    }
    projectData[name].passed += result.passed;
    projectData[name].failed += result.failed;
  });

  const projectNames = Object.keys(projectData).slice(0, 5); // Top 5 projects
  const barData = {
    labels: projectNames,
    datasets: [
      {
        label: 'Passed',
        data: projectNames.map(name => projectData[name].passed),
        backgroundColor: 'rgba(67, 233, 123, 0.8)',
        borderColor: 'rgba(67, 233, 123, 1)',
        borderWidth: 1,
      },
      {
        label: 'Failed',
        data: projectNames.map(name => projectData[name].failed),
        backgroundColor: 'rgba(245, 87, 108, 0.8)',
        borderColor: 'rgba(245, 87, 108, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 13, weight: '500' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / totalTests) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 13, weight: '500' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false
        },
        ticks: {
          font: { size: 12 }
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 12 }
        }
      }
    }
  };

  const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h2>Overall Test Results</h2>
        <div className="chart-wrapper doughnut-wrapper">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="chart-center-text">
            <div className="center-value">{passRate}%</div>
            <div className="center-label">Success</div>
          </div>
        </div>
        <div className="chart-stats">
          <div className="chart-stat">
            <div className="stat-dot passed"></div>
            <span className="stat-text">{totalPassed} passed</span>
          </div>
          <div className="chart-stat">
            <div className="stat-dot failed"></div>
            <span className="stat-text">{totalFailed} failed</span>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h2>Results by Project</h2>
        <div className="chart-wrapper bar-wrapper">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;
