const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  citations: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
}

export async function getAIResponse(question: string): Promise<PerplexityResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Demo response
  return {
    id: "demo-response-" + Date.now(),
    model: "demo-model",
    created: Date.now(),
    citations: [
      "https://example.com/demo-citation-1",
      "https://example.com/demo-citation-2"
    ],
    choices: [
      {
        index: 0,
        finish_reason: "stop",
        message: {
          role: "assistant",
          content: `Thank you for your question about "${question}". As your AI professor, I'd be happy to help you understand this topic better. This is a demo response that demonstrates the format and structure of our conversation. In a real implementation, this would be replaced with an actual AI-generated response that directly addresses your specific question.`
        }
      }
    ]
  };
}