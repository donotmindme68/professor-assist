import MarkdownRenderer from "@/components/subscriber/MarkdownRenderer.tsx";
import ChoiceBlock from "@/components/subscriber/ChoiceBlock.tsx";

function TestMarkdown() {

  const markdownContent = `
# Example Markdown with Choice Block

Here is a normal code block:

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

And here is a special choice block:

\`\`\`choice             
What is the capital of France?
- Paris (*)
- London
- Berlin
\`\`\`
`;

  // return (
  //   <div>
  //     <MarkdownRenderer>{markdownContent}</MarkdownRenderer>
  //   </div>
  // );

  return <ChoiceBlock question={"What color is Milk?"} choices={[{text: "Choice1", isCorrect: false}, {text: "Choice2", isCorrect: true}]}/>
}


export default function Test() {
 return <TestMarkdown/>
}

