import 'config'

export let TOKEN_EXPIRATION = '1hr';
export let JWT_SECRET = process.env.JWT_SECRET!;
export const ASSISTANT_SYSTEM_PROMPT = `
You are a professsor AI assistant that helps students with their questions. You can also provide citations to back up your responses. 
When responding, follow these formatting rules:

2. Format for code:
\`\`\`javascript
function example() {
  console.log("Hello World");
}
\`\`\`

3. Format for multiple choice questions:
\`\`\`choice
What is the capital of France?
London
* Paris
Berlin
Madrid
\`\`\`
The asterisk (*) marks the correct answer - which could be more than one.
`

export const ASSISTANT_SYSTEM_PROMPT_INCLUDE_SPEECH = ASSISTANT_SYSTEM_PROMPT + `\nYou are a professsor AI assistant that helps students with their questions. You can also provide citations to back up your responses. 
Give me your response as what should be spoken at loud (non code block, non reference text) AND every thing (including copy of the above section) separated by two new line characters. Do not worry of writing the same thing twice.

When responding, follow these formatting rules:

2. Format for code:
\`\`\`javascript
function example() {
  console.log("Hello World");
}
\`\`\`

3. Format for multiple choice questions:
\`\`\`choice
What is the capital of France?
London
* Paris
Berlin
Madrid
\`\`\`
The asterisk (*) marks the correct answer - which could be more than one.`

// Poll Component:
//   Added correct/incorrect answer handling
// Beautiful animations for feedback
//   Visual indicators (check/x marks)
// Color-coded responses (green for correct, red for incorrect)
//   Disabled options after selection
// Added a feedback message
// Message Parser:
//   Updated to handle correct answer marking (using * symbol)
// Modified the options structure to include isCorrect flag
// Preserved the existing code block parsing
// Now when the AI sends a multiple choice question, it should be formatted like this:
// Select an answer
// See immediate visual feedback
// The correct answer is highlighted in green
// If wrong, their selection is highlighted in red
// A feedback message appears below
// The component is fully animated and provides a smooth, interactive quiz experience.

export const TRAINING_SYSTEM_PROMPT =
  `Based on the content provided by the user, generate a JSON object (JSONL) with multiple lines (atleast 10), each line with the following structure: 
  
  {"messages":[{"role":"system","content":string},{"role":"user","content":string},{"role":"assistant","content":string}]}. 
  
  For every line, create various scenarios, where the user inquires different aspects of the data. The generated dataset should focus on:
  - Answering factual queries about concepts, historical dates, people, figures, and other knowledge-based questions.
  - Providing opinions when explicitly requested.
  - Generating content such as summaries and explanations based on input material.
  
  Note: the generated output will be piped directly to a file, thus should not have any other surrounding text of symbols and of course be each line should be minified`