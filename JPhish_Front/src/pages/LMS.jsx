import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate is available if needed
import apiClient, { detailsTrackerApiClient, campaignApiClient } from '../apiClient';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend as ChartLegend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import {
  FaGraduationCap, FaShieldAlt, FaBrain, FaUsers, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle,
  FaListAlt, FaChartPie, FaProjectDiagram, FaExternalLinkAlt, FaTimes, FaEye, FaSearch, FaRedo, FaFileDownload,
  FaUserGraduate, FaUserClock, FaUserTimes, FaInfoCircle, FaCogs, FaFilter, FaAngleRight, FaTasks,
  FaTachometerAlt, FaArchive, FaChartLine, // Added FaChartLine
  FaChalkboardTeacher
} from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, ChartLegend, CategoryScale, LinearScale, BarElement, Title);

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
  .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
  .animate-zoom-in { animation: zoomIn 0.3s ease-out forwards; }
  .animate-slide-in { animation: slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .animate-slide-out { animation: slideOutRight 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards; }
  .animate-spin { animation: spin 1s linear infinite; }

  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; /* slate-200 */ }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; /* slate-400 */ border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; /* slate-500 */ }
`;

const DEFAULT_TOPICS = ['Phishing Recognition', 'Password Security', 'Safe Browse', 'Data Protection', 'Recognizing Malware'];

const LEARNER_STATUS_MAP = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  NEEDS_REVIEW: 'Needs Review'
};

const CHART_COLORS_LIGHT = {
  pending: '#9ca3af',      // Tailwind Gray-400
  inProgress: '#facc15',   // Tailwind Yellow-400
  completed: '#2dd4bf',   // Tailwind Teal-400
  needsReview: '#f87171',  // Tailwind Red-400
  borders: {
    pending: '#6b7280',   // Tailwind Gray-500
    inProgress: '#eab308', // Tailwind Yellow-500
    completed: '#0d9488', // Tailwind Teal-600
    needsReview: '#ef4444',// Tailwind Red-500
  }
};

// --- Helper Component: Toast ---
const ToastComponent = ({ toast, isVisible, onClose }) => {
  const toastRefExt = useRef(null);

  useEffect(() => {
    if (isVisible) {
      if (toastRefExt.current) { clearTimeout(toastRefExt.current.visibilityTimeout); clearTimeout(toastRefExt.current.cleanupTimeout); }
      toastRefExt.current = {};
      toastRefExt.current.visibilityTimeout = setTimeout(() => onClose(), 3000);
      toastRefExt.current.cleanupTimeout = setTimeout(() => { if (toastRefExt.current) toastRefExt.current.toastInstance = null; }, 3300);
    }
    return () => { if (toastRefExt.current) { clearTimeout(toastRefExt.current.visibilityTimeout); clearTimeout(toastRefExt.current.cleanupTimeout); }};
  }, [isVisible, onClose]);

  if (!isVisible || !toast) return null;

  let bgColor, textColor, borderColor, IconComponent;
  switch (toast.type) {
    case 'success': bgColor = 'bg-blue-50'; textColor = 'text-blue-700'; borderColor = 'border-blue-300'; IconComponent = <FaCheckCircle className="text-xl text-blue-600" />; break;
    case 'error': bgColor = 'bg-red-50'; textColor = 'text-red-700'; borderColor = 'border-red-300'; IconComponent = <FaExclamationCircle className="text-xl text-red-600" />; break;
    case 'warning': bgColor = 'bg-yellow-50'; textColor = 'text-yellow-700'; borderColor = 'border-yellow-300'; IconComponent = <FaInfoCircle className="text-xl text-yellow-600" />; break;
    default: bgColor = 'bg-gray-50'; textColor = 'text-gray-700'; borderColor = 'border-gray-300'; IconComponent = <FaInfoCircle className="text-xl text-gray-600" />;
  }

  return (
    <div className={`fixed top-20 right-6 z-[1000] w-full max-w-sm ${isVisible ? 'animate-slide-in' : 'animate-slide-out'}`}>
      <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border ${bgColor} ${borderColor}`}>
        {IconComponent}
        <span className={`text-sm font-medium flex-1 ${textColor}`}>{toast.message}</span>
        <button onClick={onClose} className={`p-1 rounded-full hover:bg-black/10 focus:outline-none ${textColor} opacity-70 hover:opacity-100`}>
          <FaTimes className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>
  );
};

// --- Helper Component: GlobalStatCard for KPIs ---
const GlobalStatCard = ({ title, value, icon, unit = "", colorClass = "text-blue-700", bgColorClass = "bg-blue-100" }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 animate-slide-up flex-grow">
    <div className="flex items-center justify-between mb-1">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <span className={`p-2.5 rounded-full ${bgColorClass}`}>
        {React.cloneElement(icon, { className: `w-5 h-5 ${colorClass}` })}
      </span>
    </div>
    <p className={`text-3xl font-bold ${colorClass}`}>{value}{unit}</p>
  </div>
);

// --- Helper Component: ProgramSummaryCard ---
const ProgramSummaryCard = ({ program, onSelect, index }) => {
  let statusPillBg, statusPillText, StatusIconComponent;
  switch (program.programStatusLMS) {
    case 'Training Active': statusPillBg = 'bg-yellow-100'; statusPillText = 'text-yellow-800'; StatusIconComponent = <FaHourglassHalf className="mr-1.5" />; break;
    case 'Program Completed': statusPillBg = 'bg-green-100'; statusPillText = 'text-green-800'; StatusIconComponent = <FaCheckCircle className="mr-1.5" />; break;
    case 'Program Archived': statusPillBg = 'bg-gray-100'; statusPillText = 'text-gray-700'; StatusIconComponent = <FaArchive className="mr-1.5 opacity-70"/>; break;
    default: statusPillBg = 'bg-slate-100'; statusPillText = 'text-slate-700'; StatusIconComponent = <FaUserClock className="mr-1.5" />;
  }

  const miniDonutData = {
    datasets: [{
      data: [program.completionRate, 100 - program.completionRate],
      backgroundColor: [CHART_COLORS_LIGHT.completed, '#e5e7eb'], // Teal, Gray-200
      borderColor: [CHART_COLORS_LIGHT.borders.completed, '#d1d5db'], // Darker Teal, Gray-300
      borderWidth: 1, cutout: '75%',
    }],
  };
  const miniDonutOptions = { responsive: true, maintainAspectRatio: true, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } };

  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 animate-slide-up cursor-pointer group flex flex-col justify-between min-h-[270px]`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onSelect(program)}
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect(program)}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-800" title={program.name}>
                {program.name.length > 50 ? program.name.substring(0, 47) + "..." : program.name}
            </h3>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusPillBg} ${statusPillText} flex items-center shadow-sm border ${statusPillBg.replace('100','200')}`}>
                {StatusIconComponent} {program.programStatusLMS}
            </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Origin: Campaign ID {program.id}</p>
      </div>

      <div className="my-3 flex items-center space-x-4">
        <div className="w-20 h-20 relative flex items-center justify-center flex-shrink-0">
          <Doughnut data={miniDonutData} options={miniDonutOptions} />
          <div className="absolute text-xl font-bold text-blue-600">{program.completionRate}%</div>
        </div>
        <div className="text-sm space-y-1 text-gray-600">
          <p><strong className="font-medium text-gray-700">{program.learnersEnrolled}</strong> Learners Enrolled</p>
          <p><strong className="font-medium text-gray-700">{program.phishedUserCount}</strong> Originally Phished</p>
          <p><strong className="font-medium text-gray-700">{program.completionRate}%</strong> Completed Training</p>
        </div>
      </div>
      
      <div className="mt-auto pt-3 border-t border-gray-200">
        <button 
            onClick={(e) => {e.stopPropagation(); onSelect(program);}}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          <FaEye className="mr-2"/> View Details
        </button>
      </div>
    </div>
  );
};

// --- Helper Component: LearnerProgressRow ---
const LearnerProgressRow = ({ learner }) => {
  let statusPillBg, statusPillText, statusPillBorder;
  switch (learner.lmsStatus) {
    case LEARNER_STATUS_MAP.COMPLETED: statusPillBg = 'bg-green-50'; statusPillText = 'text-green-700'; statusPillBorder = 'border-green-200'; break;
    case LEARNER_STATUS_MAP.IN_PROGRESS: statusPillBg = 'bg-yellow-50'; statusPillText = 'text-yellow-700'; statusPillBorder = 'border-yellow-200'; break;
    case LEARNER_STATUS_MAP.NEEDS_REVIEW: statusPillBg = 'bg-red-50'; statusPillText = 'text-red-700'; statusPillBorder = 'border-red-200'; break;
    default: statusPillBg = 'bg-gray-50'; statusPillText = 'text-gray-600'; statusPillBorder = 'border-gray-200'; 
  }
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700" title={learner.email}>{learner.email}</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full shadow-xs border ${statusPillBg} ${statusPillText} ${statusPillBorder}`}>
              {learner.lmsStatus}
          </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">{learner.score}/30</td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{learner.analysis}</td>
    </tr>
  );
};

// --- Main LMS Component ---
const LMS = () => {
  const navigate = useNavigate();
  const [lmsPrograms, setLmsPrograms] = useState([]);
  const [selectedProgramDetail, setSelectedProgramDetail] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [toast, setToastState] = useState(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  
  const showToast = useCallback((message, type = 'success') => {
    setToastState({ message, type });
    setIsToastVisible(true);
  }, []);
  
  const closeToast = useCallback(() => {
    setIsToastVisible(false);
    setTimeout(() => setToastState(null), 300);
  }, []);

  const mapTrainingStatusToLms = useCallback((trainingStatus) => {
    if (!trainingStatus) return LEARNER_STATUS_MAP.PENDING;
    const status = String(trainingStatus).toUpperCase();
    if (status === 'REFORMED') return LEARNER_STATUS_MAP.COMPLETED;
    if (['DNL', 'UFM', 'ACTIVE', 'LEARNING REQUESTED', 'ACTIVELY LEARNING'].includes(status)) return LEARNER_STATUS_MAP.IN_PROGRESS;
    return LEARNER_STATUS_MAP.PENDING;
  },[]);

  const determineProgramLMSStatus = useCallback((campaignStatus, learners, phishedUserCount) => {
    const campStatus = String(campaignStatus).toLowerCase();
    if (campStatus === 'completed' || campStatus === 'archived') {
        const allLearnersEffectivelyCompleted = phishedUserCount > 0 && learners.length >= phishedUserCount && learners.every(l => l.lmsStatus === LEARNER_STATUS_MAP.COMPLETED || l.analysis === 'Status Unavailable' || l.analysis === 'Data Fetch Error' );
        return allLearnersEffectivelyCompleted ? 'Program Completed' : 'Program Archived';
    }
    if (phishedUserCount > 0 && learners.some(l => l.lmsStatus === LEARNER_STATUS_MAP.IN_PROGRESS || l.lmsStatus === LEARNER_STATUS_MAP.PENDING)) return 'Training Active';
    if (phishedUserCount > 0 && learners.length >= phishedUserCount && learners.every(l => l.lmsStatus === LEARNER_STATUS_MAP.COMPLETED)) return 'Program Completed';
    return 'Pending Initiation';
  },[]);

  const processCampaignDataForLMS = useCallback(async (campaignsToProcess) => {
    console.log("LMS: Starting processCampaignDataForLMS for", campaignsToProcess.length, "campaigns");
    const campaignProcessingPromises = campaignsToProcess.map(async (campaign) => {
        if (!campaign.id) return null;
        let learners = []; let phishedUserCount = 0; let enrolledUserCount = 0;
        try {
            const responsesData = await detailsTrackerApiClient.get(`/api/responses/campaign/${campaign.id}`);
            const responses = Array.isArray(responsesData.data) ? responsesData.data : [];
            const phishedUserIds = [...new Set(responses.map(r => r.user_id).filter(id => id != null))];
            phishedUserCount = phishedUserIds.length;

            if (phishedUserIds.length > 0) {
                const userPromises = phishedUserIds.map(userId =>
                    apiClient.post(`/user/${userId}`)
                        .then(userResponse => {
                            enrolledUserCount++;
                            if (userResponse.data) {
                                return {
                                    id: userId, email: userResponse.data.email || `learner_${userId}@example.com`,
                                    lmsStatus: mapTrainingStatusToLms(userResponse.data.trainingStatus),
                                    score: userResponse.data.answers || 0, analysis: userResponse.data.trainingStatus || 'N/A',
                                    lastActivity: userResponse.data.lastActivity || campaign.updatedAt || campaign.createDate,
                                };
                            }
                            return { id: userId, email: `phished_user_${userId}@example.com`, lmsStatus: LEARNER_STATUS_MAP.PENDING, score: 0, analysis: 'Status Unavailable', lastActivity: campaign.updatedAt || campaign.createDate };
                        })
                        .catch(userErr => {
                            console.warn(`Could not fetch/process for user ${userId} in campaign ${campaign.id}:`, userErr.message);
                            enrolledUserCount++;
                            return { id: userId, email: `phished_user_${userId}@example.com`, lmsStatus: LEARNER_STATUS_MAP.PENDING, score: 0, analysis: 'Data Fetch Error', lastActivity: campaign.updatedAt || campaign.createDate };
                        })
                );
                learners = await Promise.all(userPromises);
            }
        } catch (err) { console.error(`Error processing responses for campaign ${campaign.id}:`, err); }
        
        const completedLearners = learners.filter(l => l.lmsStatus === LEARNER_STATUS_MAP.COMPLETED).length;
        const baseForCompletion = enrolledUserCount > 0 ? enrolledUserCount : (phishedUserCount > 0 ? phishedUserCount : 0);
        const completionRate = baseForCompletion > 0 ? Math.round((completedLearners / baseForCompletion) * 100) : 0;
        const programStatusLMS = determineProgramLMSStatus(campaign.status, learners, phishedUserCount);

        return {
            id: campaign.id, name: campaign.name || `Training Program ${campaign.id}`,
            originalCampaignStatus: campaign.status || 'Unknown', programStatusLMS,
            description: campaign.description || 'Targeted security awareness training initiative.',
            topics: campaign.topics || DEFAULT_TOPICS,
            totalCampaignRecipients: campaign.recipientEmails?.length || phishedUserCount,
            phishedUserCount, learnersEnrolled: enrolledUserCount,
            completionRate, learners,
            createdAt: campaign.createdAt || campaign.createDate || new Date().toISOString(),
        };
    });
    const results = await Promise.all(campaignProcessingPromises);
    console.log("LMS: Finished processing all campaigns. Results:", results.length);
    return results.filter(p => p !== null).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [mapTrainingStatusToLms, determineProgramLMSStatus]);

  const loadData = useCallback(async () => {
      setInitialLoading(true); 
      setContentLoading(true); 
      setPageError(null);
      console.log("LMS: loadData called");
      try {
          const campaignResponse = await campaignApiClient.get('/api/campaigns/all');
          console.log("LMS: Fetched campaigns API response");
          const campaignsData = Array.isArray(campaignResponse.data) ? campaignResponse.data : [];
          if (campaignsData.length === 0) {
              showToast("No phishing campaigns found to process for LMS.", "warning");
              setLmsPrograms([]);
          } else {
              const processed = await processCampaignDataForLMS(campaignsData);
              setLmsPrograms(processed);
          }
      } catch (err) {
          console.error('Error fetching initial data for LMS:', err);
          setPageError('Failed to load training program data. Please try refreshing the page.');
          showToast('Failed to load data.', 'error');
          setLmsPrograms([]);
      } finally {
          console.log("LMS: loadData finished, setting loading states to false.");
          setInitialLoading(false);
          setContentLoading(false);
      }
  }, [processCampaignDataForLMS, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAndSortedPrograms = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return lmsPrograms.filter(program => {
      const filterStatus = String(program.programStatusLMS).toLowerCase();
      const matchesFilter = activeFilter === 'all' ? true :
                            activeFilter === 'active' ? filterStatus.includes('active') :
                           (filterStatus.includes('completed') || filterStatus.includes('archived'));
      const matchesSearch = program.name.toLowerCase().includes(lowerSearch) || String(program.id).toLowerCase().includes(lowerSearch);
      return matchesFilter && matchesSearch;
    });
  }, [lmsPrograms, activeFilter, searchTerm]);
  
  const kpiData = useMemo(() => {
    let totalLearnersCount = 0; let completedTrainingsCount = 0; let activeProgramsCount = 0;
    const topicOccurrences = {};
    lmsPrograms.forEach(program => {
      if (program.programStatusLMS === 'Training Active' || program.programStatusLMS === 'Post-Campaign Training') { activeProgramsCount++; }
      program.learners.forEach(learner => {
        totalLearnersCount++;
        if (learner.lmsStatus === LEARNER_STATUS_MAP.COMPLETED) { completedTrainingsCount++; }
      });
      (program.topics || []).forEach(topic => { topicOccurrences[topic] = (topicOccurrences[topic] || 0) + 1; });
    });
    const overallCompletionRate = totalLearnersCount > 0 ? Math.round((completedTrainingsCount / totalLearnersCount) * 100) : 0;
    const mostFrequentTopic = Object.entries(topicOccurrences).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return { totalEnrolledLearners: totalLearnersCount, overallCompletionRate, activeTrainingPrograms: activeProgramsCount, mostFrequentTopic };
  }, [lmsPrograms]);

  const detailProgramLearnerStatusChartData = useMemo(() => {
    if (!selectedProgramDetail) return null;
    const statusCounts = {
      [LEARNER_STATUS_MAP.PENDING]: 0, [LEARNER_STATUS_MAP.IN_PROGRESS]: 0,
      [LEARNER_STATUS_MAP.COMPLETED]: 0, [LEARNER_STATUS_MAP.NEEDS_REVIEW]: 0,
    };
    let totalLearnersInProgram = 0;
    selectedProgramDetail.learners.forEach(learner => {
      totalLearnersInProgram++;
      if (statusCounts[learner.lmsStatus] !== undefined) statusCounts[learner.lmsStatus]++;
      else statusCounts[LEARNER_STATUS_MAP.PENDING]++;
    });

    if (totalLearnersInProgram === 0 && selectedProgramDetail.learners.length > 0) {
        return {
            labels: Object.values(LEARNER_STATUS_MAP),
            datasets: [{ data: Object.keys(statusCounts).map(() => 0), 
                backgroundColor: [CHART_COLORS_LIGHT.pending, CHART_COLORS_LIGHT.inProgress, CHART_COLORS_LIGHT.completed, CHART_COLORS_LIGHT.needsReview], 
                borderColor: [CHART_COLORS_LIGHT.borders.pending, CHART_COLORS_LIGHT.borders.inProgress, CHART_COLORS_LIGHT.borders.completed, CHART_COLORS_LIGHT.borders.needsReview], 
                borderWidth: 1, hoverOffset: 8 }],
        };
    }
    if (totalLearnersInProgram === 0) return null;

    return {
      labels: Object.values(LEARNER_STATUS_MAP),
      datasets: [{
        data: [statusCounts[LEARNER_STATUS_MAP.PENDING], statusCounts[LEARNER_STATUS_MAP.IN_PROGRESS], statusCounts[LEARNER_STATUS_MAP.COMPLETED], statusCounts[LEARNER_STATUS_MAP.NEEDS_REVIEW]],
        backgroundColor: [CHART_COLORS_LIGHT.pending, CHART_COLORS_LIGHT.inProgress, CHART_COLORS_LIGHT.completed, CHART_COLORS_LIGHT.needsReview],
        borderColor: [CHART_COLORS_LIGHT.borders.pending, CHART_COLORS_LIGHT.borders.inProgress, CHART_COLORS_LIGHT.borders.completed, CHART_COLORS_LIGHT.borders.needsReview],
        borderWidth: 1, hoverOffset: 8,
      }],
    };
  }, [selectedProgramDetail]);

  const chartDoughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    animation: { duration: 1200, easing: 'easeInOutQuart' },
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11, family: "'Inter', sans-serif" }, padding: 15, usePointStyle: true, pointStyle: 'circle', color: '#4b5563'} },
      tooltip: { 
        backgroundColor: 'rgba(31, 41, 55, 0.9)', titleFont: { weight: 'bold', family: "'Inter', sans-serif", size: 13, color: '#f3f4f6' }, bodyFont: { size: 12, family: "'Inter', sans-serif", color: '#e5e7eb' },
        padding: 12, cornerRadius: 6, displayColors: true, borderColor: 'rgba(55, 65, 81, 0.5)', borderWidth: 1, boxPadding: 4,
        callbacks: {
          label: function(context) { 
            const label = context.label || ''; const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            if (total === 0 && value === 0) return `${label}: 0`;
            const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  // --- Conditional Rendering for Loading and Error States ---
  if (initialLoading) {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center z-[1000]">
            <div className="p-6 rounded-lg text-center">
                <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-lg font-semibold text-gray-700">Loading Learning Dashboard...</p>
                <p className="text-sm text-gray-500">Preparing training intelligence, please wait.</p>
            </div>
        </div>
    );
  }

  if (pageError) {
    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md animate-fade-in border border-gray-200">
                <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">System Error</h2>
                <p className="text-gray-600 mb-6">{pageError}</p>
                <button 
                    onClick={loadData}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
                >
                    <FaRedo className="mr-2"/> Try Again
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-6  min-h-screen font-sans text-gray-800">
      <style>{animationStyles}</style>
      <ToastComponent toast={toast} isVisible={isToastVisible} onClose={closeToast} />
      
      <header className="mb-10 animate-fade-in">
        <div className="flex items-center mb-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 rounded-lg shadow-lg mr-5">
            <FaChartLine className="text-white text-4xl" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-800">LMS Command Deck</h1>
            <p className="text-gray-600 mt-1 text-md">Track and enhance your organization's security awareness journey.</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <GlobalStatCard title="Active Learners" value={kpiData.totalEnrolledLearners - Math.round(kpiData.overallCompletionRate * kpiData.totalEnrolledLearners / 100)} icon={<FaUserClock/>} colorClass="text-yellow-600" bgColorClass="bg-yellow-100" />
            <GlobalStatCard title="Overall Completion" value={`${kpiData.overallCompletionRate}%`} icon={<FaCheckCircle/>} colorClass="text-green-600" bgColorClass="bg-green-100"/>
            <GlobalStatCard title="Programs In Progress" value={kpiData.activeTrainingPrograms} icon={<FaTasks/>} colorClass="text-sky-600" bgColorClass="bg-sky-100"/>
            <GlobalStatCard title="Top Focus Area" value={kpiData.mostFrequentTopic} icon={<FaBrain/>} colorClass="text-purple-600" bgColorClass="bg-purple-100"/>
        </div>
      </header>

      <main className="animate-fade-in" style={{animationDelay: '0.2s'}}>
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-700 flex items-center"><FaTasks className="mr-3 text-blue-600"/>Training Initiatives</h2>
              <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-lg shadow-sm">
                {[{id: 'all', label: "All"}, {id: 'active', label: "Active"}, {id: 'completed', label: "Completed"}].map(filter => (
                  <button key={filter.id} onClick={() => { setActiveFilter(filter.id); setSelectedProgramDetail(null);}}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeFilter === filter.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mb-6">
                <input type="text" placeholder="Search programs by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 text-sm shadow-sm"/>
                <FaSearch className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {contentLoading && filteredAndSortedPrograms.length === 0 ? (
                <div className="p-10 text-center text-gray-500"><svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-3">Loading Training Programs...</p></div>
            ) : filteredAndSortedPrograms.length === 0 ? (
                <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl shadow-inner">
                    <FaListAlt className="text-6xl text-gray-300 mx-auto mb-5" />
                    <p className="text-xl font-semibold text-gray-700">{searchTerm ? 'No programs match your search.' : `No ${activeFilter} programs found.`}</p>
                    <p className="text-sm mt-2">{searchTerm ? 'Try a different term or clear filters.' : 'Data may still be processing or none exist in this category.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAndSortedPrograms.map((program, index) => (
                        <ProgramSummaryCard key={program.id} program={program} onSelect={setSelectedProgramDetail} index={index} />
                    ))}
                </div>
            )}
             {/* Analytics tab content (from LMS Command Deck - shown only if a specific condition or tab is met) */}
            {/* This section would typically be part of a tabbed interface within the main card if 'analytics' was a primary view */}
            {/* For this layout, analytics are part of the selectedProgramDetail modal. If you want global analytics: */}
            {/* {activeFilter === 'analytics' && ( // Or some other condition to show global analytics
                <div className="mt-8 space-y-8 animate-fade-in">
                    <p className="text-center text-gray-500">Global analytics charts would go here.</p>
                </div>
            )} */}
        </div>
      </main>
      
      <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in" style={{animationDelay: '0.4s'}}>
         <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Quick Access & Resources</h3>
        <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/lms-login" className="block"> {/* Make sure this route is set up in your router */}
                <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm flex items-center justify-center">
                   <FaUserGraduate className="mr-2"/> User Training Portal
                </button>
            </Link>
             <Link to="/campaign" className="block">
                <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md text-sm flex items-center justify-center">
                   <FaListAlt className="mr-2"/> Phishing Campaigns Hub
                </button>
            </Link>
            <Link to="/lms/new-training" className="block"> {/* Hypothetical route */}
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm flex items-center justify-center">
                   <FaChalkboardTeacher className="mr-2"/> Start New Training {/* Or FaChalkboardTeacher */}
                </button>
            </Link>
            <Link to="/" className="block">
                <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md text-sm flex items-center justify-center">
                   <FaBrain className="mr-2"/> Main Dashboard
                </button>
            </Link>
        </div>
      </div>

      {/* Program Details Slide-In Panel */}
      {selectedProgramDetail && (
        <div className={`fixed inset-0 z-[90] flex justify-end`}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProgramDetail(null)}></div> {/* Backdrop gets its own fade-in */}
            <div className={`bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-gray-200 animate-slide-in-right relative z-10`}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <div className="flex items-center min-w-0">
                        <FaProjectDiagram className="mr-3 text-blue-600 text-2xl flex-shrink-0" />
                        <h2 className="text-xl font-semibold text-gray-800 truncate" title={selectedProgramDetail.name}>
                            Program Details: {selectedProgramDetail.name}
                        </h2>
                    </div>
                    <button onClick={() => setSelectedProgramDetail(null)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400" aria-label="Close">
                        <FaTimes size={18} />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-grow p-6 custom-scrollbar space-y-6">
                    <section className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Program Overview</h3>
                        <p className="text-sm text-gray-600 mb-3">{selectedProgramDetail.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-3">
                            <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"><strong className="text-gray-500 block text-xs uppercase">Campaign Status:</strong> <span className="text-gray-700 font-medium">{selectedProgramDetail.originalCampaignStatus}</span></div>
                            <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"><strong className="text-gray-500 block text-xs uppercase">LMS Status:</strong> <span className="text-gray-700 font-medium">{selectedProgramDetail.programStatusLMS}</span></div>
                            <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"><strong className="text-gray-500 block text-xs uppercase">Phished:</strong> <span className="text-gray-700 font-medium">{selectedProgramDetail.phishedUserCount} / {selectedProgramDetail.totalCampaignRecipients}</span></div>
                            <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"><strong className="text-gray-500 block text-xs uppercase">Enrolled:</strong> <span className="text-gray-700 font-medium">{selectedProgramDetail.learnersEnrolled}</span></div>
                        </div>
                         <div className="mb-3">
                            <div className="flex justify-between items-center text-gray-700 mb-1">
                                <span className="text-sm font-medium">Training Completion</span>
                                <span className="text-lg font-bold text-blue-600">{selectedProgramDetail.completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3.5 shadow-inner overflow-hidden">
                                <div className={`h-3.5 rounded-full transition-width duration-500 ease-out ${selectedProgramDetail.completionRate > 60 ? 'bg-gradient-to-r from-green-400 to-teal-500' : selectedProgramDetail.completionRate > 30 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-pink-500'}`} style={{ width: `${selectedProgramDetail.completionRate}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Key Training Topics:</h4>
                            <div className="flex flex-wrap gap-2">
                            {(selectedProgramDetail.topics || []).map(topic => (
                                <span key={topic} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full shadow-sm border border-indigo-200">{topic}</span>
                            ))}
                            </div>
                        </div>
                    </section>

                    <section className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Learner Status Distribution</h3>
                        <div className="h-64 w-full max-w-sm mx-auto">
                        {detailProgramLearnerStatusChartData ? (
                            <Doughnut data={detailProgramLearnerStatusChartData} options={chartDoughnutOptions} />
                        ) : (
                            <p className="text-center text-gray-500 pt-16">No learner status data for chart.</p>
                        )}
                        </div>
                    </section>

                    <section className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Learner Roster</h3>
                        {selectedProgramDetail.learners && selectedProgramDetail.learners.length > 0 ? (
                        <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0 z-[5]">
                                <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner Email</th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis/Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {selectedProgramDetail.learners.map(learner => 
                                    <LearnerProgressRow key={learner.id || learner.email} learner={learner} />
                                )}
                            </tbody>
                            </table>
                            </div>
                        </div>
                        ) : (
                        <div className="p-6 text-center bg-white rounded-md border border-gray-200">
                            <FaUsers className="text-3xl text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No specific learner data available for this program.</p>
                        </div>
                        )}
                    </section>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3 sticky bottom-0 z-10">
                    <button onClick={() => setSelectedProgramDetail(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Close</button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <FaFileDownload className="mr-2"/> Export Data
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LMS;