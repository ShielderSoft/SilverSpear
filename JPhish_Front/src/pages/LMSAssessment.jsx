import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

const LMSAssessment = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [answerTimes, setAnswerTimes] = useState([]);
  const [correctResponses, setCorrectResponses] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);

  // Check for user email and prepare questions on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('lmsUserEmail');
    if (!storedEmail) {
      navigate('/lms-login');
      return;
    }
    setEmail(storedEmail);
    prepareQuestions();

    return () => {
      isMounted.current = false;
    };
  }, [navigate]);

  // Set start time for first question
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex === 0) {
      setStartTime(new Date());
    }
  }, [questions, currentQuestionIndex]);

  // Prepare 30 questions from all modules
  const prepareQuestions = () => {
    // This would typically come from your API
    // For this example, we'll generate mock questions
    
    const moduleQuestions = [
      // Module 1: Phishing Recognition Basics - 10 questions
      {
        question: "What is the primary goal of phishing attacks?",
        options: [
          "To install software updates",
          "To steal sensitive information or credentials",
          "To improve system performance",
          "To conduct system maintenance"
        ],
        correctAnswer: 1
      },
      {
        question: "Which of these is NOT typically a sign of a phishing email?",
        options: [
          "Urgent calls to action",
          "Requests for personal information",
          "Professional design with proper grammar",
          "Mismatched or suspicious URLs"
        ],
        correctAnswer: 2
      },
      {
        question: "What should you check before clicking on a link in an email?",
        options: [
          "The font size of the email",
          "The actual URL destination by hovering over it",
          "The time the email was sent",
          "The email client being used"
        ],
        correctAnswer: 1
      },
      {
        question: "Which type of phishing targets specific high-profile individuals?",
        options: [
          "Vishing",
          "Smishing",
          "Spear phishing",
          "Whaling"
        ],
        correctAnswer: 2
      },
      {
        question: "What does 'pharming' refer to in the context of cyber attacks?",
        options: [
          "Sending farming-related spam emails",
          "Redirecting users to fraudulent websites",
          "Harvesting email addresses",
          "Using agricultural terms in phishing"
        ],
        correctAnswer: 1
      },
      {
        question: "Which of the following file types is most commonly used for malware distribution?",
        options: [
          ".txt files",
          ".jpg files",
          ".exe files",
          ".html files"
        ],
        correctAnswer: 2
      },
      {
        question: "What is a 'business email compromise' attack?",
        options: [
          "When a business email server crashes",
          "When attackers impersonate executives to request wire transfers",
          "When businesses send too many marketing emails",
          "When business emails are flagged as spam"
        ],
        correctAnswer: 1
      },
      {
        question: "What information should you NEVER provide in response to an email request?",
        options: [
          "Your name",
          "Your job title",
          "Your password",
          "Your work email address"
        ],
        correctAnswer: 2
      },
      {
        question: "What technology helps websites prove they are legitimate?",
        options: [
          "JavaScript",
          "SSL/TLS certificates",
          "Flash Player",
          "Web cookies"
        ],
        correctAnswer: 1
      },
      {
        question: "What should you do if you suspect you've fallen for a phishing attack?",
        options: [
          "Delete the email and ignore it",
          "Reply to the sender asking for clarification",
          "Immediately report it to IT security and change passwords",
          "Forward the email to colleagues for their opinion"
        ],
        correctAnswer: 2
      },
      
      // Module 2: Email Security Best Practices - 10 questions
      {
        question: "What does DMARC help prevent?",
        options: [
          "Data corruption",
          "Email spoofing and domain impersonation",
          "Password cracking",
          "Network outages"
        ],
        correctAnswer: 1
      },
      {
        question: "What should you check in the sender's email address?",
        options: [
          "The profile picture",
          "The domain matches the actual organization",
          "The time zone",
          "The email signature"
        ],
        correctAnswer: 1
      },
      {
        question: "Which of these is a secure email practice?",
        options: [
          "Opening all attachments to check them",
          "Using the same password for all email accounts",
          "Enabling two-factor authentication",
          "Sharing login credentials with colleagues"
        ],
        correctAnswer: 2
      },
      {
        question: "What does S/MIME provide for emails?",
        options: [
          "Faster delivery",
          "Enhanced formatting options",
          "Digital signatures and encryption",
          "Automatic translations"
        ],
        correctAnswer: 2
      },
      {
        question: "Which email header information is most easily spoofed?",
        options: [
          "The 'Received' headers",
          "The 'From' display name",
          "The message ID",
          "The date stamp"
        ],
        correctAnswer: 1
      },
      {
        question: "What is a recommended way to share sensitive documents?",
        options: [
          "Regular email attachment",
          "Password-protected files through secure channels",
          "Using public cloud storage links",
          "Posting them on company websites"
        ],
        correctAnswer: 1
      },
      {
        question: "What should you do with suspicious email attachments?",
        options: [
          "Open them in safe mode",
          "Forward them to IT",
          "Do not download or open them",
          "Rename them before opening"
        ],
        correctAnswer: 2
      },
      {
        question: "Which of these is important when setting email filters?",
        options: [
          "Blocking all external emails",
          "Regularly reviewing spam folder for false positives",
          "Automatically deleting all filtered emails",
          "Sharing filter settings with colleagues"
        ],
        correctAnswer: 1
      },
      {
        question: "What information should email encryption protect?",
        options: [
          "Only financial information",
          "Only customer data",
          "All sensitive and personally identifiable information",
          "Only healthcare information"
        ],
        correctAnswer: 2
      },
      {
        question: "How often should you update your email password?",
        options: [
          "Never, if it's strong enough",
          "Every few years",
          "Regularly (every 60-90 days) or when compromise is suspected",
          "Only when required by the system"
        ],
        correctAnswer: 2
      },
      
      // Module 3: Social Engineering Defense - 10 questions
      {
        question: "What is 'baiting' in social engineering?",
        options: [
          "Using false promises to hook victims",
          "Setting up physical traps",
          "Creating fake social media profiles",
          "Sending repeated email requests"
        ],
        correctAnswer: 0
      },
      {
        question: "Which approach is NOT recommended when handling an unexpected call requesting sensitive information?",
        options: [
          "Hanging up and calling back on a verified number",
          "Asking for the caller's employee ID",
          "Providing information if the caller seems knowledgeable about your company",
          "Requesting to speak with a supervisor"
        ],
        correctAnswer: 2
      },
      {
        question: "What is 'quid pro quo' in social engineering?",
        options: [
          "Promising something in return for information",
          "Using Latin phrases to confuse victims",
          "Hacking through an exchange server",
          "Accessing systems without permission"
        ],
        correctAnswer: 0
      },
      {
        question: "How can organizations protect against physical social engineering?",
        options: [
          "By only hiring people they know",
          "By implementing badge access systems and visitor protocols",
          "By having an open office layout",
          "By allowing remote work only"
        ],
        correctAnswer: 1
      },
      {
        question: "What is a key defense against impersonation attacks?",
        options: [
          "Using complex technical jargon",
          "Implementing multi-factor authentication",
          "Changing your name regularly",
          "Using multiple email addresses"
        ],
        correctAnswer: 1
      },
      {
        question: "What psychological technique do attackers often use in social engineering?",
        options: [
          "Inverse psychology",
          "Dream analysis",
          "Creating artificial urgency or fear",
          "Behavioral conditioning"
        ],
        correctAnswer: 2
      },
      {
        question: "Which of these is NOT a common goal of social engineering?",
        options: [
          "Installation of malware",
          "Building genuine relationships",
          "Financial fraud",
          "Data theft"
        ],
        correctAnswer: 1
      },
      {
        question: "What is 'water holing' in cyber attacks?",
        options: [
          "Tampering with office water coolers",
          "Injecting malware into websites frequently visited by targets",
          "Flooding systems with excessive data",
          "Creating fake water utility bills"
        ],
        correctAnswer: 1
      },
      {
        question: "What training approach best helps prevent social engineering attacks?",
        options: [
          "One-time annual training sessions",
          "Regular simulated attacks and ongoing awareness training",
          "Technical skills development",
          "Physical security training only"
        ],
        correctAnswer: 1
      },
      {
        question: "What should employees do if they suspect they've been targeted by a social engineering attack?",
        options: [
          "Handle it themselves to avoid embarrassment",
          "Report it only if they responded to the attack",
          "Immediately report it through proper channels",
          "Wait to see if anything bad happens first"
        ],
        correctAnswer: 2
      }
    ];
    
    // Shuffle the questions to randomize the assessment
    const shuffledQuestions = [...moduleQuestions].sort(() => Math.random() - 0.5);
    
    // Take only 30 questions (or all if fewer than 30)
    const selectedQuestions = shuffledQuestions.slice(0, 30);
    
    setQuestions(selectedQuestions);
  };

  // Handle answer selection
  const handleAnswerSelection = (optionIndex) => {
    if (selectedAnswer !== null) return; // Prevent changing answer after selection
    
    setSelectedAnswer(optionIndex);
    
    // Record end time for current question
    const endTime = new Date();
    const currentQuestion = questions[currentQuestionIndex];
    
    // Add to answer times array
    const newAnswerTimes = [...answerTimes];
    newAnswerTimes[currentQuestionIndex] = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    setAnswerTimes(newAnswerTimes);
    
    // Check if answer is correct
    if (optionIndex === currentQuestion.correctAnswer) {
      setCorrectResponses(correctResponses + 1);
    }
    
    // Proceed to next question after a delay
    setTimeout(() => {
      if (isMounted.current) {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setStartTime(new Date()); // Set start time for next question
          setProgress(Math.round(((currentQuestionIndex + 1) / questions.length) * 100));
        } else {
          // All questions answered
          submitAssessment();
        }
      }
    }, 1500);
  };

  // Submit assessment results
  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare payload
      const payload = {
        email: email,
        questions: answerTimes,
        correctResponses: correctResponses
      };
      
      // Send to backend
      await axios.post('http://147.93.111.204:4000/assessment', payload);
      
      // Mark assessment as complete
      setAssessmentComplete(true);
      
      // Navigate to completion page after a delay
      setTimeout(() => {
        if (isMounted.current) {
          // Store results in localStorage for completion page
          localStorage.setItem('lmsAssessmentResults', JSON.stringify({
            totalQuestions: questions.length,
            correctResponses: correctResponses
          }));
          navigate('/lms-completion');
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('There was an error submitting your assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Display current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-[#d1e0eb]">
      <div className="container mx-auto pt-6 px-4 pb-16">
        {questions.length > 0 && !assessmentComplete ? (
          <div className="max-w-3xl mx-auto">
            {/* Header with progress */}
            <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-white">Final Assessment</h1>
                  <span className="text-white font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5 mt-3">
                  <div 
                    className="bg-white h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Question card */}
            <div className="bg-white rounded-b-xl shadow-lg p-8 mb-8">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <FaClock className="text-indigo-500 mr-2" />
                  <span className="text-gray-500 text-sm">
                    Take your time to answer correctly. Your responses and timing are being recorded.
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {currentQuestion.question}
                </h2>
                
                {/* Answer options */}
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelection(index)}
                      disabled={selectedAnswer !== null}
                      className={`
                        w-full text-left p-4 rounded-lg transition-all duration-200
                        ${selectedAnswer === null ? 
                          'hover:bg-indigo-50 border border-gray-200' : 
                          selectedAnswer === index ?
                            (index === currentQuestion.correctAnswer ? 
                              'bg-green-100 border border-green-300' : 
                              'bg-red-100 border border-red-300') :
                            index === currentQuestion.correctAnswer && selectedAnswer !== null ?
                              'bg-green-100 border border-green-300' :
                              'border border-gray-200 opacity-70'
                        }
                      `}
                    >
                      <div className="flex items-start">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium mr-3">
                          {['A', 'B', 'C', 'D'][index]}
                        </span>
                        <span className={`
                          ${selectedAnswer === index ?
                            (index === currentQuestion.correctAnswer ? 'text-green-700' : 'text-red-700') :
                            index === currentQuestion.correctAnswer && selectedAnswer !== null ?
                              'text-green-700' : 'text-gray-700'
                          }
                        `}>
                          {option}
                        </span>
                      </div>
                      
                      {/* Show feedback icon after selection */}
                      {selectedAnswer !== null && (
                        <div className="mt-2">
                          {index === currentQuestion.correctAnswer ? (
                            <div className="flex items-center text-green-700">
                              <FaCheckCircle className="mr-2" />
                              <span>Correct Answer</span>
                            </div>
                          ) : selectedAnswer === index ? (
                            <div className="flex items-center text-red-700">
                              <FaExclamationCircle className="mr-2" />
                              <span>Incorrect Answer</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : assessmentComplete ? (
          // Assessment complete message
          <div className="max-w-md mx-auto mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-500 to-green-600">
              <h1 className="text-2xl font-bold text-white text-center">Assessment Complete!</h1>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your assessment has been submitted successfully. You will be redirected to the results page shortly.
              </p>
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Loading state
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LMSAssessment;