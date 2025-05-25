import React, { useState, useEffect } from 'react'
import apiClient, { aiClient } from '../apiClient' // Assuming aiClient is correctly configured
import { useDispatch } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { selectEmailTemplate, selectLandingTemplate } from '../features/templatesSlice'
import {
  FaEnvelope,
  FaFileAlt,
  FaSave,
  FaCheck,
  FaEye,
  FaTrashAlt,
  FaPaperPlane,
  FaRobot,
  FaTimes,
  FaPlus,
  FaFileSignature,
  FaCode,
  FaQuestionCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaCopy,
  FaExternalLinkAlt,
  FaPencilAlt,
  FaSearch,
  FaListAlt,
  FaArrowLeft, // For back button
  FaTools, // For Workbench
  FaPalette, // For Design
} from 'react-icons/fa'

const animationStyles = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
  .animate-slide-out {
    animation: slideOut 0.3s ease-in forwards;
  }
  .animate-fade-in {
    animation: fadeIn 0.35s ease-in-out forwards;
  }
  .animate-fade-out {
    animation: fadeOut 0.35s ease-in-out forwards;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9; /* Tailwind gray-100 */
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #94a3b8; /* Tailwind slate-400 */
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #64748b; /* Tailwind slate-500 */
  }
  .rdw-editor-main {
    color: #374151; /* Tailwind gray-700 */
  }
`

const ResourceManagement = () => {
  const dispatch = useDispatch()

  const [emailName, setEmailName] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailEditorState, setEmailEditorState] = useState(EditorState.createEmpty())
  const [emailTemplates, setEmailTemplates] = useState([])
  const [filteredEmailTemplates, setFilteredEmailTemplates] = useState([])
  const [emailSearchTerm, setEmailSearchTerm] = useState('');

  const [landingName, setLandingName] = useState('')
  const [landingEditorState, setLandingEditorState] = useState(EditorState.createEmpty())
  const [landingTemplates, setLandingTemplates] = useState([])
  const [filteredLandingTemplates, setFilteredLandingTemplates] = useState([])
  const [landingSearchTerm, setLandingSearchTerm] = useState('');

  const [creationMode, setCreationMode] = useState(null) // 'email', 'landing', or null for selection

  const [aiQuestion, setAiQuestion] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiMessages, setAiMessages] = useState([])
  const [scenarioType, setScenarioType] = useState('email')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [modalTitle, setModalTitle] = useState('')

  const [toast, setToast] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid date' : date.toLocaleDateString('en-GB', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getHTML = (editorState) => draftToHtml(convertToRaw(editorState.getCurrentContent()));

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [emailRes, landingRes] = await Promise.all([
          apiClient.get('/emailTemplate/all'),
          apiClient.get('/landingPageTemplate/all')
        ]);
        const fetchedEmailTemplates = Array.isArray(emailRes.data) ? emailRes.data : [];
        const fetchedLandingTemplates = Array.isArray(landingRes.data) ? landingRes.data : [];
        
        setEmailTemplates(fetchedEmailTemplates);
        setFilteredEmailTemplates(fetchedEmailTemplates);
        setLandingTemplates(fetchedLandingTemplates);
        setFilteredLandingTemplates(fetchedLandingTemplates);

      } catch (err) {
        console.error('Failed to fetch templates', err);
        showToast('Failed to fetch templates.', 'error');
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    setFilteredEmailTemplates(
      emailTemplates.filter(template => template.name.toLowerCase().includes(emailSearchTerm.toLowerCase()))
    );
  }, [emailSearchTerm, emailTemplates]);

  useEffect(() => {
    setFilteredLandingTemplates(
      landingTemplates.filter(template => template.name.toLowerCase().includes(landingSearchTerm.toLowerCase()))
    );
  }, [landingSearchTerm, landingTemplates]);

  const decodeBase64Html = (encodedHtml) => {
    if (!encodedHtml || typeof encodedHtml !== 'string') return '<p>Error: Content is not a valid string.</p>';
    try {
      const cleaned = encodedHtml.replace(/(\r\n|\n|\r)/gm, "");
      return atob(cleaned);
    } catch (err) {
      console.error("Decoding error", err);
      return '<p>Error decoding content. It might not be base64 encoded.</p>';
    }
  };

  const handleSaveEmailTemplate = async (e) => {
    e.preventDefault();
    if (!emailName.trim() || !emailSubject.trim()) {
        showToast('Template name and subject are required.', 'error'); return;
    }
    const emailHtml = getHTML(emailEditorState);
    if (emailHtml.length < 20) { showToast('Email content cannot be empty.', 'error'); return; }
    try {
      const emailTemplatePayload = { name: emailName, subject: emailSubject, phishingLink: '' };
      const formData = new FormData();
      formData.append('emailTemplate', JSON.stringify(emailTemplatePayload));
      const emailBlob = new Blob([emailHtml], { type: 'text/html' });
      formData.append('bodyFile', emailBlob, 'body.html');
      
      const response = await apiClient.post('/emailTemplate/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Email template saved successfully!');
      setEmailName(''); setEmailSubject(''); setEmailEditorState(EditorState.createEmpty());
      const newTemplates = [...emailTemplates, response.data];
      setEmailTemplates(newTemplates); setFilteredEmailTemplates(newTemplates);
      setCreationMode(null); // Go back to type selection
    } catch (err) {
      showToast(`Failed to save email template: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleSaveLandingTemplate = async (e) => {
    e.preventDefault();
    if (!landingName.trim()) { showToast('Template name is required.', 'error'); return; }
    const landingHtml = getHTML(landingEditorState);
    if (landingHtml.length < 20) { showToast('Landing page content cannot be empty.', 'error'); return; }
    try {
      const landingPagePayload = { name: landingName, description: 'Custom Landing Page' };
      const formData = new FormData();
      const landingPagePayloadBlob = new Blob([JSON.stringify(landingPagePayload)], { type: 'application/json' });
      formData.append('landingPageTemplate', landingPagePayloadBlob);
      const landingBlob = new Blob([landingHtml], { type: 'text/html' });
      formData.append('htmlFile', landingBlob, 'landing.html');

      const response = await apiClient.post('/landingPageTemplate/create', formData);
      showToast('Landing page template saved successfully!');
      setLandingName(''); setLandingEditorState(EditorState.createEmpty());
      const newTemplates = [...landingTemplates, response.data];
      setLandingTemplates(newTemplates); setFilteredLandingTemplates(newTemplates);
      setCreationMode(null); // Go back to type selection
    } catch (err) {
      showToast(`Failed to save landing template: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  const handleShowDetails = (template, type) => {
    const encodedContent = type === 'Email' ? template.body : (template.code || template.htmlContent);
    const decodedContent = decodeBase64Html(encodedContent);
    setModalTitle(`${type} Template: ${template.name}`);
    setModalContent(decodedContent);
    setModalOpen(true);
  };

  const handleDeleteTemplate = async (id, type, name) => {
    if (window.confirm(`Are you sure you want to delete the ${type.toLowerCase()} template "${name}"? This action cannot be undone.`)) {
      try {
        if (type === 'Email') {
          await apiClient.delete(`/emailTemplate/del/${id}`);
          const updated = emailTemplates.filter((temp) => temp.id !== id);
          setEmailTemplates(updated); setFilteredEmailTemplates(updated);
        } else {
          await apiClient.delete(`/landingPageTemplate/del/${id}`);
          const updated = landingTemplates.filter((temp) => temp.id !== id);
          setLandingTemplates(updated); setFilteredLandingTemplates(updated);
        }
        showToast(`${type} template deleted successfully!`);
      } catch (err) {
        showToast(`Failed to delete ${type.toLowerCase()} template: ${err.response?.data?.message || err.message}`, 'error');
      }
    }
  };

  const handleSelectTemplateForCampaign = (template, type) => {
    if (type === 'Email') dispatch(selectEmailTemplate(template));
    else dispatch(selectLandingTemplate(template));
    showToast(`${type} template '${template.name}' selected for campaign!`);
  };

  const handleSetCreationMode = (mode) => {
    // Reset fields when switching modes or opening a new one
    if (mode === 'email') {
      setLandingName(''); setLandingEditorState(EditorState.createEmpty());
    } else if (mode === 'landing') {
      setEmailName(''); setEmailSubject(''); setEmailEditorState(EditorState.createEmpty());
    }
    setCreationMode(mode);
  };
  
  const extractBrandFromQuestion = (question) => {
    const commonBrands = ['Microsoft', 'Google', 'Amazon', 'Apple', 'Facebook', 'Netflix', 'PayPal', 'LinkedIn', 'Twitter', 'Adobe', 'Dropbox', 'Office 365'];
    for (const brand of commonBrands) {
      if (question.toLowerCase().includes(brand.toLowerCase())) return brand;
    }
    return 'Generic Brand';
  };
  
  const updateEditorWithGeneratedHTML = (htmlContent, targetEditor) => {
    try {
        const blocksFromHtml = htmlToDraft(htmlContent);
        if (blocksFromHtml) {
            const { contentBlocks, entityMap } = blocksFromHtml;
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            const newEditorState = EditorState.createWithContent(contentState);

            if (targetEditor === 'email') {
                setEmailEditorState(newEditorState);
                if (!emailName && aiQuestion) setEmailName(`AI: ${aiQuestion.substring(0,30)}...`);
                if (!emailSubject && aiQuestion) setEmailSubject(`AI: ${aiQuestion.substring(0,40)}...`);
                setCreationMode('email');
                showToast('AI content loaded into Email Template editor.', 'success');
            } else if (targetEditor === 'landing') {
                setLandingEditorState(newEditorState);
                 if (!landingName && aiQuestion) setLandingName(`AI LP: ${aiQuestion.substring(0,30)}...`);
                setCreationMode('landing');
                showToast('AI content loaded into Landing Page editor.', 'success');
            }
        } else showToast('Could not parse HTML from AI.', 'error');
    } catch (error) {
        showToast('Error loading AI content into editor.', 'error');
    }
};

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) { showToast('Please enter a scenario description for the AI.', 'error'); return; }
    setIsLoadingAI(true);
    const currentUserMessage = { type: 'user', content: aiQuestion };
    setAiMessages(prev => [...prev, currentUserMessage]);
    try {
      let endpoint = scenarioType === 'landing' ? '/ai/generate-landing' : scenarioType === 'scenario' ? '/ai/generate-scenario' : '/ai/generate-email';
      const payload = { scenario: aiQuestion, brandToImpersonate: extractBrandFromQuestion(aiQuestion), desiredAction: "Click a link and enter credentials", urgencyLevel: "High", audience: "Corporate employees" };
      const response = await aiClient.post(endpoint, payload);
      let aiResponseContent = ''; let emailHtml = null; let landingHtml = null;
      if (scenarioType === 'scenario') {
        aiResponseContent = `**Email Idea:**\n${response.data.email.explanation}\n\n**Landing Page Idea:**\n${response.data.landingPage.explanation}`;
        emailHtml = response.data.email.html; landingHtml = response.data.landingPage.html;
      } else if (scenarioType === 'email') {
        aiResponseContent = response.data.explanation; emailHtml = response.data.html;
      } else {
        aiResponseContent = response.data.explanation; landingHtml = response.data.html;
      }
      setAiMessages(prev => [...prev, { type: 'ai', content: aiResponseContent, emailHtml, landingHtml }]);
      setAiQuestion('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error.';
      setAiMessages(prev => [...prev, { type: 'ai', content: errorMessage, isError: true }]);
      showToast(`AI generation failed: ${errorMessage}`, 'error');
    } finally { setIsLoadingAI(false); }
  };

  const handleCloseModal = () => { setModalOpen(false); setModalContent(''); setModalTitle(''); };

  const ToastComponent = () => { /* ... same as before ... */ };
  // Re-add ToastComponent if it was removed or ensure it's defined as in the previous correct version.
  // For brevity, assuming ToastComponent is correctly defined as in your previous version.

  const renderTemplateTypeSelection = () => (
    <div className="p-6 animate-fade-in">
        <p className="text-center text-gray-600 mb-6 text-md">Select the type of template you want to create:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => handleSetCreationMode('email')}
                    className="group bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-xl shadow-lg hover:shadow-2xl text-white text-left transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300">
                <FaEnvelope size={40} className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity"/>
                <h3 className="text-2xl font-semibold mb-1">Email Template</h3>
                <p className="text-sm opacity-90 group-hover:opacity-100">Craft engaging email templates for your campaigns.</p>
            </button>
            <button onClick={() => handleSetCreationMode('landing')}
                    className="group bg-gradient-to-br from-green-500 to-teal-600 p-8 rounded-xl shadow-lg hover:shadow-2xl text-white text-left transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-300">
                <FaFileAlt size={40} className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity"/>
                <h3 className="text-2xl font-semibold mb-1">Landing Page</h3>
                <p className="text-sm opacity-90 group-hover:opacity-100">Design compelling landing pages for user interaction.</p>
            </button>
        </div>
    </div>
  );
  
  const renderTemplateForm = (type) => {
    const isEmail = type === 'email';
    const title = isEmail ? "Designing Email Template" : "Designing Landing Page";
    const name = isEmail ? emailName : landingName;
    const setName = isEmail ? setEmailName : setLandingName;
    const subject = isEmail ? emailSubject : null;
    const setSubject = isEmail ? setEmailSubject : null;
    const editorState = isEmail ? emailEditorState : landingEditorState;
    const setEditorState = isEmail ? setEmailEditorState : setLandingEditorState;
    const handleSubmit = isEmail ? handleSaveEmailTemplate : handleSaveLandingTemplate;

    return (
      <div className="p-6 animate-fade-in">
        <button onClick={() => setCreationMode(null)} className="mb-6 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors group">
            <FaArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" /> Back to Template Types
        </button>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor={`${type}Name`} className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
              <span className="bg-blue-100 p-1 rounded-md mr-2 shadow-sm"><FaFileSignature className="w-4 h-4 text-blue-600" /></span>Template Name
            </label>
            <input id={`${type}Name`} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter template name"
                   className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          {isEmail && (
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <span className="bg-blue-100 p-1 rounded-md mr-2 shadow-sm"><FaEnvelope className="w-4 h-4 text-blue-600" /></span>Email Subject
              </label>
              <input id="emailSubject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject"
                     className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
              <span className="bg-blue-100 p-1 rounded-md mr-2 shadow-sm"><FaCode className="w-4 h-4 text-blue-600" /></span>HTML Content
            </label>
            <Editor editorState={editorState} onEditorStateChange={setEditorState}
                    wrapperClassName="bg-white rounded-lg border border-gray-300 shadow-sm text-gray-800"
                    editorClassName="p-4 min-h-[300px] custom-scrollbar rdw-editor-main"
                    toolbarClassName="!bg-gray-50 border-b border-gray-200 rounded-t-lg sticky top-0 z-10"
                    toolbar={{ /* ... same toolbar options ... */ }}/>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg flex items-center">
              <FaSave className="mr-2" /> Save Template
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderAvailableTemplatesCard = (type) => {
    const isEmail = type === 'email';
    const templates = isEmail ? filteredEmailTemplates : filteredLandingTemplates;
    const setSearchTerm = isEmail ? setEmailSearchTerm : setLandingSearchTerm;
    const searchTerm = isEmail ? emailSearchTerm : landingSearchTerm;
    const title = isEmail ? "Available Email Templates" : "Available Landing Page Templates";
    const icon = isEmail ? <FaEnvelope className="mr-2.5 text-white" /> : <FaFileAlt className="mr-2.5 text-white" />;

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
                 <div className="flex flex-col sm:flex-row justify-between items-center relative gap-y-2">
                    <h2 className="text-xl font-bold text-white flex items-center">{icon}{title} ({templates.length})</h2>
                    {templates.length > 0 && (
                        <div className="relative w-full sm:w-auto max-w-xs">
                            <input type="text" placeholder={`Search ${type} templates...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-full text-sm bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50 w-full" />
                            <FaSearch className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-white/80" />
                        </div>
                    )}
                </div>
            </div>
            <div className="p-6">
                {templates.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                        <FaListAlt className="text-3xl text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-md font-medium">No {type} templates found.</p>
                         {searchTerm && <p className="text-gray-500 text-sm mt-1">Try adjusting your search.</p>}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80 sticky top-0 z-[5]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50/70">
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm font-medium text-gray-800" title={template.name}>{template.name}</td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-600">{formatDate(template.createDate || template.createdAt)}</td>
                                        <td className="px-6 py-3.5 whitespace-nowrap text-sm space-x-2 flex items-center">
                                            <button onClick={() => handleSelectTemplateForCampaign(template, isEmail ? 'Email' : 'Landing')} title="Select for Campaign" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100"><FaCheck size={16} /></button>
                                            <button onClick={() => handleShowDetails(template, isEmail ? 'Email' : 'Landing')} title="View Details" className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"><FaEye size={16} /></button>
                                            <button onClick={() => handleDeleteTemplate(template.id, isEmail ? 'Email' : 'Landing', template.name)} title="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-100"><FaTrashAlt size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <style>{animationStyles}</style>
      {toast && <ToastComponent message={toast.message} type={toast.type} />}

      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-md mr-4"><FaFileAlt className="text-white text-2xl" /></div>
          <h1 className="text-3xl font-bold text-gray-800">Resource Management</h1>
        </div>
        <p className="text-gray-600 ml-[calc(2.5rem+0.625rem)]">Manage templates or use AI for assistance.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Template Workbench & Available Templates */}
        <div className="w-full lg:w-3/5 space-y-6">
            {/* Template Workbench Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl">
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
                    <h2 className="text-xl font-bold text-white flex items-center relative">
                        <FaPalette className="mr-2.5" /> Template Workbench
                    </h2>
                </div>
                {!creationMode ? renderTemplateTypeSelection() : renderTemplateForm(creationMode)}
            </div>

            {/* Available Email Templates Card */}
            {renderAvailableTemplatesCard('email')}

            {/* Available Landing Page Templates Card */}
            {renderAvailableTemplatesCard('landing')}
        </div>

        {/* Right Column: AI Q&A Card (Same as before) */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl h-full flex flex-col">
            <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-teal-700 px-6 py-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mt-16 -mr-16"></div>
              <h2 className="text-xl font-bold text-white flex items-center relative">
                <FaRobot className="mr-2.5" /> AI Template Assistant
              </h2>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="mb-4"> {/* Scenario Type Buttons */} </div>
              {/* <div className="flex-grow bg-gray-50 rounded-lg border border-gray-200 shadow-inner overflow-y-auto mb-4 px-4 py-3 custom-scrollbar min-h-[300px]"> AI Messages </div> */}
              <div className="mt-auto"> {/* AI Input */} </div>
                 {/* Full AI section content from previous response here. For brevity, it's omitted but should be the same. */}
                 {/* Ensure the AI Section uses the same state like `aiMessages`, `isLoadingAI`, `aiQuestion`, `handleAskAI`, `updateEditorWithGeneratedHTML` */}
                <div className="mb-4">
                <div className="flex border border-gray-300 rounded-lg p-0.5 bg-gray-100 max-w-xs mx-auto shadow-sm">
                  {[{id: 'email', label: 'Email'}, {id: 'landing', label: 'Landing Page'}].map((type) => (
                    <button key={type.id} onClick={() => setScenarioType(type.id)}
                            className={`flex-1 text-sm py-1.5 px-2 rounded-md font-medium transition-all whitespace-nowrap
                                        ${scenarioType === type.id ? 'bg-white text-green-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-grow bg-gray-50 rounded-lg border border-gray-200 shadow-inner overflow-y-auto mb-4 px-4 py-3 custom-scrollbar min-h-[300px]">
                {aiMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center h-full">
                    <FaQuestionCircle className="text-4xl text-gray-400 mx-auto mb-3" />
                    <p className="font-medium">Describe a scenario to generate templates.</p>
                    <p className="text-sm mt-1">e.g., "Microsoft password reset email"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiMessages.map((message, index) => (
                      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-xl p-3 shadow-sm max-w-[90%] ${message.type === 'user' ? 'bg-blue-500 text-white' : message.isError ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-white text-gray-700 border border-gray-200'}`}>
                          {message.type === 'user' && <p>{message.content}</p>}
                          {message.type === 'ai' && (
                            <div>
                              <div className="prose prose-sm max-w-none whitespace-pre-wrap">{message.content}</div>
                              {message.emailHtml && (
                                <div className="mt-3 border-t border-gray-200 pt-2">
                                  <h4 className="text-xs font-semibold text-gray-600 mb-1 uppercase">Generated Email:</h4>
                                  <div className="border border-gray-300 bg-white rounded shadow-sm overflow-hidden h-32 custom-scrollbar">
                                    <iframe srcDoc={message.emailHtml} title="Email Preview" className="w-full h-full scale-[0.8] origin-top-left" sandbox="allow-scripts" />
                                  </div>
                                  <div className="mt-1.5 flex space-x-2">
                                    <button onClick={() => updateEditorWithGeneratedHTML(message.emailHtml, 'email')} className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-md flex items-center"><FaPencilAlt className="mr-1"/> Use Email</button>
                                  </div>
                                </div>
                              )}
                              {message.landingHtml && (
                                <div className="mt-3 border-t border-gray-200 pt-2">
                                  <h4 className="text-xs font-semibold text-gray-600 mb-1 uppercase">Generated Landing Page:</h4>
                                   <div className="border border-gray-300 bg-white rounded shadow-sm overflow-hidden h-32 custom-scrollbar">
                                    <iframe srcDoc={message.landingHtml} title="Landing Page Preview" className="w-full h-full scale-[0.8] origin-top-left" sandbox="allow-scripts" />
                                  </div>
                                  <div className="mt-1.5 flex space-x-2">
                                     <button onClick={() => updateEditorWithGeneratedHTML(message.landingHtml, 'landing')} className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded-md flex items-center"><FaPencilAlt className="mr-1"/> Use Landing</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-2">
                  <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)}
                         onKeyPress={(e) => e.key === 'Enter' && !isLoadingAI && handleAskAI()}
                         placeholder={`Describe a ${scenarioType} scenario...`}
                         className="flex-grow px-4 py-2.5 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                         disabled={isLoadingAI} />
                  <button onClick={handleAskAI} disabled={isLoadingAI}
                          className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg flex items-center
                                      ${isLoadingAI ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    <FaPaperPlane className="mr-2 text-sm" />
                    {isLoadingAI ? 'Generating...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Template Details (Same as before) */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[90] p-4 animate-fade-in">
          <div className="bg-white p-0 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center"><FaEye className="mr-2 text-blue-500" /> {modalTitle}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200" aria-label="Close"><FaTimes size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-grow p-6 custom-scrollbar"><div dangerouslySetInnerHTML={{ __html: modalContent }} className="prose prose-sm max-w-none" /></div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
              <button onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-5 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceManagement