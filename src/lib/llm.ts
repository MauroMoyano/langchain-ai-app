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

export default model;
