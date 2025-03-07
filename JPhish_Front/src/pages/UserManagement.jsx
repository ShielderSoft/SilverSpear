import React, { useState, useEffect } from 'react'
import apiClient from '../apiClient'
import { useDispatch } from 'react-redux'
import { selectGroup } from '../features/groupsSlice'
import { FaCheck, FaTrashAlt, FaEye, FaPlus, FaTimes, FaUserPlus, FaUsers } from 'react-icons/fa'

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
    alert(`Group '${group.groupName}' has been selected!`)
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

  return (
    <div className="p-8 h-screen">
      <h1 className="text-3xl text-black font-bold mb-6">User Management</h1>
      <div className="flex h-full space-x-8">
        {/* Left Side: Bulk Upload & Selective Upload Sections */}
        <div className="w-1/3 space-y-8">
          {/* Bulk Upload Section */}
          <section className="bg-[#FAFAFA] bg-opacity-60 p-4 text-black rounded shadow-lg">
            <h2 className="text-2xl mb-4">Bulk Upload</h2>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div>
                <label className="block text-xl mb-1 text-[#000080]">Group Name:</label>
                <input
                  type="text"
                  value={bulkGroupName}
                  onChange={(e) => setBulkGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#000080] placeholder-[#595b5c]"
                  required
                />
              </div>
              <div>
                <label className="block text-xl mb-1 text-[#000080]">CSV File:</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkFileChange}
                  className="w-full text- p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#595b5c]"
                  required
                />
              </div>
              <button
                type="submit"
                className="border border-[#3ca5b3] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-2 px-4 rounded font-bold transition-colors"
              >
                <FaUsers />
              </button>
            </form>
          </section>

          {/* Selective Upload Section */}
          <section className="bg-[#FAFAFA] bg-opacity-60 p-4 text-black rounded shadow-lg">
            <h2 className="text-2xl mb-4">Selective Upload</h2>
            <form onSubmit={handleSelectiveUpload} className="space-y-4">
              <div>
                <label className="block text-xl mb-1 text-[#000080]">Group Name:</label>
                <input
                  type="text"
                  value={selectiveGroupName}
                  onChange={(e) => setSelectiveGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="w-full p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#000080] placeholder-[#595b5c]"
                  required
                />
              </div>
              <div>
                <h3 className="text-xl mb-2 text-[#000080]">Users</h3>
                {userRows.map((row, index) => (
                  <div key={index} className="flex space-x-4 mb-2">
                    <input
                      type="text"
                      placeholder="Username"
                      value={row.username}
                      onChange={(e) =>
                        handleUserRowChange(index, 'username', e.target.value)
                      }
                      className="flex-1 p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#000080] placeholder-[#595b5c]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={row.email}
                      onChange={(e) =>
                        handleUserRowChange(index, 'email', e.target.value)
                      }
                      className="flex-1 p-2 mt-1 rounded bg-transparent border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-[#000080] placeholder-[#595b5c]"
                      required
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addUserRow}
                  className="mt-2 border border-[#3ca5b3] text-[#000080] hover:bg-[#6642ff] hover:text-gray-800 py-1 px-3 rounded font-bold transition-colors"
                >
                  <FaUserPlus />
                </button>
              </div>
              <button
                type="submit"
                className="border border-[#3ca5b3] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-2 px-4 rounded-lg font-bold transition-colors"
              >
                <FaPlus />
              </button>
            </form>
          </section>
        </div>

        {/* Right Side: Existing Groups Section */}
        <div className="w-2/3 h-full">
          <section className="bg-[#FAFAFA] bg-opacity-60 p-4 text-black srounded shadow h-full overflow-y-auto">
            <h2 className="text-2xl mb-4 text-offwhite">Existing Groups</h2>
            {groups.length === 0 ? (
              <p className="text-[#000080]">No groups found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-[#000080]">Group Name</th>
                      <th className="px-4 py-2 text-left text-[#000080]">User Count</th>
                      <th className="px-4 py-2 text-left text-[#000080]">Created At</th>
                      <th className="px-4 py-2 text-left text-[#000080]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {groups.map((group) => (
                      <tr key={group.id}>
                        <td className="px-4 py-2 text-black">{group.groupName}</td>
                        <td className="px-4 py-2 text-black">{group.users.length}</td>
                        <td className="px-4 py-2 text-black">{new Date(group.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => handleSelectGroup(group)}
                            className="border border-[#f8f8f8] text-[#000080] hover:bg-[#5be55b] hover:text-gray-800 py-1 px-3 rounded font-bold transition-colors"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="border border-[#f8f8f8] text-[#000080] hover:bg-[#fd2d2d] hover:text-gray-800 py-1 px-3 rounded font-bold transition-colors"
                          >
                            <FaTrashAlt />
                          </button>
                          <button
                            onClick={() => handleShowDetails(group)}
                            className="border border-[#f8f8f8] text-[#000080] hover:bg-blue-500 hover:text-gray-800 py-1 px-3 rounded font-bold transition-colors"
                          >
                            <FaEye />
                          </button>
                        </td> 
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Group Details Modal */}
      {modalGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white text-gray-800 p-6 rounded-lg w-11/12 md:max-w-2xl relative">

            
            <h2 className="text-2xl font-bold text-[#000080] mb-4 pr-8">Group Details</h2>
            
            {/* Group info section */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-bold">Group Name:</span> {modalGroup.groupName}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-bold">User Count:</span> {modalGroup.users.length}
                </div>
                <div className="bg-gray-100 p-2 rounded col-span-2">
                  <span className="font-bold">Created At:</span>{' '}
                  {new Date(modalGroup.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Scrollable users list */}
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Users:</h3>
              <div className="max-h-[300px] overflow-auto border border-gray-200 rounded p-2">
                {modalGroup.users.map((user) => (
                  <div key={user.id} className="border-b last:border-0 p-2">
                    <p>
                      <span className="font-bold">Name:</span> {user.name}
                    </p>
                    <p>
                      <span className="font-bold">Email:</span> {user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-bold">Created:</span>{' '}
                      {new Date(user.createDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bottom close button */}
            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="bg-red-500 text-white py-2 px-4 rounded font-bold transition-colors hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement