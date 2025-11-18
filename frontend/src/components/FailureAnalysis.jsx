import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './FailureAnalysis.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FailureAnalysis = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="failure-analysis">
        <h2>🔍 Failure Analysis</h2>
        <p className="no-data">No test data available for analysis.</p>
      </div>
    );
  }

  // Parse error details and count recurring failures
  const errorCounts = {};
  
  results.forEach(result => {
    if (result.error_details) {
      const errors = result.error_details.split('\n');
      errors.forEach(error => {
        if (error.trim()) {
          // Extract error type (first part before colon)
          const errorType = error.split(':')[0].trim() || 'Unknown Error';
          errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
        }
      });
    }
  });

  // Get top 5 recurring failures
  const sortedErrors = Object.entries(errorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (sortedErrors.length === 0) {
    return (
      <div className="failure-analysis">
        <h2>🔍 Failure Analysis</h2>
        <p className="no-failures">✅ All tests passed! No failures to analyze.</p>
      </div>
    );
  }

  const chartData = {
    labels: sortedErrors.map(([errorType]) => errorType),
    datasets: [
      {
        label: 'Failure Count',
        data: sortedErrors.map(([, count]) => count),
        backgroundColor: [
          'rgba(231, 76, 60, 0.8)',
          'rgba(243, 156, 18, 0.8)',
          'rgba(155, 89, 182, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(230, 126, 34, 0.8)',
        ],
        borderColor: [
          'rgba(231, 76, 60, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(230, 126, 34, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Recurring Failures',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="failure-analysis">
      <h2>🔍 Failure Analysis</h2>
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="failure-details">
        <h3>Failure Summary</h3>
        <ul>
          {sortedErrors.map(([errorType, count], index) => (
            <li key={index}>
              <span className="error-count">{count}x</span>
              <span className="error-type">{errorType}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FailureAnalysis;
