const express = require('express');
const bodyParser = require('body-parser');
const assessmentRoutes = require('./routes/assessment.js');
const aiRoutes = require('./routes/ai.js');
const cors = require('cors')

const app = express();

app.use(cors());

// Middleware to parse JSON request bodies.
app.use(bodyParser.json());

// Mount the assessment route.
app.use('/assessment', assessmentRoutes);
app.use('/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'LMS-Assessment',
    aiService: 'online' 
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});