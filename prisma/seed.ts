import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEEDS = [
  {
    provider: "openai",
    model: "gpt-4.1-mini",
    prompt: "What is the capital of France?",
    response: "The capital of France is Paris."
  },
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    prompt: "What is the capital of France?",
    response: "Paris is the capital and most populous city of France."
  },
  {
    provider: "openai",
    model: "gpt-4.1-mini",
    prompt: "Explain quantum entanglement in one sentence.",
    response: "Quantum entanglement is a phenomenon where two particles become correlated such that the state of one instantly influences the state of the other, regardless of distance."
  },
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    prompt: "Explain quantum entanglement in one sentence.",
    response: "Quantum entanglement is when two or more particles become linked so that measuring one instantly affects the other, no matter how far apart they are."
  },
  {
    provider: "openai",
    model: "gpt-4.1-mini",
    prompt: "What are the best practices for REST API design?",
    response: "Use nouns for resources, HTTP verbs for actions, versioning via URL or headers, consistent error responses, pagination for lists, and always validate and sanitise input."
  },
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    prompt: "What are the best practices for REST API design?",
    response: "Key REST best practices include: use resource-based URLs, leverage HTTP methods correctly, return standard status codes, version your API, and provide clear documentation."
  }
];

async function main() {
  console.log("Seeding database...");

  for (const seed of SEEDS) {
    await prisma.queryLog.create({ data: seed });
  }

  console.log(`Seeded ${SEEDS.length} query logs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
