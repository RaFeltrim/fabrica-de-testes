import React, { useState } from 'react';
import './ExportButton.css';

const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setShowMenu(false);
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = `http://localhost:3001/api/v1/export/${format}`;
      link.download = `qadash-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-button-container">
      <button 
        className="export-btn" 
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
      >
        {isExporting ? '📥 Exporting...' : '📥 Export Report'}
      </button>
      
      {showMenu && !isExporting && (
        <div className="export-menu">
          <button 
            className="export-option"
            onClick={() => handleExport('csv')}
          >
            📊 Export as CSV
          </button>
          <button 
            className="export-option"
            onClick={() => handleExport('pdf')}
          >
            📄 Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;