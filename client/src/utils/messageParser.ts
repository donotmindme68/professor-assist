interface ParsedContent {
  type: 'text' | 'code' | 'poll';
  content: string | { language?: string; code: string } | {
    question: string;
    options: { text: string; isCorrect: boolean; }[];
  };
}

export function parseMessage(content: string): ParsedContent[] {
  const parts: ParsedContent[] = [];
  let currentText = '';

  // Split the content into lines
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code blocks
    if (line.startsWith('```')) {
      // Add any accumulated text
      if (currentText.trim()) {
        parts.push({ type: 'text', content: currentText.trim() });
        currentText = '';
      }

      // Extract language if specified
      const language = line.slice(3).trim();
      let code = '';
      i++;

      // Collect code until closing backticks
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }

      parts.push({
        type: 'code',
        content: { language, code: code.trim() }
      });

      continue;
    }

    // Check for multiple choice questions
    if (line.match(/^[A-Z]\)\s+/) || line.match(/^[0-9]+\)\s+/)) {
      // Look back for the question
      let questionText = currentText.split('\n').pop() || '';
      currentText = currentText.substring(0, currentText.length - questionText.length);

      // Add any accumulated text before the question
      if (currentText.trim()) {
        parts.push({ type: 'text', content: currentText.trim() });
        currentText = '';
      }

      const options: { text: string; isCorrect: boolean; }[] = [];
      let currentLine = line;
      let correctAnswer = '';

      // Look for the correct answer marker (*) and remove it
      while (i < lines.length && (currentLine.match(/^[A-Z]\)\s+/) || currentLine.match(/^[0-9]+\)\s+/))) {
        let optionText = currentLine.replace(/^[A-Z0-9]\)\s+/, '').trim();
        const isCorrect = optionText.endsWith('*');

        if (isCorrect) {
          optionText = optionText.slice(0, -1).trim();
          correctAnswer = optionText;
        }

        options.push({
          text: optionText,
          isCorrect: isCorrect
        });

        i++;
        currentLine = lines[i] || '';
      }
      i--;

      if (options.length > 0) {
        parts.push({
          type: 'poll',
          content: {
            question: questionText.trim(),
            options
          }
        });
        continue;
      }
    }

    currentText += line + '\n';
  }

  // Add any remaining text
  if (currentText.trim()) {
    parts.push({ type: 'text', content: currentText.trim() });
  }

  return parts;
}