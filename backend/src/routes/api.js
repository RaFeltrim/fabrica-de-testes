const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');
const projectScanner = require('../services/projectScanner');

// GET all test results
router.get('/results', resultsController.getAllResults);

// GET single test result by ID
router.get('/results/:id', resultsController.getResultById);

// POST new test result
router.post('/results', resultsController.createResult);

// GET detected projects from Projetos folder
router.get('/projects', (req, res) => {
  try {
    const projects = projectScanner.getProjectList();
    res.status(200).json({
      message: 'Projects scanned successfully',
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error scanning projects:', error);
    res.status(500).json({
      error: 'Failed to scan projects',
      message: error.message
    });
  }
});

module.exports = router;
