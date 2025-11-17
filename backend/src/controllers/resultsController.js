const dbService = require('../services/dbService');

class ResultsController {
  async createResult(req, res) {
    try {
      const { suite_name, total, passed, failed } = req.body;

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
        failed
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
      const results = await dbService.getAllResults();
      
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
