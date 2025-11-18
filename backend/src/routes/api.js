const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');
const exportController = require('../controllers/exportController');
const failuresController = require('../controllers/failuresController');
const trendsController = require('../controllers/trendsController');
const scheduleController = require('../controllers/scheduleController');

// GET all test results
router.get('/results', resultsController.getAllResults);

// GET single test result by ID
router.get('/results/:id', resultsController.getResultById);

// POST new test result
router.post('/results', resultsController.createResult);

// Export to CSV
router.get('/export/csv', exportController.exportToCSV);

// Export to PDF
router.get('/export/pdf', exportController.exportToPDF);

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

module.exports = router;
