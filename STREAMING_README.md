# Streaming con LangChain y Google Generative AI

Este proyecto implementa funcionalidad de streaming para respuestas en tiempo real usando LangChain y Google Generative AI.

## Configuración

Asegúrate de tener configurada tu variable de entorno `GOOGLE_API_KEY` en el archivo `.env.local`:

```env
GOOGLE_API_KEY=tu_api_key_de_google_aqui
```

## Funciones Disponibles

### 1. `streamResponse(message: string)`

Streaming básico con un mensaje simple.

```typescript
import { streamResponse } from "./src/lib/llm";

await streamResponse("Contame un chiste");
```

### 2. `streamStructuredConversation(systemPrompt: string, userMessage: string)`

Streaming con conversación estructurada que incluye un prompt del sistema.

```typescript
import { streamStructuredConversation } from "./src/lib/llm";

const systemPrompt = "Eres un asistente amigable que responde en español.";
const userMessage = "Explicame qué es la IA";

await streamStructuredConversation(systemPrompt, userMessage);
```

## Ejecutar Ejemplos

Para probar el streaming, ejecuta:

```bash
npm run stream
```

Esto ejecutará los ejemplos incluidos en `src/examples/streaming-example.ts`.

## Uso en tu Código

Puedes usar las funciones de streaming en cualquier parte de tu aplicación:

```typescript
// Ejemplo básico
await streamResponse("Hola, ¿cómo estás?");

// Ejemplo con prompt del sistema
await streamStructuredConversation(
  "Eres un experto en programación que explica conceptos de manera simple.",
  "¿Qué es una función en JavaScript?"
);
```

## Características

- ✅ Streaming en tiempo real
- ✅ Manejo de tipos de contenido complejos
- ✅ Soporte para prompts del sistema
- ✅ Compatible con Google Generative AI (Gemini 2.0 Flash)
- ✅ Manejo de errores incluido

## Notas

- El streaming se muestra en `process.stdout` (consola)
- Las respuestas se procesan chunk por chunk en tiempo real
- El modelo usado es "gemini-2.0-flash" con temperatura 0
