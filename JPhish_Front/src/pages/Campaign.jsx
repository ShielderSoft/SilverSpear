import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import apiClient from '../apiClient'
import { campaignApiClient, detailsTrackerApiClient } from '../apiClient'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { 
  FaEllipsisV,
  FaEnvelope, 
  FaFileAlt, 
  FaSave, 
  FaCheck, 
  FaEye, 
  FaTrashAlt, 
  FaPaperPlane, 
  FaRobot, 
  FaTimes
} from 'react-icons/fa'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const Campaign = () => {
  // Get selected data from Redux slices
  const selectedGroup = useSelector((state) => state.groups?.selectedGroup)
  const selectedEmailTemplate = useSelector((state) => state.templates?.emailTemplate)
  const selectedLandingTemplate = useSelector((state) => state.templates?.landingTemplate)
  const selectedSenderProfile = useSelector((state) => state.senderProfiles?.selectedProfile)

  // Modal visibility states
  const [isUseSelectedModalOpen, setIsUseSelectedModalOpen] = useState(false)
  const [isCreateNewModalOpen, setIsCreateNewModalOpen] = useState(false)
  const [reportData, setReportData] = useState([])
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  
  // Dropdown menu state
  const [openMenuId, setOpenMenuId] = useState(null)

  // State for new campaign modal (create new)
  const [newCampaignEmails, setNewCampaignEmails] = useState('')
  const [newCampaignSmtpHost, setNewCampaignSmtpHost] = useState('')
  const [newCampaignSmtpUsername, setNewCampaignSmtpUsername] = useState('')
  const [newCampaignSmtpPassword, setNewCampaignSmtpPassword] = useState('')
  const [newCampaignSmtpPort, setNewCampaignSmtpPort] = useState('')
  const [newCampaignEmailBody, setNewCampaignEmailBody] = useState('')
  const [newCampaignLandingLink, setNewCampaignLandingLink] = useState('')

  // State for campaigns
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaignResponses, setCampaignResponses] = useState([])
  const [loading, setLoading] = useState(false)

  // Count of total users in the selected campaign (placeholder)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedCampaignName, setSelectedCampaignName] = useState('')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])
  
  // Load campaigns automatically when the component mounts
  useEffect(() => {
    handleShowLastCampaign()
  }, [])

  // Fetch campaigns when "Show Last Campaign" is clicked
  const handleShowLastCampaign = async () => {
    try {
      setLoading(true)
      const response = await campaignApiClient.get('/api/campaigns/all')
      setCampaigns(Array.isArray(response.data) ? response.data : [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      alert('Failed to fetch campaigns')
      setLoading(false)
    }
  }

  // Handler for showing campaign details in the right part of the screen
  const handleShowCampaignDetails = async (campaign) => {
    try {
      setLoading(true)
      setSelectedCampaign(campaign)
      
      // Use the new endpoint that returns responses filtered by campaign ID
      const response = await detailsTrackerApiClient.get(`/api/responses/campaign/${campaign.id}`)
      
      console.log(`Fetched responses for campaign ${campaign.id}:`, response.data)
      
      // Get all responses for the campaign
      const allResponses = response.data;
      
      // Process responses to get unique interactions per user (both clicks and submissions)
      const uniqueResponses = getUniqueUserResponses(allResponses);
      
      // Set the processed responses
      setCampaignResponses(uniqueResponses);
      
      // Set totalUsers based on recipient emails
      if (Array.isArray(campaign.recipientEmails)) {
        setTotalUsers(campaign.recipientEmails.length)
      } else {
        console.warn(`campaign.recipientEmails is not defined or not an array for campaign ${campaign.id}`)
        setTotalUsers(0) // Set a default value
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching campaign details:', err)
      alert('Failed to fetch campaign details')
      setLoading(false)
    }
  }

  // Handler for "Use Selected" modal open
  const handleUseSelected = () => {
    if (
      !selectedGroup ||
      !selectedEmailTemplate ||
      !selectedLandingTemplate ||
      !selectedSenderProfile
    ) {
      alert(
        'Please select a User Group, Email Template, Landing Page Template, and Sender Profile first.'
      )
      return
    }
    setIsUseSelectedModalOpen(true)
  }

  // Handler for starting campaign using selected details
  const handleStartSelectedCampaign = async () => {
    if (!selectedCampaignName.trim()) {
      alert('Please provide a campaign name.');
      return;
    }
    const jwtToken = localStorage.getItem('jwtToken')
    const payload = {
      jwtToken,
      campaignName: selectedCampaignName,
      userGroupId: selectedGroup.id,
      emailTemplateId: selectedEmailTemplate.id,
      landingPageTemplateId: selectedLandingTemplate.id,
      profileId: selectedSenderProfile.id,
    }
    try {
      setLoading(true)
      await campaignApiClient.post('/api/campaigns/create_and_send', payload)
      alert('Campaign started successfully!')
      setIsUseSelectedModalOpen(false)
      setSelectedCampaignName('') // Reset campaign name after submission
      // Refresh the campaigns list
      handleShowLastCampaign()
      setLoading(false)
    } catch (err) {
      console.error('Error starting campaign:', err)
      alert('Failed to start campaign')
      setLoading(false)
    }
  }

  // Handler for creating new campaign from modal input
  const handleSendNewCampaign = async () => {
    const payload = {
      emails: newCampaignEmails.split(',').map((e) => e.trim()),
      smtpConfig: {
        host: newCampaignSmtpHost,
        username: newCampaignSmtpUsername,
        password: newCampaignSmtpPassword,
        port: newCampaignSmtpPort,
      },
      emailBody: newCampaignEmailBody,
      landingPageLink: newCampaignLandingLink,
    }
    try {
      setLoading(true)
      await campaignApiClient.post('/api/campaigns/send/single', payload)
      alert('Campaign created and emails sent successfully!')
      setIsCreateNewModalOpen(false)
      // Refresh campaigns list
      handleShowLastCampaign()
      setLoading(false)
    } catch (err) {
      console.error('Error sending campaign:', err)
      alert('Failed to send campaign')
      setLoading(false)
    }
  }

  // Handler for deleting a campaign
  const handleDeleteCampaign = async (campaignId) => {
    try {
      setLoading(true)
      await campaignApiClient.delete(`/api/campaigns/${campaignId}`)
      alert('Campaign deleted successfully!')
      setCampaigns(campaigns.filter((c) => c.id !== campaignId))
      if (selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign(null)
        setCampaignResponses([])
      }
      setLoading(false)
    } catch (err) {
      console.error('Error deleting campaign:', err)
      alert('Failed to delete campaign')
      setLoading(false)
    }
  }

  const handleMarkCampaignCompleted = async (campaignId) => {
    try {
      setLoading(true)
      await campaignApiClient.put(`/api/campaigns/${campaignId}/status?status=completed`)      
      alert('Campaign marked as completed!')
      
      // Update the campaign in the local state to show it's completed
      setCampaigns(campaigns.map(c => 
        c.id === campaignId ? {...c, status: 'completed'} : c
      ))
      
      // If this is the currently selected campaign, update that too
      if (selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign({...selectedCampaign, status: 'completed'})
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error marking campaign as completed:', err)
      alert('Failed to mark campaign as completed')
      setLoading(false)
    }
  }

  const getUniqueUserResponses = (responses) => {
    // Group responses by user_id and interaction type
    const userResponseMap = responses.reduce((acc, response) => {
      const userId = response.user_id;
      // Determine if this is a click-only or data submission interaction
      const interactionType = response.response_text ? 'submission' : 'click';
      
      // Create nested structure if it doesn't exist
      if (!acc[userId]) {
        acc[userId] = {};
      }
      
      // If this type of interaction isn't recorded yet for this user, or if this one is newer
      if (!acc[userId][interactionType] || 
          new Date(response.created_at) > new Date(acc[userId][interactionType].created_at)) {
        acc[userId][interactionType] = response;
      }
      
      return acc;
    }, {});
    
    // Flatten the map into an array of responses
    const uniqueResponses = [];
    Object.values(userResponseMap).forEach(userInteractions => {
      // Add click interaction if exists
      if (userInteractions.click) {
        uniqueResponses.push(userInteractions.click);
      }
      // Add submission interaction if exists
      if (userInteractions.submission) {
        uniqueResponses.push(userInteractions.submission);
      }
    });
    
    return uniqueResponses;
  }
  
  // Generate chart data for Details Shared
  // Generate chart data for Emails Clicked
const getEmailsClickedChartData = () => {
  if (!selectedCampaign) return null
  
  // Count unique users who clicked
  const uniqueUserIds = new Set();
  campaignResponses.forEach(response => {
    uniqueUserIds.add(response.user_id);
  });
  
  const uniqueClickCount = uniqueUserIds.size;
  const notClickedEmails = totalUsers - uniqueClickCount;
  
  return {
    labels: ['Clicked', 'Not Clicked'],
    datasets: [
      {
        data: [uniqueClickCount, notClickedEmails],
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(177, 177, 177, 0.8)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(211, 211, 211, 1)'],
        borderWidth: 1,
      },
    ],
  }
}

// Generate chart data for Details Shared
const getDetailsSharedChartData = () => {
  if (!selectedCampaign) return null
  
  // Track unique users who shared details
  const uniqueUserIdsWithDetails = new Set();
  
  campaignResponses.forEach(response => {
    if (response.response_text) {
      uniqueUserIdsWithDetails.add(response.user_id);
    }
  });
  
  const detailsShared = uniqueUserIdsWithDetails.size;
  const noDetails = totalUsers - detailsShared;
  
  return {
    labels: ['Details Shared', 'No Details'],
    datasets: [
      {
        data: [detailsShared, noDetails],
        backgroundColor: ['rgba(226, 32, 32, 0.8)', 'rgba(177, 177, 177, 0.8)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(211, 211, 211, 1)'],
        borderWidth: 1,
      },
    ],
  }
}
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  }

  // Toggle dropdown menu
  const toggleMenu = (e, id) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === id ? null : id)
  }

  return (
    <div className="p-8 text-black">
      <h1 className="text-3xl font-bold text-[#000080] mb-6">Campaign Management</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={handleUseSelected}
          className="border-2 border-[#000080] text-[#000080] hover:bg-blue-200 py-2 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Use Selected
        </button>
        <button
          onClick={() => setIsCreateNewModalOpen(true)}
          className="border-2 border-[#000080] text-[#000080] hover:bg-blue-200 py-2 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Create New Campaign
        </button>
        {/* "Show Campaigns" button removed as campaigns now load automatically */}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000080] mx-auto"></div>
            <p className="mt-2 text-center text-[#000080]">Loading...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Campaigns Table */}
        <div className="w-full lg:w-1/2">
          <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#000080] mb-4">Available Campaigns</h2>
            
            {campaigns.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No campaigns found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} 
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedCampaign?.id === campaign.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleShowCampaignDetails(campaign)}>
                        <td className="px-6 py-4 whitespace-nowrap">#{campaign.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{campaign.name}
                        {campaign.status === 'completed' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center relative">
                          <button 
                            onClick={(e) => toggleMenu(e, campaign.id)}
                            className="text-gray-500 hover:text-gray-800 focus:outline-none"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown menu */}
                          {openMenuId === campaign.id && (
                            <div className="fixed mt-2 right-auto bg-gray-100 rounded-md shadow-lg py-1 z-50" 
                                style={{ 
                                  minWidth: "140px", 
                                  top: "auto", 
                                  left: `${window.innerWidth <= 640 ? '50%' : 'auto'}`,
                                  transform: `${window.innerWidth <= 640 ? 'translateX(-50%)' : 'none'}`
                                }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleShowCampaignDetails(campaign)
                                  setOpenMenuId(null)
                                }}
                                className="block px-4 py-2 text-sm text-black hover:bg-gray-200 w-full text-left"
                              >
                                <FaEye className="inline mr-2" /> View
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteCampaign(campaign.id)
                                  setOpenMenuId(null)
                                }}
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-200 w-full text-left"
                              >
                                <FaTrashAlt className="inline mr-2" /> Delete
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkCampaignCompleted(campaign.id)
                                  setOpenMenuId(null)
                                }}
                                className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-200 w-full text-left"
                              >
                                <FaCheck className="inline mr-2" /> Mark Completed
                              </button>
                              <button
                                onClick={() => navigate(`/report/${campaign.id}`)}
                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaFileAlt className="mr-2 text-blue-600" />
                                Get Report
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Campaign Details */}
        <div className="w-full lg:w-1/2">
          <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md h-full">
            {selectedCampaign ? (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-bold text-[#000080]">
                    Campaign Details: {selectedCampaign.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">ID: {selectedCampaign.id}</p>
                </div>
                
                {/* Statistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Emails Clicked Chart */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-md font-semibold text-[#000080] mb-2">Emails Clicked</h3>
                    <div className="h-64">
                      {getEmailsClickedChartData() && (
                        <Pie data={getEmailsClickedChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>
                  
                  {/* Details Shared Chart */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="text-md font-semibold text-[#000080] mb-2">Details Shared</h3>
                    <div className="h-64">
                      {getDetailsSharedChartData() && (
                        <Pie data={getDetailsSharedChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Response Data Table */}
                <div>
                  <h3 className="text-md font-semibold text-[#000080] mb-2">User Responses</h3>
                  
                  {campaignResponses.length === 0 ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-600">
                      No response data available for this campaign.
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {campaignResponses.map((response) => (
                            <tr key={response.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                {response.user_id}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                {response.ip_address.replace('::ffff:', '')}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                                {response.response_text || 'No data entered'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                {new Date(response.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center p-8">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-lg">Select a campaign to view details</p>
                  <p className="text-sm">Campaign statistics and response data will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Use Selected Modal */}
      {isUseSelectedModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsUseSelectedModalOpen(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-10 max-w-3xl mx-4 p-6 text-black">
            <h2 className="text-2xl font-bold text-[#000080] mb-4">Use Selected Details</h2>
             <div className="mb-4">
                <label className="block mb-1 font-medium text-[#000080]">
                  <span className="flex items-center gap-2">
                   Campaign Name:
                  </span>
                </label>
                <input
                  type="text"
                  value={selectedCampaignName}
                  onChange={(e) => setSelectedCampaignName(e.target.value)}
                  placeholder="Enter campaign name..."
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            <p>
              <strong>User Group:</strong>{' '}
              {selectedGroup?.groupName || 'Not selected'}
            </p>
            <p>
              <strong>Email Template:</strong>{' '}
              {selectedEmailTemplate?.name || 'Not selected'}
            </p>
            <p>
              <strong>Landing Page Template:</strong>{' '}
              {selectedLandingTemplate?.name || 'Not selected'}
            </p>
            <p>
              <strong>Sender Profile:</strong>{' '}
              {selectedSenderProfile?.profileName || 'Not selected'}
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleStartSelectedCampaign}
                className="border-2 border-[#000080] text-[#000080] hover:bg-[#5be55b] py-2 px-4 rounded-lg font-bold transition-colors"
              >
                <FaPaperPlane />
              </button>
              <button
                onClick={() => setIsUseSelectedModalOpen(false)}
                className="border-2 border-red-700 text-red-700  hover:bg-red-300 py-2 px-4 rounded-lg font-bold transition-colors"
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Campaign Modal */}
      {isCreateNewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsCreateNewModalOpen(false)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-10 max-w-3xl mx-4 p-6 text-black">
            <h2 className="text-2xl font-bold text-[#000080] mb-4">Create New Campaign</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">
                  Emails (comma separated):
                </label>
                <input
                  type="text"
                  value={newCampaignEmails}
                  onChange={(e) => setNewCampaignEmails(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">SMTP Host:</label>
                <input
                  type="text"
                  value={newCampaignSmtpHost}
                  onChange={(e) => setNewCampaignSmtpHost(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">SMTP Username:</label>
                  <input
                    type="text"
                    value={newCampaignSmtpUsername}
                    onChange={(e) => setNewCampaignSmtpUsername(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">SMTP Password:</label>
                  <input
                    type="password"
                    value={newCampaignSmtpPassword}
                    onChange={(e) => setNewCampaignSmtpPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">SMTP Port:</label>
                <input
                  type="number"
                  value={newCampaignSmtpPort}
                  onChange={(e) => setNewCampaignSmtpPort(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email Body:</label>
                <textarea
                  value={newCampaignEmailBody}
                  onChange={(e) => setNewCampaignEmailBody(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Landing Page Link:
                </label>
                <input
                  type="url"
                  value={newCampaignLandingLink}
                  onChange={(e) => setNewCampaignLandingLink(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleSendNewCampaign}
                  className="border-2 border-[#000080] text-[#000080] bg-green-200 hover:bg-[#5be55b] py-2 px-4 rounded-lg font-bold transition-colors"
                >
                  <FaPaperPlane />
                </button>
                <button
                  onClick={() => setIsCreateNewModalOpen(false)}
                  className="border-2 border-red-700 text-red-700 bg-red-100 hover:bg-red-200 py-2 px-4 rounded-lg font-bold transition-colors"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Campaign