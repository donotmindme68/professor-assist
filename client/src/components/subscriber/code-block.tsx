import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-zinc-950 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900">
        <span className="text-sm text-zinc-400">{language}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </motion.button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-zinc-200">{code}</code>
      </pre>
    </div>
  );
}