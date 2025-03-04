import React, { useState, useEffect } from 'react';
import { Check, X, Award, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface ChoiceBlockProps {
  question: string;
  choices: Choice[];
}

const ChoiceBlock: React.FC<ChoiceBlockProps> = ({ question, choices }) => {
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [animateResult, setAnimateResult] = useState(false);

  // Check if multiple correct answers exist
  const hasMultipleCorrectAnswers = choices.filter(choice => choice.isCorrect).length > 1;

  useEffect(() => {
    if (showAnswers) {
      const correctAnswers = choices.filter(choice => choice.isCorrect);
      const correctSelected = selectedChoices.filter(index => choices[index].isCorrect).length;
      const incorrectSelected = selectedChoices.filter(index => !choices[index].isCorrect).length;

      // Only count as fully correct if user selected all correct answers and no incorrect ones
      const isFullyCorrect = incorrectSelected === 0 && correctSelected === correctAnswers.length;

      setResult({
        correct: correctSelected,
        total: correctAnswers.length
      });

      // Trigger animation
      setAnimateResult(true);
      setTimeout(() => setAnimateResult(false), 1500);
    }
  }, [showAnswers, selectedChoices, choices]);

  const handleChoiceClick = (index: number) => {
    if (!showAnswers) {
      setSelectedChoices(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
    }
  };

  const handleCheckAnswers = () => {
    setShowAnswers(true);
  };

  const handleReset = () => {
    setSelectedChoices([]);
    setShowAnswers(false);
  };

  // Calculate score percentage
  const scorePercentage = showAnswers && result.total > 0
    ? Math.round((result.correct / result.total) * 100)
    : 0;

  // Determine result message and color
  const getResultFeedback = () => {
    if (scorePercentage === 100) {
      return { message: "Perfect! All correct!", color: "text-green-600" };
    } else if (scorePercentage >= 75) {
      return { message: "Great job!", color: "text-green-600" };
    } else if (scorePercentage >= 50) {
      return { message: "Good effort!", color: "text-amber-600" };
    } else {
      return { message: "Keep practicing!", color: "text-red-600" };
    }
  };

  const feedback = getResultFeedback();

  return (
    <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 my-4 border border-primary-200 shadow-md">
      {question && (
        <div className="mb-4 font-medium text-gray-800 text-lg">{question}</div>
      )}

      <div className="space-y-3">
        {choices.map((choice, index) => (
          <div
            key={index}
            onClick={() => handleChoiceClick(index)}
            className={`
              p-4 rounded-lg cursor-pointer transition-all flex items-start gap-3
              hover:shadow-md
              ${!showAnswers ? 'hover:border-primary-400' : ''}
              ${selectedChoices.includes(index)
              ? 'bg-primary-50 border-primary-400'
              : 'bg-white border-gray-200'} 
              ${showAnswers && choice.isCorrect
              ? 'bg-green-50 border-green-400'
              : ''}
              ${showAnswers && selectedChoices.includes(index) && !choice.isCorrect
              ? 'bg-red-50 border-red-400'
              : ''}
              border-2 transform transition-transform ${!showAnswers && 'hover:scale-[1.01]'}
            `}
          >
            {hasMultipleCorrectAnswers ? (
              <div className={`
                w-5 h-5 rounded-md flex-shrink-0 mt-0.5 border-2 flex items-center justify-center
                ${selectedChoices.includes(index)
                ? 'bg-primary-100 border-primary-600'
                : 'bg-white border-gray-400'}
                ${showAnswers && choice.isCorrect
                ? 'bg-green-100 border-green-600'
                : ''}
                ${showAnswers && selectedChoices.includes(index) && !choice.isCorrect
                ? 'bg-red-100 border-red-600'
                : ''}
              `}>
                {selectedChoices.includes(index) && (
                  <Check className="w-4 h-4 text-primary-700" />
                )}
                {showAnswers && choice.isCorrect && !selectedChoices.includes(index) && (
                  <Check className="w-4 h-4 text-green-700" />
                )}
              </div>
            ) : (
              <div className={`
                w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border-2
                ${selectedChoices.includes(index)
                ? 'bg-primary-100 border-primary-600'
                : 'bg-white border-gray-400'}
                ${showAnswers && choice.isCorrect
                ? 'bg-green-100 border-green-600'
                : ''}
                ${showAnswers && selectedChoices.includes(index) && !choice.isCorrect
                ? 'bg-red-100 border-red-600'
                : ''}
              `}>
                {selectedChoices.includes(index) && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-700 m-auto" />
                )}
                {showAnswers && choice.isCorrect && !selectedChoices.includes(index) && (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-700 m-auto" />
                )}
              </div>
            )}

            <div className="flex-1 font-medium text-gray-700">{choice.text}</div>

            {showAnswers && (
              <div className={`flex items-center ml-2 ${choice.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {choice.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  selectedChoices.includes(index) && <X className="w-5 h-5" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAnswers && (
        <div className={`mt-5 p-4 rounded-lg border-2 ${
          scorePercentage === 100
            ? 'bg-green-50 border-green-300'
            : scorePercentage >= 50
              ? 'bg-amber-50 border-amber-300'
              : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-bold text-lg ${feedback.color}`}>
                {feedback.message}
              </p>
              <p className="text-gray-700">
                You got {result.correct} out of {result.total} correct
              </p>
            </div>
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              text-xl font-bold border-4 ${
              scorePercentage === 100
                ? 'border-green-500 text-green-700 bg-green-100'
                : scorePercentage >= 50
                  ? 'border-amber-500 text-amber-700 bg-amber-100'
                  : 'border-red-500 text-red-700 bg-red-100'
            } ${animateResult ? 'animate-pulse' : ''}
            `}>
              {scorePercentage}%
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-3 justify-center">
        {!showAnswers ? (
          <button
            onClick={handleCheckAnswers}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Award className="w-5 h-5" />
            <span>Check Answers</span>
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChoiceBlock;