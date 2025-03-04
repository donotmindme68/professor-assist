import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  return (
    <div className="my-2 rounded-md bg-gray-800 dark:bg-gray-900 overflow-x-auto">
      {language && (
        <div className="px-4 py-1 text-xs text-gray-400 bg-gray-700 dark:bg-gray-800 border-b border-gray-600">
          {language}
        </div>
      )}
      <pre className="p-4 text-gray-100 dark:text-gray-200 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;