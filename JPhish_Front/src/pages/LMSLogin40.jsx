import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowRight } from 'react-icons/fa';

const LMSLogin40 = () => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateEmail(email)) {
      // Save email to localStorage for use in other LMS pages
      localStorage.setItem('lmsUserEmail40', email);
      navigate('/lms-modules40');
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f0f4f8] to-[#d1e0eb]">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Security Training" 
              className="h-16"
              onError={(e) => e.target.src = 'https://via.placeholder.com/150x60?text=Security+Training'}
            />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mt-4">
            Extended Security Awareness Training
          </h1>
          <p className="text-indigo-100 text-center mt-2">
            5 Module Advanced Program - Learn how to protect yourself and your organization
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-[#000080] mb-6">
            Please sign in with your email to continue
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                Your Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsValid(true);
                  }}
                  className={`pl-10 block w-full text-black border ${!isValid ? 'border-red-500' : 'border-gray-300'} 
                    rounded-md shadow-sm py-3 px-4 placeholder-gray-400 focus:outline-none 
                    focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="name@company.com"
                  required
                />
              </div>
              {!isValid && (
                <p className="mt-2 text-sm text-red-600">
                  Please enter a valid email address
                </p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent 
                  rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 
                  hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 font-medium"
              >
                <span>Continue to Advanced Training</span>
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having trouble? Contact your IT department
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSLogin40;