import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaClock, FaExclamationCircle, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const LMSAssessment40 = () => {
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
    const storedEmail = localStorage.getItem('lmsUserEmail40');
    if (!storedEmail) {
      navigate('/lms-login40');
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

  // Prepare assessment questions from all modules
  const prepareQuestions = () => {
    // Initial 1 question (will expand to 40 later)
    const allQuestions = [
      {
        question: "Which of these tactics is most commonly used in advanced persistent threat (APT) attacks?",
        options: [
          "Mass phishing campaigns targeting thousands of random users",
          "Using stolen credentials from data breaches for initial access",
          "Sending emails with obvious grammar and spelling mistakes",
          "Direct denial-of-service attacks on public-facing systems"
        ],
        correctAnswer: 1,
        explanation: "APT attacks typically use stolen credentials from data breaches to gain initial access, as this method is stealthy and difficult to detect compared to mass phishing or denial-of-service attacks."
      }
    ];
    
    setQuestions(allQuestions);
    
    // Initialize answer times array with empty slots
    setAnswerTimes(new Array(allQuestions.length).fill(null));
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
      question: currentQuestion.question,
      selectedAnswer: optionIndex,
      correctAnswer: currentQuestion.correctAnswer,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      timeSpent: (endTime - startTime) / 1000 // time in seconds
    };
    setAnswerTimes(newAnswerTimes);
    
    // Check if answer is correct
    if (optionIndex === currentQuestion.correctAnswer) {
      setCorrectResponses(correctResponses + 1);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setStartTime(new Date()); // Set start time for next question
      setProgress(Math.round(((currentQuestionIndex + 1) / questions.length) * 100));
    } else {
      // All questions answered
      submitAssessment();
    }
  };

  // Submit assessment results
  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare payload
      const payload = {
        email: email,
        assessmentType: "advanced-40",
        questions: answerTimes,
        correctResponses: correctResponses,
        totalQuestions: questions.length,
        completionDate: new Date().toISOString()
      };
      
      // Send to backend
      await axios.post('http://147.93.111.204:4000/assessment/advanced', payload);
      
      // Mark assessment as complete
      setAssessmentComplete(true);
      
      // Store results in localStorage for completion page
      localStorage.setItem('lmsAssessmentResults40', JSON.stringify({
        totalQuestions: questions.length,
        correctResponses: correctResponses,
        passingScore: Math.ceil(questions.length * 0.7)
      }));

      // Navigate to completion page after a short delay
      setTimeout(() => {
        if (isMounted.current) {
          navigate('/lms-completion40');
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('There was an error submitting your assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-[#d1e0eb]">
      <div className="container mx-auto pt-6 px-4 pb-16">
        {questions.length > 0 && !assessmentComplete ? (
          <div className="max-w-3xl mx-auto">
            {/* Header with progress */}
            <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FaShieldAlt className="text-white mr-2 text-xl" />
                    <h1 className="text-2xl font-bold text-white">Advanced Security Assessment</h1>
                  </div>
                  <span className="text-white font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5 mt-4">
                  <div 
                    className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Question card */}
            <div className="bg-white rounded-b-xl shadow-lg p-8 mb-8">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <FaClock className="text-indigo-600 mr-2" />
                  <span className="text-gray-600 text-sm">
                    Consider each question carefully. This advanced assessment tests your comprehensive security knowledge.
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {questions[currentQuestionIndex].question}
                </h2>
                
                {/* Answer options */}
                <div className="space-y-4 mb-8">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelection(index)}
                      disabled={selectedAnswer !== null}
                      className={`
                        w-full text-left p-4 rounded-lg text-black transition-all duration-200
                        ${selectedAnswer === null ? 
                          'hover:bg-indigo-50 border border-gray-200' : 
                          selectedAnswer === index ?
                            (index === questions[currentQuestionIndex].correctAnswer ? 
                              'bg-green-50 border-2 border-green-500' : 
                              'bg-red-50 border-2 border-red-500') :
                            index === questions[currentQuestionIndex].correctAnswer && selectedAnswer !== null ?
                              'bg-green-50 border-2 border-green-500' :
                              'border border-gray-200 opacity-75'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <span className={`
                          w-8 h-8 flex items-center justify-center rounded-full mr-3
                          ${selectedAnswer === null ? 
                            'bg-indigo-100 text-indigo-700' :
                            selectedAnswer === index ?
                              (index === questions[currentQuestionIndex].correctAnswer ? 
                                'bg-green-100 text-green-700' : 
                                'bg-red-100 text-red-700') :
                              index === questions[currentQuestionIndex].correctAnswer && selectedAnswer !== null ?
                                'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                          }
                        `}>
                          {['A', 'B', 'C', 'D'][index]}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Explanation after answering */}
                {selectedAnswer !== null && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    selectedAnswer === questions[currentQuestionIndex].correctAnswer
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <h3 className={`font-bold mb-2 flex items-center ${
                      selectedAnswer === questions[currentQuestionIndex].correctAnswer
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}>
                      {selectedAnswer === questions[currentQuestionIndex].correctAnswer
                        ? <><FaCheckCircle className="mr-2" /> Correct</>
                        : <><FaExclamationCircle className="mr-2" /> Incorrect</>
                      }
                    </h3>
                    <p className="text-gray-700">{questions[currentQuestionIndex].explanation}</p>
                  </div>
                )}
                
                {/* Next question button */}
                {selectedAnswer !== null && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleNextQuestion}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md flex items-center"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
                      <FaArrowRight className="ml-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : assessmentComplete ? (
          // Assessment complete message
          <div className="max-w-md mx-auto mt-16 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-500 to-teal-600">
              <h1 className="text-2xl font-bold text-white text-center">Assessment Complete!</h1>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank You for Completing the Advanced Assessment</h2>
              <p className="text-gray-600 mb-6">
                Your assessment has been submitted successfully. Your detailed results will be available shortly.
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

export default LMSAssessment40;