// controllers/stats.js
const User       = require('../models/User')
const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')

exports.getDashboardStats = async (req, res, next) => {
  try {
    // Only for mentor/admin
    if (!['mentor','admin'].includes(req.user.role))
      return res.status(403).json({ success:false })

    // 1) Global counts
    const [ totalStudents, totalAssignments, totalQuizzes, totalTests ] = await Promise.all([
      User.countDocuments({ role:'student' }),
      Assignment.countDocuments({ mode:'assignment' }),
      Assignment.countDocuments({ mode:'quiz' }),
      Assignment.countDocuments({ mode:'test' }),
    ])

    // 2) Dispatched vs drafts per mode
    const dispatched = await Assignment.aggregate([
      { $group: {
          _id: '$mode',
          dispatched: { $sum: { $cond: ['$isDispatched',1,0] } },
          drafts:      { $sum: { $cond: ['$isDispatched',0,1] } }
      }}
    ])
    // 3) Leaderboards: for quizzes/tests sort by grade desc
   // 3) Leaderboards: for quizzes/tests sort by grade desc, include student info
const leaderboard = await Submission.aggregate([
  // only submissions with a grade
  { $match: { grade: { $ne: null } } },

  // join in assignment details
  { $lookup: {
      from: 'assignments',
      localField: 'assignment',
      foreignField: '_id',
      as: 'assignment'
  }},
  { $unwind: '$assignment' },

  // only quizzes & tests
  { $match: { 'assignment.mode': { $in: ['quiz','test'] } } },

  // join in student document
  { $lookup: {
      from: 'users',
      localField: 'student',
      foreignField: '_id',
      as: 'student'
  }},
  { $unwind: '$student' },

  // group by assignment, accumulating student + grade pairs
  { $group: {
      _id: '$assignment._id',
      title: { $first: '$assignment.title' },
      scores: { 
        $push: {
          student: {
            _id:   '$student._id',
            name:  '$student.name',
            email: '$student.email'   // or whatever fields you want
          },
          grade: '$grade'
        }
      }
  }},

  // sort each scores array descending and take top 5
  { $project: {
      title: 1,
      leaderboard: {
        $slice: [
          { $sortArray: { input: '$scores', sortBy: { grade: -1 } } },
          5
        ]
      }
  }}
])


    return res.json({
      success:true,
      data: { totalStudents, totalAssignments, totalQuizzes, totalTests, dispatched, leaderboard }
    })
  } catch(err){ next(err) }
}



exports.getStats = async (req, res, next) => {
  try {
    // counts by role
    const [totalStudents, totalMentors] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' })
    ]);

    // assignments / quizzes / tests
    const [totalAssignments, totalQuizzes, totalTests] = await Promise.all([
      Assignment.countDocuments({ mode: 'assignment', isDispatched: true }),
      Assignment.countDocuments({ mode: 'quiz',       isDispatched: true }),
      Assignment.countDocuments({ mode: 'test',       isDispatched: true })
    ]);

    // ongoing (dispatched & not yet due or not yet submitted)
    const now = new Date();
    const [ongoingAssignments, ongoingQuizzes, ongoingTests] = await Promise.all([
      Assignment.countDocuments({ mode:'assignment', isDispatched:true, dueDate:{ $gt: now } }),
      Assignment.countDocuments({ mode:'quiz',       isDispatched:true, dueDate:{ $gt: now } }),
      Assignment.countDocuments({ mode:'test',       isDispatched:true, dueDate:{ $gt: now } })
    ]);

    // submissions reviewed vs pending manual
    const totalSubs      = await Submission.countDocuments({ isFinal: true });
    const pendingReview  = await Submission.countDocuments({
      isFinal: true,
      feedback: null,
      'answers.isCorrect': { $exists: false } // or however you mark manual
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalMentors,
        totalAssignments,
        totalQuizzes,
        totalTests,
        ongoingAssignments,
        ongoingQuizzes,
        ongoingTests,
        totalSubs,
        pendingReview
      }
    });
  } catch (err) {
    next(err);
  }
};
