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
}

module.exports = new DbService();
