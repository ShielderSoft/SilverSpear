const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get a response from Gemini AI
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The response text
 */
async function getGeminiResponse(prompt) {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting response from Gemini:', error);
    throw new Error('Failed to get AI response: ' + error.message);
  }
}

/**
 * Generate an email template based on a phishing scenario
 * @param {Object} scenarioData - The scenario data
 * @returns {Promise<Object>} - The generated email template and explanation
 */
async function generateEmailTemplate(scenarioData) {
  const prompt = `
You are an expert in creating realistic phishing email templates for security awareness training.

SCENARIO:
${scenarioData.scenario}

TARGET AUDIENCE:
${scenarioData.audience || 'General corporate employees'}

COMPANY/BRAND TO IMPERSONATE:
${scenarioData.brandToImpersonate || 'Not specified'}

DESIRED ACTION (what should the recipient do):
${scenarioData.desiredAction || 'Click a link'}

URGENCY LEVEL (1-5):
${scenarioData.urgencyLevel || '3'}

CONSTRAINTS:
- This is ONLY for authorized security training purposes
- The template must be realistic enough to test security awareness
- Include inline CSS (no external stylesheets)
- Include any necessary JavaScript inline
- Make the email look legitimate but include subtle phishing indicators

DELIVERABLE:
1. First provide a brief explanation of the approach and what phishing tactics are being employed
2. Then provide a complete HTML email template that can be directly used

FORMAT THE OUTPUT AS FOLLOWS:

## Explanation
[Your explanation here]

## Email Template HTML
\`\`\`html
[Complete HTML with inline CSS]
\`\`\`
`;

  const response = await getGeminiResponse(prompt);
  
  // Parse the response to separate explanation from HTML
  const explanationMatch = response.match(/## Explanation\s+([\s\S]*?)(?=##)/);
  const htmlMatch = response.match(/```html\s+([\s\S]*?)```/);
  
  return {
    explanation: explanationMatch ? explanationMatch[1].trim() : "No explanation provided",
    html: htmlMatch ? htmlMatch[1].trim() : "No HTML template generated",
  };
}

/**
 * Generate a landing page based on a phishing scenario
 * @param {Object} scenarioData - The scenario data
 * @returns {Promise<Object>} - The generated landing page and explanation
 */
async function generateLandingPage(scenarioData) {
  const prompt = `
You are an expert in creating realistic phishing landing pages for security awareness training.

SCENARIO:
${scenarioData.scenario}

TARGET AUDIENCE:
${scenarioData.audience || 'General corporate employees'}

COMPANY/BRAND TO IMPERSONATE:
${scenarioData.brandToImpersonate || 'Not specified'}

DESIRED ACTION (what should the visitor do):
${scenarioData.desiredAction || 'Enter credentials'}

PAGE TYPE:
${scenarioData.pageType || 'Login page'}

CONSTRAINTS:
- This is ONLY for authorized security training purposes
- The page must be realistic enough to test security awareness
- Include inline CSS (no external stylesheets)
- Include any necessary JavaScript inline (form validation, etc.)
- Make the page look legitimate but include subtle phishing indicators
- The page should be a single HTML file with everything embedded

DELIVERABLE:
1. First provide a brief explanation of the approach and what phishing tactics are being employed
2. Then provide a complete HTML landing page that can be directly used

FORMAT THE OUTPUT AS FOLLOWS:

## Explanation
[Your explanation here]

## Landing Page HTML
\`\`\`html
[Complete HTML with inline CSS and JS]
\`\`\`
`;

  const response = await getGeminiResponse(prompt);
  
  // Parse the response to separate explanation from HTML
  const explanationMatch = response.match(/## Explanation\s+([\s\S]*?)(?=##)/);
  const htmlMatch = response.match(/```html\s+([\s\S]*?)```/);
  
  return {
    explanation: explanationMatch ? explanationMatch[1].trim() : "No explanation provided",
    html: htmlMatch ? htmlMatch[1].trim() : "No HTML landing page generated",
  };
}

/**
 * Generate both email template and landing page for a complete phishing simulation
 * @param {Object} scenarioData - The scenario data
 * @returns {Promise<Object>} - Both templates and explanations
 */
async function generatePhishingScenario(scenarioData) {
  try {
    // Generate both components in parallel
    const [emailResult, landingPageResult] = await Promise.all([
      generateEmailTemplate(scenarioData),
      generateLandingPage(scenarioData)
    ]);
    
    return {
      email: emailResult,
      landingPage: landingPageResult
    };
  } catch (error) {
    console.error('Error generating phishing scenario:', error);
    throw new Error('Failed to generate complete phishing scenario');
  }
}

module.exports = {
  getGeminiResponse,
  generateEmailTemplate,
  generateLandingPage,
  generatePhishingScenario
};