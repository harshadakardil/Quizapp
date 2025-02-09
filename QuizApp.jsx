import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Timer, Heart } from 'lucide-react';

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(30);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchQuizData();
  }, []);

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && gameState === 'playing') {
      handleAnswer(null);
    }
    return () => clearInterval(interval);
  }, [timer, gameState]);

  const fetchQuizData = async () => {
    try {
      const response = await axios.get('https://api.jsonserve.com/Uw5CrX');
      setQuizData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch quiz data. Please try again later.');
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
    setAnswers([]);
    setStreak(0);
    setTimer(30);
  };

  const handleAnswer = (selectedAnswer) => {
    if (!quizData?.questions) return;

    const currentQ = quizData.questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    
    if (isCorrect) {
      const streakBonus = Math.floor(streak / 2) * 5;
      const timeBonus = Math.floor(timer / 10) * 2;
      setScore(prev => prev + currentQ.points + streakBonus + timeBonus);
      setStreak(prev => prev + 1);
    } else {
      setLives(prev => prev - 1);
      setStreak(0);
    }

    setAnswers(prev => [...prev, {
      question: currentQ.question,
      selectedAnswer,
      correctAnswer: currentQ.correctAnswer,
      isCorrect
    }]);

    if (currentQuestion < quizData.questions.length - 1 && (isCorrect || lives > 1)) {
      setCurrentQuestion(prev => prev + 1);
      setTimer(30);
    } else {
      setGameState('end');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  const renderStart = () => (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-center mb-6">{quizData?.title || 'Quiz Game'}</h1>
      <div className="text-center">
        <p className="mb-6">Test your knowledge with this interactive quiz!</p>
        <Button 
          variant="success"
          onClick={startQuiz}
          className="w-full"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );

  const renderQuestion = () => {
    if (!quizData?.questions) return null;
    const question = quizData.questions[currentQuestion];

    return (
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" />
            <span>Lives: {lives}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="text-blue-500" />
            <span>Time: {timer}s</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            <span>Score: {score}</span>
          </div>
        </div>

        <Progress 
          value={(currentQuestion + 1) / quizData.questions.length * 100} 
          className="mb-6"
        />

        <h2 className="text-xl font-semibold mb-6">
          Question {currentQuestion + 1}: {question.question}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full text-left py-4"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderEnd = () => (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-6">Quiz Complete!</h2>
      
      <div className="text-center mb-8">
        <p className="text-4xl font-bold text-green-500 mb-4">{score} Points</p>
        <p className="text-gray-600">
          You answered {answers.filter(a => a.isCorrect).length} out of {quizData?.questions.length} questions correctly
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        {answers.map((answer, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${answer.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
          >
            <p className="font-medium">{answer.question}</p>
            <p className="text-sm">
              Your answer: {answer.selectedAnswer || "Time's up!"}
              {!answer.isCorrect && (
                <span className="block text-green-600">
                  Correct answer: {answer.correctAnswer}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      <Button 
        variant="success"
        onClick={startQuiz}
        className="w-full"
      >
        Play Again
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {gameState === 'start' && renderStart()}
      {gameState === 'playing' && renderQuestion()}
      {gameState === 'end' && renderEnd()}
    </div>
  );
};

export default QuizApp;