const dbService = require('../services/dbService');

class ExportController {
  async exportToCSV(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      // Get data based on date range or all data
      let query = dbService.getAllResults();
      
      if (startDate && endDate) {
        query = dbService.getResultsByDateRange(startDate, endDate);
      }
      
      const results = await query;
      
      // Create CSV headers
      const headers = [
        'ID', 'Suite Name', 'Framework', 'Test Type', 'Total', 'Passed', 
        'Failed', 'Pass Rate %', 'Project Category', 'Created At'
      ];
      
      // Create CSV rows
      const rows = results.map(result => {
        const passRate = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(2) : 0;
        return [
          result.id,
          `"${result.suite_name}"`,
          `"${result.framework || 'Unknown'}"`,
          `"${result.test_type || 'Functional'}"`,
          result.total,
          result.passed,
          result.failed,
          passRate,
          `"${result.project_category || ''}"`,
          new Date(result.created_at).toISOString()
        ].join(',');
      });
      
      // Combine headers and rows
      const csvContent = [headers.join(','), ...rows].join('\n');
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="qadash-report.csv"');
      
      res.status(200).send(csvContent);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      res.status(500).json({
        error: 'Failed to export data',
        message: error.message
      });
    }
  }
}

module.exports = new ExportController();