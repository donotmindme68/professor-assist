import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface PollOption {
  text: string;
  isCorrect: boolean;
}

interface PollProps {
  question: string;
  options: PollOption[];
}

export function Poll({ question, options }: PollProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleOptionClick = (index: number) => {
    if (selectedOption === null) {
      setSelectedOption(index);
      setShowResult(true);
    }
  };

  return (
    <div className="bg-background/5 backdrop-blur-sm rounded-lg p-4 my-4">
      <h3 className="text-lg font-semibold mb-4">{question}</h3>
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          const showCorrect = showResult && option.isCorrect;
          const showIncorrect = showResult && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={index}
              whileHover={selectedOption === null ? { scale: 1.01 } : {}}
              whileTap={selectedOption === null ? { scale: 0.99 } : {}}
              onClick={() => handleOptionClick(index)}
              className={`w-full text-left transition-all duration-300 ${
                selectedOption !== null ? 'cursor-default' : 'cursor-pointer'
              }`}
              disabled={selectedOption !== null}
            >
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-lg transition-colors duration-300 ${
                    showCorrect
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : showIncorrect
                        ? 'bg-red-100 dark:bg-red-900/20'
                        : isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : 'bg-gray-100 dark:bg-gray-800/20'
                  }`}
                />
                <div className="relative px-4 py-3 flex justify-between items-center">
                  <span className={`transition-colors duration-300 ${
                    showCorrect
                      ? 'text-green-700 dark:text-green-300 font-semibold'
                      : showIncorrect
                        ? 'text-red-700 dark:text-red-300'
                        : isSelected
                          ? 'text-blue-700 dark:text-blue-300'
                          : ''
                  }`}>
                    {option.text}
                  </span>
                  {showResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {option.isCorrect ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : isSelected ? (
                        <X className="w-5 h-5 text-red-500" />
                      ) : null}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-4 p-3 rounded-lg ${
            options[selectedOption!].isCorrect
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}
        >
          {options[selectedOption!].isCorrect ? (
            <p className="font-medium">Correct! Well done!</p>
          ) : (
            <p className="font-medium">
              Incorrect. The correct answer has been highlighted.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}