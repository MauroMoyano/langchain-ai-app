import { streamResponse, streamStructuredConversation } from "../lib/llm";

// Ejemplo básico de streaming
async function ejemploStreamingBasico() {
  console.log("=== Ejemplo de Streaming Básico ===");
  await streamResponse("Contame un chiste");
  console.log("\n");
}

// Ejemplo de streaming con conversación estructurada
async function ejemploStreamingEstructurado() {
  console.log("=== Ejemplo de Streaming Estructurado ===");
  const systemPrompt =
    "Eres un asistente amigable que responde en español de manera concisa.";
  const userMessage =
    "Explicame qué es la inteligencia artificial en 3 oraciones";

  await streamStructuredConversation(systemPrompt, userMessage);
  console.log("\n");
}

// Función principal para ejecutar los ejemplos
async function main() {
  try {
    await ejemploStreamingBasico();
    await ejemploStreamingEstructurado();
  } catch (error) {
    console.error("Error durante el streaming:", error);
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
  main();
}

export { ejemploStreamingBasico, ejemploStreamingEstructurado };
