import { embed } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Pinecone, RecordValues } from "@pinecone-database/pinecone";

const lookupRules = async (queryString: string) => {
    const googleGenerativeAI = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "xxxx",
      });
    const pinecone = new Pinecone({
    apiKey:
      process.env.PINECONE_API_KEY || "xxxx",
  });
  const index = pinecone.index({ name: "lorcana-rules" });
  
  const { embedding: queryEmbedding } = await embed({
    model: googleGenerativeAI.embeddingModel("gemini-embedding-2-preview"),
    value: queryString,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      },
    },
  });
  const ruleResults = await index.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });
  console.log({ruleResults});
  return ruleResults;
};

export default lookupRules;
