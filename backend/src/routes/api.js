const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const resultsController = require('../controllers/resultsController');
const exportController = require('../controllers/exportController');
const failuresController = require('../controllers/failuresController');
const trendsController = require('../controllers/trendsController');
const scheduleController = require('../controllers/scheduleController');
const webhookController = require('../controllers/webhookController');

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit webhooks to 30 per minute per IP
  message: 'Too many webhook requests, please slow down.'
});

const exportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit exports to 10 per 5 minutes
  message: 'Too many export requests, please wait before trying again.'
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

// GET all test results
router.get('/results', resultsController.getAllResults);

// GET single test result by ID
router.get('/results/:id', resultsController.getResultById);

// POST new test result
router.post('/results', resultsController.createResult);

// Export to CSV (with stricter rate limiting)
router.get('/export/csv', exportLimiter, exportController.exportToCSV);

// Export to PDF (with stricter rate limiting)
router.get('/export/pdf', exportLimiter, exportController.exportToPDF);

// GET top recurring failures
router.get('/failures/top', failuresController.getTopFailures);

// GET trend data (aggregated by time period)
router.get('/trends', trendsController.getTrendData);

// GET project-specific trends
router.get('/trends/projects', trendsController.getProjectTrends);

// Scheduled exports management
router.get('/schedules', scheduleController.getScheduledJobs);
router.post('/schedules', scheduleController.createScheduledJob);
router.delete('/schedules/:id', scheduleController.deleteScheduledJob);
router.post('/schedules/cleanup', scheduleController.cleanupOldExports);

// Webhook endpoints for CI/CD integrations (with webhook-specific rate limiting)
router.get('/webhooks', webhookController.getWebhookInfo);
router.post('/webhooks/github', webhookLimiter, webhookController.handleGitHubWebhook);
router.post('/webhooks/jenkins', webhookLimiter, webhookController.handleJenkinsWebhook);
router.post('/webhooks/gitlab', webhookLimiter, webhookController.handleGitLabWebhook);
router.post('/webhooks/generic', webhookLimiter, webhookController.handleGenericWebhook);

module.exports = router;
