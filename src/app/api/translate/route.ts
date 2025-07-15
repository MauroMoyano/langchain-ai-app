import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Validar método HTTP
    if (request.method !== "POST") {
      return NextResponse.json(
        { error: "Método no permitido" },
        { status: 405 }
      );
    }

    // Validar Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type debe ser application/json" },
        { status: 400 }
      );
    }

    const { text } = await request.json();

    // Validar entrada
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Texto requerido" }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: "Texto demasiado largo (máximo 5000 caracteres)" },
        { status: 400 }
      );
    }

    const messages = [
      new SystemMessage("Translate the following from English into Italian"),
      new HumanMessage(text),
    ];

    const result = await model.invoke(messages);

    // Extraer información de tokens y metadatos
    const tokenUsage = result.response_metadata?.tokenUsage;
    const finishReason = result.response_metadata?.finish_reason;

    return NextResponse.json({
      content: result.content,
      tokenUsage,
      finishReason,
    });
  } catch (error) {
    console.error("Error en translate API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
