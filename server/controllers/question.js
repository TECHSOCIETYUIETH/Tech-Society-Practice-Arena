// controllers/question.js
const Question = require('../models/Question');

// @desc Create one or many questions
exports.createQuestion = async (req, res, next) => {
  try {
    let inserted;
    if (Array.isArray(req.body)) {
      // Bulk
      const payloads = req.body.map(item => ({
        ...item,
        tags: { ...item.tags, creator: req.user.id }
      }));
      inserted = await Question.insertMany(payloads);
    } else {
      // Single
      const payload = {
        ...req.body,
        tags: { ...req.body.tags, creator: req.user.id }
      };
      inserted = [ await Question.create(payload) ];
    }

    // Now re-query and populate creator
    const ids = inserted.map(q => q._id);
    const populated = await Question.find({ _id: { $in: ids } })
      .populate('tags.creator', 'name email');

    // Return one or many
    const data = Array.isArray(req.body) ? populated : populated[0];
    res.status(201).json({ success: true, data });

  } catch (err) {
    next(err);
  }
};

exports.getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find()
      .populate('tags.creator','name email');
      console.log(questions);
    res.json({ success:true, data:questions });
  } catch (err) {
    next(err);
  }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id)
      .populate('tags.creator','name email');
    if (!q) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data:q });
  } catch (err) {
    next(err);
  }
};

// @desc Update a question
// controllers/question.js
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success:false, message:'Question not found' });
    }

    // Merge top-level fields
    for (const key of Object.keys(req.body)) {
      if (key === 'tags') {
        // Merge nested tags (so we don't lose creator)
        for (const tagKey of Object.keys(req.body.tags)) {
          question.tags[tagKey] = req.body.tags[tagKey];
        }
      } else {
        question[key] = req.body[key];
      }
    }

    await question.save();  // will run validators
    res.json({ success:true, data: question });
  } catch (err) {
    next(err);
  }
};


// @desc Delete a question
exports.deleteQuestion = async (req, res, next) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, message:'Deleted' });
  } catch (err) {
    next(err);
  }
};
 