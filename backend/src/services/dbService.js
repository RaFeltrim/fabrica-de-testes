const knex = require('knex');
const knexConfig = require('../knexfile');

const db = knex(knexConfig);

class DbService {
  async saveResult(resultData) {
    try {
      // Check if a result with the same suite_name already exists
      const existing = await db('test_results')
        .where({ suite_name: resultData.suite_name })
        .first();

      if (existing) {
        // Update existing record
        await db('test_results')
          .where({ id: existing.id })
          .update({
            total: resultData.total,
            passed: resultData.passed,
            failed: resultData.failed,
            created_at: db.fn.now()
          });
        return { id: existing.id, ...resultData };
      } else {
        // Insert new record
        const [id] = await db('test_results').insert({
          suite_name: resultData.suite_name,
          total: resultData.total,
          passed: resultData.passed,
          failed: resultData.failed
        });
        return { id, ...resultData };
      }
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

  async getResultById(id) {
    try {
      const result = await db('test_results')
        .where({ id })
        .first();
      return result;
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error;
    }
  }
}

module.exports = new DbService();
