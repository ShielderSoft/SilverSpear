import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { useDispatch } from 'react-redux'
import { selectGroup } from '../features/groupsSlice'
import { FaCheck, FaTrashAlt, FaEye, FaPlus, FaTimes, FaUserPlus, FaUsers } from 'react-icons/fa'
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

function UserManagement() {
  const dispatch = useDispatch()

  // States for Bulk Upload
  const [bulkGroupName, setBulkGroupName] = useState('')
  const [csvFile, setCsvFile] = useState(null)

  // States for Selective Upload
  const [selectiveGroupName, setSelectiveGroupName] = useState('')
  const [userRows, setUserRows] = useState([{ username: '', email: '' }])

  // State for Existing Groups
  const [groups, setGroups] = useState([])

  // State for Group Details Modal
  const [modalGroup, setModalGroup] = useState(null)

  const [toast, setToast] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [manualUploadActive, setManualUploadActive] = useState(false);
  // Fetch existing groups from backend on mount
  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await apiClient.get('/usergroup/all')
        setGroups(response.data)
      } catch (err) {
        console.error('Failed to fetch groups', err)
      }
    }
    fetchGroups()
  }, [])

  // Handlers for Bulk Upload
  const handleBulkFileChange = (e) => {
    setCsvFile(e.target.files[0])
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('Groupname', bulkGroupName)
    if (csvFile) {
      formData.append('file', csvFile)
    }
    try {
      await apiClient.post('/usergroup/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('Bulk group created successfully!')
      setBulkGroupName('')
      setCsvFile(null)
      const response = await apiClient.get('/usergroup/all')
      setGroups(response.data)
    } catch (err) {
      console.error('Bulk upload failed', err)
      alert('Bulk upload failed')
    }
  }

  // Handlers for Selective Upload
  const handleUserRowChange = (index, field, value) => {
    const newRows = [...userRows]
    newRows[index][field] = value
    setUserRows(newRows)
  }

  const addUserRow = () => {
    setUserRows([...userRows, { username: '', email: '' }])
  }

  const handleSelectiveUpload = async (e) => {
    e.preventDefault()
    const payload = {
      groupName: selectiveGroupName,
      users: userRows.map((user) => ({
        name: user.username,
        email: user.email,
      })),
    }
    try {
      await apiClient.post('/usergroup/createGroup', payload)
      alert('Selective group created successfully!')
      setSelectiveGroupName('')
      setUserRows([{ username: '', email: '' }])
      const response = await apiClient.get('/usergroup/all')
      setGroups(response.data)
    } catch (err) {
      console.error('Selective upload failed', err)
      alert('Selective upload failed')
    }
  }

  // Handlers for Existing Groups actions
  const handleSelectGroup = (group) => {
    dispatch(selectGroup(group))
    setToast({
      message: `Group '${group.groupName}' has been selected!`,
      type: 'success'
    })
    setToastVisible(true)
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 500) // Clean up after animation
    }, 1500)
  }

  const handleDeleteGroup = async (groupId) => {
    try {
      await apiClient.post(`/usergroup/del/${groupId}`)
      alert('Group deleted successfully!')
      setGroups(groups.filter((group) => group.id !== groupId))
    } catch (err) {
      console.error('Delete group failed', err)
      alert('Delete group failed')
    }
  }

  const handleShowDetails = (group) => {
    setModalGroup(group)
  }
  
  const closeModal = () => {
    setModalGroup(null)
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
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Enhanced Page Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg mr-4">
            <FaUsers className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        </div>
        <p className="text-gray-600 ml-16">Create and manage user groups for your phishing campaigns</p>
      </div>
      
      {/* Upload Section with enhanced visuals */}
<div className="mb-8">
  <div className="flex flex-col md:flex-row gap-6">
    {/* Left side: Upload form */}
    <div className="w-full md:w-1/2">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl h-full">
        {/* Header with animated gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -mb-10 -ml-10"></div>
          
          <div className="flex justify-between items-center relative">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FaUserPlus className="mr-2" /> Upload User Details
            </h2>
            <div className="flex space-x-2">
              <button 
                className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm group"
                onClick={() => alert("Download sample CSV")}
              >
                <svg className="w-4 h-4 mr-1.5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Sample
              </button>
              <button 
                className={`${manualUploadActive ? 'bg-green-500 text-white' : 'bg-white text-blue-700 hover:bg-blue-50'} px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-all shadow-sm`}
                onClick={() => setManualUploadActive(!manualUploadActive)}
              >
                <FaUserPlus className={`mr-1.5 ${manualUploadActive ? 'animate-pulse' : ''}`} />
                Manual Upload
              </button>
            </div>
          </div>
        </div>
        
        {/* Upload Form Content */}
        <div className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <span className="bg-blue-100 p-1 rounded-md mr-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                Group Name
              </label>
              <input
                type="text"
                value={bulkGroupName}
                onChange={(e) => setBulkGroupName(e.target.value)}
                placeholder="Enter a name for this user group"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                <span className="bg-blue-100 p-1 rounded-md mr-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                Upload CSV File
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center hover:border-blue-500 transition-colors group bg-gradient-to-br from-gray-50 to-white">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>
                    {' '}or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">CSV file only</p>
                </div>
                {csvFile && (
                  <div className="mt-4 text-sm text-gray-800 bg-blue-50 px-3 py-1.5 rounded-full inline-flex items-center animate-fade-in">
                    <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {csvFile.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBulkUpload}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Right side: Manual entry - only visible when manual upload is active */}
    {manualUploadActive && (
      <div className="w-full md:w-1/2 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl h-full">
          <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-teal-700 px-6 py-4">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mt-20 -mr-20"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -mb-10 -ml-10"></div>
            
            <div className="flex justify-between items-center relative">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FaUserPlus className="mr-2" /> Manual User Entry
              </h2>
              <button
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors border border-white/20"
                onClick={() => setManualUploadActive(false)}
              >
                <FaTimes className="mr-1.5" />
                Close
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                  <span className="bg-green-100 p-1 rounded-md mr-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  Group Name
                </label>
                <input
                  type="text"
                  value={selectiveGroupName}
                  onChange={(e) => setSelectiveGroupName(e.target.value)}
                  placeholder="Enter a name for this user group"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="bg-green-100 p-1 rounded-md mr-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </span>
                    User Details
                  </label>
                  <button
                    type="button"
                    onClick={addUserRow}
                    className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center bg-green-50 px-2 py-1 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <FaPlus className="mr-1.5" />
                    Add User
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 rounded-lg">
                  {userRows.map((row, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-2 gap-3 bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg relative group border border-gray-100 hover:border-green-200 transition-colors shadow-sm hover:shadow"
                    >
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        <input
                          type="text"
                          placeholder="Username"
                          value={row.username}
                          onChange={(e) => handleUserRowChange(index, 'username', e.target.value)}
                          className="pl-10 w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                          required
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          placeholder="Email"
                          value={row.email}
                          onChange={(e) => handleUserRowChange(index, 'email', e.target.value)}
                          className="pl-10 w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                          required
                        />
                      </div>
                      {userRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newRows = [...userRows];
                            newRows.splice(index, 1);
                            setUserRows(newRows);
                          }}
                          className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                        >
                          <FaTimes size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSelectiveUpload}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center"
                >
                  <FaUserPlus className="mr-2" />
                  Save Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
      
      {/* COMPLETELY REDESIGNED EXISTING GROUPS SECTION */}
      <div className="col-span-3">
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
    {/* Header with search functionality */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center">
          <FaUsers className="mr-2" /> Existing User Groups
        </h2>
        
        {groups.length > 0 && (
          <div className="relative mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="Search groups..."
              className="pl-9 pr-4 py-2 rounded-full text-sm bg-white/10 border border-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-auto"
            />
            <svg className="w-5 h-5 absolute left-2.5 top-2.5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>
    </div>
    
    {groups.length === 0 ? (
      <div className="p-12 text-center">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-full animate-ping"></div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-full relative">
            <FaUsers className="text-blue-500 text-4xl" />
          </div>
        </div>
        <p className="text-gray-600 text-lg font-medium mt-4">No user groups have been created yet</p>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
          User groups help you organize your campaign targets. Create a group using the form above.
        </p>
        <button 
          onClick={addUserRow}
          className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 flex items-center mx-auto"
        >
          <FaUserPlus className="mr-2" /> Create First Group
        </button>
      </div>
    ) : (
      <div className="flex flex-col md:flex-row">
        {/* Left side: Group selection */}
        <div className="w-full md:w-1/4 lg:w-1/5 border-r border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center">
              <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 inline-flex items-center justify-center mr-2 text-xs">
                {groups.length}
              </span>
              Groups
            </h3>
          </div>
          <nav className="overflow-y-auto max-h-[500px] py-2 groups-scrollbar">
            {groups.map((group, idx) => (
              <button
                key={group.id}
                onClick={() => setModalGroup(group)}
                className={`w-full text-left px-4 py-3 flex items-center transition-all duration-200 ${
                  modalGroup && modalGroup.id === group.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'border-l-4 border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-medium mr-3">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${
                    modalGroup && modalGroup.id === group.id ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {group.groupName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {group.users.length} user{group.users.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  modalGroup && modalGroup.id === group.id
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <FaEye size={12} />
                </span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Right side: Group details */}
        <div className="w-full md:w-3/4 lg:w-4/5 p-6 overflow-hidden">
          {modalGroup ? (
            <div className="animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                      {modalGroup.groupName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 truncate">{modalGroup.groupName}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Created on {new Date(modalGroup.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => handleSelectGroup(modalGroup)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <FaCheck className="mr-2" /> Select Group
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${modalGroup.groupName}"? This action cannot be undone.`)) {
                        handleDeleteGroup(modalGroup.id);
                        setModalGroup(null);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    <FaTrashAlt className="mr-2 text-red-500" /> Delete
                  </button>
                </div>
              </div>
              
              {/* Stats summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-sm text-gray-500">Total Users</div>
                  <div className="text-2xl font-bold text-gray-800 flex items-end">
                    {modalGroup.users.length}
                    <span className="text-xs text-gray-500 ml-1 mb-1">users</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-sm text-blue-600">Group Name</div>
                  <div className="text-lg font-medium text-blue-800 truncate">{modalGroup.groupName}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="text-lg font-medium text-gray-800">
                    {new Date(modalGroup.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* User table with search and filters */}
              <div className="mb-3 flex flex-wrap items-center justify-between">
                <h4 className="font-medium text-gray-700 flex items-center">
                  <FaUsers className="mr-2 text-blue-500" /> 
                  Users in Group
                </h4>
                <div className="relative mt-2 sm:mt-0">
                  <input
                    type="text"
                    placeholder="Find user..."
                    className="pl-8 pr-4 py-1.5 rounded-lg text-sm border border-gray-300 w-full sm:w-auto"
                  />
                  <svg className="w-4 h-4 absolute left-2.5 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            Name
                            <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modalGroup.users.length > 0 ? (
                        modalGroup.users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 font-medium text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                              <a href={`mailto:${user.email}`} className="hover:text-blue-600 hover:underline transition-colors">
                                {user.email}
                              </a>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                            No users found in this group
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {modalGroup.users.length > 10 && (
                  <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Previous
                      </a>
                      <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Next
                      </a>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                          <span className="font-medium">{modalGroup.users.length}</span> users
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </a>
                          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            1
                          </a>
                          <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100">
                            2
                          </a>
                          <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-500 text-right">
                Total users: {modalGroup.users.length}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="bg-gray-50 rounded-full p-5">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M19 12a7 7 0 10-14 0 7 7 0 0014 0z" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">Select a group from the sidebar</p>
              <p className="mt-2 text-gray-500 max-w-md text-center">
                Choose a user group from the list to view its details and manage its users.
              </p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  
  <style jsx>{`
    .groups-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .groups-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    .groups-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 3px;
    }
    .groups-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-in-out;
    }
  `}</style>
</div>
      {/* </div> */}
      
      {/* Toast Notification - Keep existing implementation */}
      <style>{animationStyles}</style>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default UserManagement