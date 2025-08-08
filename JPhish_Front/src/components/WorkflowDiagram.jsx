import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaBullseye, 
  FaEnvelope, 
  FaFileAlt, 
  FaNetworkWired, 
  FaEye, 
  FaGraduationCap,
  FaArrowRight 
} from 'react-icons/fa'

const WorkflowDiagram = ({ isDark, currentStep }) => {
  const steps = [
    { icon: FaBullseye, title: "Plan", color: "blue" },
    { icon: FaEnvelope, title: "Configure", color: "green" },
    { icon: FaFileAlt, title: "Prepare", color: "purple" },
    { icon: FaNetworkWired, title: "Launch", color: "orange" },
    { icon: FaEye, title: "Capture", color: "indigo" },
    { icon: FaGraduationCap, title: "Train", color: "teal" }
  ]

  return (
    <div className={`py-8 px-6 xl:py-10 xl:px-8 rounded-2xl w-full max-w-5xl mx-auto ${isDark ? 'bg-transparent' : 'bg-transparent'}`}>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-center px-4 xl:px-6">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              {/* Step container with equal width and proper spacing */}
              <div className="flex justify-center px-1" style={{ minWidth: '120px' }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.6 }}
                  animate={{ 
                    scale: currentStep === index ? 1.1 : 0.9, 
                    opacity: currentStep === index ? 1 : 0.6
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`relative flex flex-col items-center p-2 xl:p-3 rounded-xl text-white transform transition-all duration-300 hover:scale-[1.02] w-16 h-16 xl:w-18 xl:h-18 ${
                    currentStep === index 
                      ? `${step.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-400' :
                          step.color === 'green' ? 'bg-gradient-to-br from-green-600 to-green-400' :
                          step.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-purple-400' :
                          step.color === 'orange' ? 'bg-gradient-to-br from-orange-600 to-orange-400' :
                          step.color === 'indigo' ? 'bg-gradient-to-br from-indigo-600 to-indigo-400' :
                          'bg-gradient-to-br from-teal-600 to-teal-400'} shadow-xl`
                      : `${step.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-400' :
                          step.color === 'green' ? 'bg-gradient-to-br from-green-600 to-green-400' :
                          step.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-purple-400' :
                          step.color === 'orange' ? 'bg-gradient-to-br from-orange-600 to-orange-400' :
                          step.color === 'indigo' ? 'bg-gradient-to-br from-indigo-600 to-indigo-400' :
                          'bg-gradient-to-br from-teal-600 to-teal-400'} opacity-60`
                  }`}
                >
                  <step.icon className={`${currentStep === index ? 'text-sm xl:text-base' : 'text-xs xl:text-sm'} mb-1 transition-all duration-300`} />
                  <span className={`text-[10px] xl:text-xs font-medium transition-all duration-300 text-center leading-tight ${
                    currentStep === index ? 'text-white font-semibold' : 'text-white text-opacity-80'
                  }`}>
                    {step.title}
                  </span>
                  
                  {/* Active indicator - positioned safely */}
                  {currentStep === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
              
              {/* Arrow connector - properly spaced to avoid overlap */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center mx-2 xl:mx-3 min-w-0">
                  <motion.div 
                    className={`h-1 w-6 xl:w-8 rounded-full transition-all duration-500 ${
                      currentStep > index 
                        ? 'bg-gradient-to-r from-green-500 to-green-400' 
                        : currentStep === index
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                        : isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                    animate={{
                      boxShadow: currentStep === index 
                        ? '0 0 8px rgba(59, 130, 246, 0.4)' 
                        : '0 0 0px rgba(59, 130, 246, 0)'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    animate={{
                      x: currentStep === index ? 2 : 0,
                      scale: currentStep === index ? 1.2 : 1
                    }}
                    transition={{ duration: 0.3 }}
                    className="ml-1.5 xl:ml-2"
                  >
                    <FaArrowRight 
                      className={`text-xs xl:text-sm transition-colors duration-300 ${
                        currentStep > index 
                          ? 'text-green-500' 
                          : currentStep === index
                          ? 'text-blue-500'
                          : isDark ? 'text-gray-500' : 'text-gray-400'
                      }`} 
                    />
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile and Tablet Layout */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: currentStep === index ? 1 : 0.7, 
                scale: currentStep === index ? 1.05 : 1
              }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`relative flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
                currentStep === index 
                  ? (step.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg' :
                     step.color === 'green' ? 'bg-gradient-to-br from-green-600 to-green-400 text-white shadow-lg' :
                     step.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-purple-400 text-white shadow-lg' :
                     step.color === 'orange' ? 'bg-gradient-to-br from-orange-600 to-orange-400 text-white shadow-lg' :
                     step.color === 'indigo' ? 'bg-gradient-to-br from-indigo-600 to-indigo-400 text-white shadow-lg' :
                     'bg-gradient-to-br from-teal-600 to-teal-400 text-white shadow-lg')
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <motion.div 
                className={`p-2 rounded-md transition-all duration-300 ${
                  currentStep === index 
                    ? 'bg-white bg-opacity-20' 
                    : (step.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white' :
                       step.color === 'green' ? 'bg-gradient-to-br from-green-600 to-green-400 text-white' :
                       step.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-purple-400 text-white' :
                       step.color === 'orange' ? 'bg-gradient-to-br from-orange-600 to-orange-400 text-white' :
                       step.color === 'indigo' ? 'bg-gradient-to-br from-indigo-600 to-indigo-400 text-white' :
                       'bg-gradient-to-br from-teal-600 to-teal-400 text-white')
                }`}
                animate={{
                  scale: currentStep === index ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <step.icon className={`${currentStep === index ? 'text-lg' : 'text-base'} transition-all duration-300`} />
              </motion.div>
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium transition-all duration-300 leading-tight ${
                  currentStep === index ? 'font-semibold' : ''
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 transition-all duration-300 ${
                  currentStep === index 
                    ? 'text-white text-opacity-80 font-medium' 
                    : isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {index + 1}/6
                </div>
              </div>
              
              {/* Active indicator - safely positioned */}
              {currentStep === index && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-md"
                >
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorkflowDiagram
