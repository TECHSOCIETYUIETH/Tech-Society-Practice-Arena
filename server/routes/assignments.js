// routes/assignments.js
const router    = require('express').Router();
const auth      = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const ctrl      = require('../controllers/assignment');

// all routes require login
router.use(auth);

// create/update/delete → admin & mentor only
router.post(   '/',        authorize('admin','mentor'), ctrl.createAssignment);
router.put(    '/:id',     authorize('admin','mentor'), ctrl.updateAssignment);
router.delete( '/:id',     authorize('admin','mentor'), ctrl.deleteAssignment);

// read → any authenticated user
router.get(    '/',        ctrl.getAssignments);
router.get(    '/:id',     ctrl.getAssignment);

module.exports = router;
