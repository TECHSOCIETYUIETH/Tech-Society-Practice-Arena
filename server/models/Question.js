// models/Question.js
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id:   { type: String, required: true },
  text: { type: String, required: true }
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  input:    { type: String, required: true },
  expected: { type: String, required: true }
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url:     { type: String, required: true },
  caption: { type: String }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq','msq','descriptive','image'],
    required: true
  },
  content:      { type: String, required: true },
  images:     [imageSchema],


  options: {
    type: [optionSchema],
    validate: {
      validator: function(arr) {
        // only require non-empty options when type is mcq or msq
        if (this.type === 'mcq' || this.type === 'msq') {
          return Array.isArray(arr) && arr.length >= 2 && arr.every(o => o.text && o.text.trim());
        }
        return true;
      },
      message: 'MCQ/MSQ questions must have at least two non-empty options'
    }
  },


  correctAnswers: {
    type: [String],
    validate: {
      validator: function(arr) {
        if (this.type === 'mcq') {
          return arr.length === 1;
        }
        if (this.type === 'msq') {
          return arr.length >= 1;
        }
        return true;
      },
      message: 'Invalid number of correct answers for question type'
    }
  },

  
  testCases:      [ testCaseSchema ],
  explanation:    { type: String },
  tags: {
    topics:    [ String ],
    difficulty:{ type: String, enum:['beginner','intermediate','advanced'], default:'beginner' },
    creator:   { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
