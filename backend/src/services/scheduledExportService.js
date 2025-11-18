const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const dbService = require('./dbService');

class ScheduledExportService {
  constructor() {
    this.jobs = new Map();
    this.exportDir = path.join(__dirname, '../../exports');
    
    // Ensure export directory exists
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  // Schedule a recurring export job
  scheduleExport(config) {
    const { id, schedule, format, filename, enabled = true } = config;
    
    // Validate cron expression
    if (!cron.validate(schedule)) {
      throw new Error('Invalid cron expression');
    }

    // Stop existing job if it exists
    if (this.jobs.has(id)) {
      this.stopExport(id);
    }

    if (!enabled) {
      console.log(`📅 Export job '${id}' created but not started (disabled)`);
      return;
    }

    // Create new scheduled task
    const task = cron.schedule(schedule, async () => {
      try {
        console.log(`📤 Running scheduled export: ${id}`);
        await this.executeExport(format, filename);
        console.log(`✅ Scheduled export completed: ${id}`);
      } catch (error) {
        console.error(`❌ Scheduled export failed: ${id}`, error);
      }
    });

    this.jobs.set(id, { task, config });
    console.log(`📅 Scheduled export '${id}' started: ${schedule}`);
  }

  // Execute export based on format
  async executeExport(format, filename) {
    const results = await dbService.getAllResults();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFilename = filename 
      ? `${filename}-${timestamp}.${format}`
      : `qadash-export-${timestamp}.${format}`;
    const filepath = path.join(this.exportDir, exportFilename);

    if (format === 'csv') {
      await this.exportToCSV(results, filepath);
    } else if (format === 'json') {
      await this.exportToJSON(results, filepath);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }

    return filepath;
  }

  async exportToCSV(results, filepath) {
    const headers = [
      'ID', 'Suite Name', 'Framework', 'Test Type', 'Total', 'Passed', 
      'Failed', 'Pass Rate %', 'Project Category', 'Created At'
    ];

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

    const csvContent = [headers.join(','), ...rows].join('\n');
    fs.writeFileSync(filepath, csvContent, 'utf8');
  }

  async exportToJSON(results, filepath) {
    const exportData = {
      generated_at: new Date().toISOString(),
      total_executions: results.length,
      results: results
    };
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');
  }

  // Stop a scheduled export
  stopExport(id) {
    const job = this.jobs.get(id);
    if (job) {
      job.task.stop();
      this.jobs.delete(id);
      console.log(`⏹️ Stopped scheduled export: ${id}`);
      return true;
    }
    return false;
  }

  // Get all scheduled jobs
  getScheduledJobs() {
    const jobs = [];
    this.jobs.forEach((job, id) => {
      jobs.push({
        id,
        schedule: job.config.schedule,
        format: job.config.format,
        filename: job.config.filename,
        enabled: job.config.enabled
      });
    });
    return jobs;
  }

  // Clean up old exports (older than specified days)
  cleanupOldExports(daysToKeep = 30) {
    const files = fs.readdirSync(this.exportDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;
    files.forEach(file => {
      const filepath = path.join(this.exportDir, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    });

    console.log(`🧹 Cleaned up ${deletedCount} old export files`);
    return deletedCount;
  }

  // Initialize default scheduled jobs
  initializeDefaultJobs() {
    // Daily CSV export at midnight
    this.scheduleExport({
      id: 'daily-csv',
      schedule: '0 0 * * *', // Every day at midnight
      format: 'csv',
      filename: 'daily-report',
      enabled: false // Disabled by default, can be enabled via API
    });

    // Weekly JSON backup on Sundays at 1 AM
    this.scheduleExport({
      id: 'weekly-backup',
      schedule: '0 1 * * 0', // Every Sunday at 1 AM
      format: 'json',
      filename: 'weekly-backup',
      enabled: false // Disabled by default
    });

    // Cleanup old exports monthly
    cron.schedule('0 2 1 * *', () => { // 1st day of month at 2 AM
      console.log('🧹 Running monthly export cleanup');
      this.cleanupOldExports(30);
    });
  }
}

// Export singleton instance
const scheduledExportService = new ScheduledExportService();
module.exports = scheduledExportService;
