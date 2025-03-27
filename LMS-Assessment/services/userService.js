const axios = require('axios');

// Update URL to use the VPS address and port
const USER_SERVICE_URL = 'http://147.93.30.128:9000';

/**
 * Update user's learning status with the number of correct responses.
 *
 * @param {string} email - The user's email address.
 * @param {string} status - The new status to set (UFM, Reformed, or DNL).
 * @param {number} correctResponses - The number of correct responses provided by the user.
 * @returns {object} The updated user data.
 */
async function processAssessment(email, status, correctResponses) {
  // Update the user's status and number of correct responses using the correct endpoint
  try {
    console.log(`Attempting to update learning status for ${email} with status: ${status}`);
    const updateResponse = await axios.post(`${USER_SERVICE_URL}/user/update-learning-status/${email}`, {
      status: status,
      correctResponses: correctResponses
    },{
      timeout: 10000, // Add a timeout
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  console.log('Update successful:', updateResponse.data);
    return updateResponse.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Update error details:', error.message);
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Server response data:', error.response.data);
      console.error('Server response status:', error.response.status);
      console.error('Server response headers:', error.response.headers);
    }
    
    // Instead of letting the error bubble up and cause a 500,
    // return a formatted error object that the calling code can handle
    return {
      success: false,
      error: error.message,
      details: error.response?.data || 'No detailed error information available'
    };
  }
}

module.exports = {
  processAssessment
};