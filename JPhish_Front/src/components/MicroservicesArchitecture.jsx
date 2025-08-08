import React from 'react'
import { motion } from 'framer-motion'
import { 
  FaBullseye, 
  FaEnvelope, 
  FaNetworkWired, 
  FaGraduationCap, 
  FaUserFriends, 
  FaChartLine,
  FaDatabase,
  FaShieldAlt
} from 'react-icons/fa'

const MicroservicesArchitecture = ({ isDark }) => {
  const services = [
    { 
      name: 'Campaign Service', 
      icon: FaBullseye, 
      color: 'blue',
      position: { x: 20, y: 20 },
      description: 'Campaign management and orchestration'
    },
    { 
      name: 'JPhish SMTP', 
      icon: FaEnvelope, 
      color: 'green',
      position: { x: 70, y: 20 },
      description: 'Email delivery and tracking'
    },
    { 
      name: 'Dashboard', 
      icon: FaNetworkWired, 
      color: 'purple',
      position: { x: 20, y: 70 },
      description: 'Response capture and analytics'
    },
    { 
      name: 'LMS Assessment', 
      icon: FaGraduationCap, 
      color: 'orange',
      position: { x: 70, y: 70 },
      description: 'Training and assessment delivery'
    }
  ]

  const connections = [
    { from: 0, to: 1, label: 'Send Campaign' },
    { from: 1, to: 2, label: 'Track Clicks' },
    { from: 2, to: 3, label: 'Trigger Training' },
    { from: 3, to: 0, label: 'Report Results' }
  ]

  return (
    <div className={`relative p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} h-96`}>
      <div className="absolute inset-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Connection lines */}
          {connections.map((connection, index) => {
            const fromService = services[connection.from]
            const toService = services[connection.to]
            return (
              <motion.g key={index}>
                <motion.line
                  x1={fromService.position.x + 5}
                  y1={fromService.position.y + 5}
                  x2={toService.position.x + 5}
                  y2={toService.position.y + 5}
                  stroke={isDark ? '#4b5563' : '#d1d5db'}
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: index * 0.5, repeat: Infinity, repeatType: 'loop' }}
                />
                <motion.text
                  x={(fromService.position.x + toService.position.x) / 2 + 5}
                  y={(fromService.position.y + toService.position.y) / 2 + 3}
                  fontSize="2"
                  fill={isDark ? '#9ca3af' : '#6b7280'}
                  textAnchor="middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.3 }}
                >
                  {connection.label}
                </motion.text>
              </motion.g>
            )
          })}
        </svg>

        {/* Service nodes */}
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${service.position.x}%`, 
              top: `${service.position.y}%` 
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`relative group p-4 rounded-xl text-white cursor-pointer shadow-lg w-24 h-24 flex flex-col items-center justify-center ${
                service.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-400' :
                service.color === 'green' ? 'bg-gradient-to-br from-green-600 to-green-400' :
                service.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-purple-400' :
                'bg-gradient-to-br from-orange-600 to-orange-400'
              }`}
            >
              <service.icon className="text-xl mb-1" />
              <div className="text-xs font-semibold text-center leading-tight">
                {service.name}
              </div>
              
              {/* Tooltip */}
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-black'} text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}>
                {service.description}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isDark ? 'border-t-gray-900' : 'border-t-black'}`}></div>
              </div>
              
              {/* Pulse animation */}
              <motion.div
                className={`absolute inset-0 rounded-xl opacity-30 ${
                  service.color === 'blue' ? 'bg-gradient-to-br from-blue-400 to-blue-300' :
                  service.color === 'green' ? 'bg-gradient-to-br from-green-400 to-green-300' :
                  service.color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-purple-300' :
                  'bg-gradient-to-br from-orange-400 to-orange-300'
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              />
            </motion.div>
          </motion.div>
        ))}

        {/* Central hub */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className={`p-4 rounded-full w-20 h-20 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'} border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          >
            <FaDatabase className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </motion.div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 right-2">
        <div className={`flex items-center space-x-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaShieldAlt className="text-xl text-blue-400" />
          <span>Secure Microservices</span>
        </div>
      </div>
    </div>
  )
}

export default MicroservicesArchitecture
