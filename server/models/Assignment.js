// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: true,
    trim:     true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Question',
      required: true
    }
  ],
  visibleToAll: {
    type:    Boolean,
    default: true
  },
  visibleTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User'
    }
  ],
  createdBy: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
