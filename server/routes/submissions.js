const router    = require('express').Router({ mergeParams: true });
const auth      = require('../middleware/auth');
const ctrl      = require('../controllers/submission');

// all routes require login
router.use(auth);

// submit (student)
router.post(   '/:id/submit',                  ctrl.submitAssignment);

// list & get (admin/mentor see all; student sees own)
router.get(    '/:id/submissions',             ctrl.getSubmissions);
router.get(    '/:id/submissions/:sid',        ctrl.getSubmission);

// PDF download
router.get(    '/:id/submissions/:sid/pdf',    ctrl.downloadSubmission);

module.exports = router;
