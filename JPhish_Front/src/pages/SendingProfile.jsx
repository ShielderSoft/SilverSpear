import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useDispatch } from 'react-redux';
import { selectSenderProfile } from '../features/senderProfilesSlice'; // Ensure this slice and action exist
import {
  FaSave, FaCheck, FaEye, FaTrashAlt, FaPaperPlane, FaPlus, FaListAlt, FaInfoCircle,
  FaUserCircle, FaAt, FaAlignLeft, FaGlobe, FaServer, FaUserShield, FaKey, FaNetworkWired,
  FaSearch, FaTimes, FaCheckCircle, FaExclamationCircle, FaBookOpen, FaArrowRight, FaArrowLeft,
  FaWrench,
  FaUsersCog,
} from 'react-icons/fa';

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
const FormInput = ({ id, label, type = "text", value, onChange, placeholder, required = false, icon, rows, autoComplete = "off" }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
        <span className="bg-blue-100 p-1 rounded-md mr-2 shadow-sm">{icon}</span>{label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows || 3}
               className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 custom-scrollbar" />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete}
               className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400" />
      )}
    </div>
  );

const SendingProfile = () => {
  const dispatch = useDispatch();

  // Form state
  const [name, setName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [description, setDescription] = useState('');
  const [domainTLD, setDomainTLD] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpPort, setSmtpPort] = useState('');

  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState(null);

  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const [activeTab, setActiveTab] = useState('manage'); // 'manage', 'create', 'guide'
  const [currentStep, setCurrentStep] = useState(1); // For multi-step form

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 300); // Corresponds to slideOut animation
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid date' : date.toLocaleDateString('en-GB', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await apiClient.get('/profile/get');
        const fetchedProfiles = Array.isArray(response.data) ? response.data : [];
        setProfiles(fetchedProfiles);
        setFilteredProfiles(fetchedProfiles);
      } catch (err) {
        console.error('Error fetching sender profiles:', err);
        showToast('Failed to fetch profiles. Please try again later.', 'error');
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredProfiles(
      profiles.filter(p =>
        p.profileName?.toLowerCase().includes(lowerSearchTerm) ||
        p.profileEmailId?.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [searchTerm, profiles]);

  const resetForm = () => {
    setName(''); setEmailId(''); setDescription('');
    setDomainTLD(''); setSmtpHost(''); setSmtpPort('');
    setSmtpUsername(''); setSmtpPassword('');
  };

  const validateStep1 = () => {
    if (!name.trim()) { showToast('Profile Name is required.', 'error'); return false; }
    if (!emailId.trim()) { showToast('Sender Email Address is required.', 'error'); return false; }
    if (!/\S+@\S+\.\S+/.test(emailId)) {
      showToast('Please enter a valid Sender Email address.', 'error'); return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!domainTLD.trim()) { showToast('Sending Domain (TLD) is required.', 'error'); return false; }
    if (!smtpHost.trim()) { showToast('SMTP Host is required.', 'error'); return false; }
    if (!smtpPort.trim()) { showToast('SMTP Port is required.', 'error'); return false; }
    const portNum = parseInt(smtpPort);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      showToast('Please enter a valid Port number (1-65535).', 'error'); return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!smtpUsername.trim()) { showToast('SMTP Username is required.', 'error'); return false; }
    if (!smtpPassword.trim()) { showToast('SMTP Password is required.', 'error'); return false; }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handlePrevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!(validateStep1() && validateStep2() && validateStep3())) {
        showToast('Please ensure all required fields are correctly filled across all steps.', 'error');
        return;
    }

    const payload = {
      profileName: name, profileEmailId: emailId, profileDesc: description,
      domainTld: domainTLD, profileSMTPHost: smtpHost, profileSMTPUsername: smtpUsername,
      profileSMTPPassword: smtpPassword, profileSMTPPort: smtpPort,
    };

    try {
      const response = await apiClient.post('/profile/create', payload);
      // Assuming backend returns the full profile object including id and createDate upon successful creation
      const newProfile = response.data.profile || { ...payload, id: response.data.id || Date.now(), createDate: new Date().toISOString() };
      
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      // No need to setFilteredProfiles here if useEffect on profiles handles it
      
      showToast(response.data.message || 'Profile created successfully!');
      resetForm();
      setCurrentStep(1);
      setActiveTab('manage');
    } catch (err) {
      console.error('Error saving sender profile:', err);
      showToast(`Failed to save profile: ${err.response?.data?.message || err.message || 'An unknown error occurred.'}`, 'error');
    }
  };

  const handleDeleteProfile = async (profileId, profileName) => {
    if (window.confirm(`Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`)) {
      try {
        await apiClient.delete(`/profile/${profileId}`); // Ensure your API uses DELETE and this endpoint
        showToast('Sender profile deleted successfully!');
        const updatedProfiles = profiles.filter((profile) => profile.id !== profileId);
        setProfiles(updatedProfiles);
        // No need to setFilteredProfiles here if useEffect on profiles handles it
      } catch (err) {
        console.error('Error deleting sender profile:', err);
        showToast(`Failed to delete profile: ${err.response?.data?.message || err.message || 'An unknown error occurred.'}`, 'error');
      }
    }
  };

  const handleShowDetails = (profile) => {
    setModalTitle(`Profile Details: ${profile.profileName}`);
    setModalContent(
      <div className="space-y-2.5 text-sm text-gray-700">
        <p><strong>Profile Name:</strong> {profile.profileName}</p>
        <p><strong>Sender Email:</strong> {profile.profileEmailId}</p>
        <p><strong>Description:</strong> {profile.profileDesc || <span className="italic text-gray-500">Not provided</span>}</p>
        <hr className="my-2 border-gray-200"/>
        <p><strong>Domain TLD:</strong> {profile.domainTld}</p>
        <hr className="my-2 border-gray-200"/>
        <p><strong>SMTP Host:</strong> {profile.profileSMTPHost}</p>
        <p><strong>SMTP Port:</strong> {profile.profileSMTPPort}</p>
        <p><strong>SMTP Username:</strong> {profile.profileSMTPUsername}</p>
        {/* SMTP Password is intentionally not shown for security */}
        <hr className="my-2 border-gray-200"/>
        <p><strong>Created On:</strong> {formatDate(profile.createDate || profile.createdAt)}</p>
      </div>
    );
    setIsModalOpen(true);
  };

  const handleSelectProfileForCampaign = (profile) => {
    dispatch(selectSenderProfile(profile)); // Ensure 'selectSenderProfile' is correctly defined in your Redux slice
    showToast(`Profile '${profile.profileName}' has been selected for use in campaigns!`);
  };
  
  const ToastComponent = () => {
    if (!toastVisible || !toast) return null;
    const successColors = 'bg-blue-50 border border-blue-300 text-blue-700';
    const errorColors = 'bg-red-50 border border-red-300 text-red-700';
    const toastColors = toast.type === 'success' ? successColors : errorColors;

    return (
      <div className={`fixed top-20 right-6 z-[100] w-full max-w-sm ${toastVisible ? 'animate-slide-in' : 'animate-slide-out'}`}>
        <div className={`${toastColors} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3`}>
          {toast.type === 'success' ? <FaCheckCircle className="text-xl" /> : <FaExclamationCircle className="text-xl" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    );
  };

  // const FormInput = ({ id, label, type = "text", value, onChange, placeholder, required = false, icon, rows, autoComplete = "off" }) => (
  //   <div>
  //     <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
  //       <span className="bg-blue-100 p-1 rounded-md mr-2 shadow-sm">{icon}</span>{label}
  //       {required && <span className="text-red-500 ml-1">*</span>}
  //     </label>
  //     {type === "textarea" ? (
  //       <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows || 3}
  //              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 custom-scrollbar" />
  //     ) : (
  //       <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete}
  //              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400" />
  //     )}
  //   </div>
  // );

  const renderCreateFormStep = () => {
    // Common icon styling for form inputs
    const iconProps = { className: "w-4 h-4 text-blue-600" };

    switch (currentStep) {
      case 1: // Profile Basics
        return (
          <div className="space-y-5 animate-zoom-in">
            <h4 className="text-lg font-semibold text-gray-700 mb-1">Step 1 of 3: Profile Basics</h4>
            <FormInput id="profileName" label="Profile Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Marketing Team Profile" icon={<FaUserCircle {...iconProps} />} required />
            <FormInput id="emailId" label="Sender Email Address" type="email" value={emailId} onChange={(e) => setEmailId(e.target.value)} placeholder="e.g., info@example.com" icon={<FaAt {...iconProps} />} required />
            <FormInput id="description" label="Description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe this profile's purpose (optional)" icon={<FaAlignLeft {...iconProps} />} />
          </div>
        );
      case 2: // Domain & Server
        return (
          <div className="space-y-5 animate-zoom-in">
            <h4 className="text-lg font-semibold text-gray-700 mb-1">Step 2 of 3: Domain & Server Details</h4>
            <FormInput id="domainTLD" label="Sending Domain (TLD)" value={domainTLD} onChange={(e) => setDomainTLD(e.target.value)} placeholder="e.g., mycompany.com" icon={<FaGlobe {...iconProps} />} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <FormInput id="smtpHost" label="SMTP Host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.example.com" icon={<FaServer {...iconProps} />} required />
              <FormInput id="smtpPort" label="SMTP Port" type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="e.g., 587" icon={<FaNetworkWired {...iconProps} />} required />
            </div>
          </div>
        );
      case 3: // Authentication
        return (
          <div className="space-y-5 animate-zoom-in">
            <h4 className="text-lg font-semibold text-gray-700 mb-1">Step 3 of 3: SMTP Authentication</h4>
            <FormInput id="smtpUsername" label="SMTP Username" value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} placeholder="Usually your email address" icon={<FaUserShield {...iconProps} />} required autoComplete="username"/>
            <FormInput id="smtpPassword" label="SMTP Password" type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder="Enter SMTP password" icon={<FaKey {...iconProps} />} required autoComplete="new-password" />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <style>{animationStyles}</style>
      <ToastComponent />

      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-md mr-4"><FaPaperPlane className="text-white text-2xl" /></div>
          <h1 className="text-3xl font-bold text-gray-800">Sending Profiles Hub</h1>
        </div>
        <p className="text-gray-600 ml-[calc(2.5rem+0.625rem)]">Manage, create, and configure sender profiles for campaigns.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-2 sm:px-6 py-3 border-b border-blue-700/50">
          <div className="flex space-x-1 sm:space-x-2">
            {[
              { id: 'manage', label: 'Manage Profiles', icon: <FaUsersCog /> },
              { id: 'create', label: 'Create New', icon: <FaPlus /> },
              { id: 'guide', label: 'Setup Guide', icon: <FaBookOpen /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === 'create' && currentStep === 0) setCurrentStep(1); }}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-white/80
                  ${activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-md scale-105'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                  }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[500px]">
          {activeTab === 'manage' && (
            <div className="animate-fade-in space-y-4">
              {profiles.length > 0 && (
                <div className="relative w-full max-w-md mb-4">
                  <input type="text" placeholder="Search profiles by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                         className="pl-10 pr-4 py-2.5 rounded-full text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-gray-800 placeholder-gray-400" />
                  <FaSearch className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              )}
              {filteredProfiles.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 mt-4">
                  <FaListAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 text-lg font-semibold">
                    {searchTerm ? 'No profiles match your search.' : (profiles.length === 0 ? 'No sending profiles created yet.' : 'No profiles found.')}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm ? 'Try a different search term or clear the search.' : (profiles.length === 0 ? 'You can create one from the "Create New" tab.' : '')}
                  </p>
                   {profiles.length > 0 && searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Clear search
                        </button>
                    )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm max-h-[600px] overflow-y-auto custom-scrollbar">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80 sticky top-0 z-[5]">
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email Address</th>
                        <th className="px-6 py-3 hidden sm:table-cell">Created</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProfiles.map((profile) => (
                        <tr key={profile.id || profile.profileName} className="hover:bg-gray-50/70 transition-colors duration-100">
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900" title={profile.profileName}>{profile.profileName}</div>
                            <div className="text-xs text-gray-500 sm:hidden">{formatDate(profile.createDate || profile.createdAt)}</div>
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600" title={profile.profileEmailId}>{profile.profileEmailId}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{formatDate(profile.createDate || profile.createdAt)}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-sm space-x-1 sm:space-x-2 flex items-center">
                            <button onClick={() => handleSelectProfileForCampaign(profile)} title="Select for Campaign" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"><FaCheck size={16} /></button>
                            <button onClick={() => handleShowDetails(profile)} title="View Details" className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"><FaEye size={16} /></button>
                            <button onClick={() => handleDeleteProfile(profile.id, profile.profileName)} title="Delete Profile" className="p-1.5 rounded-md text-red-500 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"><FaTrashAlt size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="animate-fade-in max-w-2xl mx-auto">
              <form onSubmit={handleSaveProfile} className="custom-scrollbar overflow-y-auto max-h-[calc(100vh-300px)] pr-2 pb-4"> {/* Added scroll for long forms */}
                <div className="mb-6 sticky top-0 bg-white/80 backdrop-blur-sm py-3 z-10"> {/* Sticky progress bar */}
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Step {currentStep} of 3</span>
                    <span className="font-medium">{currentStep === 1 ? "Profile Basics" : currentStep === 2 ? "Domain & Server" : "Authentication"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
                  </div>
                </div>
                {renderCreateFormStep()}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                  <button type="button" onClick={handlePrevStep} disabled={currentStep === 1}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center">
                    <FaArrowLeft className="mr-2 text-xs" /> Previous
                  </button>
                  {currentStep < 3 ? (
                    <button type="button" onClick={handleNextStep}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center">
                      Next <FaArrowRight className="ml-2 text-xs" />
                    </button>
                  ) : (
                    <button type="submit"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg flex items-center">
                      <FaSave className="mr-2" /> Save Profile
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="animate-fade-in prose prose-sm max-w-none text-gray-700 space-y-6 custom-scrollbar max-h-[calc(100vh-260px)] overflow-y-auto pr-3 pb-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 bg-blue-600 p-2 rounded-lg mt-1 shadow"><FaBookOpen className="w-5 h-5 text-white" /></div>
                  <div><h3 className="text-lg font-semibold text-blue-800 !mt-0">Sending Profile Setup Guide</h3><p className="text-gray-600 !mb-0">Follow these steps for optimal email deliverability.</p></div>
                </div>
              </div>
              {[
                { title: "Profile Basics", icon: <FaUserCircle className="w-4 h-4 text-blue-700"/>, points: [
                    "<strong>Profile Name:</strong> A recognizable name (e.g., \"Marketing SMTP\").",
                    "<strong>Sender Email Address:</strong> The \"From\" address recipients see. Must be valid and monitored.",
                    "<strong>Description:</strong> Optional notes about this profile's purpose.",
                ]},
                { title: "Domain & Server Details", icon: <FaServer className="w-4 h-4 text-blue-700"/>, points: [
                    "<strong>Sending Domain (TLD):</strong> Domain part of your sender email (e.g., <code>example.com</code>). <strong>Crucial:</strong> Authenticate with SPF, DKIM, DMARC in your DNS settings.",
                    "<strong>SMTP Host:</strong> Your outgoing mail server address (e.g., <code>smtp.gmail.com</code>).",
                    "<strong>SMTP Port:</strong> Common ports: <code>587</code> (TLS/STARTTLS - Recommended), <code>465</code> (SSL), <code>25</code> (Standard, often blocked, avoid if possible).",
                ]},
                { title: "SMTP Authentication", icon: <FaKey className="w-4 h-4 text-blue-700"/>, points: [
                    "<strong>SMTP Username:</strong> Usually your full email address.",
                    "<strong>SMTP Password:</strong> Account password. <strong>Important for Gmail/Microsoft 365:</strong> Use an \"App Password\" if 2FA is enabled for better security.",
                ]}
              ].map((section, index) => (
                <div key={section.title} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <h4 className="font-semibold text-gray-800 text-md !mt-0 !mb-2 flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-2.5">{index + 1}</span>
                    {section.title}
                  </h4>
                  <ul className="list-disc pl-8 mt-1 space-y-1.5 text-gray-600" dangerouslySetInnerHTML={{ __html: section.points.map(p => `<li>${p}</li>`).join('') }} />
                </div>
              ))}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded-r-md shadow-sm flex items-start space-x-3">
                <FaExclamationCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-md text-yellow-700 font-semibold !mt-0">Key Considerations for Success</p>
                  <ul className="list-disc pl-5 text-xs text-yellow-600 mt-1.5 space-y-1">
                    <li><strong>Authorization & Compliance:</strong> Always ensure you have explicit permission to use SMTP servers and email addresses. Adhere to anti-spam laws (CAN-SPAM, GDPR).</li>
                    <li><strong>Test Thoroughly:</strong> After setup, send test emails to various clients (Gmail, Outlook, etc.) to check deliverability and spam placement.</li>
                    <li><strong>Monitor Sending Reputation:</strong> High bounce rates or spam complaints can damage your domain's reputation.</li>
                    <li><strong>Rate Limits:</strong> Be aware of sending limits imposed by your SMTP provider.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[90] p-4 animate-fade-in">
          <div className="bg-white p-0 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center"><FaEye className="mr-2 text-blue-500" /> {modalTitle}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400" aria-label="Close"><FaTimes size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-grow p-6 custom-scrollbar">{modalContent}</div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendingProfile;