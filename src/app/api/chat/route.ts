import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

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

    const { message } = await request.json();

    // Validar entrada
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Mensaje demasiado largo (máximo 5000 caracteres)" },
        { status: 400 }
      );
    }

    const result = await model.invoke(message);

    // Extraer información de tokens y metadatos
    const tokenUsage = result.response_metadata?.tokenUsage;
    const finishReason = result.response_metadata?.finish_reason;

    return NextResponse.json({
      content: result.content,
      tokenUsage,
      finishReason,
    });
  } catch (error) {
    console.error("Error en chat API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
