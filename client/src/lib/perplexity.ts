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
  const response = await fetch(PERPLEXITY_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable professor who provides clear, accurate, and educational responses to student questions."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      return_citations: true,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
