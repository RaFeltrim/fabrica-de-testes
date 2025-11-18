const dbService = require('../services/dbService');

class TrendsController {
  async getTrendData(req, res) {
    try {
      const { grouping = 'day', days = 30 } = req.query;
      
      // Validate grouping parameter
      const validGroupings = ['hour', 'day', 'week', 'month'];
      if (!validGroupings.includes(grouping)) {
        return res.status(400).json({
          error: 'Invalid grouping parameter',
          message: 'Grouping must be one of: hour, day, week, month'
        });
      }

      // Validate days parameter
      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return res.status(400).json({
          error: 'Invalid days parameter',
          message: 'Days must be a number between 1 and 365'
        });
      }

      const trendData = await dbService.getTrendData(grouping, daysNum);

      res.status(200).json({
        message: 'Trend data retrieved successfully',
        grouping,
        days: daysNum,
        count: trendData.length,
        data: trendData
      });
    } catch (error) {
      console.error('Error fetching trend data:', error);
      res.status(500).json({
        error: 'Failed to fetch trend data',
        message: error.message
      });
    }
  }

  async getProjectTrends(req, res) {
    try {
      const { project, days = 30 } = req.query;

      // Validate days parameter
      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return res.status(400).json({
          error: 'Invalid days parameter',
          message: 'Days must be a number between 1 and 365'
        });
      }

      const projectTrends = await dbService.getProjectTrends(project, daysNum);

      res.status(200).json({
        message: 'Project trends retrieved successfully',
        project: project || 'all',
        days: daysNum,
        count: projectTrends.length,
        data: projectTrends
      });
    } catch (error) {
      console.error('Error fetching project trends:', error);
      res.status(500).json({
        error: 'Failed to fetch project trends',
        message: error.message
      });
    }
  }
}

module.exports = new TrendsController();
