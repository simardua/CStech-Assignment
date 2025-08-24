const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAgents,
  createAgent,
  updateAgent,
  deleteAgent
} = require('../controller/agentController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private
router.get('/', getAgents);

// @route   POST /api/agents
// @desc    Create new agent
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('mobile')
    .isMobilePhone()
    .withMessage('Please provide a valid mobile number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], createAgent);

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private
router.put('/:id', updateAgent);

// @route   DELETE /api/agents/:id
// @desc    Delete agent
// @access  Private
router.delete('/:id', deleteAgent);

module.exports = router;