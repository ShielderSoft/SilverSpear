import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import ResourceManagement from './pages/ResourceManagement'
import SendingProfile from './pages/SendingProfile'
import DomainFinder from './pages/DomainFinder'
import DomainManagement from './pages/DomainManagement'
import Campaign from './pages/Campaign'
import LMS from './pages/LMS'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Background from './components/Background'
import LMSLogin from './pages/LMSLogin';
import LMSModules from './pages/LMSModule';
import LMSAssessment from './pages/LMSAssessment';
import LMSLogin40 from './pages/LMSLogin40';
import LMSModules40 from './pages/LMSModule40';
import LMSAssessment40 from './pages/LMSAssessment40';
import Report from './pages/Report'

function App() {
  const token = localStorage.getItem('jwtToken')
  const location = useLocation()

  const noNavbarPages = ['/login', '/lms-login','/lms-login40', '/lms-modules','/lms-modules40', '/lms-assessment','/lms-assessment40', '/lms-completion']
  const showNavbar = !noNavbarPages.includes(location.pathname)

  return (
    <div className="min-h-screen text-white flex flex-col">
     <Background />
      {/* Render Navbar on all pages except login */}
      {showNavbar && <Navbar />}
      <div className='flex-grow overflow-auto pb-16'>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/lms-login" element={<LMSLogin />} />
        <Route path="/lms-modules" element={<LMSModules />} />
        <Route path="/lms-assessment" element={<LMSAssessment />} />

        <Route path="/lms-login40" element={<LMSLogin40 />} />
        <Route path="/lms-modules40" element={<LMSModules40 />} />
        <Route path="/lms-assessment40" element={<LMSAssessment40 />} />

        <Route element={<ProtectedRoute />} >
          <Route path="/" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/resource-management" element={<ResourceManagement />} />
          <Route path="/sending-profile" element={<SendingProfile />} />
          <Route path="/domain-finder" element={<DomainFinder />} />
          <Route path="/domain-management" element={<DomainManagement />} />
          <Route path="/campaign" element={<Campaign />} />
          <Route path="/lms" element={<LMS />} />
          <Route path="/report/:campaignId" element={<Report />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
      </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App