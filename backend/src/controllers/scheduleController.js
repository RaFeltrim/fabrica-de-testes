const scheduledExportService = require('../services/scheduledExportService');

class ScheduleController {
  async getScheduledJobs(req, res) {
    try {
      const jobs = scheduledExportService.getScheduledJobs();
      
      res.status(200).json({
        message: 'Scheduled jobs retrieved successfully',
        count: jobs.length,
        data: jobs
      });
    } catch (error) {
      console.error('Error fetching scheduled jobs:', error);
      res.status(500).json({
        error: 'Failed to fetch scheduled jobs',
        message: error.message
      });
    }
  }

  async createScheduledJob(req, res) {
    try {
      const { id, schedule, format, filename, enabled } = req.body;

      // Validation
      if (!id || !schedule || !format) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['id', 'schedule', 'format']
        });
      }

      // Validate format
      const validFormats = ['csv', 'json'];
      if (!validFormats.includes(format)) {
        return res.status(400).json({
          error: 'Invalid format',
          message: 'Format must be either csv or json'
        });
      }

      scheduledExportService.scheduleExport({
        id,
        schedule,
        format,
        filename,
        enabled: enabled !== false // Default to true
      });

      res.status(201).json({
        message: 'Scheduled job created successfully',
        data: { id, schedule, format, filename, enabled }
      });
    } catch (error) {
      console.error('Error creating scheduled job:', error);
      res.status(500).json({
        error: 'Failed to create scheduled job',
        message: error.message
      });
    }
  }

  async deleteScheduledJob(req, res) {
    try {
      const { id } = req.params;

      const success = scheduledExportService.stopExport(id);

      if (!success) {
        return res.status(404).json({
          error: 'Job not found',
          message: `No scheduled job with id: ${id}`
        });
      }

      res.status(200).json({
        message: 'Scheduled job deleted successfully',
        data: { id }
      });
    } catch (error) {
      console.error('Error deleting scheduled job:', error);
      res.status(500).json({
        error: 'Failed to delete scheduled job',
        message: error.message
      });
    }
  }

  async cleanupOldExports(req, res) {
    try {
      const { days = 30 } = req.query;
      const daysNum = parseInt(days);

      if (isNaN(daysNum) || daysNum < 1) {
        return res.status(400).json({
          error: 'Invalid days parameter',
          message: 'Days must be a positive number'
        });
      }

      const deletedCount = scheduledExportService.cleanupOldExports(daysNum);

      res.status(200).json({
        message: 'Cleanup completed successfully',
        deletedCount
      });
    } catch (error) {
      console.error('Error cleaning up exports:', error);
      res.status(500).json({
        error: 'Failed to cleanup exports',
        message: error.message
      });
    }
  }
}

module.exports = new ScheduleController();
