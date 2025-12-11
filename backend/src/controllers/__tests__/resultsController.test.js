const request = require('supertest');
const express = require('express');
const resultsController = require('../resultsController');

jest.mock('../../services/dbService', () => ({
  saveResult: jest.fn().mockResolvedValue({ id: 1 }),
  getResults: jest.fn().mockResolvedValue([])
}));

const app = express();
app.use(express.json());
app.set('io', { emit: jest.fn() });

app.post('/api/v1/results', (req, res) => resultsController.createResult(req, res));
app.get('/api/v1/results', (req, res) => resultsController.getResults(req, res));

describe('ResultsController', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('should save a valid test result', async () => {
    const dbService = require('../../services/dbService');
    dbService.saveResult.mockResolvedValueOnce({ id: 1 });
    
    const response = await request(app)
      .post('/api/v1/results')
      .send({ suite_name: 'Test', total: 10, passed: 9, failed: 1 })
      .expect(201);
    
    expect(response.body).toHaveProperty('message');
  });
});