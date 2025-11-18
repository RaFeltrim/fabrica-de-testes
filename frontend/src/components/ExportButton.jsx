import React, { useState } from 'react';
import './ExportButton.css';

const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = 'http://localhost:3001/api/v1/export/csv';
      link.download = 'qadash-report.csv';
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
    <button 
      className="export-btn" 
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? '📥 Exporting...' : '📥 Export to CSV'}
    </button>
  );
};

export default ExportButton;