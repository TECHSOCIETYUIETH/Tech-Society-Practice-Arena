const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Question',
    required: true
  },
  answer: {
    // either a string (mcq) or array of strings (msq)
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isCorrect: { type: Boolean, required: true },
  score:     { type: Number,  required: true }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  assignment: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Assignment',
    required: true
  },
  student: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },
  answers:     [ answerSchema ],
  totalScore:  { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
