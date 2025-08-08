import React from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <FaArrowLeft />
                <span>Back to Landing</span>
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                SilverSpear Documentation
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-6">About SilverSpear</h2>
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              SilverSpear is a comprehensive security awareness and phishing simulation platform designed to strengthen organizational cybersecurity through targeted training and assessment.
            </p>
            
            <h3 className="text-2xl font-semibold mb-4 text-cyan-300">Core Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-lg font-semibold mb-2 text-blue-300">Phishing Simulation</h4>
                <p className="text-gray-300">Realistic phishing campaigns to test user awareness and identify vulnerable areas.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-blue-300">Training Modules</h4>
                <p className="text-gray-300">Interactive learning management system with comprehensive security training content.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-blue-300">Campaign Management</h4>
                <p className="text-gray-300">Advanced campaign orchestration with detailed targeting and scheduling capabilities.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 text-blue-300">Analytics & Reporting</h4>
                <p className="text-gray-300">Comprehensive dashboards and reports to track security awareness progress.</p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-4 text-cyan-300">Architecture</h3>
            <p className="text-gray-300 mb-4">
              Built on a modern microservices architecture, SilverSpear provides scalable, secure, and reliable security awareness training:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Campaign Service:</strong> Manages phishing campaigns and user targeting</li>
              <li><strong>JPhish Backend:</strong> Core phishing simulation engine</li>
              <li><strong>LMS Assessment:</strong> Learning management and training assessment system</li>
              <li><strong>Landing Page Service:</strong> Handles phishing landing pages and user interactions</li>
              <li><strong>React Frontend:</strong> Modern, responsive user interface</li>
            </ul>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="#api-quickstart" 
              className="flex items-center justify-between p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">API Quickstart</h3>
                <p className="text-gray-300 text-sm">Get started with the SilverSpear API in 5 minutes</p>
              </div>
            </a>
            
            <Link 
              to="/dashboard" 
              className="flex items-center justify-between p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">Admin Console</h3>
                <p className="text-gray-300 text-sm">Access the SilverSpear admin dashboard</p>
              </div>
            </Link>
            
            <a 
              href="#examples" 
              className="flex items-center justify-between p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">Code Examples</h3>
                <p className="text-gray-300 text-sm">Sample implementations and integration examples</p>
              </div>
            </a>
          </div>
        </section>

        {/* Getting Started */}
        <section className="text-center py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Getting Started with SilverSpear</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-cyan-300">For Administrators</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Access the admin dashboard to manage users and campaigns</li>
                  <li>• Configure organizational settings and security policies</li>
                  <li>• Create and schedule phishing simulation campaigns</li>
                  <li>• Monitor training progress and generate reports</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-cyan-300">For End Users</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Complete interactive security awareness training modules</li>
                  <li>• Participate in simulated phishing assessments</li>
                  <li>• Track your learning progress and achievements</li>
                  <li>• Access resources for improving security awareness</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-2xl font-semibold mb-6">Need Support?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/dashboard" 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200 font-medium"
                >
                  Access Dashboard
                </Link>
                <a 
                  href="mailto:support@silverspear.security" 
                  className="border-2 border-gray-600 text-gray-300 px-8 py-3 rounded-lg hover:border-gray-500 hover:text-white transition-colors font-medium"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Documentation
