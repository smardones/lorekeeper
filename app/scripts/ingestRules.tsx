import { PDFParse } from "pdf-parse";
import { Pinecone } from "@pinecone-database/pinecone";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { embedMany } from "ai";

function chunkText(text: string): string[] {
  // 1. Clean up page break artifacts and other unwanted text
  const cleanupRules = [
    { pattern: /-- \d+ of \d+ --/g, replacement: "" },
    { pattern: /disneylorcana\.com\s*©\s*D\s*isney\s*/g, replacement: "" },
    { pattern: /Page \d+/g, replacement: "" },
  ];

  const cleanedText = cleanupRules.reduce((currentText, rule) => {
    return currentText.replace(rule.pattern, rule.replacement);
  }, text);

  const sections = cleanedText
    .split(/(?=^\d+\.\d*\.?\d*\.?\s+|^GLOSSARY)/gm)

    .filter((section) => section.length > 50);

  const glossary = sections.find((s) => s.startsWith("GLOSSARY"));
  if (!glossary) {
    console.warn("No glossary section found in the text.");
    return sections;
  }
  const glossarySections = glossary
    .split(/\n(?=[a-z][a-zA-Z\s,/{}]+\n)/)
    .filter((chunk) => chunk.length > 50);

  let sectionsWithGlossary = sections;
  if (!!glossary) {
    sectionsWithGlossary = sections.flatMap((section) => {
      if (section.startsWith("GLOSSARY")) {
        return glossarySections;
      } else return section;
    });
  }
  const formattedSections = sectionsWithGlossary.map((section) =>
    section.replace(/\n+/g, " ").trim(),
  );
  return formattedSections;
}

const pdfPath =
  "https://files.disneylorcana.com/Disney-Lorcana-Comprehensive-Rules-020526-EN-Edited.pdf";

export async function ingestRules() {
  const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: 'xxxx',
});
  let batchSize = 100;
  let completeVectors = [];
  const pinecone = new Pinecone({
    apiKey:
      "xxxx"
  });
  const index = pinecone.index({ name: "lorcana-rules" });
  const parser = new PDFParse({ url: pdfPath });

  const result = await parser.getText();
  const chunks = chunkText(result.text);

  for (let i = 0; i < chunks.length; i += batchSize) {
  const batch = chunks.slice(i, i + batchSize);

  const { embeddings } = await embedMany({
    model: googleGenerativeAI.embeddingModel("gemini-embedding-2-preview"),
    values: batch,
    providerOptions: {
      google: {
        outputDimensionality: 768,
      },
    },
  });

  await index.upsert({
    records: embeddings.map((embedding, idx) => ({
      id: `chunk-${i + idx}`,
      values: embedding,
      metadata: { text: chunks[i + idx] },
    }))
  });

  console.log(`Upserted chunks ${i} to ${Math.min(i + batchSize, chunks.length)} of ${chunks.length}`);
}
}

ingestRules();
