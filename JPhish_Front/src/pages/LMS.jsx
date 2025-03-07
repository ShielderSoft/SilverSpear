import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LMS = () => {
  // State for managing components
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Sample data for LMS campaigns
  const lmsCampaigns = [
    { 
      id: 1, 
      name: 'Security Awareness Training', 
      status: 'Active',
      userCount: 125, 
      phishedUsers: 98,
      domainTLD: 'securityplus.com',
      completionRate: 78,
      topics: ['Phishing Recognition', 'Password Security', 'Social Engineering'],
      description: 'Fundamental security awareness training for all employees',
      users: [
        { email: 'user1@example.com', status: 'Completed', answers: 22, analysis: 'Reformed' },
        { email: 'user2@example.com', status: 'Pending', answers: 13, analysis: 'Actively Learning' },
        { email: 'user3@example.com', status: 'Completed', answers: 25, analysis: 'Reformed' },
        { email: 'user4@example.com', status: 'Completed', answers: 19, analysis: 'Learning Requested' },
        { email: 'user5@example.com', status: 'Pending', answers: 8, analysis: 'Actively Learning' }
      ]
    },
    { 
      id: 2, 
      name: 'Advanced Phishing Prevention', 
      status: 'Completed',
      userCount: 85, 
      phishedUsers: 72,
      domainTLD: 'phishdefense.org',
      completionRate: 92,
      topics: ['Email Headers Analysis', 'URL Inspection', 'Attachment Safety'],
      description: 'Advanced training for identifying sophisticated phishing attempts',
      users: [
        { email: 'manager1@company.com', status: 'Completed', answers: 24, analysis: 'Reformed' },
        { email: 'manager2@company.com', status: 'Completed', answers: 23, analysis: 'Reformed' },
        { email: 'manager3@company.com', status: 'Completed', answers: 25, analysis: 'Reformed' },
        { email: 'manager4@company.com', status: 'Completed', answers: 18, analysis: 'Learning Requested' }
      ]
    },
    { 
      id: 3, 
      name: 'Social Engineering Defense', 
      status: 'Active',
      userCount: 110, 
      phishedUsers: 65,
      domainTLD: 'socialdefense.net',
      completionRate: 65,
      topics: ['Impersonation Tactics', 'Verification Procedures', 'Reporting Protocols'],
      description: 'Specialized training on defending against social engineering attacks',
      users: [
        { email: 'employee1@corp.com', status: 'Pending', answers: 12, analysis: 'Actively Learning' },
        { email: 'employee2@corp.com', status: 'Completed', answers: 21, analysis: 'Reformed' },
        { email: 'employee3@corp.com', status: 'Pending', answers: 15, analysis: 'Actively Learning' }
      ]
    },
    { 
      id: 4, 
      name: 'Mobile Device Security', 
      status: 'Pending',
      userCount: 95, 
      phishedUsers: 0,
      domainTLD: 'mobilesec.io',
      completionRate: 0,
      topics: ['App Permission Management', 'Public WiFi Dangers', 'Device Encryption'],
      description: 'Security practices for mobile devices and remote work',
      users: []
    },
    { 
      id: 5, 
      name: 'Data Protection Fundamentals', 
      status: 'Archived',
      userCount: 150, 
      phishedUsers: 132,
      domainTLD: 'dataprotect.edu',
      completionRate: 95,
      topics: ['Data Classification', 'Secure Storage', 'Secure Destruction'],
      description: 'Best practices for handling sensitive information',
      users: [
        { email: 'staff1@school.edu', status: 'Completed', answers: 25, analysis: 'Reformed' },
        { email: 'staff2@school.edu', status: 'Completed', answers: 24, analysis: 'Reformed' },
        { email: 'staff3@school.edu', status: 'Completed', answers: 20, analysis: 'Learning Requested' },
        { email: 'staff4@school.edu', status: 'Completed', answers: 23, analysis: 'Reformed' },
        { email: 'staff5@school.edu', status: 'Pending', answers: 18, analysis: 'Actively Learning' }
      ]
    }
  ];

  // Calculate statistics for pie chart
  const totalCampaigns = lmsCampaigns.length;
  const archivedCampaigns = lmsCampaigns.filter(c => c.status === 'Archived' || c.status === 'Completed').length;
  const archivePercentage = Math.round((archivedCampaigns / totalCampaigns) * 100);
  const activeCampaigns = totalCampaigns - archivedCampaigns;

  // Handle campaign selection
  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
  };

  // Animate chart on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Get URL parameters to detect if coming from dashboard
  const comingFromDashboard = window.location.search.includes('source=dashboard');
  
  // Show a welcome back message if coming from dashboard
  useEffect(() => {
    if (comingFromDashboard) {
      // Could show a welcome message or highlight specific content
      console.log("User navigated from dashboard");
    }
  }, [comingFromDashboard]);

  return (
    <div className="p-6 max-w-full text-black">
      {/* Header Section with Welcome */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#000080]">LMS Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your learning management campaigns</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Campaign Table - Left Side */}
        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md lg:col-span-2">
          <h2 className="text-xl font-bold text-[#000080] mb-4">Training Campaigns</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Count</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lmsCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'Archived' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {campaign.userCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewDetails(campaign)}
                        className="text-[#000080] bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Campaign Stats */}
        <div className="space-y-6">
          {/* Pie Chart Card */}
          <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-[#000080] mb-4">Campaign Status</h2>
            
            {/* Futuristic Pie Chart */}
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
                    stroke="url(#archivedGradient)" 
                    strokeWidth="10"
                    strokeDasharray={`${isChartVisible ? archivePercentage * 2.83 : 0} 283`} 
                    strokeLinecap="round"
                    className="transition-all duration-1500 ease-out"
                    style={{
                      filter: "drop-shadow(0px 0px 6px rgba(99, 102, 241, 0.5))",
                    }}
                  />
                  
                  {/* Glowing effect */}
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="url(#glowGradient)" 
                    strokeWidth="3"
                    strokeDasharray={`${isChartVisible ? archivePercentage * 2.83 : 0} 283`}
                    strokeLinecap="round"
                    className="animate-pulse"
                    opacity="0.7"
                  />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="archivedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#c4b5fd" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-[#000080]">{archivePercentage}%</span>
                  <span className="text-sm text-gray-500">Archived</span>
                </div>
              </div>
            </div>
            
            {/* Interactive Legend */}
            <div className="bg-white p-4 rounded-lg mt-4">
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between p-2 hover:bg-indigo-50 rounded transition-colors cursor-pointer group"
                  title="Completed or archived campaigns"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mr-2 group-hover:scale-125 transition-transform"></div>
                    <span className="text-sm text-gray-600">Archived Campaigns</span>
                  </div>
                  <span className="text-sm font-medium">{archivedCampaigns}</span>
                </div>
                <div 
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer group"
                  title="Active or pending campaigns"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-200 mr-2 group-hover:scale-125 transition-transform"></div>
                    <span className="text-sm text-gray-600">Active Campaigns</span>
                  </div>
                  <span className="text-sm font-medium">{activeCampaigns}</span>
                </div>
                <div 
                  className="flex items-center justify-between p-2 hover:bg-blue-50 rounded transition-colors cursor-pointer group"
                  title="Total campaigns"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 mr-2 group-hover:scale-125 transition-transform"></div>
                    <span className="text-sm text-gray-600">Total Campaigns</span>
                  </div>
                  <span className="text-sm font-medium">{totalCampaigns}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Card */}
          <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md">
            <h2 className="text-lg font-bold text-[#000080] mb-3">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg">
                Create New Training
              </button>
              <button className="w-full bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-medium py-2 px-4 rounded-lg transition-colors">
                Generate Reports
              </button>
              <Link to="/lms-login" className="block w-full">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
               Access User Training
              </button>
              </Link>
              <Link to="/lms-login40" className="block w-full">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
               Access User Training 40
              </button>
              </Link>
              <Link to="/campaign" className="block w-full">
                <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors">
                  Back to Campaigns
                </button>
              </Link>
              <Link to="/" className="block w-full mt-2">
                <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details Section - Only shows when a campaign is selected */}
      {selectedCampaign && (
        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md mb-8 animate-fadein">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#000080]">
              Campaign Details: {selectedCampaign.name}
            </h2>
            <button 
              onClick={() => setSelectedCampaign(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Overview</h3>
              <p className="text-gray-600 mb-4">{selectedCampaign.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">{selectedCampaign.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      selectedCampaign.completionRate < 33 ? 'bg-red-500' : 
                      selectedCampaign.completionRate < 66 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${selectedCampaign.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Training Topics</h3>
              <div className="space-y-2">
                {selectedCampaign.topics.map((topic, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                    <span className="text-gray-600">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* NEW: Campaign Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {/* Domain TLD */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Domain TLD</h4>
              <div className="flex items-center">
                <div className="w-2 h-8 bg-blue-500 rounded-sm mr-2"></div>
                <span className="text-lg font-semibold text-gray-700">{selectedCampaign.domainTLD}</span>
              </div>
            </div>
            
            {/* Total Users */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Total Users</h4>
              <div className="flex items-center">
                <div className="w-2 h-8 bg-green-500 rounded-sm mr-2"></div>
                <span className="text-lg font-semibold text-gray-700">{selectedCampaign.userCount}</span>
              </div>
            </div>
            
            {/* Phished Users */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Phished Users</h4>
              <div className="flex items-center">
                <div className="w-2 h-8 bg-red-500 rounded-sm mr-2"></div>
                <span className="text-lg font-semibold text-gray-700">{selectedCampaign.phishedUsers}</span>
              </div>
            </div>
            
            {/* Learning Status */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Learning</h4>
              <div className="flex items-center">
                <div className="w-2 h-8 bg-purple-500 rounded-sm mr-2"></div>
                <span className={`font-semibold px-2 py-1 rounded-full text-sm ${
                  selectedCampaign.status === 'Active' ? 'bg-green-100 text-green-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedCampaign.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* NEW: Phished Users Table */}
          {selectedCampaign.users.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-700 mb-4">Phished Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedCampaign.users.map((user, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          <span className={`font-medium ${
                            user.answers < 15 ? 'text-red-600' : 
                            user.answers < 20 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {user.answers}/25
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.analysis === 'Reformed' ? 'bg-blue-100 text-blue-800' : 
                            user.analysis === 'Learning Requested' ? 'bg-purple-100 text-purple-800' : 
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {user.analysis}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg font-medium transition-colors mr-3">
              View Full Report
            </button>
            <button className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
              Manage Training
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LMS;