const request = require('supertest');
const express = require('express');
const trendsController = require('../trendsController');

// Mock do knex database
jest.mock('../../services/dbService', () => ({
  getTrendData: jest.fn().mockResolvedValue([])
}));

const app = express();
app.use(express.json());

app.get('/api/v1/trends', (req, res) => trendsController.getTrendData(req, res));

describe('TrendsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/trends', () => {
    it('should return trends data with default parameters', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockResolvedValueOnce([
        {
          period: '2025-12-10',
          total_tests: 100,
          passed_tests: 85,
          failed_tests: 15,
          success_rate: 85.0
        }
      ]);

      const response = await request(app)
        .get('/api/v1/trends')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should group by hour when specified', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockResolvedValueOnce([
        {
          period: '2025-12-10 14:00',
          total_tests: 20,
          passed_tests: 18,
          failed_tests: 2,
          success_rate: 90.0
        }
      ]);

      const response = await request(app)
        .get('/api/v1/trends?grouping=hour')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(dbService.getTrendData).toHaveBeenCalledWith('hour', 30);
    });

    it('should group by day (default)', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockResolvedValueOnce([
        {
          period: '2025-12-10',
          total_tests: 100,
          passed_tests: 85,
          failed_tests: 15,
          success_rate: 85.0
        }
      ]);

      const response = await request(app)
        .get('/api/v1/trends?grouping=day')
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should group by week', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockResolvedValueOnce([
        {
          period: '2025-W50',
          total_tests: 500,
          passed_tests: 450,
          failed_tests: 50,
          success_rate: 90.0
        }
      ]);

      const response = await request(app)
        .get('/api/v1/trends?grouping=week')
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should group by month', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockResolvedValueOnce([
        {
          period: '2025-12',
          total_tests: 2000,
          passed_tests: 1800,
          failed_tests: 200,
          success_rate: 90.0
        }
      ]);

      const response = await request(app)
        .get('/api/v1/trends?grouping=month')
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should support days parameter', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockResolvedValueOnce([]);

      await request(app)
        .get('/api/v1/trends?days=7')
        .expect(200);

      expect(dbService.getTrendData).toHaveBeenCalledWith('day', 7);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid grouping parameter', async () => {
      const response = await request(app)
        .get('/api/v1/trends?grouping=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid grouping parameter');
    });

    it('should handle invalid days parameter', async () => {
      const response = await request(app)
        .get('/api/v1/trends?days=999')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid days parameter');
    });

    it('should handle database errors gracefully', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/trends')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Data Aggregation', () => {
    it('should return empty array when no data', async () => {
      const dbService = require('../../services/dbService');
      dbService.getTrendData.mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/v1/trends')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });
});
