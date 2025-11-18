const dbService = require('../services/dbService');

class FailuresController {
  async getTopFailures(req, res) {
    try {
      // Get all results with failures
      const results = await dbService.getAllResults();
      
      // Aggregate error types
      const errorCounts = {};
      
      results.forEach(result => {
        // Skip results without failures
        if (result.failed === 0) return;
        
        // Use error_type if available, otherwise try to parse from error_details
        let errorType = result.error_type || 'Unknown Error';
        
        if (!result.error_type && result.error_details) {
          // Try to extract error type from error details
          const errorLines = result.error_details.split('\n');
          if (errorLines.length > 0) {
            const firstError = errorLines[0];
            // Extract error type from the beginning of the error message
            if (firstError.includes(':')) {
              errorType = firstError.split(':')[0].trim();
            } else {
              errorType = firstError.substring(0, 50) + (firstError.length > 50 ? '...' : '');
            }
          }
        }
        
        // Count error types
        if (errorCounts[errorType]) {
          errorCounts[errorType].count += result.failed;
          errorCounts[errorType].suites.push(result.suite_name);
        } else {
          errorCounts[errorType] = {
            count: result.failed,
            suites: [result.suite_name],
            type: errorType
          };
        }
      });
      
      // Convert to array and sort by count
      const topFailures = Object.values(errorCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 failures
      
      res.status(200).json({
        message: 'Top failures retrieved successfully',
        count: topFailures.length,
        data: topFailures
      });
    } catch (error) {
      console.error('Error fetching top failures:', error);
      res.status(500).json({
        error: 'Failed to fetch top failures',
        message: error.message
      });
    }
  }
}

module.exports = new FailuresController();