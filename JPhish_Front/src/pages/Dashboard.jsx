import React, { useState, useEffect, useRef } from 'react';
import { FaChartLine, FaEnvelope, FaGraduationCap, FaUserFriends, FaBullseye, FaCalendarAlt, FaInfoCircle, FaMousePointer, FaKeyboard, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apiClient, {campaignApiClient, detailsTrackerApiClient } from '../apiClient';

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
          campaignApiClient.get('/api/campaigns/all'),
          apiClient.get('/user/all'),
          detailsTrackerApiClient.get('/api/responses')
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
  {/* Active Campaigns Card */}
  <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 group">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-90 group-hover:from-blue-500 group-hover:to-blue-700 transition-all duration-500"></div>
    
    {/* Animated particle effects */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      <div className="absolute w-20 h-20 bg-white rounded-full opacity-10 top-0 left-0 animate-float-slow"></div>
      <div className="absolute w-12 h-12 bg-white rounded-full opacity-10 bottom-10 right-10 animate-float-medium"></div>
      <div className="absolute w-8 h-8 bg-white rounded-full opacity-10 top-20 right-20 animate-float-fast"></div>
    </div>
    
    <div className="relative p-7 flex justify-between items-center">
      <div className="space-y-2">
        <p className="text-white text-s uppercase tracking-wider font-semibold">Active Campaigns</p>
        <div className="flex items-baseline">
          <h3 className="text-white text-3xl font-bold counter-animation">{activeCampaigns}</h3>
          <span className="ml-1 text-blue-200 text-sm">campaigns</span>
        </div>
        <p className="text-blue-100 text-xs">Currently active</p>
      </div>
      
      <div className="relative">
        {/* Animated ring around icon */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-300 opacity-30 animate-ping-slow"></div>
        <div className="bg-transparent bg-opacity-20 p-4 rounded-full group-hover:bg-opacity-30 transition-all duration-300">
          <FaChartLine className="text-black text-2xl group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
    
    {/* Animated progress bar */}
    <div className="relative h-2 w-full bg-blue-700 bg-opacity-40">
      <div className="absolute top-0 left-0 h-full bg-blue-200 rounded-r-full animate-pulse-width" 
           style={{ width: `${(activeCampaigns/Math.max(activeCampaigns, 5))*100}%` }}></div>
    </div>
  </div>

  {/* Emails Sent Card */}
  <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 group">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-green-400 opacity-90 group-hover:from-green-500 group-hover:to-teal-700 transition-all duration-500"></div>
    
    {/* Animated particle effects */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      <div className="absolute w-20 h-20 bg-white rounded-full opacity-10 top-0 right-0 animate-float-slow"></div>
      <div className="absolute w-12 h-12 bg-white rounded-full opacity-10 bottom-10 left-10 animate-float-medium"></div>
      <div className="absolute w-8 h-8 bg-white rounded-full opacity-10 top-20 left-20 animate-float-fast"></div>
    </div>
    
    <div className="relative p-7 flex justify-between items-center">
      <div className="space-y-2">
        <p className="text-white text-s uppercase tracking-wider font-semibold">Emails Sent</p>
        <div className="flex items-baseline">
          <h3 className="text-white text-3xl font-bold counter-animation">{totalEmailsSent}</h3>
          <span className="ml-1 text-green-200 text-sm">emails</span>
        </div>
        <p className="text-green-100 text-xs">Total dispatched</p>
      </div>
      
      <div className="relative">
        {/* Animated ring around icon */}
        <div className="absolute inset-0 rounded-full border-4 border-green-300 opacity-30 animate-ping-slow"></div>
        <div className="bg-transparent bg-opacity-20 p-4 rounded-full group-hover:bg-opacity-30 transition-all duration-300">
          <FaEnvelope className="text-white text-2xl group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
    
    {/* Animated progress bar */}
    <div className="relative h-2 w-full bg-green-700 bg-opacity-40">
      <div className="absolute top-0 left-0 h-full bg-green-200 rounded-r-full animate-pulse-width" 
           style={{ width: `${(totalEmailsSent/Math.max(totalEmailsSent, 100))*100}%` }}></div>
    </div>
  </div>

  {/* Emails Opened Card */}
  <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 group">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-400 opacity-90 group-hover:from-purple-500 group-hover:to-indigo-700 transition-all duration-500"></div>
    
    {/* Animated particle effects */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      <div className="absolute w-20 h-20 bg-white rounded-full opacity-10 bottom-0 left-0 animate-float-slow"></div>
      <div className="absolute w-12 h-12 bg-white rounded-full opacity-10 top-10 right-10 animate-float-medium"></div>
      <div className="absolute w-8 h-8 bg-white rounded-full opacity-10 bottom-20 right-20 animate-float-fast"></div>
    </div>
    
    <div className="relative p-7 flex justify-between items-center">
      <div className="space-y-2">
        <p className="text-white text-s uppercase tracking-wider font-semibold">Emails Opened</p>
        <div className="flex items-baseline">
          <h3 className="text-white text-3xl font-bold counter-animation">{inProgressCount}</h3>
          <span className="ml-1 text-purple-200 text-sm">opened</span>
        </div>
        <p className="text-purple-100 text-xs">User engagement</p>
      </div>
      
      <div className="relative">
        {/* Animated ring around icon */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-300 opacity-30 animate-ping-slow"></div>
        <div className="bg-transparent bg-opacity-20 p-4 rounded-full group-hover:bg-opacity-30 transition-all duration-300">
          <FaGraduationCap className="text-white text-2xl group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
    
    {/* Animated progress bar */}
    <div className="relative h-2 w-full bg-purple-700 bg-opacity-40">
      <div className="absolute top-0 left-0 h-full bg-purple-200 rounded-r-full animate-pulse-width" 
           style={{ width: `${(inProgressCount/totalEmailsSent)*100}%` }}></div>
    </div>
  </div>

  {/* Total Users Card */}
  <div className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 group">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-400 opacity-90 group-hover:from-amber-500 group-hover:to-orange-700 transition-all duration-500"></div>
    
    {/* Animated particle effects */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      <div className="absolute w-20 h-20 bg-white rounded-full opacity-10 bottom-0 right-0 animate-float-slow"></div>
      <div className="absolute w-12 h-12 bg-white rounded-full opacity-10 top-10 left-10 animate-float-medium"></div>
      <div className="absolute w-8 h-8 bg-white rounded-full opacity-10 bottom-20 left-20 animate-float-fast"></div>
    </div>
    
    <div className="relative p-7 flex justify-between items-center">
      <div className="space-y-2">
        <p className="text-white text-s uppercase tracking-wider font-semibold">Total Users</p>
        <div className="flex items-baseline">
          <h3 className="text-white text-3xl font-bold counter-animation">{totalUsers}</h3>
          <span className="ml-1 text-amber-200 text-sm">users</span>
        </div>
        <p className="text-amber-100 text-xs">System-wide</p>
      </div>
      
      <div className="relative">
        {/* Animated ring around icon */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-300 opacity-30 animate-ping-slow"></div>
        <div className="bg-transparent bg-opacity-20 p-4 rounded-full group-hover:bg-opacity-30 transition-all duration-300">
          <FaUserFriends className="text-black text-2xl group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </div>
    
    {/* Animated progress bar */}
    <div className="relative h-2 w-full bg-amber-700 bg-opacity-40">
      <div className="absolute top-0 left-0 h-full bg-amber-200 rounded-r-full animate-pulse-width" 
           style={{ width: '100%' }}></div>
    </div>
  </div>
</div>

      {/* Middle Section - Campaign Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Campaign Progress Overview - With Combined Progress Bar */}
        <div className="bg-gradient-to-br from-white to-blue-100 p-6 rounded-2xl shadow-lg col-span-2 border border-blue-100 relative overflow-hidden">
  {/* Background decorative elements */}
  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
  <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-100 rounded-full opacity-10 -ml-20 -mb-20"></div>
  
  {/* Header with animated icon */}
  <div className="relative">
    <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
      <span className="bg-blue-100 p-2 rounded-lg mr-3 relative">
        <FaBullseye className="text-blue-600 animate-pulse z-10 relative" />
        <span className="absolute inset-0 bg-blue-200 rounded-lg transform scale-75 opacity-60 animate-ping"></span>
      </span> 
      Campaign Engagement Analysis
    </h2>
    
    {/* Enhanced legend */}
    <div className="flex items-center mb-6 gap-8">
      <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-2"></div>
        <span className="text-sm text-gray-700 font-medium">Clicked</span>
      </div>
      <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
        <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-2"></div>
        <span className="text-sm text-gray-700 font-medium">Submitted</span>
      </div>
    </div>
  </div>
  
  {tableData.length > 0 ? (
    <div className="space-y-5">
      {tableData.map((campaign) => (
        <div 
          key={campaign.id} 
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-800 font-semibold">
                  {campaign.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-gray-800 text-lg">{campaign.name}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              campaign.status === 'completed' 
                ? 'bg-green-100 text-green-700' 
                : campaign.status === 'archived' 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {campaign.status}
              {campaign.status === 'active' && (
                <span className="ml-1.5 w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
              )}
            </div>
          </div>
          
          {/* Enhanced Progress Bar for Clicks and Submissions */}
          <div className="mb-4">
            <div className="flex items-center mb-2 justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-1 rounded">
                  <FaMousePointer className="text-blue-600 text-xs" />
                </div>
                <span className="text-sm text-gray-700 ml-2 font-medium">{campaign.clickCount} clicks</span>
              </div>
              <div className="flex items-center">
                <div className="bg-red-100 p-1 rounded">
                  <FaKeyboard className="text-red-600 text-xs" />
                </div>
                <span className="text-sm text-gray-700 ml-2 font-medium">{campaign.dataCount} submissions</span>
              </div>
            </div>
            
            <div className="w-full h-8 bg-gray-100 rounded-lg relative overflow-hidden p-1.5">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 w-full h-full"></div>
              
              {/* Blue layer for clicks with animated gradient */}
              <div 
                className="absolute top-1.5 left-1.5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-md transition-all duration-1000 ease-out"
                style={{ width: 'calc(100% - 12px)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-30"></div>
              </div>
              
              {/* Red layer for submissions with animated gradient and glow */}
              <div 
                className="absolute top-1.5 left-1.5 h-5 bg-gradient-to-r from-red-400 to-red-600 rounded-md transition-all duration-1000 ease-out"
                style={{ 
                  width: `calc(${campaign.submissionRatio}% - ${campaign.submissionRatio > 0 ? '12px' : '0px'})`,
                  boxShadow: campaign.submissionRatio > 50 ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-20"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-600">{campaign.clickCount} clicks / {campaign.dataCount} submissions</span>
              </div>
              <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {campaign.submissionRatio}% conversion
              </div>
            </div>
          </div>
          
          {/* Interactive button */}
          <div className="pt-2 text-right">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors flex items-center ml-auto">
              View details <FaChartLine className="ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-gray-100 flex flex-col items-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <FaBullseye className="text-blue-400 text-xl" />
      </div>
      <p className="text-gray-600 mb-4">No campaigns with clicks found</p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
        Create Campaign
      </button>
    </div>
  )}
  
  {tableData.length > 0 && (
    <div className="mt-6 text-center">
      <button className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium flex items-center mx-auto">
        See all campaigns <FaArrowRight className="ml-2" />
      </button>
    </div>
  )}
</div>

        {/* Reformed Users */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-100 to-white p-6 rounded-2xl shadow-lg border border-indigo-100">
  {/* Background decorative elements */}
  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
  <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-100 rounded-full opacity-10 -ml-20 -mb-20"></div>
  <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-purple-300 rounded-full opacity-20 animate-float-slow"></div>
  <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-indigo-300 rounded-full opacity-30 animate-float-medium"></div>
  
  {/* Header with animated icon */}
  <div className="relative mb-5">
    <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
      <span className="bg-indigo-100 p-2 rounded-lg mr-3 relative">
        <FaGraduationCap className="text-indigo-600 z-10 relative" />
        <span className="absolute inset-0 bg-indigo-200 rounded-lg transform scale-75 opacity-60 animate-ping"></span>
      </span> 
      Training Progress
    </h2>
    <p className="text-indigo-600 text-sm ml-11">User completion statistics</p>
  </div>
  
  {/* Interactive Chart Section */}
  <div className="flex flex-col items-center justify-center mb-6 relative">
    <div className="relative w-48 h-48 mb-2">
      {/* Pie Chart SVG with enhanced animations */}
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full drop-shadow-xl">
        {/* Light glowing overlay for completed section */}
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="url(#reformedGlowGradient)" 
          strokeWidth="11"
          strokeDasharray={`${isChartVisible ? reformedUsersPercentage * 2.83 : 0} 283`} 
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out"
          style={{ filter: "blur(4px)" }}
        />
      
        {/* Background circle with subtle texture */}
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="#e5e7eb" 
          strokeWidth="10"
        />
        
        {/* Main progress indicator */}
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="url(#reformedGradient)" 
          strokeWidth="10"
          strokeDasharray={`${isChartVisible ? reformedUsersPercentage * 2.83 : 0} 283`} 
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out"
          style={{
            filter: "drop-shadow(0px 0px 3px rgba(79, 70, 229, 0.5))",
          }}
        />
        
        {/* Moving dot along progress path */}
        {isChartVisible && (
          <circle 
            cx="50" 
            cy="5" 
            r="3"
            fill="white"
            className="animate-pulse"
            transform={`rotate(${reformedUsersPercentage * 3.6} 50 50)`}
            style={{ 
              filter: "drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.9))",
             }}
          />
        )}
        
        {/* Enhanced gradients */}
        <defs>
          <linearGradient id="reformedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="reformedGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
            <stop offset="100%" stopColor="rgba(167, 139, 250, 0.1)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center text with counter animation */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-green-800 drop-shadow-sm counter-animation">{reformedUsersPercentage}%</span>
        <span className="text-sm text-green-600 font-medium">Completed</span>
      </div>
    </div>

    {/* Interactive label badges */}
    <div className="flex justify-center gap-3 mb-6">
      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
        {reformedUsersCount} Reformed Users
      </div>
      <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
        {inProgressCount} In Training
      </div>
    </div>
  </div>
  
  {/* Enhanced Legend with interactive hover effects */}
  <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50 hover:shadow-md transition-shadow duration-300">
    <div className="space-y-3">
      <div className="flex items-center justify-between group hover:bg-indigo-50 p-2 rounded-lg transition-all duration-300">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mr-2 group-hover:scale-110 transition-transform"></div>
          <span className="text-sm text-gray-700 group-hover:text-indigo-700 transition-colors font-medium">Reformed Users</span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">{reformedUsersCount}</span>
          <span className="text-xs text-indigo-500 ml-1">users</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-200 mr-2 group-hover:scale-110 transition-transform"></div>
          <span className="text-sm text-gray-700 group-hover:text-gray-700 transition-colors font-medium">In Progress</span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{inProgressCount}</span>
          <span className="text-xs text-gray-500 ml-1">users</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between group hover:bg-blue-50 p-2 rounded-lg transition-all duration-300">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 border border-blue-300 mr-2 group-hover:scale-110 transition-transform"></div>
          <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors font-medium">Total Users</span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">{totalUsers}</span>
          <span className="text-xs text-blue-500 ml-1">users</span>
        </div>
      </div>
    </div>
  </div>
  
  {/* Enhanced Call-to-Action Button */}
  <div className="mt-6 relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-green-600 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
    <Link to="/lms" className="block w-full">
      <button className="relative w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center">
        <FaGraduationCap className="mr-2" />
        View Training Dashboard
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 group-hover:translate-x-1 transition-transform">
          <FaArrowRight />
        </span>
      </button>
    </Link>
  </div>
</div>
      </div>

      {/* Modern Chart for All Campaigns - REPLACED WITH DOUGHNUT CHARTS */}
      <div className="relative overflow-auto bg-gradient-to-br from-red-50 to-white p-8 rounded-2xl shadow-lg border border-blue-100">
  {/* Background decorative elements */}
  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
  <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-100 rounded-full opacity-10 -ml-20 -mb-20"></div>
  <div className="absolute top-1/3 left-2/3 w-6 h-6 bg-blue-300 rounded-full opacity-20 animate-float-slow"></div>
  <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-indigo-300 rounded-full opacity-30 animate-float-medium"></div>
  
  {/* Enhanced header with animated icon */}
  <div className="relative mb-6 flex justify-between items-center">
    <div className="flex items-center">
      <span className="bg-blue-100 p-2 rounded-lg mr-3 relative">
        <FaChartLine className="text-blue-600 z-10 relative" />
        <span className="absolute inset-0 bg-blue-200 rounded-lg transform scale-75 opacity-60 animate-ping"></span>
      </span>
      <h2 className="text-2xl font-bold text-blue-800">Active Campaigns</h2>
    </div>
    
    <Link to="/campaign">
      <button className="relative overflow-hidden bg-white px-4 py-2 rounded-full text-blue-700 border border-blue-200 font-medium text-sm shadow-sm hover:shadow-md transition-all group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative flex items-center">
          View All 
          <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
        </span>
      </button>
    </Link>
  </div>
  
  {/* Interactive Legend with hover effects */}
  <div className="flex flex-wrap items-center justify-start mb-6 gap-3">
    <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-shadow">
      <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
      <span className="text-sm text-gray-700 font-medium">Total Users</span>
    </div>
    <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-shadow">
      <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-2"></div>
      <span className="text-sm text-gray-700 font-medium">Clicked Users</span>
    </div>
    <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-shadow">
      <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-2"></div>
      <span className="text-sm text-gray-700 font-medium">Data Submitted</span>
    </div>
    <div className="flex items-center bg-indigo-50 px-3 py-1.5 rounded-full text-indigo-700 text-sm ml-auto">
      <FaInfoCircle className="mr-2" />
      <span className="font-medium">Hover for details</span>
    </div>
  </div>
  
  {/* Enhanced Doughnut Charts Container */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    {allCampaignData.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {allCampaignData.map((campaign) => (
          <div 
            key={campaign.id}
            className="relative flex flex-col items-center transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-xl p-4 group"
            onMouseEnter={() => setHoveredCampaign(campaign.id)}
            onMouseLeave={() => setHoveredCampaign(null)}
          >
            {/* Enhanced Doughnut Chart with Gradients and Animations */}
            <div className="relative w-36 h-36">
              {/* Animated overlay for hover effect */}
              <div className="absolute inset-0 bg-blue-50 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              {/* SVG Doughnut Chart with enhanced visuals */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                {/* Background gradient overlay */}
                <defs>
                  <linearGradient id={`bgGradient-${campaign.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(229, 231, 235, 0.7)" />
                    <stop offset="100%" stopColor="rgba(209, 213, 219, 0.7)" />
                  </linearGradient>
                  <linearGradient id={`clickGradient-${campaign.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(37, 99, 235, 0.7)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.7)" />
                  </linearGradient>
                  <linearGradient id={`dataGradient-${campaign.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(220, 38, 38, 0.7)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0.7)" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Background circle - Total users with gradient */}
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke={`url(#bgGradient-${campaign.id})`}
                  strokeWidth="15"
                  strokeDasharray="251.2 0"
                  strokeLinecap="round"
                />
                
                {/* Clicked users segment with enhanced gradient and animation */}
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke={`url(#clickGradient-${campaign.id})`}
                  strokeWidth="15"
                  strokeDasharray={`${campaign.clickCount > 0 ? (campaign.clickCount / campaign.userCount) * 251.2 : 0} 251.2`} 
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  transform="rotate(-90 50 50)"
                  style={{ filter: campaign.clickCount > campaign.userCount / 2 ? 'url(#glow)' : 'none' }}
                />
                
                {/* Data submitted segment with enhanced gradient and animation */}
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke={`url(#dataGradient-${campaign.id})`}
                  strokeWidth="15"
                  strokeDasharray={`${campaign.dataCount > 0 ? (campaign.dataCount / campaign.userCount) * 251.2 : 0} 251.2`}
                  strokeDashoffset={251.2 - ((campaign.clickCount / campaign.userCount) * 251.2)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  transform="rotate(-90 50 50)"
                  style={{ filter: campaign.dataCount > campaign.userCount / 2 ? 'url(#glow)' : 'none' }}
                />
                
                {/* Inner circle with enhanced gradient fill */}
                <circle 
                  cx="50" cy="50" r="25" 
                  fill="url(#centerGradient)"
                  className="opacity-90 group-hover:opacity-100 transition-opacity"
                />
                
                {/* Define enhanced inner circle gradient fill */}
                <defs>
                  <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                    <stop offset="100%" stopColor="rgba(241, 245, 249, 0.7)" />
                  </radialGradient>
                </defs>
              </svg>
              
              {/* Enhanced Center text with animations */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-blue-900 group-hover:scale-110 transition-transform">
                  {campaign.clickProgress}%
                </span>
                <span className="text-xs font-medium text-blue-700">Engaged</span>
              </div>
              
              {/* Enhanced Hover tooltip with better styling and animation */}
              {hoveredCampaign === campaign.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 ml-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-3 rounded-lg shadow-xl z-10 w-46 text-center pointer-events-none animate-fade-in">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="triangle-up border-b-gray-900"></div>
                  </div>
                  <p className="font-bold text-sm border-b border-gray-700 pb-1.5 mb-1.5">{campaign.name}</p>
                  <div className="grid grid-cols-2 gap-y-1 text-left">
                    <p className="text-xs text-gray-300">Total Users:</p>
                    <p className="text-xs font-medium text-right">{campaign.userCount}</p>
                    <p className="text-xs text-gray-300">Clicked:</p>
                    <p className="text-xs font-medium text-blue-300 text-right">{campaign.clickCount} ({campaign.clickProgress}%)</p>
                    <p className="text-xs text-gray-300">Submitted:</p>
                    <p className="text-xs font-medium text-red-300 text-right">{campaign.dataCount} ({campaign.dataProgress}%)</p>
                    <p className="text-xs text-gray-300">Conversion:</p>
                    <p className="text-xs font-medium text-green-300 text-right">{campaign.submissionRatio}%</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status indicator with enhanced animation */}
            {(campaign.status !== 'completed' && campaign.status !== 'archived') && (
              <div className="absolute top-2 right-2 flex items-center">
                <div className="relative w-3 h-3">
                  <div className="absolute inset-0 bg-green-500 rounded-full"></div>
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute inset-0 bg-green-300 rounded-full animate-pulse opacity-75 scale-150"></div>
                </div>
                <span className="text-xs text-green-600 ml-1 font-medium bg-green-50 px-1.5 py-0.5 rounded">{campaign.status}</span>
              </div>
            )}
            
            {/* Enhanced Campaign name with tooltip for long names */}
            <div className="mt-3 text-sm font-medium text-gray-800 text-center w-full truncate px-2" title={campaign.name}>
              {campaign.name}
            </div>
            
            {/* Enhanced Stats with better visualization */}
            <div className="mt-2 w-full bg-gray-50 p-1.5 rounded-lg flex justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-1 shadow-sm"></div>
                <span className="text-xs text-gray-700">{campaign.clickCount}</span>
              </div>
              <div className="h-4 border-r border-gray-200"></div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full mr-1 shadow-sm"></div>
                <span className="text-xs text-gray-700">{campaign.dataCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="py-16 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <FaChartLine className="text-blue-300 text-2xl" />
        </div>
        <p className="text-gray-500 mb-6 text-center">No active campaigns available</p>
        <Link to="/campaign/new">
          <button className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium py-2 px-5 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center">
              Create Campaign <FaPlus className="ml-2" />
            </span>
          </button>
        </Link>
      </div>
    )}
  </div>

  {/* Page navigation if needed */}
  {allCampaignData.length > 10 && (
    <div className="mt-6 flex justify-center">
      <div className="bg-white inline-flex rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <button className="px-3 py-2 bg-white text-gray-500 hover:bg-blue-50 border-r border-gray-200">&laquo;</button>
        <button className="px-3 py-2 bg-blue-500 text-white">1</button>
        <button className="px-3 py-2 bg-white text-gray-700 hover:bg-blue-50">2</button>
        <button className="px-3 py-2 bg-white text-gray-700 hover:bg-blue-50">3</button>
        <button className="px-3 py-2 bg-white text-gray-500 hover:bg-blue-50 border-l border-gray-200">&raquo;</button>
      </div>
    </div>
  )}

  <style jsx>{`
    .triangle-up {
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid;
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translate(-50%, 10px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out forwards;
    }
  `}</style>
</div>
    </div>
  );
};

export default Dashboard;