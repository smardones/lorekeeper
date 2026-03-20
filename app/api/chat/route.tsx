import fetchCardData from "@/app/tools/cardLoader";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, tool, stepCountIs } from "ai"; // vercel sdk for streaming responses
import z from "zod";

const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = await streamText({
    model: googleGenerativeAI("gemini-3-flash-preview"),
    system: `You are a concise, helpful assistant.
    Answer clearly and skip unnecessary filler phrases.`,
    temperature: 1,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      getCardData: tool({
        description: "Fetch card data from the Lorcast API",
        inputSchema: z.object({
          queryString: z
            .string()
            .describe(
              "The search query for the card data. It can be a card name, version name, characteristic, or any relevant keyword to find the desired card information. Do not include any special characters and instead add a space or combine words separated by special characters. For example 'Elsa - Spirit of Winter' should be 'Elsa Spirit of Winter' or 'ElsaSpiritofWinter'.",
            ),
        }),
        execute: async ({ queryString }) => {
          const retunedCardData = await fetchCardData(queryString);
          return retunedCardData;
        },
        
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
