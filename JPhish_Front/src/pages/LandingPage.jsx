import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaChartLine, 
  FaEnvelope, 
  FaGraduationCap, 
  FaUserFriends, 
  FaBullseye, 
  FaShieldAlt,
  FaServer,
  FaDatabase,
  FaNetworkWired,
  FaEye,
  FaClipboardList,
  FaArrowRight,
  FaCheckCircle,
  FaLock,
  FaUsers,
  FaFileAlt,
  FaMoon,
  FaSun,
  FaExternalLinkAlt
} from 'react-icons/fa'
import '../branding.css'
import '../landing.css'
import WorkflowDiagram from '../components/WorkflowDiagram'
import MicroservicesArchitecture from '../components/MicroservicesArchitecture'

const LandingPage = () => {
  const [isDark, setIsDark] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  // Auto-advance workflow steps for visual interest
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 6)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const workflowSteps = [
    {
      icon: FaBullseye,
      title: "Plan Campaigns",
      description: "Define audience segments, schedule delivery, and craft realistic phishing scenarios tailored to your organization's needs.",
      color: "from-blue-600 to-blue-400"
    },
    {
      icon: FaEnvelope,
      title: "Configure Sender Profiles", 
      description: "Securely manage SMTP credentials, domain configurations, and sending identities with built-in validation.",
      color: "from-teal-600 to-green-400"
    },
    {
      icon: FaFileAlt,
      title: "Prepare Templates & Dashboard",
      description: "Create compelling email templates and destination experiences that align with your training objectives.",
      color: "from-purple-600 to-pink-400"
    },
    {
      icon: FaNetworkWired,
      title: "Launch & Deliver",
      description: "Execute campaigns across user groups with intelligent bot filtering and comprehensive tracking capabilities.",
      color: "from-orange-600 to-red-400"
    },
    {
      icon: FaEye,
      title: "Capture Responses",
      description: "Record clicks, form submissions, and behavioral signals securely with detailed forensic analysis.",
      color: "from-indigo-600 to-purple-400"
    },
    {
      icon: FaGraduationCap,
      title: "Train & Report",
      description: "Deliver targeted LMS modules with AI-powered feedback and generate comprehensive analytics reports.",
      color: "from-emerald-600 to-teal-400"
    }
  ]

  const capabilities = [
    {
      icon: FaBullseye,
      title: "Campaigns",
      description: "Design, schedule, and track realistic phishing campaigns with advanced targeting capabilities.",
      link: "/campaign"
    },
    {
      icon: FaEnvelope,
      title: "Sender Profiles", 
      description: "Manage SMTP credentials, domains, and sending identities securely with validation tools.",
      link: "/sending-profile"
    },
    {
      icon: FaDatabase,
      title: "Domains & Resources",
      description: "Handle domains, email templates, and digital assets from a centralized management hub.",
      link: "/resource-management"
    },
    {
      icon: FaUserFriends,
      title: "Users & Groups",
      description: "Target training effectively with granular user management and group segmentation.",
      link: "/user-management"
    },
    {
      icon: FaGraduationCap,
      title: "LMS & Assessments",
      description: "Deliver interactive training modules with AI-powered feedback and progress tracking.",
      link: "/lms"
    },
    {
      icon: FaChartLine,
      title: "Reporting & Analytics",
      description: "Visualize campaign results and export detailed insights in real-time dashboards.",
      link: "/report"
    }
  ]

  const outcomes = [
    { metric: "85%", label: "Reduction in risky clicks", sublabel: "within 6 months" },
    { metric: "92%", label: "Training completion rate", sublabel: "across all modules" },
    { metric: "78%", label: "Improved threat detection", sublabel: "confidence scores" }
  ]

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
      {/* Navbar */}
      <nav 
        className={`${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'} p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-sm`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            SilverSpear
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#workflow" className={`transition-colors hover:text-cyan-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Workflow
            </a>
            <a href="#capabilities" className={`transition-colors hover:text-cyan-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Features
            </a>
            <Link to="/docs" className={`transition-colors hover:text-cyan-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Documentation
            </Link>
            <a href="#security" className={`transition-colors hover:text-cyan-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Security
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
          </button>
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200 font-medium"
          >
            Open Console
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
      <section className="px-6 py-16 max-w-7xl mx-auto" aria-labelledby="hero-title">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h1 id="hero-title" className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  SilverSpear
                </span>
              </h1>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Security awareness and phishing simulation, built for scale.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {['Modular', 'Microservices', 'Secure', 'Scalable'].map((badge, index) => (
                <span
                  key={badge}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200 font-medium text-center"
              >
                Dashboard
              </Link>
              <Link
                to="/docs"
                className={`border-2 ${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} px-8 py-3 rounded-lg transition-colors font-medium text-center`}
              >
                View Documentation
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <MicroservicesArchitecture isDark={isDark} />
          </motion.div>
        </div>
      </section>

      {/* Workflow Overview */}
      <section id="workflow" className={`py-16 xl:py-24 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 xl:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 xl:mb-20"
          >
            <h2 className="text-3xl xl:text-4xl font-bold mb-4">How SilverSpear Works</h2>
            <p className={`text-lg xl:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              End-to-end phishing simulation and security awareness training in six strategic phases
            </p>
          </motion.div>

          {/* Reorganized layout to prevent cutoff */}
          <div className="space-y-12 xl:space-y-16">
            {/* Workflow Diagram - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <WorkflowDiagram isDark={isDark} currentStep={currentStep} />
            </motion.div>
            
            {/* Step Content - Centered */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div className="flex items-center justify-center gap-4">
                <div className={`p-4 rounded-2xl text-white transform transition-transform hover:scale-110 bg-gradient-to-br ${workflowSteps[currentStep].color}`}>
                  {React.createElement(workflowSteps[currentStep].icon, { className: "text-3xl" })}
                </div>
                <div className="text-left">
                  <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                    Step {currentStep + 1} of 6
                  </span>
                  <h3 className="text-2xl xl:text-3xl font-bold">{workflowSteps[currentStep].title}</h3>
                </div>
              </div>
              
              <p className={`text-lg xl:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                {workflowSteps[currentStep].description}
              </p>
              
              <div className="flex items-center justify-center gap-8 pt-4">
                <Link
                  to="/docs"
                  className={`inline-flex items-center gap-2 ${isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-700'} transition-colors font-medium`}
                >
                  Learn more <FaArrowRight className="text-sm" />
                </Link>
                
                {/* Step indicators */}
                <div className="flex gap-2">
                  {workflowSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-blue-500 scale-125' 
                          : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Core Capabilities</h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Comprehensive security awareness platform with modular microservices architecture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group p-6 rounded-2xl ${isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 hover:scale-105`}
              >
                <div className="mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 text-white w-fit mb-4 group-hover:scale-110 transition-transform">
                    <capability.icon className="text-xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{capability.title}</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                    {capability.description}
                  </p>
                </div>
                <Link
                  to={capability.link}
                  className={`inline-flex items-center gap-2 ${isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-700'} transition-colors text-sm font-medium`}
                >
                  Explore <FaArrowRight className="text-xs" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes & Proof */}
      <section className={`py-20 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Proven Results</h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Measurable improvements in security awareness and threat detection capabilities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {outcomes.map((outcome, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                  {outcome.metric}
                </div>
                <div className="text-xl font-semibold mb-1">{outcome.label}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{outcome.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Security & Compliance</h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Enterprise-grade security with comprehensive audit capabilities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaLock, title: "Role-based Access Control", description: "Granular permissions and user management" },
              { icon: FaShieldAlt, title: "Data Privacy", description: "Secure handling of sensitive information" },
              { icon: FaFileAlt, title: "Audit Logging", description: "Comprehensive traceability and compliance" },
              { icon: FaCheckCircle, title: "Security Standards", description: "Industry best practices and certifications" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}
              >
                <item.icon className="text-3xl text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/security"
              className={`inline-flex items-center gap-2 ${isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-700'} transition-colors font-medium`}
            >
              View Security Documentation <FaExternalLinkAlt className="text-sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold">Ready to run your next simulation?</h2>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Start building security awareness with comprehensive phishing simulations and training programs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-8 py-4 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200 font-medium text-lg"
              >
                Open Console
              </Link>
              <a
                href="#contact"
                className={`border-2 ${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'} px-8 py-4 rounded-lg transition-colors font-medium text-lg`}
              >
                Book a Demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
                SilverSpear
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Security awareness and phishing simulation platform built for enterprise scale.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <div className="space-y-2">
                <a href="/api" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>API Reference</a>
                <Link to="/docs" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>User Guides</Link>
                <a href="/integration" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>Integration</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <div className="space-y-2">
                <Link to="/security" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>Security Policy</Link>
                <a href="#" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>Privacy Policy</a>
                <a href="#" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>License (MIT)</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>Contact Us</a>
                <a href="#" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>Community</a>
                <a href="#" className={`block text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} transition-colors`}>Status</a>
              </div>
            </div>
          </div>
          
          <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 SilverSpear. Built with security in mind.
            </p>
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}

export default LandingPage
