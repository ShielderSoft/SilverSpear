const express = require('express');
const router = express.Router();
const { 
  generateEmailTemplate,
  generateLandingPage,
  generatePhishingScenario
} = require('../services/aiService');

/**
 * Generate an email template based on a scenario
 * POST /ai/generate-email
 */
router.post('/generate-email', async (req, res) => {
  try {
    const scenarioData = req.body;
    
    if (!scenarioData.scenario) {
      return res.status(400).json({ 
        error: 'Scenario description is required' 
      });
    }
    
    const result = await generateEmailTemplate(scenarioData);
    res.json(result);
  } catch (error) {
    console.error('Error generating email template:', error);
    res.status(500).json({ 
      error: 'Failed to generate email template',
      details: error.message 
    });
  }
});

/**
 * Generate a landing page based on a scenario
 * POST /ai/generate-landing
 */
router.post('/generate-landing', async (req, res) => {
  try {
    const scenarioData = req.body;
    
    if (!scenarioData.scenario) {
      return res.status(400).json({ 
        error: 'Scenario description is required' 
      });
    }
    
    const result = await generateLandingPage(scenarioData);
    res.json(result);
  } catch (error) {
    console.error('Error generating landing page:', error);
    res.status(500).json({ 
      error: 'Failed to generate landing page',
      details: error.message 
    });
  }
});

/**
 * Generate both email and landing page for a complete phishing scenario
 * POST /ai/generate-scenario
 */
router.post('/generate-scenario', async (req, res) => {
  try {
    const scenarioData = req.body;
    
    if (!scenarioData.scenario) {
      return res.status(400).json({ 
        error: 'Scenario description is required' 
      });
    }
    
    const result = await generatePhishingScenario(scenarioData);
    res.json(result);
  } catch (error) {
    console.error('Error generating phishing scenario:', error);
    res.status(500).json({ 
      error: 'Failed to generate complete phishing scenario',
      details: error.message 
    });
  }
});

module.exports = router;