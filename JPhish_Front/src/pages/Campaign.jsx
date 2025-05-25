import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import apiClient, { campaignApiClient, detailsTrackerApiClient } from '../apiClient';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartLegend } from 'chart.js';
import {
  FaEllipsisV, FaEnvelope, FaFileAlt, FaSave, FaCheck, FaEye, FaTrashAlt, FaPaperPlane,
  FaTimes, FaPlus, FaRocket, FaListUl, FaChartPie, FaUsers, FaMousePointer,
  FaShareSquare, FaRedo, FaCheckCircle, FaExclamationCircle, FaHourglassHalf, FaBan, FaCalendarAlt,
  FaFilter, FaSearch, FaCogs, FaUserCheck, FaInfoCircle, FaServer, FaNetworkWired, FaUserShield, FaKey} from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, ChartLegend);

const animationStyles = `
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
  .animate-slide-out { animation: slideOut 0.3s ease-in forwards; }
  .animate-fade-in { animation: fadeIn 0.35s ease-in-out forwards; }
  .animate-zoom-in { animation: zoomIn 0.2s ease-out forwards; }

  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; /* Tailwind slate-100 */ }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; /* Tailwind slate-400 */ border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; /* Tailwind slate-500 */ }
`;

const chartColors = {
  opened: ['#2dd4bf', '#e2e8f0'],       // Teal (opened), Slate (not opened) - Tailwind teal-400, slate-200
  clicked: ['#facc15', '#e2e8f0'],      // Yellow (clicked), Slate (not clicked) - Tailwind yellow-400, slate-200
  submitted: ['#f43f5e', '#e2e8f0'],   // Rose (submitted), Slate (not submitted) - Tailwind rose-500, slate-200
  borders: ['#0d9488', '#cbd5e1', '#e11d48', '#cbd5e1'] // Darker shades for borders
};

const FormInputLaunchModal = ({ id, label, type = "text", value, onChange, placeholder, required = false, rows, icon, autoComplete = "off" }) => (
     <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        {icon && <span className="mr-2 text-gray-500">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows || 3}
               className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm custom-scrollbar" />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete}
               className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm" />
      )}
    </div>
  );

const Campaign = () => {
  const navigate = useNavigate();

  const selectedGroup = useSelector((state) => state.groups?.selectedGroup);
  const selectedEmailTemplate = useSelector((state) => state.templates?.emailTemplate);
  const selectedLandingTemplate = useSelector((state) => state.templates?.landingTemplate);
  const selectedSenderProfile = useSelector((state) => state.senderProfiles?.selectedProfile);

  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [launchModalMode, setLaunchModalMode] = useState('quick');

  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignResponses, setCampaignResponses] = useState([]);
  const [campaignTargets, setCampaignTargets] = useState([]);
  const [totalUsersInSelectedCampaign, setTotalUsersInSelectedCampaign] = useState(0);

  const [quickLaunchCampaignName, setQuickLaunchCampaignName] = useState('');
  const [advCampaignName, setAdvCampaignName] = useState('');
  const [advEmails, setAdvEmails] = useState('');
  const [advSmtpHost, setAdvSmtpHost] = useState('');
  const [advSmtpUsername, setAdvSmtpUsername] = useState('');
  const [advSmtpPassword, setAdvSmtpPassword] = useState('');
  const [advSmtpPort, setAdvSmtpPort] = useState('');
  const [advEmailBody, setAdvEmailBody] = useState('');
  const [advLandingLink, setAdvLandingLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 3000);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCampaigns = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);
    try {
      const response = await campaignApiClient.get('/api/campaigns/all');
      const fetchedCampaigns = Array.isArray(response.data)
        ? response.data.sort((a, b) => new Date(b.createdAt || b.createDate) - new Date(a.createdAt || a.createDate)) // Use createDate as fallback
        : [];
      setCampaigns(fetchedCampaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      showToast('Failed to fetch campaigns.', 'error');
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredCampaigns(
      campaigns.filter(c =>
        c.name?.toLowerCase().includes(lowerSearchTerm) ||
        String(c.id)?.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [searchTerm, campaigns]);

  const getUniqueUserInteractions = useCallback((responsesArray) => {
    const interactions = {
        clickedUsers: new Set(),
        submittedUsers: new Set(),
    };
    if (!Array.isArray(responsesArray)) return interactions;

    responsesArray.forEach(response => {
        if(response.user_id) interactions.clickedUsers.add(response.user_id);
        if (response.response_text && response.response_text.trim() !== "" && response.user_id) {
            interactions.submittedUsers.add(response.user_id);
        }
    });
    return interactions;
  }, []);

  const handleShowCampaignDetails = useCallback(async (campaign) => {
    setSelectedCampaign(campaign);
    setLoading(true);
    try {
      const [responsesRes, targetsRes] = await Promise.all([
        detailsTrackerApiClient.get(`/api/responses/campaign/${campaign.id}`),
        campaignApiClient.get(`/api/campaigns/${campaign.id}/targets`)
      ]);

      const allResponses = Array.isArray(responsesRes.data) ? responsesRes.data : [];
      setCampaignResponses(allResponses);
      
      const targetsData = Array.isArray(targetsRes.data) ? targetsRes.data : [];
      setCampaignTargets(targetsData);

      setTotalUsersInSelectedCampaign(targetsData.length || campaign.recipientEmails?.length || 0);

    } catch (err) {
      console.error('Error fetching campaign details:', err);
      showToast('Failed to fetch campaign details.', 'error');
      setSelectedCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleOpenLaunchModal = (mode = 'quick') => {
    setLaunchModalMode(mode);
    if (mode === 'quick') {
      if (!selectedGroup || !selectedEmailTemplate || !selectedLandingTemplate || !selectedSenderProfile) {
        showToast('Please select all components (Group, Templates, Profile) via other pages first, or use Advanced Setup.', 'warning');
      }
      setQuickLaunchCampaignName('');
    } else {
      setAdvCampaignName('');
      setAdvEmails('');
      setAdvSmtpHost(selectedSenderProfile?.profileSMTPHost || '');
      setAdvSmtpUsername(selectedSenderProfile?.profileSMTPUsername || '');
      setAdvSmtpPassword('');
      setAdvSmtpPort(selectedSenderProfile?.profileSMTPPort || '');
      try {
        setAdvEmailBody(selectedEmailTemplate && selectedEmailTemplate.body ? atob(selectedEmailTemplate.body) : '');
      } catch (e) {
        console.warn("Failed to decode email template body:", e);
        setAdvEmailBody(selectedEmailTemplate?.body || '');
      }
      setAdvLandingLink('');
    }
    setIsLaunchModalOpen(true);
  };

  const handleQuickLaunchCampaign = useCallback(async (e) => {
    e.preventDefault();
    if (!quickLaunchCampaignName.trim()) {
      showToast('Campaign Name is required.', 'error'); return;
    }
    if (!selectedGroup || !selectedEmailTemplate || !selectedLandingTemplate || !selectedSenderProfile) {
      showToast('All components (Group, Templates, Profile) must be selected for Quick Launch.', 'error'); return;
    }
    const jwtToken = localStorage.getItem('jwtToken');
    const payload = {
      jwtToken, campaignName: quickLaunchCampaignName,
      userGroupId: selectedGroup.id, emailTemplateId: selectedEmailTemplate.id,
      landingPageTemplateId: selectedLandingTemplate.id, profileId: selectedSenderProfile.id,
    };
    setLoading(true);
    try {
      await campaignApiClient.post('/api/campaigns/create_and_send', payload);
      showToast('Campaign (Quick Launch) started successfully!');
      setIsLaunchModalOpen(false);
      setQuickLaunchCampaignName('');
      fetchCampaigns(false);
    } catch (err) {
      console.error('Error starting quick launch campaign:', err);
      showToast(`Failed to start campaign: ${err.response?.data?.message || err.message}`, 'error');
    } finally { setLoading(false); }
  }, [quickLaunchCampaignName, selectedGroup, selectedEmailTemplate, selectedLandingTemplate, selectedSenderProfile, showToast, fetchCampaigns]);

  const handleAdvancedCampaignSend = useCallback(async (e) => {
    e.preventDefault();
    if(!advCampaignName.trim()) { showToast('Campaign Name is required.', 'error'); return; }
    if(!advEmails.trim()) { showToast('Recipient Emails are required.', 'error'); return; }
    // Add more specific validations for other advanced fields if necessary

    const payload = {
      name: advCampaignName,
      emails: advEmails.split(',').map(email => email.trim()).filter(email => email),
      smtpConfig: {
        host: advSmtpHost, username: advSmtpUsername,
        password: advSmtpPassword, port: advSmtpPort,
      },
      emailBody: advEmailBody,
      landingPageLink: advLandingLink, // Placeholder like {{PHISHING_LINK}}
    };
    setLoading(true);
    try {
      await campaignApiClient.post('/api/campaigns/send/advanced', payload); // Ensure this endpoint exists
      showToast('Campaign (Advanced Setup) created and emails sent successfully!');
      setIsLaunchModalOpen(false);
      setAdvCampaignName(''); setAdvEmails(''); setAdvSmtpHost(''); setAdvSmtpUsername('');
      setAdvSmtpPassword(''); setAdvSmtpPort(''); setAdvEmailBody(''); setAdvLandingLink('');
      fetchCampaigns(false);
    } catch (err) {
      console.error('Error sending advanced campaign:', err);
      showToast(`Failed to send campaign: ${err.response?.data?.message || err.message}`, 'error');
    } finally { setLoading(false); }
  }, [advCampaignName, advEmails, advSmtpHost, advSmtpUsername, advSmtpPassword, advSmtpPort, advEmailBody, advLandingLink, showToast, fetchCampaigns]);

  const handleDeleteCampaign = useCallback(async (campaignId, campaignName) => {
    if (window.confirm(`Are you sure you want to delete campaign "${campaignName}" (ID: ${campaignId})? This action cannot be undone.`)) {
      setLoading(true);
      try {
        await campaignApiClient.delete(`/api/campaigns/${campaignId}`);
        showToast('Campaign deleted successfully!');
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        if (selectedCampaign && selectedCampaign.id === campaignId) {
          setSelectedCampaign(null); setCampaignResponses([]); setCampaignTargets([]);
        }
      } catch (err) {
        console.error('Error deleting campaign:', err);
        showToast(`Failed to delete campaign: ${err.response?.data?.message || err.message}`, 'error');
      } finally { setLoading(false); }
    }
    setOpenMenuId(null);
  }, [selectedCampaign, showToast]);

  const handleMarkCampaignCompleted = useCallback(async (campaignId) => {
    setLoading(true);
    try {
      await campaignApiClient.put(`/api/campaigns/${campaignId}/status?status=completed`);
      showToast('Campaign marked as completed!');
      const updatedCampaigns = campaigns.map(c => c.id === campaignId ? { ...c, status: 'completed' } : c);
      setCampaigns(updatedCampaigns);
      if (selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign(prev => ({ ...prev, status: 'completed' }));
      }
    } catch (err) {
      console.error('Error marking campaign completed:', err);
      showToast(`Failed to mark campaign as completed: ${err.response?.data?.message || err.message}`, 'error');
    } finally { setLoading(false); }
    setOpenMenuId(null);
  }, [campaigns, selectedCampaign, showToast]);
  
  const chartOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '60%',
    animation: { duration: 1200, easing: 'easeInOutQuart' },
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11, family: "'Inter', sans-serif" }, padding: 15, usePointStyle: true, pointStyle: 'circle', color: '#4b5563'} },
      tooltip: {
        enabled: true, backgroundColor: 'rgba(0,0,0,0.75)', titleFont: { weight: 'bold', family: "'Inter', sans-serif" }, bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 10, cornerRadius: 4, displayColors: false,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total === 0 && value === 0) return `${label}: 0`; // Avoid NaN% if total is 0
            const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  const getEmailsOpenedChartData = useCallback(() => {
    if (!selectedCampaign || totalUsersInSelectedCampaign === 0) return null;
    const openedCount = campaignTargets.filter(target => target.emailOpened).length;
    const notOpenedCount = Math.max(0, totalUsersInSelectedCampaign - openedCount);
    if (openedCount === 0 && notOpenedCount === 0 && totalUsersInSelectedCampaign > 0) { // Show "0 Opened" if total users > 0
        return { labels: ['Opened', 'Not Opened'], datasets: [{ data: [0, totalUsersInSelectedCampaign], backgroundColor: chartColors.opened, borderColor: chartColors.borders[0], borderWidth: 1, hoverOffset: 8 }] };
    }
    if (openedCount === 0 && notOpenedCount === 0) return null;
    return { labels: ['Opened', 'Not Opened'], datasets: [{ data: [openedCount, notOpenedCount], backgroundColor: chartColors.opened, borderColor: chartColors.borders[0], borderWidth: 1, hoverOffset: 8 }] };
  }, [selectedCampaign, campaignTargets, totalUsersInSelectedCampaign]);

  const getEmailsClickedChartData = useCallback(() => {
    if (!selectedCampaign || totalUsersInSelectedCampaign === 0) return null;
    const interactions = getUniqueUserInteractions(campaignResponses);
    const clickedCount = interactions.clickedUsers.size;
    const notClickedCount = Math.max(0, totalUsersInSelectedCampaign - clickedCount);
    if (clickedCount === 0 && notClickedCount === 0 && totalUsersInSelectedCampaign > 0) {
        return { labels: ['Clicked Link', 'Not Clicked'], datasets: [{ data: [0, totalUsersInSelectedCampaign], backgroundColor: chartColors.clicked, borderColor: chartColors.borders[1], borderWidth: 1, hoverOffset: 8 }] };
    }
    if (clickedCount === 0 && notClickedCount === 0) return null;
    return { labels: ['Clicked Link', 'Not Clicked'], datasets: [{ data: [clickedCount, notClickedCount], backgroundColor: chartColors.clicked, borderColor: chartColors.borders[1], borderWidth: 1, hoverOffset: 8 }] };
  }, [selectedCampaign, campaignResponses, totalUsersInSelectedCampaign, getUniqueUserInteractions]);

  const getDetailsSharedChartData = useCallback(() => {
    if (!selectedCampaign || totalUsersInSelectedCampaign === 0) return null;
    const interactions = getUniqueUserInteractions(campaignResponses);
    const submittedCount = interactions.submittedUsers.size;
    const notSubmittedCount = Math.max(0, totalUsersInSelectedCampaign - submittedCount);
     if (submittedCount === 0 && notSubmittedCount === 0 && totalUsersInSelectedCampaign > 0) {
        return { labels: ['Details Submitted', 'Not Submitted'], datasets: [{ data: [0, totalUsersInSelectedCampaign], backgroundColor: chartColors.submitted, borderColor: chartColors.borders[2], borderWidth: 1, hoverOffset: 8 }] };
    }
    if (submittedCount === 0 && notSubmittedCount === 0) return null;
    return { labels: ['Details Submitted', 'Not Submitted'], datasets: [{ data: [submittedCount, notSubmittedCount], backgroundColor: chartColors.submitted, borderColor: chartColors.borders[2], borderWidth: 1, hoverOffset: 8 }] };
  }, [selectedCampaign, campaignResponses, totalUsersInSelectedCampaign, getUniqueUserInteractions]);
  
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getStatusPill = (status) => {
    switch (status?.toLowerCase()) {
      case 'running': case 'active':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 shadow-sm border border-yellow-200">Running</span>;
      case 'completed':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 shadow-sm border border-green-200">Completed</span>;
      case 'draft':
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 shadow-sm border border-gray-200">Draft</span>;
      default:
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 shadow-sm border border-red-200">{status || 'Unknown'}</span>;
    }
  };

  const ToastComponent = useCallback(() => {
    if (!toastVisible || !toast) return null;
    const successColors = 'bg-blue-50 border border-blue-300 text-blue-700';
    const errorColors = 'bg-red-50 border border-red-300 text-red-700';
    const warningColors = 'bg-yellow-50 border border-yellow-300 text-yellow-700';
    let toastColors;
    if (toast.type === 'success') toastColors = successColors;
    else if (toast.type === 'error') toastColors = errorColors;
    else toastColors = warningColors; // Default to warning or add more types

    return (
      <div className={`fixed top-20 right-6 z-[100] w-full max-w-sm ${toastVisible ? 'animate-slide-in' : 'animate-slide-out'}`}>
        <div className={`${toastColors} px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-xl" /> : 
           toast.type === 'error' ? <FaExclamationCircle className="text-xl" /> : 
           <FaInfoCircle className="text-xl" /> }
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    );
  }, [toast, toastVisible]);

  // const FormInputLaunchModal = ({ id, label, type = "text", value, onChange, placeholder, required = false, rows, icon, autoComplete = "off" }) => (
  //    <div>
  //     <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
  //       {icon && <span className="mr-2 text-gray-500">{icon}</span>}
  //       {label}
  //       {required && <span className="text-red-500 ml-1">*</span>}
  //     </label>
  //     {type === "textarea" ? (
  //       <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows || 3}
  //              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm custom-scrollbar" />
  //     ) : (
  //       <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete}
  //              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm" />
  //     )}
  //   </div>
  // );

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen font-sans">
      <style>{animationStyles}</style>
      <ToastComponent />
      {loading && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="p-6 rounded-lg shadow-xl text-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-700">Processing...</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-md mr-4"><FaRocket className="text-white text-2xl" /></div>
          <h1 className="text-3xl font-bold text-gray-800">Campaign Command Center</h1>
        </div>
        <p className="text-gray-600 ml-[calc(2.5rem+0.625rem)]">Launch, monitor, and manage your phishing campaigns.</p>
      </div>

      <div className="mb-6 flex justify-start items-center">
        <button
          onClick={() => handleOpenLaunchModal('quick')}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg flex items-center transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <FaPlus className="mr-2" /> Launch New Campaign
        </button>
        <button
            onClick={() => fetchCampaigns(true)}
            title="Refresh Campaign List"
            className="ml-4 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg border border-gray-300 flex items-center transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
            <FaRedo size={14} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/5 xl:w-1/3">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col">
            <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center"><FaListUl className="mr-2.5" /> Campaign Directory</h2>
            </div>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text" placeholder="Search campaigns by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full rounded-full text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400" />
                <FaSearch className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex-grow px-2 pb-2 custom-scrollbar overflow-y-auto min-h-[300px]"> {/* Adjust max-h if needed, or use flex-grow */}
              {filteredCampaigns.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                  <FaRocket className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="font-semibold">{searchTerm ? 'No campaigns match search.' : 'No campaigns launched yet.'}</p>
                  <p className="text-sm mt-1">{searchTerm ? 'Try another term.' : 'Click "Launch New Campaign" to start.'}</p>
                </div>
              ) : (
                <ul className="space-y-3 p-2">
                  {filteredCampaigns.map((campaign) => (
                    <li key={campaign.id}
                        onClick={() => handleShowCampaignDetails(campaign)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer group
                                    ${selectedCampaign?.id === campaign.id 
                                        ? 'bg-blue-50 border-blue-500 shadow-lg ring-2 ring-blue-500 ring-offset-1' 
                                        : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`text-md font-semibold group-hover:text-blue-700 ${selectedCampaign?.id === campaign.id ? 'text-blue-700' : 'text-gray-800'}`}>{campaign.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">ID: {campaign.id} <span className="mx-1">&bull;</span> <FaCalendarAlt className="inline mr-1 text-gray-400" />{formatDateForDisplay(campaign.createdAt || campaign.createDate)}</p>
                        </div>
                        <div className="relative">
                           <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === campaign.id ? null : campaign.id);}}
                                   className={`p-1.5 rounded-full transition-colors ${selectedCampaign?.id === campaign.id ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' : 'text-gray-400 hover:bg-gray-100 group-hover:text-gray-600'}`}>
                            <FaEllipsisV />
                          </button>
                          {openMenuId === campaign.id && (
                            <div ref={actionMenuRef} className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-zoom-in">
                               <a onClick={(e) => { e.stopPropagation(); handleShowCampaignDetails(campaign); setOpenMenuId(null);}} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"><FaEye className="mr-2.5 text-gray-400" /> View Details</a>
                               <a onClick={(e) => { e.stopPropagation(); navigate(`/report/${campaign.id}`); setOpenMenuId(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"><FaFileAlt className="mr-2.5 text-gray-400" /> Get Report</a>
                               {campaign.status !== 'completed' && <a onClick={(e) => { e.stopPropagation(); handleMarkCampaignCompleted(campaign.id); }} className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 cursor-pointer"><FaCheckCircle className="mr-2.5" /> Mark Completed</a>}
                               <a onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign.id, campaign.name); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"><FaTrashAlt className="mr-2.5" /> Delete Campaign</a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 group-hover:border-gray-200/0 flex justify-between items-center">
                        {getStatusPill(campaign.status)}
                        <span className="text-xs text-gray-500 flex items-center"><FaUsers className="mr-1" /> {campaign.recipientEmails?.length || campaignTargets?.length || 0} Targets</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/5 xl:w-2/3">
          {selectedCampaign ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in h-full flex flex-col">
              <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center truncate" title={selectedCampaign.name}>
                        <FaChartPie className="mr-2.5" /> Performance: {selectedCampaign.name}
                    </h2>
                    <button onClick={() => setSelectedCampaign(null)} className="text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1" title="Close Details"><FaTimes /></button>
                </div>
              </div>
              <div className="p-6 space-y-6 custom-scrollbar overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: "Emails Opened", dataFn: getEmailsOpenedChartData, icon: <FaEnvelope className="text-teal-500 text-lg"/> },
                        { title: "Links Clicked", dataFn: getEmailsClickedChartData, icon: <FaMousePointer className="text-yellow-500 text-lg"/> },
                        { title: "Details Submitted", dataFn: getDetailsSharedChartData, icon: <FaShareSquare className="text-rose-500 text-lg"/> },
                    ].map(chart => {
                        const chartData = chart.dataFn();
                        return (
                            <div key={chart.title} className="bg-gray-50 p-4 rounded-xl shadow-md border border-gray-200 flex flex-col items-center hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-3 text-gray-700">
                                    {chart.icon}
                                    <h3 className="text-md font-semibold ml-2">{chart.title}</h3>
                                </div>
                                <div className="h-48 w-48 sm:h-52 sm:w-52">
                                    {chartData ? (
                                        <Doughnut data={chartData} options={chartOptions} />
                                     ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                                            <FaBan className="mr-1 text-2xl mb-1"/> No data available
                                        </div>
                                     )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">User Interactions</h3>
                  {campaignResponses.length === 0 ? (
                    <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                      <FaUsers className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No user interactions recorded for this campaign yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50/80 sticky top-0 z-[5]">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Data</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {campaignResponses.map((response) => (
                              <tr key={response.id} className="hover:bg-gray-50/70">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{response.user_id}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{response.ip_address?.replace('::ffff:', '')}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={response.response_text || 'Clicked link only'}>
                                  {response.response_text || <span className="italic text-gray-400">Clicked link</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(response.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
              <FaChartPie className="text-6xl text-gray-300 mb-6" />
              <p className="text-xl font-semibold text-gray-700">Select a Campaign</p>
              <p className="mt-1 text-center">Choose a campaign from the directory to view its detailed performance metrics and user interactions.</p>
            </div>
          )}
        </div>
      </div>

      {isLaunchModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[90] p-4 animate-fade-in">
          <div className="bg-white p-0 rounded-xl shadow-xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FaRocket className="mr-2 text-blue-500" /> Launch New Campaign: <span className="ml-1 font-bold">{launchModalMode === 'quick' ? 'Quick Launch' : 'Advanced Setup'}</span>
              </h2>
              <button onClick={() => setIsLaunchModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400" aria-label="Close"><FaTimes size={20} /></button>
            </div>
            
            <div className="overflow-y-auto flex-grow p-6 custom-scrollbar space-y-5">
              {launchModalMode === 'quick' ? (
                <form onSubmit={handleQuickLaunchCampaign} className="space-y-5">
                  <FormInputLaunchModal id="quickCampaignName" label="Campaign Name" value={quickLaunchCampaignName} onChange={(e) => setQuickLaunchCampaignName(e.target.value)} placeholder="Enter a memorable campaign name" required icon={<FaFileAlt />} />
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-1.5 shadow-sm">
                    <p className="font-medium text-blue-700 flex items-center mb-1"><FaUserCheck className="mr-2"/> Using Selected Components:</p>
                    <p className='font-medium text-blue-900'><strong>User Group:</strong> {selectedGroup?.groupName || <span className="text-red-500 italic">Not Selected - Required</span>}</p>
                    <p className='font-medium text-blue-900'><strong>Email Template:</strong> {selectedEmailTemplate?.name || <span className="text-red-500 italic">Not Selected - Required</span>}</p>
                    <p className='font-medium text-blue-900'><strong>Landing Page:</strong> {selectedLandingTemplate?.name || <span className="text-red-500 italic">Not Selected - Required</span>}</p>
                    <p className='font-medium text-blue-900'><strong>Sender Profile:</strong> {selectedSenderProfile?.profileName || <span className="text-red-500 italic">Not Selected - Required</span>}</p>
                  </div>
                   <button type="button" onClick={() => setLaunchModalMode('advanced')} className="text-sm text-blue-600 hover:underline mt-2 block text-center w-full py-1">Switch to Advanced Setup</button>
                </form>
              ) : (
                <form onSubmit={handleAdvancedCampaignSend} className="space-y-4">
                   <FormInputLaunchModal id="advCampaignName" label="Campaign Name" value={advCampaignName} onChange={(e) => setAdvCampaignName(e.target.value)} placeholder="Enter campaign name" required icon={<FaFileAlt />} />
                  <FormInputLaunchModal id="advEmails" label="Target Emails (comma-separated)" type="textarea" value={advEmails} onChange={(e) => setAdvEmails(e.target.value)} placeholder="user1@example.com, user2@example.com" required icon={<FaUsers />} />
                  <h4 className="text-sm font-semibold text-gray-600 pt-3 border-t mt-4 mb-1">SMTP Configuration (if not using Sender Profile)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInputLaunchModal id="advSmtpHost" label="SMTP Host" value={advSmtpHost} onChange={(e) => setAdvSmtpHost(e.target.value)} placeholder="smtp.example.com" icon={<FaServer />} />
                    <FormInputLaunchModal id="advSmtpPort" label="Port" type="number" value={advSmtpPort} onChange={(e) => setAdvSmtpPort(e.target.value)} placeholder="587" icon={<FaNetworkWired />} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInputLaunchModal id="advSmtpUsername" label="SMTP Username" value={advSmtpUsername} onChange={(e) => setAdvSmtpUsername(e.target.value)} placeholder="your_email@example.com" icon={<FaUserShield />} />
                    <FormInputLaunchModal id="advSmtpPassword" label="SMTP Password" type="password" value={advSmtpPassword} onChange={(e) => setAdvSmtpPassword(e.target.value)} placeholder="your_password" icon={<FaKey />} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-600 pt-3 border-t mt-4 mb-1">Content Details</h4>
                  <FormInputLaunchModal id="advEmailBody" label="Email Body (HTML)" type="textarea" rows={5} value={advEmailBody} onChange={(e) => setAdvEmailBody(e.target.value)} placeholder="<p>Your HTML email content here...</p>" required icon={<FaEnvelope />} />
                  <FormInputLaunchModal id="advLandingLink" label="Phishing Link in Email (Placeholder)" type="text" value={advLandingLink} onChange={(e) => setAdvLandingLink(e.target.value)} placeholder="e.g., {{PHISHING_LINK}} or actual link" required icon={<FaFileAlt />} />
                   <button type="button" onClick={() => setLaunchModalMode('quick')} className="text-sm text-blue-600 hover:underline mt-2 block text-center w-full py-1">Switch to Quick Launch (uses pre-selected components)</button>
                </form>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
              <button onClick={() => setIsLaunchModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-lg transition-colors">Cancel</button>
              {launchModalMode === 'quick' ? (
                <button onClick={handleQuickLaunchCampaign}
                        disabled={!selectedGroup || !selectedEmailTemplate || !selectedLandingTemplate || !selectedSenderProfile || !quickLaunchCampaignName.trim()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed">
                  <FaPaperPlane className="mr-2" /> Start Quick Launch
                </button>
              ) : (
                 <button onClick={handleAdvancedCampaignSend}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg flex items-center">
                  <FaPaperPlane className="mr-2" /> Send Advanced Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;