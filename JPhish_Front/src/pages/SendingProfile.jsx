import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { useDispatch } from 'react-redux'
import { selectSenderProfile } from '../features/senderProfilesSlice'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, ContentState } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {FaSave, 
  FaCheck, 
  FaEye, 
  FaTrashAlt,FaPaperPlane} from 'react-icons/fa'

const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 bg-opacity-90 p-6 rounded-lg w-11/12 md:max-w-3xl max-h-[80vh] overflow-auto">
        <h2 className="text-2xl text-white font-bold mb-4">{title}</h2>
        <div className="bg-white text-black p-4 rounded overflow-auto" style={{ maxHeight: "60vh" }}>
          {content}
        </div>
        <button
          onClick={onClose}
          className="mt-4 border border-[#f8f8f8] text-[#f8f8f8] hover:bg-[#f8f8f8] hover:text-gray-800 py-2 px-4 rounded font-bold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

const SendingProfile = () => {
  const dispatch = useDispatch()

  // States for Create a Sender Profile Section
  const [name, setName] = useState('')
  const [emailId, setEmailId] = useState('')
  const [description, setDescription] = useState('')
  // Domain Details
  const [domainTLD, setDomainTLD] = useState('')
  // SMTP Config
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpUsername, setSmtpUsername] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [smtpPort, setSmtpPort] = useState('')

  // State for Available Profiles
  const [profiles, setProfiles] = useState([])

  // Modal state for showing details
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState(null)

  // States for the AI Q&A
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiEditorState, setAiEditorState] = useState(EditorState.createEmpty())

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'Invalid date' : date.toLocaleString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Fetch available sender profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await apiClient.get('/profile/get')
        // Ensure the response data is an array
        setProfiles(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error('Error fetching sender profiles:', err)
      }
    }
    fetchProfiles()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    // Map local state to backend keys for SendingProfile entity
    const payload = {
      profileName: name,
      profileEmailId: emailId,
      profileDesc: description,
      domainTld: domainTLD,
      profileSMTPHost: smtpHost,
      profileSMTPUsername: smtpUsername,
      profileSMTPPassword: smtpPassword,
      profileSMTPPort: smtpPort,
    }
    try {
      const response = await apiClient.post('/profile/create', payload)
      alert(response.data) // Should show "Profile created successfully"
      // Reset form fields
      setName('')
      setEmailId('')
      setDescription('')
      setDomainTLD('')
      setSmtpHost('')
      setSmtpUsername('')
      setSmtpPassword('')
      setSmtpPort('')
      // Append the newly created profile to the profiles list
      setProfiles([...profiles, payload])
    } catch (err) {
      console.error('Error saving sender profile:', err)
      alert('Failed to save sender profile')
    }
  }

  const handleDeleteProfile = async (profileId) => {
    try {
      await apiClient.delete(`/profile/${profileId}`)
      alert('Sender profile deleted successfully!')
      setProfiles(profiles.filter((profile) => profile.id !== profileId))
    } catch (err) {
      console.error('Error deleting sender profile:', err)
      alert('Failed to delete sender profile')
    }
  }

  const handleShowDetails = (profile) => {
    setModalTitle(`Sender Profile - ${profile.profileName} Details`)
    setModalContent(
      <div className="space-y-2">
        <p><strong>Name:</strong> {profile.profileName}</p>
        <p><strong>Email Id:</strong> {profile.profileEmailId}</p>
        <p><strong>Description:</strong> {profile.profileDesc}</p>
        <p><strong>Domain TLD:</strong> {profile.domainTld}</p>
        <p><strong>SMTP Host:</strong> {profile.profileSMTPHost}</p>
        <p><strong>SMTP Username:</strong> {profile.profileSMTPUsername}</p>
        <p><strong>SMTP Port:</strong> {profile.profileSMTPPort}</p>
      </div>
    )
    setIsModalOpen(true)
  }

  const handleSelectProfile = (profile) => {
    dispatch(selectSenderProfile(profile))
    alert(`Sender profile "${profile.profileName}" selected!`)
  }

  // AI Q&A dummy handler
  const handleAskAI = () => {
    // Just a placeholder for the actual API call to AI service
    const dummyResponse = `This is a sample response to: ${aiQuestion}`
    const contentState = ContentState.createFromText(dummyResponse)
    setAiEditorState(EditorState.createWithContent(contentState))
  }

  return (
    <div className="p-8 text-white h-screen">
      <h1 className="text-3xl text-black font-bold mb-6">Sending Profile Management</h1>
      
      <div className="flex h-full space-x-4">
        {/* Left Column */}
        <div className="w-1/2 space-y-4">
          {/* Available Profiles Section */}
          <div className="bg-[#FAFAFA] bg-opacity-60 p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl text-black font-bold mb-4">Available Profiles</h2>
            {profiles.length === 0 ? (
              <p className="text-[#000080]">No sender profiles available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-[#000080]">Name</th>
                      <th className="px-4 py-2 text-left text-[#000080]">Email Id</th>
                      <th className="px-4 py-2 text-left text-[#000080]">Created</th>
                      <th className="px-4 py-2 text-left text-[#000080]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {profiles.map((profile) => (
                      <tr key={profile.id}>
                        <td className="px-4 py-2 text-[#000080]">{profile.profileName}</td>
                        <td className="px-4 py-2 text-[#000080]">{profile.profileEmailId}</td>
                        <td className="px-4 py-2 text-[#000080]">
                          {formatDate(profile.createDate)}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button 
                            onClick={() => handleSelectProfile(profile)}
                            className="border border-[#f8f8f8] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                          >
                            <FaCheck />
                          </button>
                          <button 
                            onClick={() => handleShowDetails(profile)}
                            className="border border-[#f8f8f8] text-[#000080] hover:bg-blue-400 hover:text-gray-800 py-1 px-2 rounded text-sm font-bold transition-colors"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleDeleteProfile(profile.id)}
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

          {/* AI Q&A Card */}
          <div className="bg-[#FAFAFA] bg-opacity-60 p-5 rounded-lg shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-black font-bold">Ask our A.I</h2>
              <div className="bg-green-500 h-3 w-3 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex-grow bg-white rounded-lg border border-gray-300 shadow-inner overflow-auto mb-4 px-4 py-3">
              <div className="space-y-4">
                {aiEditorState && aiEditorState.getCurrentContent().hasText() ? (
                  <div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-lg p-3 text-gray-700 max-w-[80%]">
                        <Editor
                          editorState={aiEditorState}
                          onEditorStateChange={setAiEditorState}
                          readOnly
                          toolbarHidden
                          wrapperClassName="bg-transparent border-0"
                          editorClassName="p-0"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>Ask a question about sending profile</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-2 relative">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                placeholder="Type your question here..."
                className="w-full p-3 pr-16 rounded-full bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
              />
              <button
                onClick={handleAskAI}
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 border-2 border-[#000080] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-1.5 px-4 rounded-full font-bold transition-colors shadow-md"
              >
                Ask
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Create a Sender Profile Section */}
        <div className="w-1/2">
          <div className="bg-[#FAFAFA] bg-opacity-60 p-5 rounded-lg shadow-lg overflow-y-auto" style={{ maxHeight: "calc(100vh - 130px)" }}>
            <h2 className="text-2xl text-black font-bold mb-4">Create a Sender Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="mt-6 bg-white p-4 rounded-lg border-l-4 border-[#000080] shadow-md">
            <h3 className="text-xl text-black font-semibold mb-2">Profile Details</h3>
            <div className="space-y-3">
            <div>
              <label className="block mb-1 text-[#000080] font-medium">Profile Name:</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter profile name..."
                className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
                required
              />
            </div>
          <div>
         <label className="block mb-1 text-[#000080] font-medium">Email Address:</label>
         <input 
        type="email"
        value={emailId}
        onChange={(e) => setEmailId(e.target.value)}
        placeholder="Enter email address..."
        className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
        required
        />
        </div>
       <div>
       <label className="block mb-1 text-[#000080] font-medium">Description:</label>
        <textarea 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter profile description..."
        className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400 min-h-[80px]"
        required
       />
        </div>
        </div>
      </div>

              {/* Domain Details - with card-like styling */}
              <div className="mt-6 bg-white p-4 rounded-lg border-l-4 border-[#000080] shadow-md">
                <h3 className="text-xl text-black font-semibold mb-2">Domain Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-[#000080] font-medium">Domain TLD:</label>
                    <input 
                      type="text"
                      value={domainTLD}
                      onChange={(e) => setDomainTLD(e.target.value)}
                      placeholder="e.g., example.com"
                      className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SMTP Config - with card-like styling */}
              <div className="mt-6 bg-white p-4 rounded-lg border-l-4 border-[#000080] shadow-md">
                <h3 className="text-xl text-black font-semibold mb-2">SMTP Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-[#000080] font-medium">Host:</label>
                    <input 
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="e.g., smtp.example.com"
                      className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#000080] font-medium">Username:</label>
                    <input 
                      type="text"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                      placeholder="SMTP username"
                      className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#000080] font-medium">Password:</label>
                    <input 
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="SMTP password"
                      className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#000080] font-medium">Port:</label>
                    <input 
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="e.g., 587, 465, 25"
                      className="w-full p-2 rounded bg-white border-2 border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm text-[#000080] placeholder-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 border-2 border-[#000080] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105 w-full"
              >
                Save profile
              </button>
            </form>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        content={modalContent}
      />
    </div>
  )
}

export default SendingProfile