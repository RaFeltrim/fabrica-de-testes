import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = () => {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
      </div>
      
      <div className="skeleton-stats">
        <div className="skeleton-stat-card"></div>
        <div className="skeleton-stat-card"></div>
        <div className="skeleton-stat-card"></div>
        <div className="skeleton-stat-card"></div>
      </div>
      
      <div className="skeleton-chart">
        <div className="skeleton-chart-placeholder"></div>
      </div>
      
      <div className="skeleton-table">
        <div className="skeleton-table-row">
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
        </div>
        <div className="skeleton-table-row">
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
        </div>
        <div className="skeleton-table-row">
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
