import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight, FaChevronLeft, FaCheck, FaExclamationTriangle, FaLock, FaLockOpen } from 'react-icons/fa';
import slide1 from '../assets/ppt-slides/slide-1.png';
import slide2 from '../assets/ppt-slides/slide-2.png';
import slide3 from '../assets/ppt-slides/slide-3.png';
import slide4 from '../assets/ppt-slides/slide-4.png';
import slide5 from '../assets/ppt-slides/slide-5.png';


const LMSModule = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [activeModule, setActiveModule] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState({});
  const [questionFeedback, setQuestionFeedback] = useState({});

  // Check for user email on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('lmsUserEmail');
    if (!storedEmail) {
      // Redirect to login if no email found
      navigate('/lms-login');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  // Module content data
  const modules = [
    {
      id: 0,
      title: "Phishing Recognition Basics",
      description: "Learn to identify common phishing techniques",
      isPptModule: true,
      slides: [
        {
          id: "slide1",
          imageUrl: slide1,
          caption: "Introduction to Phishing" // Optional caption
        },
        {
          id: "slide2",
          imageUrl: slide2,
          caption: "Common Phishing Indicators"
        },
        {
          id: "slide3",
          imageUrl: slide3,
          caption: "Email-based Phishing"
        },
        {
          id: "slide4",
          imageUrl: slide4,
          caption: "Social Media Phishing"
        },
        {
          id: "slide5",
          imageUrl: slide5,
          caption: "Current Phishing Trends"
        }
      ],
      questions: [
        {
          id: "m1q1",
          question: "What is phishing primarily designed to obtain?",
          options: [
            "Computer hardware information",
            "Personal or sensitive information",
            "Software version numbers",
            "System performance metrics"
          ],
          correctAnswer: 1
        },
        {
          id: "m1q2",
          question: "Which of these is a common indicator of a phishing email?",
          options: [
            "Contains your full name",
            "Comes from a company you do business with",
            "Creates a sense of urgency or fear",
            "Has a company logo"
          ],
          correctAnswer: 2
        },
        {
          id: "m1q3",
          question: "When you receive a suspicious email, what should you do first?",
          options: [
            "Reply asking if it's legitimate",
            "Call the sender using the phone number in the email",
            "Don't click links or download attachments",
            "Forward it to everyone to warn them"
          ],
          correctAnswer: 2
        },
        {
          id: "m1q4",
          question: "What technology do legitimate websites use to protect your information?",
          options: [
            "HTTP",
            "HTML",
            "HTTPS",
            "XML"
          ],
          correctAnswer: 2
        },
        {
          id: "m1q5",
          question: "Which of these is a sign of a potential phishing website?",
          options: [
            "The URL begins with https://",
            "The domain matches the company's official name",
            "The site has a lock icon in the address bar",
            "The URL contains misspellings or additional words"
          ],
          correctAnswer: 3
        }
      ]
    },
    {
      id: 1,
      title: "Email Security Best Practices",
      description: "Techniques to protect yourself from email-based threats",
      slides: [
        {
          title: "Email Authentication",
          content: "Learn about email security features like SPF, DKIM, and DMARC that help verify sender identity."
        },
        {
          title: "Identifying Suspicious Links",
          content: "Always hover over links before clicking to preview the actual URL. Look for misspellings and unusual domains."
        },
        {
          title: "Safe Attachment Handling",
          content: "Never open attachments from unknown senders. Be especially cautious of .zip, .exe, and macro-enabled Office files."
        },
        {
          title: "Email Filtering and Management",
          content: "Configure spam filters properly and regularly check spam folders for false positives."
        },
        {
          title: "Reporting Suspicious Emails",
          content: "Know your organization's protocol for reporting suspicious emails to IT security teams."
        }
      ],
      questions: [
        {
          id: "m2q1",
          question: "What should you do before clicking on a link in an email?",
          options: [
            "Click it immediately if it looks important",
            "Hover over it to see the actual URL destination",
            "Always trust links from known senders",
            "Download any attachments first"
          ],
          correctAnswer: 1
        },
        {
          id: "m2q2",
          question: "Which file attachment type is generally considered the most dangerous?",
          options: [
            ".jpg files",
            ".pdf files",
            ".exe files",
            ".txt files"
          ],
          correctAnswer: 2
        },
        {
          id: "m2q3",
          question: "What does HTTPS in a URL indicate?",
          options: [
            "The site is a government website",
            "The site uses encryption for security",
            "The site is hosted in a specific country",
            "The site is a social media platform"
          ],
          correctAnswer: 1
        },
        {
          id: "m2q4",
          question: "Which email security protocol helps verify sender identity?",
          options: [
            "SMTP",
            "HTTP",
            "DKIM",
            "FTP"
          ],
          correctAnswer: 2
        },
        {
          id: "m2q5",
          question: "What should you do if you receive a suspicious email at work?",
          options: [
            "Delete it immediately",
            "Forward it to colleagues to ask their opinion",
            "Report it according to your company's security policy",
            "Reply to ask if it's legitimate"
          ],
          correctAnswer: 2
        }
      ]
    },
    {
      id: 2,
      title: "Social Engineering Defense",
      description: "Protecting against manipulation techniques",
      slides: [
        {
          title: "What is Social Engineering?",
          content: "Social engineering uses psychological manipulation to trick users into making security mistakes or giving away sensitive information."
        },
        {
          title: "Common Social Engineering Tactics",
          content: "These include pretexting, baiting, quid pro quo attacks, and tailgating in physical environments."
        },
        {
          title: "Vishing (Voice Phishing) Awareness",
          content: "Be alert to phone calls requesting personal information or immediate action, especially those creating a sense of urgency."
        },
        {
          title: "Impersonation Detection",
          content: "Verify identities through official channels before providing any sensitive information, even if the request appears legitimate."
        },
        {
          title: "Building a Security Culture",
          content: "Encourage skepticism and reporting of suspicious activities as part of your organization's security mindset."
        }
      ],
      questions: [
        {
          id: "m3q1",
          question: "What is 'pretexting' in social engineering?",
          options: [
            "Creating fake identification documents",
            "Creating a fabricated scenario to obtain information",
            "Pretending to be a technical support agent",
            "Setting up fake websites"
          ],
          correctAnswer: 1
        },
        {
          id: "m3q2",
          question: "What is 'tailgating' in the context of physical security?",
          options: [
            "Following too closely in traffic",
            "Following an authorized person through a secure door without permission",
            "Installing unauthorized software on computers",
            "Using company vehicles without authorization"
          ],
          correctAnswer: 1
        },
        {
          id: "m3q3",
          question: "Which of the following is a sign of a vishing (voice phishing) attempt?",
          options: [
            "Caller knows your name and basic information",
            "Call comes from a local area code",
            "Caller creates urgency and requests immediate action",
            "Caller identifies themselves as from a company you recognize"
          ],
          correctAnswer: 2
        },
        {
          id: "m3q4",
          question: "What is a key defense against social engineering attacks?",
          options: [
            "Installing antivirus software",
            "Using a VPN",
            "Verifying identities through official channels",
            "Changing passwords frequently"
          ],
          correctAnswer: 2
        },
        {
          id: "m3q5",
          question: "Which approach is recommended when you receive a suspicious request for sensitive information?",
          options: [
            "Provide the information if the request seems urgent",
            "Ask your coworkers if they received the same request",
            "Contact the requester through a verified channel to confirm",
            "Provide only partial information as a compromise"
          ],
          correctAnswer: 2
        }
      ]
    }
  ];

  // Handle module selection
  const selectModule = (moduleId) => {
    // Only allow selecting a module if previous ones are completed
    // or it's the first module
    if (moduleId === 0 || completedModules.length >= moduleId) {
      setActiveModule(moduleId);
      setActiveSlide(0);
      setShowQuestions(false);
    }
  };

  // Navigate through slides
  const navigateSlides = (direction) => {
    const totalSlides = modules[activeModule].slides.length;
    
    if (direction === 'next') {
      if (activeSlide < totalSlides - 1) {
        setActiveSlide(activeSlide + 1);
      } else {
        // Show questions when reaching the end of slides
        setShowQuestions(true);
      }
    } else {
      if (activeSlide > 0) {
        setActiveSlide(activeSlide - 1);
      }
      if (showQuestions) {
        setShowQuestions(false);
        setActiveSlide(modules[activeModule].slides.length - 1);
      }
    }
  };

  // Handle question answer selection
  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
    
    const question = modules[activeModule].questions.find(q => q.id === questionId);
    const isCorrect = optionIndex === question.correctAnswer;
    
    setQuestionFeedback({
      ...questionFeedback,
      [questionId]: isCorrect
    });
  };

  // Check if all questions for the active module are answered correctly
  const checkModuleCompletion = () => {
    const moduleQuestions = modules[activeModule].questions;
    const answeredCorrectly = moduleQuestions.filter(q => 
      questionFeedback[q.id] === true
    ).length;
    
    if (answeredCorrectly === moduleQuestions.length) {
      if (!completedModules.includes(activeModule)) {
        setCompletedModules([...completedModules, activeModule]);
      }
      
      // If all modules are completed, enable the assessment button
      if (completedModules.length === 2 && activeModule === 2) {
        return true;
      }
    }
    return false;
  };

  // Navigate to final assessment
  const startAssessment = () => {
    navigate('/lms-assessment');
  };

  // Determine if a module is available based on completion of previous modules
  const isModuleAvailable = (moduleId) => {
    if (moduleId === 0) return true;
    return completedModules.length >= moduleId;
  };

  // Check if the module is complete after rendering
  useEffect(() => {
    if (showQuestions) {
      checkModuleCompletion();
    }
  }, [questionFeedback, showQuestions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-[#d1e0eb]">
      <div className="container mx-auto pt-6 px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
            <h1 className="text-2xl font-bold text-white">Security Awareness Training</h1>
            <p className="text-indigo-100 mt-1">
              Welcome, {email}! Complete all modules to unlock the final assessment.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row">
            {/* Left sidebar - Module navigation */}
            <div className="md:w-1/4 border-r border-gray-200">
              <div className="p-4">
                <h2 className="text-lg font-semibold text-[#000080] mb-4">Training Modules</h2>
                <ul className="space-y-2">
                  {modules.map((module) => (
                    <li key={module.id}>
                      <button
                        onClick={() => selectModule(module.id)}
                        className={`
                          w-full text-left px-4 py-3 rounded-lg flex items-center justify-between
                          ${activeModule === module.id 
                            ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500' 
                            : 'hover:bg-gray-50 text-gray-700'}
                          ${!isModuleAvailable(module.id) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        disabled={!isModuleAvailable(module.id)}
                      >
                        <div className="flex items-center">
                          <span className="font-medium">{module.title}</span>
                        </div>
                        <div>
                          {completedModules.includes(module.id) ? (
                            <FaCheck className="text-green-500" />
                          ) : isModuleAvailable(module.id) ? (
                            <FaLockOpen className="text-gray-400" />
                          ) : (
                            <FaLock className="text-gray-400" />
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                
                {completedModules.length === 3 && (
                  <div className="mt-6">
                    <button
                      onClick={startAssessment}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                      <FaCheck className="mr-2" />
                      Take Final Assessment
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right content area - Slides and questions */}
            <div className="md:w-3/4 p-6">
              {!showQuestions ? (
                // Show slides
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-[#000080]">
                      {modules[activeModule].isPptModule 
                        ? modules[activeModule].slides[activeSlide].caption 
                        : modules[activeModule].slides[activeSlide].title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        Slide {activeSlide + 1} of {modules[activeModule].slides.length}
                      </span>
                    </div>
                    
                    <div className="border-l-4 border-indigo-500 pl-4 py-2 mb-8">
                      <p className="text-gray-700 leading-relaxed">
                        {modules[activeModule].slides[activeSlide].content}
                      </p>
                    </div>
                    {modules[activeModule].isPptModule ? (
                        // Display PPT slide as image
                        <div className="flex flex-col items-center mb-8">
                          <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={modules[activeModule].slides[activeSlide].imageUrl} 
                              alt={`Slide ${activeSlide + 1}`}
                              className="w-full h-auto"
                            />
                          </div>
                          <div className="mt-4 text-center text-gray-600">
                            {modules[activeModule].slides[activeSlide].caption}
                          </div>
                        </div>
                      ) : (
                        // Display text-based slide (existing functionality)
                        <div className="border-l-4 border-indigo-500 pl-4 py-2 mb-8">
                          <p className="text-gray-700 leading-relaxed">
                            {modules[activeModule].slides[activeSlide].content}
                          </p>
                        </div>
                    )}

                    {/* Slide navigation */}
                    <div className="flex justify-between pt-4 mt-8 border-t border-gray-200">
                      <button
                        onClick={() => navigateSlides('prev')}
                        className={`flex items-center ${activeSlide === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}
                        disabled={activeSlide === 0}
                      >
                        <FaChevronLeft className="mr-2" />
                        Previous Slide
                      </button>
                      <button
                        onClick={() => navigateSlides('next')}
                        className="flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        {activeSlide < modules[activeModule].slides.length - 1 ? 'Next Slide' : 'Practice Questions'}
                        <FaChevronRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Show questions
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#000080] mb-6">
                      Practice Questions - {modules[activeModule].title}
                    </h3>
                    
                    <div className="space-y-8">
                      {modules[activeModule].questions.map((question, qIndex) => (
                        <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium text-gray-800 mb-3">
                            {qIndex + 1}. {question.question}
                          </p>
                          <div className="space-y-2 ml-6">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex}>
                                <label className={`
                                  flex items-start p-2 rounded-md hover:bg-gray-100 cursor-pointer
                                  ${answers[question.id] === oIndex && questionFeedback[question.id] === true
                                    ? 'bg-green-50 border border-green-200'
                                    : answers[question.id] === oIndex && questionFeedback[question.id] === false
                                      ? 'bg-red-50 border border-red-200'
                                      : ''
                                  }
                                `}>
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={oIndex}
                                    checked={answers[question.id] === oIndex}
                                    onChange={() => handleAnswerSelect(question.id, oIndex)}
                                    className="mt-1"
                                  />
                                  <span className="ml-2 text-gray-700">{option}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                          
                          {/* Show feedback after answer selection */}
                          {questionFeedback[question.id] !== undefined && (
                            <div className={`
                              mt-4 p-3 rounded-md
                              ${questionFeedback[question.id] ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
                            `}>
                              {questionFeedback[question.id] ? (
                                <div className="flex items-center text-green-700">
                                  <FaCheck className="mr-2" />
                                  <span>Correct! Well done.</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-700">
                                  <FaExclamationTriangle className="mr-2" />
                                  <span>
                                    Incorrect. The correct answer is: {question.options[question.correctAnswer]}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between pt-6 mt-8 border-t border-gray-200">
                      <button
                        onClick={() => navigateSlides('prev')}
                        className="flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <FaChevronLeft className="mr-2" />
                        Back to Slides
                      </button>
                      
                      {checkModuleCompletion() && activeModule < 2 ? (
                        <button
                          onClick={() => {
                            setActiveModule(activeModule + 1);
                            setActiveSlide(0);
                            setShowQuestions(false);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                        >
                          Next Module
                          <FaChevronRight className="ml-2" />
                        </button>
                      ) : checkModuleCompletion() && activeModule === 2 ? (
                        <button
                          onClick={startAssessment}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center"
                        >
                          Take Final Assessment
                          <FaChevronRight className="ml-2" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LMSModule;