const pool = require('./db');

/**
 * Log a new response when a user clicks a phishing link
 */
const logLinkClick = async (campaignId, userId, landingPageId, ip) => {
  try {
    const result = await pool.query(
      `INSERT INTO responses (campaign_id, user_id, landing_page_id, ip_address)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [campaignId, userId, landingPageId, ip]
    );
    console.log(`Recorded link click with response ID: ${result.rows[0].id}`);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error logging link click:', error);
    throw error;
  }
};

/**
 * Get all responses
 */
const getAllResponses = async () => {
  try {
    const result = await pool.query('SELECT * FROM responses ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching all responses:', error);
    throw error;
  }
};

/**
 * Get responses for a specific campaign
 */
const getResponsesByCampaign = async (campaignId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM responses WHERE campaign_id = $1 ORDER BY created_at DESC',
      [campaignId]
    );
    return result.rows;
  } catch (error) {
    console.error(`Error fetching responses for campaign ${campaignId}:`, error);
    throw error;
  }
};

/**
 * Update a response with form submission data
 */
const updateResponseWithFormData = async (ip, responseText) => {
  try {
    // Find the most recent response for this IP
    const findResult = await pool.query(
      `SELECT id FROM responses 
       WHERE ip_address = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [ip]
    );
    
    if (findResult.rows.length === 0) {
      console.log(`No responses found for IP ${ip}`);
      return null;
    }
    
    const responseId = findResult.rows[0].id;
    
    // Update the response with the form data
    const updateResult = await pool.query(
      `UPDATE responses 
       SET response_text = $1 
       WHERE id = $2
       RETURNING id`,
      [responseText, responseId]
    );
    
    console.log(`Updated response ID: ${updateResult.rows[0].id}`);
    return updateResult.rows[0].id;
  } catch (error) {
    console.error('Error updating response with form data:', error);
    throw error;
  }
};

module.exports = {
  logLinkClick,
  getAllResponses,
  getResponsesByCampaign,
  updateResponseWithFormData
};