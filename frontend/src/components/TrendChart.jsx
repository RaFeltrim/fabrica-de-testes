import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './TrendChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendChart = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [grouping, setGrouping] = useState('day');

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/v1/trends?grouping=${grouping}&days=${timeRange}`
      );
      const data = await response.json();
      setTrendData(data.data || []);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setTrendData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendData();
  }, [timeRange, grouping]);

  if (loading) {
    return (
      <div className="trend-chart">
        <h2>📈 Historical Trends</h2>
        <div className="loading">Loading trend data...</div>
      </div>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <div className="trend-chart">
        <h2>📈 Historical Trends</h2>
        <p className="no-data">No trend data available for the selected period.</p>
      </div>
    );
  }

  const chartData = {
    labels: trendData.map(item => {
      const date = new Date(item.date_group);
      if (grouping === 'hour') {
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit' 
        });
      } else if (grouping === 'month') {
        return date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
      } else {
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }),
    datasets: [
      {
        label: 'Pass Rate (%)',
        data: trendData.map(item => item.avg_pass_rate),
        borderColor: 'rgba(46, 213, 115, 1)',
        backgroundColor: 'rgba(46, 213, 115, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-percentage',
      },
      {
        label: 'Total Tests',
        data: trendData.map(item => item.total_tests),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-count',
      },
      {
        label: 'Failed Tests',
        data: trendData.map(item => item.total_failed),
        borderColor: 'rgba(231, 76, 60, 1)',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y-count',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: `Test Results Trends - Last ${timeRange} Days (Grouped by ${grouping})`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'y-percentage') {
                label += context.parsed.y.toFixed(2) + '%';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      'y-percentage': {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Pass Rate (%)',
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      'y-count': {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Test Count',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="trend-chart">
      <div className="trend-header">
        <h2>📈 Historical Trends</h2>
        <div className="trend-controls">
          <div className="control-group">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
          <div className="control-group">
            <label>Group By:</label>
            <select 
              value={grouping} 
              onChange={(e) => setGrouping(e.target.value)}
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="trend-summary">
        <div className="summary-card">
          <span className="summary-label">Data Points</span>
          <span className="summary-value">{trendData.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Avg Pass Rate</span>
          <span className="summary-value">
            {(trendData.reduce((acc, item) => acc + item.avg_pass_rate, 0) / trendData.length).toFixed(2)}%
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Executions</span>
          <span className="summary-value">
            {trendData.reduce((acc, item) => acc + item.execution_count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
