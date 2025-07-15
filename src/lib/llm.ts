import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Función para crear conversaciones estructuradas
export const createStructuredConversation = async (
  systemPrompt: string,
  userMessage: string
) => {
  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userMessage),
  ];

  return await model.invoke(messages);
};

// Función para streaming de respuestas
export const streamResponse = async (message: string) => {
  const stream = await model.stream(message);

  for await (const chunk of stream) {
    const content =
      typeof chunk.content === "string"
        ? chunk.content
        : Array.isArray(chunk.content)
        ? chunk.content
            .map((item) =>
              typeof item === "string" ? item : JSON.stringify(item)
            )
            .join("")
        : JSON.stringify(chunk.content);
    process.stdout.write(content);
  }
};

// Función para streaming con mensajes estructurados
export const streamStructuredConversation = async (
  systemPrompt: string,
  userMessage: string
) => {
  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userMessage),
  ];

  const stream = await model.stream(messages);

  for await (const chunk of stream) {
    const content =
      typeof chunk.content === "string"
        ? chunk.content
        : Array.isArray(chunk.content)
        ? chunk.content
            .map((item) =>
              typeof item === "string" ? item : JSON.stringify(item)
            )
            .join("")
        : JSON.stringify(chunk.content);
    process.stdout.write(content);
  }
};

export default model;
