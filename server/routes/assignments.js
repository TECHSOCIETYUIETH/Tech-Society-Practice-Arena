// routes/assignments.js
const express   = require('express')
const router    = express.Router()
const auth      = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const {
  createAssignment,
  getAssignments,
  getMyAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  getSubmission,
  gradeSubmission,
  getRankings
} = require('../controllers/assignment')

router.use(auth)
router.get(   '/me',                         authorize('student'),        getMyAssignments)
router.post(  '/',                           authorize('mentor','admin'), createAssignment)
router.get(   '/',                           authorize('mentor','admin'), getAssignments)
router.get(   '/:id',                        getAssignment)
router.put(   '/:id',                        authorize('mentor','admin'), updateAssignment)
router.delete('/:id',                        authorize('mentor','admin'), deleteAssignment)
router.post(  '/:id/submit',                 authorize('student'),        submitAssignment)
router.get(   '/:id/submissions',            authorize('mentor','admin'), getSubmissions)
router.get(   '/:id/submissions/:studentId', authorize('mentor','admin'), getSubmission)
router.put(   '/:id/submissions/:studentId', authorize('mentor','admin'), gradeSubmission)
router.get('/:id/rankings', authorize('mentor','admin'), getRankings)
module.exports = router
