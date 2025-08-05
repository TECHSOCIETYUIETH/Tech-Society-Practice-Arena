// routes/users.js
const express = require('express');
const authorize    = require('../middleware/authorize');
const { getUsers }   = require('../controllers/user');

const router = express.Router();

// Only admin/mentor can list students
router.get('/', authorize('admin','mentor'), getUsers);

module.exports = router;
 