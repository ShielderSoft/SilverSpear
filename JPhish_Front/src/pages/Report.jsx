import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { campaignApiClient, detailsTrackerApiClient } from '../apiClient';
import { 
  FaArrowLeft, 
  FaEnvelope, 
  FaFileAlt, 
  FaChartLine, 
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaCalendarAlt,
  FaGlobe,
  FaRegClock
} from 'react-icons/fa';

// Import any required chart libraries
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Report = () => {
  const { campaignId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesRef = useRef([]);

  // Fetch report data and campaign details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both report data and campaign details
        const [reportResponse, campaignsResponse] = await Promise.all([
          detailsTrackerApiClient.get(`/api/reports/campaign/${campaignId}`),
          campaignApiClient.get('/api/campaigns/all')
        ]);
        
        setReportData(reportResponse.data);
        
        // Find the specific campaign by ID
        const campaignData = campaignsResponse.data.find(c => c.id.toString() === campaignId.toString());
        setCampaign(campaignData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [campaignId]);

  // Handle navigation between slides
  const navigateToSlide = (index) => {
    setCurrentSlide(index);
    if (slidesRef.current[index]) {
      slidesRef.current[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate chart data for click-through rate
  const getClickRateChartData = () => {
    if (!reportData) return null;
    
    return {
      labels: ['Clicked', 'Not Clicked'],
      datasets: [
        {
          data: [reportData.uniqueUsers, (campaign?.recipientEmails?.length || 0) - reportData.uniqueUsers],
          backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(177, 177, 177, 0.8)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(211, 211, 211, 1)'],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Generate chart data for form submissions
  const getSubmissionRateChartData = () => {
    if (!reportData) return null;
    
    const submittedData = reportData.reportData.filter(r => r.response_text).length;
    const clickedNoSubmission = reportData.totalResponses - submittedData;
    
    return {
      labels: ['Submitted Data', 'Clicked Only'],
      datasets: [
        {
          data: [submittedData, clickedNoSubmission],
          backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1,
        },
      ],
    };
  };

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
        position: 'bottom'
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" id="Report">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Report</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/campaign" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FaArrowLeft className="mr-2" /> Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/campaign" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <FaArrowLeft className="mr-2" /> Back to Campaigns
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigateToSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className={`p-2 rounded-full ${currentSlide === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Previous
              </button>
              <div className="text-sm font-medium">
                {currentSlide + 1} / {4} {/* Total number of slides */}
              </div>
              <button 
                onClick={() => navigateToSlide(Math.min(3, currentSlide + 1))}
                disabled={currentSlide === 3}
                className={`p-2 rounded-full ${currentSlide === 3 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

     
      {/* Slides container */}
      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Slide 1: Heading */}
        <div 
          ref={el => slidesRef.current[0] = el}
          className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[80vh] flex flex-col"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white">
            <h1 className="text-4xl font-bold mb-4">Phishing Campaign Report</h1>
            <h2 className="text-2xl mb-6">{campaign?.name || 'Campaign Report'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              <div className="bg-white text-black bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4">
                <p className="text-sm opacity-80">Campaign ID</p>
                <p className="text-2xl font-semibold">{campaign?.id}</p>
              </div>
              <div className="bg-white text-black bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4">
                <p className="text-sm opacity-80">Total Recipients</p>
                <p className="text-2xl font-semibold">{campaign?.recipientEmails?.length || 'N/A'}</p>
              </div>
              <div className="bg-white text-black bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4">
                <p className="text-sm opacity-80">Clicked Links</p>
                <p className="text-2xl font-semibold">{reportData?.uniqueUsers || 0}</p>
              </div>
              <div className="bg-white text-black bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4">
                <p className="text-sm opacity-80">Data Submissions</p>
                <p className="text-2xl font-semibold">{reportData?.reportData?.filter(r => r.response_text)?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-8 flex-grow">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Executive Summary</h3>
              <p className="text-gray-600">
                This report presents the results of the phishing campaign "{campaign?.name || 'Campaign'}" conducted by your organization. 
                The campaign targeted {campaign?.recipientEmails?.length || 'N/A'} users to assess the organization's vulnerability to phishing attacks.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Key Findings</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600">
                        <FaChartLine size={12} />
                      </span>
                    </div>
                    <span className="ml-3 text-gray-600">
                      <strong>{reportData?.uniqueUsers || 0}</strong> unique users clicked the phishing link
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-600">
                        <FaExclamationTriangle size={12} />
                      </span>
                    </div>
                    <span className="ml-3 text-gray-600">
                      <strong>{reportData?.reportData?.filter(r => r.response_text)?.length || 0}</strong> users submitted sensitive information
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-600">
                        <FaCheck size={12} />
                      </span>
                    </div>
                    <span className="ml-3 text-gray-600">
                      <strong>{((campaign?.recipientEmails?.length || 0) - (reportData?.uniqueUsers || 0))}</strong> users did not engage with the phishing email
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Success Rate</h4>
                <div className="h-48">
                  {getClickRateChartData() && (
                    <Pie data={getClickRateChartData()} options={chartOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slide 2: Introduction */}
        <div 
          ref={el => slidesRef.current[1] = el} 
          className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[80vh]"
        >
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Campaign Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaEnvelope className="mr-2 text-blue-600" /> Email Template
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Subject:</strong> {campaign?.emailSubject || "Password Reset Required"}
                  </p>
                  <p className="text-gray-600 mt-2">
                    <strong>Sender:</strong> {campaign?.senderEmail || "IT Security <security@company.com>"}
                  </p>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-gray-600">
                      {campaign?.emailBody || 
                        "The email template used in this campaign mimics a standard password reset notification that appears to come from the organization's IT department. It includes urgent language and a call to action to click the link to reset the password immediately."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaFileAlt className="mr-2 text-indigo-600" /> Landing Page
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    <strong>URL:</strong> {campaign?.landingPageLink || "https://acme-secure-login.com/reset"}
                  </p>
                  <p className="text-gray-600 mt-2">
                    <strong>Type:</strong> {campaign?.landingPageType || "Credential Harvester"}
                  </p>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-gray-600">
                      {campaign?.landingPageDescription || 
                        "The landing page closely resembles the organization's actual login portal. It includes the company logo, familiar color scheme, and form fields for username and password entry. Upon submission, it redirects to the legitimate company website."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Campaign Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <ul className="space-y-6 relative">
                  <li className="ml-10 relative">
                    <div className="absolute -left-10 mt-1.5 w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                      <FaEnvelope className="text-blue-600" size={12} />
                    </div>
                    <p className="font-medium text-gray-800">Campaign Initiated</p>
                    <p className="text-sm text-gray-500">
                      {new Date(campaign?.createdAt || new Date()).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </li>
                  <li className="ml-10 relative">
                    <div className="absolute -left-10 mt-1.5 w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                      <FaChartLine className="text-green-600" size={12} />
                    </div>
                    <p className="font-medium text-gray-800">First Click Recorded</p>
                    <p className="text-sm text-gray-500">
                      {reportData?.reportData?.length > 0 
                        ? new Date(reportData.reportData[reportData.reportData.length - 1].created_at).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : 'No clicks recorded'}
                    </p>
                  </li>
                  <li className="ml-10 relative">
                    <div className="absolute -left-10 mt-1.5 w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                      <FaExclamationTriangle className="text-red-600" size={12} />
                    </div>
                    <p className="font-medium text-gray-800">First Credential Submission</p>
                    <p className="text-sm text-gray-500">
                      {reportData?.reportData?.filter(r => r.response_text)?.length > 0 
                        ? new Date(reportData.reportData.find(r => r.response_text)?.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : 'No credentials submitted'}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        // Add this code after the Slide 2 section and before the closing </div> of the container

{/* Slide 3: Context */}
<div 
  ref={el => slidesRef.current[2] = el} 
  className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[80vh]"
>
  <div className="p-8">
    <h2 className="text-3xl font-bold text-gray-800 mb-6">Campaign Context & Analysis</h2>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div className="lg:col-span-2 rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Security Risk Assessment</h3>
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <span className="inline-block w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <FaExclamationTriangle />
              </span>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-800">Social Engineering Tactics</h4>
              <p className="text-gray-600 mt-1">
                This campaign utilized {campaign?.social_engineering_tactic || "urgency and authority"} 
                to manipulate users into taking immediate action without proper verification.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <span className="inline-block w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <FaGlobe />
              </span>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-800">Deceptive Elements</h4>
              <p className="text-gray-600 mt-1">
                The landing page URL ({campaign?.landingPageLink || "example.com"}) was designed to look legitimate
                but actually redirected to a credential-harvesting form.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Lookalike Domain</span>
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">SSL Certificate Misuse</span>
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Brand Impersonation</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <span className="inline-block w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaUser />
              </span>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-gray-800">Target Analysis</h4>
              <p className="text-gray-600 mt-1">
                This campaign targeted {campaign?.recipientEmails?.length || "N/A"} users across the organization.
                {reportData?.uniqueUsers > 0 && ` ${reportData.uniqueUsers} users (${Math.round((reportData.uniqueUsers / (campaign?.recipientEmails?.length || 1)) * 100)}%) engaged with the phishing content.`}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Campaign Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">Click-through Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((reportData?.uniqueUsers || 0) / (campaign?.recipientEmails?.length || 1) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.round((reportData?.uniqueUsers || 0) / (campaign?.recipientEmails?.length || 1) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">Submission Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((reportData?.reportData?.filter(r => r.response_text)?.length || 0) / (reportData?.uniqueUsers || 1) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${Math.round((reportData?.reportData?.filter(r => r.response_text)?.length || 0) / (reportData?.uniqueUsers || 1) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Data Submission</h4>
            <div className="h-48">
              {getSubmissionRateChartData() && (
                <Pie data={getSubmissionRateChartData()} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Red Flags and Warning Signs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-3">Email Red Flags</h4>
          <ul className="space-y-2">
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">Mismatched or suspicious sender email address</span>
            </li>
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">Urgent or threatening language</span>
            </li>
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">Generic greeting instead of personalized</span>
            </li>
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">Grammatical errors or unusual phrasing</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-3">URL/Website Red Flags</h4>
          <ul className="space-y-2">
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">URL doesn't match the organization's domain</span>
            </li>
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">Use of URL shorteners to hide actual destination</span>
            </li>
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">Subtle misspellings in the domain (typosquatting)</span>
            </li>
            <li className="flex items-center">
              <FaTimes className="text-red-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">HTTP instead of HTTPS connection</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Slide 4: Data */}
<div 
  ref={el => slidesRef.current[3] = el} 
  className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[80vh]"
>
  <div className="p-8">
    <h2 className="text-3xl font-bold text-gray-800 mb-6">Response Data</h2>
    
    <div className="rounded-lg border border-gray-200 p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Timeline</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">IP Address</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reportData?.reportData?.slice().reverse().map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaRegClock className="mr-2 text-gray-400" />
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="font-medium text-indigo-800">
                        {entry.user_id.toString()[0] || 'U'}
                      </span>
                    </div>
                    <span className="ml-2">User {entry.user_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.ip_address?.replace('::ffff:', '') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {entry.response_text ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Data Submitted
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Link Clicked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {entry.response_text ? (
                    <button 
                      onClick={() => alert(entry.response_text)}
                      className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
                    >
                      View submitted data
                    </button>
                  ) : (
                    "No data submitted"
                  )}
                </td>
              </tr>
            ))}
            
            {(!reportData?.reportData || reportData.reportData.length === 0) && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-sm text-center text-gray-500">
                  No response data available for this campaign.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Data Collection Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-600">Total Clicks</span>
            </div>
            <span className="font-bold">{reportData?.totalResponses || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
              <span className="text-gray-600">Unique Users</span>
            </div>
            <span className="font-bold">{reportData?.uniqueUsers || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-600">Data Submissions</span>
            </div>
            <span className="font-bold">{reportData?.reportData?.filter(r => r.response_text)?.length || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-600">Non-Engaged Users</span>
            </div>
            <span className="font-bold">{(campaign?.recipientEmails?.length || 0) - (reportData?.uniqueUsers || 0)}</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Overall Risk Level</span>
            
            {(() => {
              const clickRate = (reportData?.uniqueUsers || 0) / (campaign?.recipientEmails?.length || 1);
              const submissionRate = (reportData?.reportData?.filter(r => r.response_text)?.length || 0) / (reportData?.uniqueUsers || 1);
              
              let riskClass = "bg-green-100 text-green-800";
              let riskLevel = "Low";
              
              if (clickRate > 0.3 || submissionRate > 0.5) {
                riskClass = "bg-red-100 text-red-800";
                riskLevel = "High";
              } else if (clickRate > 0.1 || submissionRate > 0.2) {
                riskClass = "bg-yellow-100 text-yellow-800";
                riskLevel = "Medium";
              }
              
              return (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskClass}`}>
                  {riskLevel}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">1</span>
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-gray-800">Security Awareness Training</h4>
              <p className="text-sm text-gray-600 mt-1">
                Schedule targeted training for users who submitted data in this campaign.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">2</span>
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-gray-800">Email Security Review</h4>
              <p className="text-sm text-gray-600 mt-1">
                Enhance email filtering rules to detect similar phishing attempts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">3</span>
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-gray-800">Implement Multi-Factor Authentication</h4>
              <p className="text-sm text-gray-600 mt-1">
                Add an additional layer of protection for user accounts.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">4</span>
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-gray-800">Follow-up Campaign</h4>
              <p className="text-sm text-gray-600 mt-1">
                Run another campaign in 30 days to measure improvement.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Generate Training Plan
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
        </div>
        
    );
    }
export default Report;
