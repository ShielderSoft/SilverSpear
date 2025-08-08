import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const user = useSelector((state) => state.auth.user) || { name: "Admin" }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  // This function returns a className string based on whether the link is active.
  const navLinkClasses = ({ isActive }) =>
    `transition-transform transform hover:scale-105 hover:text-cyan-300 ${isActive ? 'text-cyan-300 font-bold' : 'text-white'}`

  return (
    <nav className="bg-gray-800 p-4 flex text-white justify-between items-center print-none">
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold">SilverSpear</div>
        <NavLink to="/dashboard" className={navLinkClasses}>
          Dashboard
        </NavLink>
        <NavLink to="/domain-finder" className={navLinkClasses}>
         Domain Finder
        </NavLink>
        <NavLink to="/user-management" className={navLinkClasses}>
          User Management
        </NavLink>
        <NavLink to="/resource-management" className={navLinkClasses}>
          Resource Management
        </NavLink>
        <NavLink to="/sending-profile" className={navLinkClasses}>
          Sending Profile
        </NavLink>
        <NavLink to="/campaign" className={navLinkClasses}>
          Campaign
        </NavLink>
        <NavLink to="/lms" className={navLinkClasses}>LMS</NavLink>
        {/*ß
          Uncomment if needed:
          <NavLink to="/domain-finder" className={navLinkClasses}>Domain Finder</NavLink>
          <NavLink to="/domain-management" className={navLinkClasses}>Domain Management</NavLink>
          <NavLink to="/lms" className={navLinkClasses}>LMS</NavLink>
        */}
      </div>
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center focus:outline-none"
        >
          <span className="text-lg font-bold">
            {user.name.split(' ').map(n => n[0]).join('')}
          </span>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md overflow-hidden shadow-lg">
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left hover:bg-gray-600"
            >
              Log Out
            </button>
            
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar