// controllers/assignment.js
const Assignment = require('../models/Assignment');

// @desc Create a new assignment
exports.createAssignment = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user.id
    };
    const assignment = await Assignment.create(data);
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

// @desc Get all assignments (filter for students)
exports.getAssignments = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter = {
        $or: [
          { visibleToAll: true },
          { visibleTo: req.user.id }
        ]
      };
    }
    const assignments = await Assignment.find(filter)
      .populate('questions','content type')
      .populate('createdBy','name email');
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
};

// @desc Get single assignment (with same visibility check)
exports.getAssignment = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id)
      .populate('questions','content type')
      .populate('createdBy','name email');
    if (!a) return res.status(404).json({ success:false, message:'Not found' });

    if (
      req.user.role === 'student' &&
      !a.visibleToAll &&
      !a.visibleTo.includes(req.user.id)
    ) {
      return res.status(403).json({ success:false, message:'Forbidden' });
    }

    res.json({ success: true, data: a });
  } catch (err) {
    next(err);
  }
};

// @desc Update an assignment
exports.updateAssignment = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ success:false, message:'Not found' });

    // merge updates
    for (const key of Object.keys(req.body)) {
      a[key] = req.body[key];
    }
    await a.save();
    res.json({ success:true, data: a });
  } catch (err) {
    next(err);
  }
};

// @desc Delete an assignment
exports.deleteAssignment = async (req, res, next) => {
  try {
    const a = await Assignment.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, message:'Deleted' });
  } catch (err) {
    next(err);
  }
};
