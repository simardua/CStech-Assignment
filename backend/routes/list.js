const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  upload,
  uploadAndDistribute,
  getDistributedLists,
  getDistributionDetails
} = require('../controller/listController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/lists/upload
// @desc    Upload and distribute CSV/Excel file
// @access  Private
router.post('/upload', upload, uploadAndDistribute);

// @route   GET /api/lists
// @desc    Get all distributed lists
// @access  Private
router.get('/', getDistributedLists);

// @route   GET /api/lists/:id
// @desc    Get specific distribution details
// @access  Private
router.get('/:id', getDistributionDetails);

module.exports = router;