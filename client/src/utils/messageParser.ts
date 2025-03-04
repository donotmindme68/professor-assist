// Simple message parser to identify code blocks
export const parseMessage = (content: string) => {
  const parts: { type: string; content: string | { language?: string; code: string } }[] = [];
  
  // Simple regex to detect code blocks with optional language
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }
    
    // Add code block
    parts.push({
      type: 'code',
      content: {
        language: match[1] || undefined,
        code: match[2]
      }
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }
  
  // If no code blocks were found, return the whole content as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content
    });
  }
  
  return parts;
};