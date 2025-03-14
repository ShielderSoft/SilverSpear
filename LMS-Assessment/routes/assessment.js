const express = require('express');
const router = express.Router();
const { processAssessment } = require('../services/userService');

router.post('/', async (req, res) => {
  try {
    const { email, questions, correctResponses } = req.body;
    
    // Validate input payload.
    if (!email || !questions || questions.length !== 30 || typeof correctResponses !== 'number') {
      return res.status(400).json({ message: 'Please provide a valid email, exactly 30 questions, and the number of correct responses as a number.' });
    }
    
    // Determine the earliest start time and the latest end time.
    let earliest = new Date(questions[0].startTime);
    let latest = new Date(questions[0].endTime);
    for (const question of questions) {
      const start = new Date(question.startTime);
      const end = new Date(question.endTime);
      if (start < earliest) earliest = start;
      if (end > latest) latest = end;
    }
    
    const durationMinutes = (latest - earliest) / (1000 * 60);
    
    // Determine user status based on total duration.
    let status;
    if (durationMinutes < 30) {
      status = 'UFM'; // User must take the learning again.
    } else if (durationMinutes >= 30 && durationMinutes <= 60) {
      status = 'Reformed'; // User gets certified.
    } else {
      status = 'DNL'; // User is prompted to learn again.
    }
    
    // Call external service to update user status and number of correct responses.
    const updatedUser = await processAssessment(email, status, correctResponses);
    
    return res.status(200).json({
      durationMinutes,
      status,
      correctResponses,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error processing assessment:', error.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;