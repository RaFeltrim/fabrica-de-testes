const knex = require('knex');
const knexConfig = require('../knexfile');

const db = knex(knexConfig);

class DbService {
  async saveResult(resultData) {
    try {
      const [id] = await db('test_results').insert({
        suite_name: resultData.suite_name,
        total: resultData.total,
        passed: resultData.passed,
        failed: resultData.failed,
        framework: resultData.framework || 'Unknown',
        test_type: resultData.test_type || 'Functional',
        error_details: resultData.error_details,
        error_type: resultData.error_type,
        error_message: resultData.error_message,
        project_category: resultData.project_category
      });
      return { id, ...resultData };
    } catch (error) {
      console.error('Error saving result:', error);
      throw error;
    }
  }

  async getAllResults() {
    try {
      const results = await db('test_results')
        .select('*')
        .orderBy('created_at', 'desc');
      return results;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  }

  async getResultsByDateRange(startDate, endDate) {
    try {
      const results = await db('test_results')
        .whereBetween('created_at', [startDate, endDate])
        .select('*')
        .orderBy('created_at', 'desc');
      return results;
    } catch (error) {
      console.error('Error fetching results by date range:', error);
      throw error;
    }
  }

  async getTrendData(grouping = 'day', days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let dateFormat;
      switch (grouping) {
        case 'hour':
          dateFormat = '%Y-%m-%d %H:00:00';
          break;
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          // SQLite doesn't have week formatting, so we'll group by week in post-processing
          dateFormat = '%Y-%m-%d';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }

      const results = await db('test_results')
        .where('created_at', '>=', startDate.toISOString())
        .select(
          db.raw(`strftime('${dateFormat}', created_at) as date_group`),
          db.raw('COUNT(*) as execution_count'),
          db.raw('SUM(total) as total_tests'),
          db.raw('SUM(passed) as total_passed'),
          db.raw('SUM(failed) as total_failed'),
          db.raw('ROUND(AVG(CAST(passed AS REAL) / NULLIF(total, 0) * 100), 2) as avg_pass_rate')
        )
        .groupBy('date_group')
        .orderBy('date_group', 'asc');

      // For week grouping, aggregate by week
      if (grouping === 'week') {
        const weeklyData = {};
        results.forEach(row => {
          const date = new Date(row.date_group);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
          const weekKey = weekStart.toISOString().split('T')[0];
          
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
              date_group: weekKey,
              execution_count: 0,
              total_tests: 0,
              total_passed: 0,
              total_failed: 0,
              pass_rates: []
            };
          }
          
          weeklyData[weekKey].execution_count += row.execution_count;
          weeklyData[weekKey].total_tests += row.total_tests;
          weeklyData[weekKey].total_passed += row.total_passed;
          weeklyData[weekKey].total_failed += row.total_failed;
          if (row.avg_pass_rate) {
            weeklyData[weekKey].pass_rates.push(row.avg_pass_rate);
          }
        });

        return Object.values(weeklyData).map(week => ({
          date_group: week.date_group,
          execution_count: week.execution_count,
          total_tests: week.total_tests,
          total_passed: week.total_passed,
          total_failed: week.total_failed,
          avg_pass_rate: week.pass_rates.length > 0 
            ? Math.round(week.pass_rates.reduce((a, b) => a + b, 0) / week.pass_rates.length * 100) / 100
            : 0
        })).sort((a, b) => a.date_group.localeCompare(b.date_group));
      }

      return results;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }
  }

  async getProjectTrends(projectName = null, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = db('test_results')
        .where('created_at', '>=', startDate.toISOString());

      if (projectName) {
        query = query.where('suite_name', projectName);
      }

      const results = await query
        .select(
          'suite_name',
          db.raw(`strftime('%Y-%m-%d', created_at) as date`),
          db.raw('SUM(total) as total_tests'),
          db.raw('SUM(passed) as total_passed'),
          db.raw('SUM(failed) as total_failed'),
          db.raw('ROUND(AVG(CAST(passed AS REAL) / NULLIF(total, 0) * 100), 2) as pass_rate')
        )
        .groupBy('suite_name', 'date')
        .orderBy('date', 'asc');

      return results;
    } catch (error) {
      console.error('Error fetching project trends:', error);
      throw error;
    }
  }
}

module.exports = new DbService();
