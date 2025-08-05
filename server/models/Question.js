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

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq','msq','descriptive','image'],
    required: true
  },
  content:      { type: String, required: true },
  imageUrl:     { type: String },
  imageCaption: { type: String },
  options:      [ optionSchema ],
  correctAnswers: [ String ],
  testCases:      [ testCaseSchema ],
  explanation:    { type: String },
  tags: {
    topics:    [ String ],
    difficulty:{ type: String, enum:['beginner','intermediate','advanced'], default:'beginner' },
    creator:   { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
