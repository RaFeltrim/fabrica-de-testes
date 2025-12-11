const request = require('supertest');
const express = require('express');

// Mock do dbService antes de importar o controller
jest.mock('../../services/dbService', () => ({
  getAllResults: jest.fn().mockResolvedValue([])
}));

const failuresController = require('../failuresController');
const dbService = require('../../services/dbService');

const app = express();
app.use(express.json());

app.get('/api/v1/failures', (req, res) => failuresController.getTopFailures(req, res));

describe('FailuresController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/failures', () => {
    it('should return aggregated failures', async () => {
      const mockResults = [
        {
          suite_name: 'Login Tests',
          error_type: 'AssertionError',
          error_message: 'Expected true to be false',
          failed: 2
        },
        {
          suite_name: 'Login Tests',
          error_type: 'AssertionError',
          error_message: 'Expected true to be false',
          failed: 3
        }
      ];

      dbService.getAllResults.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/v1/failures')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });

    it('should handle database errors gracefully', async () => {
      dbService.getAllResults.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/failures')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});
