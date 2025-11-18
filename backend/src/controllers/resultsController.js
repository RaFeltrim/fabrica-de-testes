const dbService = require('../services/dbService');

class ResultsController {
  async createResult(req, res) {
    try {
      const { 
        suite_name, 
        total, 
        passed, 
        failed,
        framework = 'Unknown',
        test_type = 'Functional',
        error_details,
        error_type,
        error_message,
        project_category
      } = req.body;

      // Validation
      if (!suite_name || total === undefined || passed === undefined || failed === undefined) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['suite_name', 'total', 'passed', 'failed']
        });
      }

      // Validate numbers
      if (typeof total !== 'number' || typeof passed !== 'number' || typeof failed !== 'number') {
        return res.status(400).json({
          error: 'total, passed, and failed must be numbers'
        });
      }

      const result = await dbService.saveResult({
        suite_name,
        total,
        passed,
        failed,
        framework,
        test_type,
        error_details,
        error_type,
        error_message,
        project_category
      });

      res.status(201).json({
        message: 'Test result saved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error creating result:', error);
      res.status(500).json({
        error: 'Failed to save test result',
        message: error.message
      });
    }
  }

  async getAllResults(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      let query = dbService.getAllResults();
      
      // Apply date range filter if provided
      if (startDate && endDate) {
        query = dbService.getResultsByDateRange(startDate, endDate);
      }
      
      const results = await query;
      
      res.status(200).json({
        message: 'Results retrieved successfully',
        count: results.length,
        data: results
      });
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({
        error: 'Failed to fetch test results',
        message: error.message
      });
    }
  }

  async getResultById(req, res) {
    try {
      const { id } = req.params;
      const result = await dbService.getResultById(id);

      if (!result) {
        return res.status(404).json({
          error: 'Result not found'
        });
      }

      res.status(200).json({
        message: 'Result retrieved successfully',
        data: result
      });
    } catch (error) {
      console.error('Error fetching result:', error);
      res.status(500).json({
        error: 'Failed to fetch test result',
        message: error.message
      });
    }
  }
}

module.exports = new ResultsController();
