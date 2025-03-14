const axios = require('axios');

// Update URL to use the VPS address and port
const USER_SERVICE_URL = 'http://82.112.238.250:9000';

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
    const updateResponse = await axios.post(`${USER_SERVICE_URL}/user/update-learning-status/${email}`, {
      status: status,
      correctResponses: correctResponses
    });
    
    return updateResponse.data;
  } catch (error) {
    console.error('Update error details:', error);
    throw new Error(`Error updating user: ${error.message}`);
  }
}

module.exports = {
  processAssessment
};