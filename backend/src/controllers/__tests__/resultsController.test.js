const request = require('supertest');
const express = require('express');
const knex = require('knex');
const resultsController = require('../resultsController');

// Create test database
const testDb = knex({
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
});

// Mock dbService to use test database
jest.mock('../../services/dbService', () => ({
  saveResult: jest.fn(),
  getResults: jest.fn(),
  getAllResults: jest.fn(),
}));

const app = express();
app.use(express.json());
app.set('io', { emit: jest.fn() });

app.post('/api/v1/results', (req, res) => resultsController.createResult(req, res));
app.get('/api/v1/results', (req, res) => resultsController.getResults(req, res));

describe('ResultsController', () => {
  beforeAll(async () => {
    // Create test tables
    await testDb.schema.createTable('test_results', (table) => {
      table.increments('id');
      table.string('suite_name');
      table.integer('total');
      table.integer('passed');
      table.integer('failed');
      table.string('framework').defaultTo('Unknown');
      table.string('test_type').defaultTo('Functional');
      table.text('error_details');
      table.string('error_type');
      table.text('error_message');
      table.string('project_category');
      table.timestamp('created_at').defaultTo(testDb.fn.now());
    });
  });

  afterAll(async () => {
    await testDb.destroy();
  });

  beforeEach(async () => {
    // Clear table before each test
    await testDb('test_results').del();

    // Reset mocks
    jest.clearAllMocks();

    // Setup real database calls
    const dbService = require('../../services/dbService');
    dbService.saveResult.mockImplementation(async (data) => {
      const [id] = await testDb('test_results').insert(data);
      return { id, ...data };
    });

    dbService.getResults.mockImplementation(async (filters = {}) => {
      let query = testDb('test_results').select('*');

      if (filters.suite_name) {
        query = query.where('suite_name', 'like', `%${filters.suite_name}%`);
      }

      if (filters.framework) {
        query = query.where('framework', filters.framework);
      }

      if (filters.startDate && filters.endDate) {
        query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
      }

      return await query.orderBy('created_at', 'desc');
    });

    dbService.getAllResults.mockImplementation(async () => {
      return await testDb('test_results').select('*').orderBy('created_at', 'desc');
    });
  });

  it('should save a valid test result', async () => {
    const response = await request(app)
      .post('/api/v1/results')
      .send({
        suite_name: 'Test Suite',
        total: 10,
        passed: 9,
        failed: 1,
        framework: 'Jest',
        project_category: 'Unit Tests'
      })
      .expect(201);

    expect(response.body).toHaveProperty('message', 'Result saved successfully');
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toHaveProperty('id');

    // Verify data was actually saved to database
    const savedResult = await testDb('test_results').where('id', response.body.result.id).first();
    expect(savedResult).toBeTruthy();
    expect(savedResult.suite_name).toBe('Test Suite');
    expect(savedResult.total).toBe(10);
    expect(savedResult.passed).toBe(9);
    expect(savedResult.failed).toBe(1);
  });

  it('should return validation error for missing required fields', async () => {
    const response = await request(app)
      .post('/api/v1/results')
      .send({ suite_name: 'Test' }) // Missing total, passed, failed
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Missing required fields');
    expect(response.body.required).toEqual(['suite_name', 'total', 'passed', 'failed']);
  });

  it('should return validation error for invalid number types', async () => {
    const response = await request(app)
      .post('/api/v1/results')
      .send({
        suite_name: 'Test',
        total: '10', // Should be number
        passed: 9,
        failed: 1
      })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'total, passed, and failed must be numbers');
  });

  it('should retrieve all results', async () => {
    // Insert test data
    await testDb('test_results').insert([
      {
        suite_name: 'Suite 1',
        total: 10,
        passed: 8,
        failed: 2,
        framework: 'Jest'
      },
      {
        suite_name: 'Suite 2',
        total: 5,
        passed: 5,
        failed: 0,
        framework: 'Vitest'
      }
    ]);

    const response = await request(app)
      .get('/api/v1/results')
      .expect(200);

    expect(response.body).toHaveProperty('results');
    expect(Array.isArray(response.body.results)).toBe(true);
    expect(response.body.results).toHaveLength(2);

    // Verify data integrity
    const suites = response.body.results.map(r => r.suite_name).sort();
    expect(suites).toEqual(['Suite 1', 'Suite 2']);
  });

  it('should filter results by framework', async () => {
    // Insert test data
    await testDb('test_results').insert([
      { suite_name: 'Jest Test', total: 10, passed: 8, failed: 2, framework: 'Jest' },
      { suite_name: 'Vitest Test', total: 5, passed: 5, failed: 0, framework: 'Vitest' }
    ]);

    const response = await request(app)
      .get('/api/v1/results?framework=Jest')
      .expect(200);

    expect(response.body.results).toHaveLength(1);
    expect(response.body.results[0].suite_name).toBe('Jest Test');
  });

  it('should emit WebSocket event when saving result', async () => {
    const io = app.get('io');
    const emitSpy = jest.spyOn(io, 'emit');

    await request(app)
      .post('/api/v1/results')
      .send({
        suite_name: 'WebSocket Test',
        total: 5,
        passed: 4,
        failed: 1
      })
      .expect(201);

    expect(emitSpy).toHaveBeenCalledWith('new-test-result', expect.objectContaining({
      suite_name: 'WebSocket Test',
      total: 5,
      passed: 4,
      failed: 1
    }));
  });
});