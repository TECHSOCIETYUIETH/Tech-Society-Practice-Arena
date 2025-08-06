// controllers/assignment.js
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission')

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




// controllers/assignment.js
// @desc Student “My Assignments”
// controllers/assignment.js
exports.getMyAssignments = async (req, res, next) => {
  try {
    const me = req.user.id
     const assigns = await Assignment.find({
    isDispatched: true,
    $or: [ { visibleToAll:true }, { visibleTo: me } ]
 })
      .select('title startDate dueDate mode timeLimitMinutes visibleToAll createdBy questions')  // include mode & timeLimit
      .populate('createdBy','name')
      .lean()

    const subs = await Submission.find({
      assignment: { $in: assigns.map(a => a._id) },
      student: me
    }).lean()

    const subMap = {}
    subs.forEach(s => subMap[s.assignment.toString()] = s)

    const now = new Date()
    const data = assigns.map(a => {
      const sub = subMap[a._id.toString()] || null

      let studentStatus
      if (!sub) {
        if (a.startDate && now < a.startDate) studentStatus = 'upcoming'
        else if (a.dueDate && now > a.dueDate) studentStatus = 'closed'
        else studentStatus = 'pending'
      } else {
        const hasManual = a.questions.some(q => q.type==='descriptive')
        studentStatus = hasManual && sub.isFinal===false 
          ? 'pendingReview'
          : 'completed'
      }

      return {
        _id: a._id,
        title: a.title,
        startDate: a.startDate,
        dueDate: a.dueDate,
        mode: a.mode,
        timeLimitMinutes: a.timeLimitMinutes,
        visibleToAll: a.visibleToAll,
        createdBy: a.createdBy,
        questionsCount: a.questions.length,
        studentStatus,
        mySubmission: sub
      }
    })

    res.json({ success:true, data })
  } catch(err) {
    next(err)
  }
}



// @desc Get single assignment (with same visibility check)
exports.getAssignment = async (req, res, next) => {
  try {


   const a = await Assignment.findById(req.params.id)
     .populate('questions')           // ← populate full question docs
      .populate('visibleTo','name email')
      .populate('createdBy','name email')
   if (!a) return res.status(404).json({ success:false, message:'Not found' })
   res.json({ success:true, data:a })
  } catch (err) {
    next(err)
  }
}

exports.getMySubmission = async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const studentId    = req.user.id;
    const sub = await Submission.findOne({
      assignment: assignmentId,
      student:    studentId
    });
    if (!sub) {
      return res
        .status(404)
        .json({ success: false, message: 'No submission found' });
    }
    res.json({ success: true, data: sub });
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


 

// @desc Student submits assignment

// @desc Student submits or saves draft
// controllers/assignment.js

// controllers/assignment.js
exports.submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const {
      answers = [],
      testCaseResults = [],
      isFinal = true,
      timeTakenMs = null
    } = req.body;

    // 1) Fetch the assignment and its questions
    const assignment = await Assignment.findById(id).populate('questions');
    if (!assignment) {
      return res.status(404).json({ success:false, message:'Assignment not found' });
    }

    // 2) Check visibility (public or explicitly granted)
    if (
      !assignment.visibleToAll &&
      !assignment.visibleTo.some(u => u.toString() === studentId)
    ) {
      return res.status(403).json({ success:false, message:'Forbidden' });
    }

    // 3) If this is a final submission AND there are no descriptive questions, auto-grade
    let grade = null;
    const hasManual = assignment.questions.some(q => q.type === 'descriptive');
    if (isFinal && !hasManual) {
      grade = assignment.questions.reduce((count, q) => {
        if (!['mcq','msq'].includes(q.type)) return count;
        const ans = answers.find(a => a.question.toString() === q._id.toString());
        if (!ans) return count;
        const resp = ans.response;
        const correct = q.type === 'mcq'
          ? q.correctAnswers.includes(resp)
          : Array.isArray(resp)
            && resp.length === q.correctAnswers.length
            && resp.every(r => q.correctAnswers.includes(r));
        return correct ? count + 1 : count;
      }, 0);
    }

    // 4) Upsert the submission (draft or final)
    const submission = await Submission.findOneAndUpdate(
      { assignment: id, student: studentId },
      {
        $set: {
          answers,
          testCaseResults,
          grade,
          isFinal,
          timeTakenMs,
          submittedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    return res.json({ success:true, data: submission });
  } catch (err) {
    next(err);
  }
};







// @desc Mentor/Admin: list all submissions
exports.getSubmissions = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id)
      .populate('submissions.student','name email');
    if (!a) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: a.submissions });
  } catch (err) {
    next(err);
  }
}

// @desc Mentor/Admin: get one student’s submission
exports.getSubmission = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id)
      .populate('submissions.student','name email');
    if (!a) return res.status(404).json({ success:false, message:'Not found' });

    const sub = a.submissions.find(
      s => s.student._id.toString() === req.params.studentId
    );
    if (!sub) {
      return res.status(404).json({ success:false, message:'Submission not found' });
    }
    res.json({ success:true, data: sub });
  } catch (err) {
    next(err);
  }
}



// @desc Mentor/Admin: grade a student’s submission
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    const { grade, feedback, answers: answerUpdates } = req.body;

    const a = await Assignment.findById(id);
    if (!a) return res.status(404).json({ success:false, message:'Assignment not found' });

    // Find submission index
    const idx = a.submissions.findIndex(s => s.student.toString() === studentId);
    if (idx < 0) return res.status(404).json({ success:false, message:'Submission not found' });

    // Update per-answer correctness if provided
    if (Array.isArray(answerUpdates)) {
      a.submissions[idx].answers = a.submissions[idx].answers.map(ansDoc => {
        const upd = answerUpdates.find(u => u.question === ansDoc.question.toString());
        if (upd && typeof upd.isCorrect === 'boolean') {
          ansDoc.isCorrect = upd.isCorrect;
        }
        return ansDoc;
      });
    }

    // Update grade & feedback
    if (typeof grade === 'number')     a.submissions[idx].grade    = grade;
    if (typeof feedback === 'string')  a.submissions[idx].feedback = feedback;

    await a.save();

    // Respond with the updated submission
    const updated = a.submissions[idx].toObject();
    res.json({ success:true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.getRankings = async (req, res, next) => {
  try {
    const { id } = req.params
    const subs = await Submission.find({ assignment: id, isFinal: true })
      .populate('student', 'name')
      .lean()

    // sort descending by grade
    subs.sort((a, b) => b.grade - a.grade)

    // assign ranks, tie = same rank, then skip
    let lastScore = null, lastRank = 0
    const rankings = subs.map((s, idx) => {
      if (s.grade !== lastScore) {
        lastRank = idx + 1
        lastScore = s.grade
      }
      return {
        student: s.student.name,
        grade: s.grade,
        rank: lastRank
      }
    })

    res.json({ success: true, data: rankings })
  } catch (err) {
    next(err)
  }
}


// @desc Dispatch an assignment/quiz/test so students can see+attempt it
exports.dispatchAssignment = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id)
    if (!a) return res.status(404).json({ success:false, message:'Not found' })

    a.isDispatched = true
    a.dispatchDate = new Date()
    await a.save()

    res.json({ success:true, data: a })
  } catch(err) {
    next(err)
  }
}



// controllers/assignment.js

// … your existing exports.createAssignment, getAssignments, etc.

// dispatch
exports.dispatchAssignment = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id)
    if (!a) return res.status(404).json({ success:false, message:'Not found' })
    a.isDispatched = true
    a.dispatchDate = new Date()
    await a.save()
    res.json({ success:true, data:a })
  } catch (err) { next(err) }
}

// pull back
exports.undispatchAssignment = async (req, res, next) => {
  try {
    const a = await Assignment.findById(req.params.id)
    if (!a) return res.status(404).json({ success:false, message:'Not found' })
    a.isDispatched = false
    a.dispatchDate = null
    await a.save()
    res.json({ success:true, data:a })
  } catch (err) { next(err) }
}
