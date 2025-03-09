import React, { useState, useEffect, useRef } from 'react';
import { FaChartLine, FaEnvelope, FaGraduationCap, FaUserFriends, FaBullseye, FaCalendarAlt, FaInfoCircle, FaMousePointer, FaKeyboard } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [hoveredCampaign, setHoveredCampaign] = useState(null);
  
  // State for API data
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch campaign, user, and response data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campaignsResponse, usersResponse, responsesResponse] = await Promise.all([
          axios.get('http://82.112.238.250:8000/api/campaigns/all'),
          axios.get('http://82.112.238.250:9000/user/all'),
          axios.get('http://82.112.238.250:3000/api/responses')
        ]);
        
        setCampaigns(campaignsResponse.data);
        setUsers(usersResponse.data);
        setResponses(responsesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update date and time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Trigger chart animation after component mounts
    const timer = setTimeout(() => {
      setIsChartVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate metrics from real data
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(campaign => campaign.status !== 'completed').length || totalCampaigns;
  const totalUsers = users.length;
  
  // Static emails sent count as requested
  const totalEmailsSent = users.length;

  // Calculate user metrics
  const feedbackUsers = users.filter(user => user.feedbackTaken).length;
  const reformedUsersPercentage = totalUsers > 0 ? Math.round((feedbackUsers / totalUsers) * 100) : 87;
  const reformedUsersCount = feedbackUsers || Math.round(totalUsers * (reformedUsersPercentage/100));
  const inProgressCount = totalUsers - reformedUsersCount;
  
  const getUniqueUserInteractionsByCampaign = (responses) => {
    const uniqueUserCampaignMap = {};
    
    // First sort responses by date (newest first) to ensure we process recent interactions first
    const sortedResponses = [...responses].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    // Process each response
    sortedResponses.forEach(response => {
      const campaignId = response.campaign_id;
      const userId = response.user_id;
      const hasData = !!response.response_text;
      
      // Initialize campaign entry if it doesn't exist
      if (!uniqueUserCampaignMap[campaignId]) {
        uniqueUserCampaignMap[campaignId] = {
          userClicks: new Set(),
          userDataSubmissions: new Set()
        };
      }
      
      // Add user to the appropriate sets
      uniqueUserCampaignMap[campaignId].userClicks.add(userId);
      
      // Add to data submissions if the response has text
      if (hasData) {
        uniqueUserCampaignMap[campaignId].userDataSubmissions.add(userId);
      }
    });
    
    // Convert to the format used by campaignStats
    const result = {};
    Object.entries(uniqueUserCampaignMap).forEach(([campaignId, data]) => {
      result[campaignId] = {
        clickCount: data.userClicks.size,
        dataCount: data.userDataSubmissions.size
      };
    });
    
    return result;
  };


  // Group responses by campaign_id to track both clicks and data submissions
  const campaignStats = getUniqueUserInteractionsByCampaign(responses);
  
  // Transform campaign data for table display with actual response rates
  const allCampaignData = campaigns.map(campaign => {
    const recipientCount = campaign.recipientEmails?.length || 0;
    const stats = campaignStats[campaign.id] || { clickCount: 0, dataCount: 0 };
    
    // Calculate progress as ratio of responses to recipients
    const clickProgress = recipientCount > 0 
      ? Math.round((stats.clickCount / recipientCount) * 100)
      : 0;

    const dataProgress = recipientCount > 0 
      ? Math.round((stats.dataCount / recipientCount) * 100)
      : 0;
    
    // Calculate submission ratio for combined progress bar
    const submissionRatio = stats.clickCount > 0 
      ? Math.round((stats.dataCount / stats.clickCount) * 100)
      : 0;
    
    return {
      id: campaign.id,
      name: campaign.name || 'Unnamed Campaign',
      userCount: recipientCount,
      clickCount: stats.clickCount,
      dataCount: stats.dataCount,
      emailSentDomain: campaign.landingPageLink?.split('//')[1]?.split(':')[0] || 'No domain',
      status: campaign.status || 'Active',
      clickProgress: clickProgress,
      dataProgress: dataProgress,
      submissionRatio: submissionRatio
    };
  });
  
  // Filter table data to only include campaigns with interactions
  const tableData = allCampaignData
    .filter(campaign => campaign.clickCount > 0)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 max-w-full flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000080] mx-auto"></div>
          <p className="mt-2 text-[#000080]">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-full flex items-center justify-center min-h-[80vh]">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-full">
      {/* Header Section with Welcome and Date */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#000080]">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, Administrator</p>
          </div>
          <div className="text-right text-gray-600">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              <span>{currentDate}</span>
            </div>
            <div>{currentTime}</div>
          </div>
        </div>
      </div>

      {/* Overview Section - Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md border-l-4 border-blue-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaChartLine className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <div className="text-gray-500 text-sm">Active Campaigns</div>
              <div className="text-2xl font-semibold text-[#000080]">{activeCampaigns}</div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md border-l-4 border-green-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaEnvelope className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <div className="text-gray-500 text-sm">Emails Sent</div>
              <div className="text-2xl font-semibold text-[#000080]">{totalEmailsSent}</div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md border-l-4 border-purple-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaGraduationCap className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <div className="text-gray-500 text-sm">Emails opened</div>
              <div className="text-2xl font-semibold text-[#000080]">{inProgressCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md border-l-4 border-amber-400 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-full">
              <FaUserFriends className="text-amber-600 text-xl" />
            </div>
            <div className="ml-4">
              <div className="text-gray-500 text-sm">Total Users</div>
              <div className="text-2xl font-semibold text-[#000080]">{totalUsers}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Campaign Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Campaign Progress Overview - With Combined Progress Bar */}
        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md col-span-2">
          <h2 className="text-xl font-bold text-[#000080] mb-4 flex items-center">
            <FaBullseye className="mr-2" /> Campaign Stats (Engagement Analysis)
          </h2>
          
          <div className="flex items-center mb-4 gap-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Clicked Only</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Data Submitted</span>
            </div>
          </div>
          
          {tableData.length > 0 ? (
            <div className="space-y-4">
              {tableData.map((campaign) => (
                <div key={campaign.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{campaign.name}</span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      {campaign.status}
                    </span>
                  </div>
                  
                  {/* Combined Progress Bar for Clicks and Submissions */}
                  <div className="mb-3">
                    <div className="flex items-center mb-1 justify-between">
                      <div className="flex items-center">
                        <FaMousePointer className="text-blue-500 mr-2 text-sm" />
                        <span className="text-xs text-gray-500">Engagement</span>
                      </div>
                      <div className="flex items-center">
                        <FaKeyboard className="text-red-500 mr-2 text-sm" />
                        <span className="text-xs text-gray-500">Submissions</span>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full relative overflow-hidden">
                      {/* Blue layer for clicks - always fills the bar */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: '100%' }}
                      ></div>
                      
                      {/* Red layer for submissions - overlay on top of blue */}
                      <div 
                        className="absolute top-0 left-0 h-full bg-red-500 rounded-full transition-all duration-500"
                        style={{ width: `${campaign.submissionRatio}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{campaign.clickCount} clicks / {campaign.dataCount} submissions</span>
                      <span>{campaign.submissionRatio}% conversion rate</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg text-center">
              <p className="text-gray-500">No campaigns with clicks found</p>
            </div>
          )}
        </div>

        {/* Reformed Users */}
        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-[#000080] mb-4">Reformed Users</h2>
          
          <div className="space-y-5">
            {/* Animated Pie Chart */}
            <div className="flex justify-center py-2">
              <div className="relative w-48 h-48">
                {/* Pie Chart SVG */}
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                  {/* Background circle */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="10"
                  />
                  
                  {/* Animated pie segment */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="url(#reformedGradient)" 
                    strokeWidth="10"
                    strokeDasharray={`${isChartVisible ? reformedUsersPercentage * 2.83 : 0} 283`} 
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: "drop-shadow(0px 0px 5px rgba(79, 70, 229, 0.4))",
                    }}
                  />
                  
                  {/* Pulsing effect overlay */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="rgba(79, 70, 229, 0.3)" 
                    strokeWidth="10"
                    strokeDasharray={`${isChartVisible ? reformedUsersPercentage * 2.83 : 0} 283`}
                    strokeLinecap="round"
                    className="animate-pulse"
                    opacity="0.6"
                  />
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="reformedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#000080]">{reformedUsersPercentage}%</span>
                  <span className="text-sm text-gray-500">Completed</span>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="bg-white p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Reformed Users</span>
                  </div>
                  <span className="text-sm font-medium">{reformedUsersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <span className="text-sm font-medium">{inProgressCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 mr-2"></div>
                    <span className="text-sm text-gray-600">Total Users</span>
                  </div>
                  <span className="text-sm font-medium">{totalUsers}</span>
                </div>
              </div>
            </div>
            
            {/* Go to LMS Dashboard button */}
            <div className="mt-4">
              <Link to="/lms" className="block w-full">
                <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg">
                  Go to LMS Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Chart for All Campaigns - REPLACED WITH DOUGHNUT CHARTS */}
      <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#000080]">Active Campaigns</h2>
          <Link to="/campaign">
            <button className="bg-blue-50 hover:bg-blue-100 text-[#000080] border border-blue-200 py-1 px-3 rounded-lg text-sm transition-colors">
              View All
            </button>
          </Link>
        </div>
        
        {/* Legend for the graph */}
        <div className="flex items-center justify-start mb-6 gap-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Total Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Clicked Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Data Submitted</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <FaInfoCircle className="mr-1" />
            <span>Hover for details</span>
          </div>
        </div>
        
        {/* Modern Doughnut Charts Grid */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {allCampaignData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {allCampaignData.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="relative flex flex-col items-center group"
                  onMouseEnter={() => setHoveredCampaign(campaign.id)}
                  onMouseLeave={() => setHoveredCampaign(null)}
                >
                  {/* Doughnut Chart */}
                  <div className="relative w-32 h-32">
                    {/* SVG Doughnut Chart */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Background circle - Total users */}
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="none" 
                        stroke="rgba(229, 231, 235, 0.7)" 
                        strokeWidth="15"
                        strokeDasharray="251.2 0"
                        strokeLinecap="round"
                      />
                      
                      {/* Clicked users segment */}
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="none" 
                        stroke="rgba(59, 130, 246, 0.6)" 
                        strokeWidth="15"
                        strokeDasharray={`${campaign.clickCount > 0 ? (campaign.clickCount / campaign.userCount) * 251.2 : 0} 251.2`} 
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        transform="rotate(-90 50 50)"
                      />
                      
                      {/* Data submitted segment */}
                      <circle 
                        cx="50" cy="50" r="40" 
                        fill="none" 
                        stroke="rgba(239, 68, 68, 0.6)" 
                        strokeWidth="15"
                        strokeDasharray={`${campaign.dataCount > 0 ? (campaign.dataCount / campaign.userCount) * 251.2 : 0} 251.2`}
                        strokeDashoffset={251.2 - ((campaign.clickCount / campaign.userCount) * 251.2)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        transform="rotate(-90 50 50)"
                      />
                      
                      {/* Inner circle with gradient fill */}
                      <circle 
                        cx="50" cy="50" r="25" 
                        fill="url(#gradientFill)"
                        className="opacity-50"
                      />
                      
                      {/* Define gradient fill */}
                      <defs>
                        <radialGradient id="gradientFill" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
                          <stop offset="100%" stopColor="rgba(219, 234, 254, 0.4)" />
                        </radialGradient>
                      </defs>
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-[#000080]">
                        {campaign.clickProgress}%
                      </span>
                      <span className="text-xs text-gray-500">Engaged</span>
                    </div>
                    
                    {/* Hover tooltip */}
                    {hoveredCampaign === campaign.id && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white p-2 rounded shadow-lg z-10 w-48 text-center pointer-events-none">
                        <p className="font-bold text-sm">{campaign.name}</p>
                        <p className="text-xs">Total: {campaign.userCount} users</p>
                        <p className="text-xs">Clicked: {campaign.clickCount} users</p>
                        <p className="text-xs">Data submitted: {campaign.dataCount} users</p>
                        <p className="text-xs">Engagement: {campaign.clickProgress}%</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Animated pulse indicator if there are clicks */}
                  {(campaign.status !== 'completed' && campaign.status !== 'archived') && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full">
                      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
                    </div>
                  )}
                  
                  {/* Campaign name */}
                  <div className="mt-2 text-sm text-gray-600 text-center max-w-[120px] overflow-hidden text-ellipsis">
                    {campaign.name}
                  </div>
                  
                  {/* Quick stats */}
                  <div className="mt-1 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      {campaign.clickCount}
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      {campaign.dataCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center">
              <p className="text-gray-500">No campaign data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;