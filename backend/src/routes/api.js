const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');
const exportController = require('../controllers/exportController');
const failuresController = require('../controllers/failuresController');

// GET all test results
router.get('/results', resultsController.getAllResults);

// GET single test result by ID
router.get('/results/:id', resultsController.getResultById);

// POST new test result
router.post('/results', resultsController.createResult);

// Export to CSV
router.get('/export/csv', exportController.exportToCSV);

// GET top recurring failures
router.get('/failures/top', failuresController.getTopFailures);

module.exports = router;
