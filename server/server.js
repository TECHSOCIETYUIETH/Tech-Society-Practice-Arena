require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const rateLimit     = require('express-rate-limit');
const connectDB     = require('./config/db');
const authRoutes    = require('./routes/auth');
const errorHandler  = require('./middleware/errorHandler');
const questionRoutes = require('./routes/questions');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');



connectDB();

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());



// Basic rate limiter
app.use(rateLimit({ windowMs:15*60*1000, max:100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/assignments', submissionRoutes);




// Health check
app.get('/', (req, res) => res.json({ success:true, message:'API running' }));

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
