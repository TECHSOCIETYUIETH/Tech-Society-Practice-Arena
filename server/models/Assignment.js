const mongoose = require('mongoose');

// Sub‐document for each student’s submission
const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Question',
        required: true
      },
      response: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      isCorrect: Boolean
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: Number,
  feedback: String
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  questions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }
  ],

  visibleToAll: { type: Boolean, default: true },
  visibleTo: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],

 mode: {
  type: String,
  enum: ['assignment','quiz','test'],
  required: true,
  default: 'assignment'
},
startDate: Date,
dueDate:   Date,
timeLimitMinutes: Number,
status: { type: String, enum:['open','closed'], default:'open' },

  // **Embedded submissions**
  submissions: [ submissionSchema ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
