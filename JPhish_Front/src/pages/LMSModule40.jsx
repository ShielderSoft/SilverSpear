import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaArrowLeft, FaCheck, FaTimes, FaLock, FaUnlock, FaGraduationCap } from 'react-icons/fa';

const LMSModule40 = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [moduleScore, setModuleScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Load user email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('lmsUserEmail40');
    if (!storedEmail) {
      navigate('/lms-login40');
    } else {
      setEmail(storedEmail);
    }
    
    // Load completed modules from localStorage if available
    const completed = JSON.parse(localStorage.getItem('completedModules40') || '[]');
    setCompletedModules(completed);
  }, [navigate]);

  // Save progress when modules are completed
  useEffect(() => {
    if (completedModules.length > 0) {
      localStorage.setItem('completedModules40', JSON.stringify(completedModules));
    }
  }, [completedModules]);

  const handleModuleChange = (index) => {
    if (index === activeModule) return;
    
    // Only allow accessing completed modules or the next unlocked one
    if (completedModules.includes(index) || completedModules.length === index) {
      setActiveModule(index);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setModuleScore(0);
      setShowResults(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const currentModuleQuestions = modules[activeModule].questions;
    if (answerIndex === currentModuleQuestions[currentQuestion].correctAnswer) {
      setModuleScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    const currentModuleQuestions = modules[activeModule].questions;
    
    if (currentQuestion < currentModuleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Show module results if all questions are answered
      setShowResults(true);
    }
  };

  const handleCompleteModule = () => {
    // Mark this module as complete if not already
    if (!completedModules.includes(activeModule)) {
      setCompletedModules([...completedModules, activeModule]);
    }
    
    // Move to next module or assessment
    if (activeModule < modules.length - 1) {
      setActiveModule(activeModule + 1);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setModuleScore(0);
      setShowResults(false);
    } else {
      // All modules complete, navigate to assessment
      navigate('/lms-assessment40');
    }
  };

  // Module 1: Advanced Email Security content
  const modules = [
    {
      title: "Advanced Email Security",
      description: "Learn sophisticated techniques to identify and protect against advanced phishing threats in emails.",
      content: (
        <div className="space-y-4">
          <p>
            Email remains one of the primary vectors for cyber attacks. In this module, you'll learn advanced techniques 
            to identify sophisticated phishing attempts, business email compromise (BEC) attacks, and how to protect 
            sensitive information when communicating through email.
          </p>
          
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="font-bold text-indigo-700 mb-2">Did you know?</h3>
            <p className="text-indigo-900">
              Over 90% of successful cyber attacks start with a phishing email, and advanced attacks can now bypass 
              traditional security measures by using AI-generated content and sophisticated impersonation techniques.
            </p>
          </div>
          
          <h3 className="font-bold text-xl mt-4">Key Learning Objectives:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Identify advanced email phishing indicators beyond obvious red flags</li>
            <li>Recognize business email compromise (BEC) attacks that target executives</li>
            <li>Understand email header analysis for threat detection</li>
            <li>Implement proper email authentication practices</li>
            <li>Safeguard sensitive information in email communications</li>
            <li>Use email security tools and settings effectively</li>
            <li>Report suspicious emails through proper channels</li>
            <li>Respond appropriately when you suspect you've been targeted</li>
          </ul>
          
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500 mt-4">
            <h3 className="font-bold text-yellow-700 mb-2">Warning:</h3>
            <p className="text-yellow-900">
              Modern phishing emails often use real company logos, accurate employee information from social media, 
              and may reference current events or ongoing projects. The level of personalization makes these attacks 
              particularly dangerous.
            </p>
          </div>
          
          <p className="mt-4">
            Complete the following questions to test your knowledge on advanced email security concepts. You need to answer 
            all questions correctly to proceed to the next module.
          </p>
        </div>
      ),
      questions: [
        {
          question: "Which of the following is NOT typically a sign of a sophisticated phishing email?",
          options: [
            "Perfect grammar and professional formatting",
            "Legitimate-looking company logos and branding",
            "References to real company events or projects",
            "Requests for sensitive information with urgency"
          ],
          correctAnswer: 3,
          explanation: "While sophisticated phishing emails often have perfect grammar, professional formatting, and real company references, legitimate organizations will never request sensitive information with urgency. This remains a consistent red flag even in advanced attacks."
        },
        {
          question: "What is 'spear phishing'?",
          options: [
            "Using AI to generate phishing emails at scale",
            "Highly targeted phishing attacks customized for specific individuals",
            "Phishing that specifically targets financial information",
            "Attacks that use URL shorteners to hide malicious links"
          ],
          correctAnswer: 1,
          explanation: "Spear phishing refers to highly targeted phishing attacks that are customized for specific individuals, often using information gathered from social media and other sources to create convincing, personalized messages."
        },
        {
          question: "In a Business Email Compromise (BEC) attack, attackers typically:",
          options: [
            "Send mass emails with malware attachments",
            "Impersonate executives to request fund transfers or sensitive information",
            "Use public Wi-Fi networks to intercept email communications",
            "Install keyloggers through embedded images in emails"
          ],
          correctAnswer: 1,
          explanation: "Business Email Compromise (BEC) attacks typically involve impersonating executives or trusted business partners to request fund transfers, W-2 information, or other sensitive data. These attacks rely on authority and trust rather than technical exploits."
        },
        {
          question: "Which email header field can help you verify if an email actually came from the claimed sender?",
          options: [
            "Subject line",
            "CC field",
            "DKIM signature",
            "Email priority flag"
          ],
          correctAnswer: 2,
          explanation: "DKIM (DomainKeys Identified Mail) signatures in email headers help verify that an email actually came from the claimed sender domain and hasn't been altered in transit. This is one of several authentication mechanisms that can help identify spoofed emails."
        },
        {
          question: "What should you do if you receive an email from your CEO asking you to urgently purchase gift cards for clients?",
          options: [
            "Reply asking for more details about which clients need gifts",
            "Purchase the gift cards immediately to show initiative",
            "Verify the request through a different communication channel",
            "Forward the email to all team members to see if others received it"
          ],
          correctAnswer: 2,
          explanation: "When receiving unusual requests, especially those involving money or sensitive information, you should always verify through a different communication channel (phone call, in-person conversation, or through officially established verification procedures)."
        },
        {
          question: "Which of the following is the most secure way to verify a suspicious email that appears to come from a colleague?",
          options: [
            "Reply to the email directly to ask if they sent it",
            "Check if the email address exactly matches your colleague's address",
            "Contact your colleague through a separate, verified channel",
            "Check if the email contains your company's official disclaimer"
          ],
          correctAnswer: 2,
          explanation: "Contacting your colleague through a separate, verified channel (like a phone call or in-person conversation) is the most secure way to verify a suspicious email. Replying directly could connect you with the attacker, and checking email addresses or disclaimers may not be sufficient as these can be spoofed."
        },
        {
          question: "What is 'pharming'?",
          options: [
            "Mass-sending phishing emails to thousands of targets at once",
            "Redirecting users to fake websites even when they type the correct URL",
            "Using social media to gather information for targeted phishing",
            "Creating fake mobile apps that mimic legitimate banking apps"
          ],
          correctAnswer: 1,
          explanation: "Pharming is a sophisticated attack that redirects users to fake websites even when they correctly type a legitimate URL into their browser. This is done by exploiting vulnerabilities in DNS servers or local host files, making it particularly dangerous as it bypasses the user's vigilance in checking URLs."
        },
        {
          question: "What distinguishes an advanced persistent threat (APT) from regular phishing?",
          options: [
            "APTs only target government organizations",
            "APTs use long-term, stealthy approaches to maintain access to systems",
            "APTs always involve ransomware deployment",
            "APTs only occur through email vectors"
          ],
          correctAnswer: 1,
          explanation: "Advanced Persistent Threats (APTs) are characterized by their long-term, stealthy approaches to maintain unauthorized access to systems. Unlike typical phishing which may be opportunistic, APTs involve careful planning, persistence over time, and are often state-sponsored or conducted by sophisticated criminal groups with specific targets."
        }
      ]
    },
    // Additional modules will be added later
  ];

  // Render current question or results
  const renderContent = () => {
    const currentModuleData = modules[activeModule];
    
    // Show module content initially
    if (currentQuestion === 0 && !isAnswered && !showResults) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            Module {activeModule + 1}: {currentModuleData.title}
          </h2>
          <p className="text-gray-600 mb-6">{currentModuleData.description}</p>
          
          <div className="prose max-w-none text-gray-800">
            {currentModuleData.content}
          </div>
          
          <button
            onClick={() => setIsAnswered(true)}
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            Start Module Questions <FaArrowRight className="ml-2" />
          </button>
        </div>
      );
    }
    
    // Show results after all questions answered
    if (showResults) {
      const totalQuestions = currentModuleData.questions.length;
      const passThreshold = totalQuestions * 0.7; // 70% to pass
      const passed = moduleScore >= passThreshold;
      
      return (
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Module {activeModule + 1} Results</h2>
          
          <div className={`text-4xl font-bold mb-6 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {moduleScore} / {totalQuestions}
          </div>
          
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`} 
                style={{ width: `${(moduleScore / totalQuestions) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-gray-600">
              You need {Math.ceil(passThreshold)} correct answers to pass this module
            </p>
          </div>
          
          {passed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-green-800 font-bold flex items-center">
                <FaCheck className="mr-2" /> Module Complete!
              </h3>
              <p className="text-green-700">
                Congratulations! You've successfully completed this module.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-bold flex items-center">
                <FaTimes className="mr-2" /> Module Incomplete
              </h3>
              <p className="text-red-700">
                You need to score at least 70% to complete this module.
              </p>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setModuleScore(0);
                setShowResults(false);
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Retry Module
            </button>
            
            {passed && (
              <button
                onClick={handleCompleteModule}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
              >
                {activeModule < modules.length - 1 ? 'Next Module' : 'Go to Assessment'} 
                <FaArrowRight className="ml-2" />
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // Show questions
    const questionData = currentModuleData.questions[currentQuestion];
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {currentModuleData.questions.length}
          </div>
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
            Module {activeModule + 1}
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-6 text-gray-800">{questionData.question}</h2>
        
        <div className="space-y-3 mb-6">
          {questionData.options.map((option, index) => (
            <div key={index} className="flex text-black items-center">
              <button
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={`w-full text-left p-3 border rounded-lg ${
                  selectedAnswer === index 
                    ? isAnswered
                      ? index === questionData.correctAnswer
                        ? 'bg-green-50 border-green-500' 
                        : 'bg-red-50 border-red-500'
                      : 'bg-indigo-50 border-indigo-500'
                    : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
                } transition-colors`}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                    selectedAnswer === index
                      ? isAnswered
                        ? index === questionData.correctAnswer
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className={selectedAnswer === index ? 'font-medium' : ''}>
                    {option}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
        
        {isAnswered && (
          <div className={`p-4 rounded-lg mb-6 ${
            selectedAnswer === questionData.correctAnswer 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className={`font-bold mb-2 ${
              selectedAnswer === questionData.correctAnswer 
                ? 'text-green-800' 
                : 'text-red-800'
            }`}>
              {selectedAnswer === questionData.correctAnswer 
                ? 'Correct!' 
                : 'Incorrect'}
            </h3>
            <p className="text-gray-700">{questionData.explanation}</p>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          {currentQuestion > 0 || isAnswered ? (
            <button
              onClick={() => {
                if (isAnswered) {
                  handleNextQuestion();
                } else {
                  setCurrentQuestion(currentQuestion - 1);
                }
              }}
              className="bg-gray-600  px-6 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
            >
              {isAnswered ? (
                <>
                  Next Question <FaArrowRight className="ml-2" />
                </>
              ) : (
                <>
                  <FaArrowLeft className="mr-2" /> Previous
                </>
              )}
            </button>
          ) : (
            <div></div> // Empty div for flex spacing
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-[#d1e0eb] p-6">
      <div className="container mx-auto">
        <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-indigo-900">Advanced Security Training</h1>
            <div className="text-gray-600 mt-2 md:mt-0">
              Logged in as: <span className="font-medium">{email}</span>
            </div>
          </div>
          
          {/* Module Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {modules.map((module, index) => (
              <button
                key={index}
                onClick={() => handleModuleChange(index)}
                disabled={!completedModules.includes(index) && completedModules.length !== index}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeModule === index 
                    ? 'bg-indigo-600 text-white'
                    : completedModules.includes(index)
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : completedModules.length === index
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {completedModules.includes(index) ? (
                  <FaCheck className="mr-2" />
                ) : completedModules.length === index ? (
                  <FaUnlock className="mr-2" />
                ) : (
                  <FaLock className="mr-2" />
                )}
                Module {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => {
                if (completedModules.length === modules.length) {
                  navigate('/lms-assessment40');
                }
              }}
              disabled={completedModules.length !== modules.length}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                completedModules.length === modules.length
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaGraduationCap className="mr-2" />
              Final Assessment
            </button>
          </div>
        </div>
        
        {/* Current Module Content */}
        <div className="mb-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LMSModule40;