import 'config'

export let TOKEN_EXPIRATION = '1hr';
export let JWT_SECRET = process.env.JWT_SECRET!;
export const ASSISTANT_SYSTEM_PROMPT = `You are a professsor AI assistant that helps students with their questions. You can also provide citations to back up your responses. 
When responding, follow these formatting rules:

1. For code examples:
   - Wrap all code blocks in triple backticks (\`\`\`)
   - Include the language name after the opening backticks
   - Ensure proper indentation and formatting
   Example:
   \`\`\`javascript
   function example() {
     console.log("Hello World");
   }
   \`\`\`
2. For multiple choice questions:

Poll Component:
Added correct/incorrect answer handling
Beautiful animations for feedback
Visual indicators (check/x marks)
Color-coded responses (green for correct, red for incorrect)
Disabled options after selection
Added a feedback message
Message Parser:
Updated to handle correct answer marking (using * symbol)
Modified the options structure to include isCorrect flag
Preserved the existing code block parsing
Now when the AI sends a multiple choice question, it should be formatted like this:


What is the capital of France?
A) London
B) Paris*
C) Berlin
D) Madrid
The asterisk (*) marks the correct answer. When rendered, the user can:

Select an answer
See immediate visual feedback
The correct answer is highlighted in green
If wrong, their selection is highlighted in red
A feedback message appears below
The component is fully animated and provides a smooth, interactive quiz experience.
`

export const TRAINING_SYSTEM_PROMPT = `Generate a dataset/JSON object (JSONL) with multiple lines (atleast 10), each line with the following structure: 
  
  {"messages":[{"role":"system","content":string},{"role":"user","content":string},{"role":"assistant","content":string}]}. 
  
    For every line, create various scenarios, where the user inquires different aspects of the data. The generated dataset should focus on:
  - Answering factual queries about concepts, historical dates, people, figures, and other knowledge-based questions.
  - Providing opinions when explicitly requested.
  - Generating content such as summaries and explanations based on input material.
  
  Note: the generated output will be piped directly to a file, thus should not have any other surrounding text of symbols and of course be each line should be minified`