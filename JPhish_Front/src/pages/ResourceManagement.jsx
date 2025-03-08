import React, { useState, useEffect } from 'react'
import apiClient, { aiClient } from '../apiClient'
import { useDispatch } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { selectEmailTemplate, selectLandingTemplate } from '../features/templatesSlice' // Assuming these actions exist
import { 
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
const animationStyles = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .animate-slide-in {
    animation: slideIn 0.3s forwards;
  }
  
  .animate-slide-out {
    animation: slideOut 0.3s forwards;
  }
`

const ResourceManagement = () => {
  const dispatch = useDispatch()

  // States for Email Template Management
  const [emailName, setEmailName] = useState('')
  const [emailSubject, setEmailSubject] = useState('') // Add this line
  const [emailEditorState, setEmailEditorState] = useState(EditorState.createEmpty())
  const [emailTemplates, setEmailTemplates] = useState([])

  // States for Landing Page Management
  const [landingName, setLandingName] = useState('')
  const [landingEditorState, setLandingEditorState] = useState(EditorState.createEmpty())
  const [landingTemplates, setLandingTemplates] = useState([])

  // State for which form is active; null | 'email' | 'landing'
  const [activeFormMode, setActiveFormMode] = useState(null)

  // States for the AI Q&A
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiEditorState, setAiEditorState] = useState(EditorState.createEmpty())

  // Modal state for showing details
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [modalTitle, setModalTitle] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState([])
  const [scenarioType, setScenarioType] = useState('email') 

  const [toast, setToast] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid date' : date.toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Helper function to convert editor state to HTML
  const getHTML = (editorState) => draftToHtml(convertToRaw(editorState.getCurrentContent()))

  // Fetch available templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Expected API endpoints return an array of objects like:
        // { id, name, createdAt, htmlContent (base64 encoded) }
        const [emailRes, landingRes] = await Promise.all([
          apiClient.get('/emailTemplate/all'),
          apiClient.get('/landingPageTemplate/all')
        ])
        // Ensure data received is an array before setting state
        setEmailTemplates(Array.isArray(emailRes.data) ? emailRes.data : [])
        setLandingTemplates(Array.isArray(landingRes.data) ? landingRes.data : [])
      } catch (err) {
        console.error('Failed to fetch templates', err)
      }
    }
    fetchTemplates()
  }, [])

  // Handler to decode base64 HTML content
  const decodeBase64Html = (encodedHtml) => {
    if (!encodedHtml || typeof encodedHtml !== 'string') {
      console.error("Decoding error: encodedHtml is not a valid string", encodedHtml)
      return ''
    }
    try {
      const cleaned = encodedHtml.replace(/(\r\n|\n|\r)/gm, "")
      return atob(cleaned)
    } catch (err) {
      console.error("Decoding error", err)
      return encodedHtml
    }
  }

  // Handlers for Email Template Management
  const handleSaveEmailTemplate = async (e) => {
    e.preventDefault()
    try {
      const emailHtml = getHTML(emailEditorState)
      // Prepare the JSON payload
      const emailTemplatePayload = {
        name: emailName,
        subject: emailSubject, // Use the subject from state instead of empty string
        phishingLink: '' // Default or empty phishing link
      }
      const formData = new FormData()
      // "emailTemplate" key must be a stringified JSON
      formData.append('emailTemplate', JSON.stringify(emailTemplatePayload))
      // Convert the HTML content into a file-like Blob
      const emailBlob = new Blob([emailHtml], { type: 'text/html' })
      formData.append('bodyFile', emailBlob, 'body.html')
      const response = await apiClient.post('/emailTemplate/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Email template saved successfully!')
      setEmailName('')
      setEmailSubject('') // Reset the subject field
      setEmailEditorState(EditorState.createEmpty())
      // Append the newly created template to the list
      setEmailTemplates([...emailTemplates, response.data])
    } catch (err) {
      console.error('Error saving email template', err)
      alert('Failed to save email template')
    }
  }

  // Handlers for Landing Page Management
  const handleSaveLandingTemplate = async (e) => {
    e.preventDefault()
    try {
      const landingHtml = getHTML(landingEditorState)
      // Prepare the JSON payload
      const landingPagePayload = { name: landingName, description: '' }
      const formData = new FormData()
      const landingPagePayloadBlob = new Blob([JSON.stringify(landingPagePayload)], { type: 'application/json' })
      formData.append('landingPageTemplate', landingPagePayloadBlob)
      // Convert the HTML content into a file-like Blob
      const landingBlob = new Blob([landingHtml], { type: 'text/html' })
      formData.append('htmlFile', landingBlob, 'landing.html')
      const response = await apiClient.post('/landingPageTemplate/create', formData)
      alert('Landing page template saved successfully!')
      setLandingName('')
      setLandingEditorState(EditorState.createEmpty())
      // Append the newly created template to the list
      setLandingTemplates([...landingTemplates, response.data])
    } catch (err) {
      console.error('Error saving landing template', err)
      alert('Failed to save landing template')
    }
  }

  // Common handlers for Available Templates actions
  const handleShowDetails = (template, type) => {
    const encodedContent = type === 'Email' ? template.body : template.code || template.htmlContent
    const decodedContent = decodeBase64Html(encodedContent)
    setModalTitle(`${type} Template - ${template.name} Details`)
    setModalContent(decodedContent)
    setModalOpen(true)
  }

  const handleDeleteTemplate = async (id, type) => {
    try {
      if (type === 'Email') {
        await apiClient.delete(`/emailTemplate/del/${id}`)
        setEmailTemplates(emailTemplates.filter((temp) => temp.id !== id))
        alert(`Email template deleted successfully!`)
      } else {
        await apiClient.delete(`/landingPageTemplate/del/${id}`)
        setLandingTemplates(landingTemplates.filter((temp) => temp.id !== id))
        alert(`Landing template deleted successfully!`)
      }
    } catch (err) {
      console.error('Error deleting template', err)
      alert('Failed to delete template')
    }
  }

  const handleSelectTemplate = (template, type) => {
    if (type === 'Email') {
      dispatch(selectEmailTemplate(template))
    } else {
      dispatch(selectLandingTemplate(template))
    }
    setToast({
      message: `'${type}' template '${template.name}' has been selected!`,
      type: 'success'
    })
    setToastVisible(true)
    
    setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 500) // Clean up after animation
    }, 1500)
  }

  const handleSetActiveFormMode = (mode) => {
    // If switching to a different form mode or closing current form, clear the data
    if (mode !== activeFormMode) {
      // Reset the appropriate editor state
      if (activeFormMode === 'email') {
        setEmailName('');
        setEmailSubject(''); // Clear email subject
        setEmailEditorState(EditorState.createEmpty());
      } else if (activeFormMode === 'landing') {
        setLandingName('');
        setLandingEditorState(EditorState.createEmpty());
      }
    }
    
    // Set the new active form mode
    setActiveFormMode(mode);
  };

  // AI Q&A handler
  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    try {
      // Show loading state
      setIsLoading(true);
      
      // Add user message to conversation
      const newMessages = [...aiMessages, {
        type: 'user',
        content: aiQuestion
      }];
      setAiMessages(newMessages);
      
      // Determine which endpoint to call based on the type of template needed
      let endpoint = '/ai/generate-email';
      if (scenarioType === 'landing') {
        endpoint = '/ai/generate-landing';
      } else if (scenarioType === 'scenario') {
        endpoint = '/ai/generate-scenario';
      }
      
      // Call the AI service
      const response = await aiClient.post(`${endpoint}`, {
        scenario: aiQuestion,
        brandToImpersonate: extractBrandFromQuestion(aiQuestion),
        desiredAction: "Click link and enter credentials",
        urgencyLevel: "4",
        audience: "Corporate employees"
      });
      
      // Process the response
      let aiResponse = '';
      let htmlContent = '';
      
      if (scenarioType === 'scenario') {
        // For complete scenarios
        aiResponse = `## Email Template\n${response.data.email.explanation}\n\n## Landing Page\n${response.data.landingPage.explanation}`;
        htmlContent = response.data.email.html;
      } else if (scenarioType === 'email') {
        // For email templates
        aiResponse = response.data.explanation;
        htmlContent = response.data.html;
      } else {
        // For landing pages
        aiResponse = response.data.explanation;
        htmlContent = response.data.html;
      }
      
      // Add AI response to conversation
      setAiMessages([...newMessages, {
        type: 'ai',
        content: aiResponse,
        html: htmlContent
      }]);
      
      // Update the editor with the HTML content
      if (htmlContent) {
        updateEditorWithHTML(htmlContent);
      }
      
      // Clear the input
      setAiQuestion('');
    } catch (error) {
      console.error('Error calling AI service:', error);
      // Add error message to conversation
      setAiMessages([...aiMessages, 
        { type: 'user', content: aiQuestion },
        { type: 'ai', content: 'Sorry, I encountered an error generating your template. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract potential brand names from the question
  const extractBrandFromQuestion = (question) => {
    const commonBrands = ['Microsoft', 'Google', 'Amazon', 'Apple', 'Facebook', 'Netflix', 'PayPal', 'LinkedIn', 'Twitter'];
    for (const brand of commonBrands) {
      if (question.includes(brand)) {
        return brand;
      }
    }
    return '';
  };

  // Helper function to update editor with HTML content
  const updateEditorWithHTML = (htmlContent) => {
    try {
      const blocksFromHtml = htmlToDraft(htmlContent);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      
      if (activeFormMode === 'email') {
        setEmailEditorState(EditorState.createWithContent(contentState));
      } else if (activeFormMode === 'landing') {
        setLandingEditorState(EditorState.createWithContent(contentState));
      } else {
        // If no specific editor is active, update the AI editor
        setAiEditorState(EditorState.createWithContent(contentState));
      }
    } catch (error) {
      console.error('Error converting HTML to draft:', error);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setModalOpen(false)
    setModalContent('')
    setModalTitle('')
  }
  const Toast = ({ message, type = 'success' }) => {
      const bgColor = type === 'success' ? 'bg-blue-200' : 'bg-red-300'
      
      return (
        <div className={`fixed top-32 right-4 z-50 ${toastVisible ? 'animate-slide-in' : 'animate-slide-out'}`}>
          <div className={`${bgColor} text-black px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
            {type === 'success' && <FaCheck className="text-lg" />}
            <span>{message}</span>
          </div>
        </div>
      )
    }

  return (
    <div className="p-8 text-white h-screen">
      <h1 className="text-3xl text-black font-bold mb-6">Resource Management</h1>
      
      {/* Main flex container for side-by-side columns */}
      <div className="flex h-full space-x-4">
        
        {/* Left Column */}
        <div className="w-1/2 space-y-4">
          {/* Upper Card: Options */}
          <div className="bg-[#FAFAFA] bg-opacity-60 text-black p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Options</h2>
            <div className="flex justify-between space-x-3">
              <button
                onClick={() => handleSetActiveFormMode('email')}
                className="flex-1 border-2 border-[#000080] text-[#000080] hover:bg-blue-300 hover:text-gray-800 py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
               Add Email Template
              </button>
              <button
                onClick={() => handleSetActiveFormMode('landing')}
                className="flex-1 border-2 border-[#000080] text-[#000080] hover:bg-blue-300 hover:text-gray-800 py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Add Landing Page
              </button>
            </div>
          </div>

          {/* Email Template Form (Conditional) */}
          {activeFormMode === 'email' && (
            <div className="bg-[#FAFAFA] bg-opacity-60 p-4 rounded shadow-lg">
              <h2 className="text-2xl text-black font-bold mb-4">Create Email Template</h2>
              <form onSubmit={handleSaveEmailTemplate} className="space-y-4">
                <div>
                  <label className="block mb-1 text-[#000080]">Template Name:</label>
                  <input
                    type="text"
                    value={emailName}
                    onChange={(e) => setEmailName(e.target.value)}
                    placeholder="Enter template name..."
                    className="w-full p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#000080] placeholder-[#595b5c]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#000080]">Email Subject:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject line..."
                    className="w-full p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#000080] placeholder-[#595b5c]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#000080]">HTML Content:</label>
                  <Editor
                    editorState={emailEditorState}
                    onEditorStateChange={setEmailEditorState}
                    wrapperClassName="border border-gray-600 rounded bg-white text-black"
                    editorClassName="p-4"
                    toolbarClassName="border-b border-gray-300"
                  />
                </div>
                <button
                  type="submit"
                  className="border border-[#f8f8f8] text-black hover:bg-blue-300 hover:text-gray-800 py-2 px-4 rounded font-bold transition-colors"
                >
                  <FaSave /> 
                </button>
              </form>
              
              {/* Email Templates Table */}
              <div className="mt-6">
                <h3 className="text-xl text-black font-bold mb-2">Available Email Templates</h3>
                {emailTemplates.length === 0 ? (
                  <p className="text-[#000080]">No email templates found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-[#000080]">Name</th>
                          <th className="px-4 py-2 text-left text-[#000080]">Created</th>
                          <th className="px-4 py-2 text-left text-[#000080]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {emailTemplates.map((template) => (
                          <tr key={template.id}>
                            <td className="px-4 py-2 text-[#000080]">{template.name}</td>
                            <td className="px-4 py-2 text-[#000080]">
                              {formatDate(template.createDate)}
                            </td>
                            <td className="px-4 py-2 space-x-2">
                              <button
                                onClick={() => handleSelectTemplate(template, 'Email')}
                                className="border border-[#f8f8f8] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleShowDetails(template, 'Email')}
                                className="border border-[#f8f8f8] text-[#000080] hover:bg-blue-400 hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id, 'Email')}
                                className="border border-[#f8f8f8] text-[#000080] hover:bg-red-300 hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                              >
                                <FaTrashAlt />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Landing Page Template Form (Conditional) */}
          {activeFormMode === 'landing' && (
            <div className="bg-[#FAFAFA] bg-opacity-60 p-4 rounded shadow-lg">
              <h2 className="text-2xl text-black font-bold mb-4">Create Landing Page Template</h2>
              <form onSubmit={handleSaveLandingTemplate} className="space-y-4">
                <div>
                  <label className="block mb-1 text-[#000080]">Template Name:</label>
                  <input
                    type="text"
                    value={landingName}
                    onChange={(e) => setLandingName(e.target.value)}
                    placeholder="Enter template name..."
                    className="w-full p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#000080] placeholder-[#595b5c]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[#000080]">HTML Content:</label>
                  <Editor
                    editorState={landingEditorState}
                    onEditorStateChange={setLandingEditorState}
                    wrapperClassName="border border-gray-600 rounded bg-white text-black"
                    editorClassName="p-2"
                    toolbarClassName="border-b border-gray-300"
                  />
                </div>
                <button
                  type="submit"
                  className="border border-[#f8f8f8] text-black hover:bg-blue-300 hover:text-gray-800 py-2 px-4 rounded font-bold transition-colors"
                >
                  <FaSave />
                </button>
              </form>
              
              {/* Landing Templates Table */}
              <div className="mt-6">
                <h3 className="text-xl text-black font-bold mb-2">Available Landing Page Templates</h3>
                {landingTemplates.length === 0 ? (
                  <p className="text-[#000080]">No landing page templates found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-[#000080]">Name</th>
                          <th className="px-4 py-2 text-left text-[#000080]">Created</th>
                          <th className="px-4 py-2 text-left text-[#000080]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {landingTemplates.map((template) => (
                          <tr key={template.id}>
                            <td className="px-4 py-2 text-[#000080]">{template.name}</td>
                            <td className="px-4 py-2 text-[#000080]">
                              {formatDate(template.createDate)}
                            </td>
                            <td className="px-4 py-2 space-x-2">
                              <button
                                onClick={() => handleSelectTemplate(template, 'Landing')}
                                className="border border-[#f8f8f8] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleShowDetails(template, 'Landing')}
                                className="border border-[#f8f8f8] text-[#000080] hover:bg-blue-400 hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id, 'Landing')}
                                className="border border-[#f8f8f8] text-[#000080] hover:bg-red-300 hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                              >
                                <FaTrashAlt />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column: AI Q&A Card */}
        {/* Right Column: AI Q&A Card - UPDATED WITH HTML PREVIEW */}
<div className="w-1/2">
  <div className="bg-[#FAFAFA] bg-opacity-60 p-5 rounded-lg shadow-lg h-4/6 flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <h2 className="text-2xl text-black font-bold mr-3">Ask our A.I</h2>
        <div className="bg-green-500 h-3 w-3 rounded-full animate-pulse"></div>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={() => setScenarioType('email')}
          className={`text-xs px-3 py-1 rounded-full border ${
            scenarioType === 'email' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Email
        </button>
        <button 
          onClick={() => setScenarioType('landing')}
          className={`text-xs px-3 py-1 rounded-full border ${
            scenarioType === 'landing' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Landing
        </button>
        <button 
          onClick={() => setScenarioType('scenario')}
          className={`text-xs px-3 py-1 rounded-full border ${
            scenarioType === 'scenario' 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Both
        </button>
      </div>
    </div>
    
    <div className="flex-grow bg-white rounded-lg border border-gray-300 shadow-inner overflow-auto mb-4 px-4 py-3">
      <div className="space-y-4">
        {aiMessages.length > 0 ? (
          <div className="space-y-4">
            {aiMessages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 ${message.type === 'user' ? 'max-w-[80%] bg-blue-500 text-white' : 'w-full bg-gray-100 text-gray-800'}`}>
                  {/* User message */}
                  {message.type === 'user' && message.content.split('\n').map((line, i) => (
                    <p key={i} className={`${i > 0 ? 'mt-2' : ''}`}>{line}</p>
                  ))}
                  
                  {/* AI message with explanation and HTML preview */}
                  {message.type === 'ai' && (
                    <>
                      <div className="prose prose-sm max-w-none mb-3">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className={`${i > 0 ? 'mt-1' : ''}`}>{line}</p>
                        ))}
                      </div>
                      
                      {message.html && (
                        <div className="mt-4 border-t border-gray-300 pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-700">Template Preview</h4>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setModalTitle("HTML Template Preview");
                                  setModalContent(message.html);
                                  setModalOpen(true);
                                }}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                              >
                                View Full
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(message.html);
                                  alert('HTML copied to clipboard!');
                                }}
                                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                              >
                                Copy HTML
                              </button>
                            </div>
                          </div>
                          
                          {/* HTML preview in an iframe with limited height */}
                          <div className="border border-gray-300 bg-white rounded overflow-hidden" style={{ height: '180px' }}>
                            <iframe 
                              srcDoc={message.html}
                              title="Template Preview"
                              className="w-full h-full"
                              sandbox="allow-scripts"
                            />
                          </div>
                          
                          <div className="flex justify-end mt-2">
                            <button 
                              onClick={() => updateEditorWithHTML(message.html)}
                              className="text-xs bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                            >
                              Use This Template
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Describe a phishing scenario to generate templates</p>
            <p className="text-sm mt-2">Example: "Create a Microsoft password reset email"</p>
          </div>
        )}
      </div>
    </div>
    
    <div className="mt-2 relative">
  <input
    type="text"
    value={aiQuestion}
    onChange={(e) => setAiQuestion(e.target.value)}
    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAskAI()}
    placeholder={`Describe a ${scenarioType} template scenario...`}
    className="w-full p-3 pr-32 rounded-full bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
    disabled={isLoading}
  />
  <button
    onClick={handleAskAI}
    disabled={isLoading}
    className={`absolute right-1.5 top-1/2 transform -translate-y-1/2 border-2 border-[#000080] ${
      isLoading 
        ? 'bg-gray-200 text-gray-500' 
        : 'text-[#000080] hover:bg-[#5be55b] hover:text-gray-800'
    } py-1.5 px-4 rounded-full font-bold transition-colors shadow-md`}
  >
    {isLoading ? 'Generating...' : 'Generate'}
  </button>
   </div>
  </div>
</div>
      </div>

      {/* Modal for Template Details */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 bg-opacity-90 p-6 rounded-lg w-11/12 md:max-w-3xl max-h-[80vh] overflow-auto">

          <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl text-white font-bold mb-4">{modalTitle}</h2>
            <div className="bg-gray-400 text-black p-4 rounded overflow-auto" style={{ maxHeight: "60vh" }}>
              <div dangerouslySetInnerHTML={{ __html: modalContent }} />
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-4 border border-black text-black bg-red-500 hover:bg-[#f8f8f8] hover:text-gray-800 py-2 px-4 rounded font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <style>{animationStyles}</style>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default ResourceManagement