


// controllers/user.js
const User       = require('../models/User')
const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')

// GET /api/users/:id
exports.getStudentProfile = async (req, res, next) => {
  try {
    const studentId = req.params.id

    // Basic user info
    const user = await User.findById(studentId)
      .select('name email branch year')
      .lean()
    if (!user) return res.status(404).json({ success:false, message:'Not found' })

    // Completed submissions
    const completedSubs = await Submission.find({
      student: studentId,
      isFinal: true
    })
    .populate('assignment','title')
    .lean()

    // Ongoing assignments (visible + not submitted final)
    const allVisible = await Assignment.find({
      $or: [
        { visibleToAll: true },
        { visibleTo: studentId }
      ],
      isDispatched: true
    })
    .select('title dueDate')
    .lean()
    const doneIds = completedSubs.map(s => s.assignment._id.toString())
    const ongoing = allVisible.filter(a => !doneIds.includes(a._id.toString()))

    res.json({
      success: true,
      data: {
        ...user,
        submissions: completedSubs.map(s => ({
          _id: s._id,
          assignmentTitle: s.assignment.title,
          grade: s.grade,
          submittedAt: s.submittedAt
        })),
        ongoing: ongoing.map(a => ({
          _id: a._id,
          title: a.title,
          dueDate: a.dueDate
        }))
      }
    })
  } catch(err){
    next(err)
  }
}

// rename this one from getUsers → getAllUsers
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email role')    // pick whichever fields you want
      .lean();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};


exports.getUsersByRole = async (req, res, next) => {
    console.log("here to search userbbyrole");
  try {
    const role = req.query.role;
    // 1) fetch basic users
    const users = await User.find({ role }).lean();
    console.log("founded  users", users);

    // 2) fetch submission counts for these users
    const counts = await Submission.aggregate([
      { $match: { student: { $in: users.map(u => u._id) }, isFinal: true } },
      { $group: { _id: '$student', completed: { $sum: 1 } } }
    ]);

    const countMap = new Map(counts.map(c => [c._id.toString(), c.completed]));

    // 3) merge into user objects
    const withCounts = users.map(u => ({
      ...u,
      completedAssignments: countMap.get(u._id.toString()) || 0
    }));

    res.json({ success: true, data: withCounts });
  } catch (err) {
    next(err);
  }
};
