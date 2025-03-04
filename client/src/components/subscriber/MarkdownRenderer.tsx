import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChoiceBlock from './ChoiceBlock';

interface MarkdownRendererProps {
  children: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => {
  // Function to parse choice blocks
  const parseChoiceBlock = (
    codeContent: string
  ): { question: string; choices: Array<{ text: string; isCorrect: boolean; selected: boolean }> } | null => {
    // Trim the content and check if it starts with 'choice'
    const trimmedContent = codeContent.trim();
    if (!trimmedContent.startsWith('choice')) {
      return null;
    }

    const lines = trimmedContent.split('\n');

    // Remove the 'choice' identifier line
    lines.shift();

    let question = '';
    const choices: Array<{ text: string; isCorrect: boolean; selected: boolean }> = [];

    // Parse the question (everything until we hit a line starting with '-')
    while (lines.length > 0 && !lines[0].trim().startsWith('-')) {
      question += lines.shift()?.trim() + ' ';
    }

    // Parse the choices
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('-')) {
        const choiceText = trimmedLine.substring(1).trim();
        const isCorrect = choiceText.includes('(*)');
        const cleanedText = choiceText.replace('(*)', '').trim();

        choices.push({
          text: cleanedText,
          isCorrect,
          selected: false,
        });
      }
    });

    return {
      question: question.trim(),
      choices,
    };
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          />
        ),
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');

          // Check if it's a 'choice' block (even with extra spaces)
          if (!inline && match && match[1].trim() === 'choice') {
            const content = String(children).replace(/\n$/, '');
            const parsedChoice = parseChoiceBlock(content);

            if (parsedChoice) {
              return <ChoiceBlock question={parsedChoice.question} choices={parsedChoice.choices} />;
            }
          }

          // Default code block rendering
          return (
            <code
              {...props}
              className={`${
                inline
                  ? 'bg-gray-100 text-primary-800 px-1 py-0.5 rounded'
                  : 'block bg-gray-100 p-2 rounded my-2 overflow-x-auto'
              }`}
            >
              {children}
            </code>
          );
        },
        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 my-2" />,
        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 my-2" />,
        h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold my-3" />,
        h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold my-3" />,
        h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold my-2" />,
        p: ({ node, ...props }) => <p {...props} className="my-2" />,
        blockquote: ({ node, ...props }) => (
          <blockquote {...props} className="border-l-4 border-primary-300 pl-4 italic my-3" />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;