import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Función de validación
function validateInput(
  message: string,
  systemPrompt?: string
): { valid: boolean; error?: string } {
  // Validar longitud del mensaje
  if (!message || typeof message !== "string") {
    return { valid: false, error: "Mensaje requerido" };
  }

  if (message.length > 5000) {
    return {
      valid: false,
      error: "Mensaje demasiado largo (máximo 5000 caracteres)",
    };
  }

  if (message.length < 1) {
    return { valid: false, error: "Mensaje no puede estar vacío" };
  }

  // Validar systemPrompt si existe
  if (systemPrompt && typeof systemPrompt === "string") {
    if (systemPrompt.length > 2000) {
      return {
        valid: false,
        error: "System prompt demasiado largo (máximo 2000 caracteres)",
      };
    }
  }

  // Validar contenido malicioso básico
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(message) || (systemPrompt && pattern.test(systemPrompt))) {
      return { valid: false, error: "Contenido no permitido detectado" };
    }
  }

  return { valid: true };
}

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

    const { message, systemPrompt } = await request.json();

    // Validar entrada
    const validation = validateInput(message, systemPrompt);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Crear el encoder para el stream
    const encoder = new TextEncoder();

    // Crear el stream de respuesta
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let messages;

          if (systemPrompt) {
            messages = [
              new SystemMessage(systemPrompt),
              new HumanMessage(message),
            ];
          } else {
            messages = [new HumanMessage(message)];
          }

          const responseStream = await model.stream(messages);

          for await (const chunk of responseStream) {
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

            // Enviar el chunk como texto
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }

          controller.close();
        } catch (error) {
          console.error("Error en el streaming:", error);
          controller.error(new Error("Error interno del servidor"));
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // Log sanitizado para producción
    console.error("Error en API - ID:", Date.now(), error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
