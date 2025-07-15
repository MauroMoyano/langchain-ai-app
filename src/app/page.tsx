"use client";

import { useState } from "react";
import model from "../lib/llm";
import StreamingChat from "../components/StreamingChat";

interface ResponseData {
  content: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [translationInput, setTranslationInput] = useState("");
  const [translationResponse, setTranslationResponse] =
    useState<ResponseData | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await model.invoke(input);

      // Extraer información de tokens y metadatos
      const tokenUsage = result.response_metadata?.tokenUsage;
      const finishReason = result.response_metadata?.finish_reason;

      setResponse({
        content: result.content as string,
        tokenUsage,
        finishReason,
      });
    } catch (error) {
      console.error("Error:", error);
      setResponse({
        content: "Error al procesar la solicitud",
        tokenUsage: undefined,
        finishReason: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTranslation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!translationInput.trim()) return;

    setTranslationLoading(true);
    try {
      const result = await model.invoke([
        {
          role: "system",
          content: "Translate the following from English into Italian",
        },
        { role: "user", content: translationInput },
      ]);

      // Extraer información de tokens y metadatos
      const tokenUsage = result.response_metadata?.tokenUsage;
      const finishReason = result.response_metadata?.finish_reason;

      setTranslationResponse({
        content: result.content as string,
        tokenUsage,
        finishReason,
      });
    } catch (error) {
      console.error("Error:", error);
      setTranslationResponse({
        content: "Error al procesar la traducción",
        tokenUsage: undefined,
        finishReason: undefined,
      });
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      <main className="flex-1 flex flex-col gap-[32px] items-center sm:items-start w-full max-w-4xl mx-auto p-8 sm:p-20 pb-24">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse text-center mb-8">
          Mauro creo este proyecto para aprender a usar LangChain
        </h1>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chat normal */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">
              Chat con Gemini 2.5 Flash
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading && input.trim()) {
                      handleSubmit(e);
                    }
                  }
                }}
                placeholder="Escribe tu mensaje aquí... (Presiona Enter para enviar)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Enviar"}
              </button>
            </form>

            {response && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-black border border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-2 text-white">Respuesta:</h3>
                  <p className="whitespace-pre-wrap text-white">
                    {response.content}
                  </p>
                </div>

                {response.tokenUsage && (
                  <div className="p-4 bg-black border border-gray-600 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2 text-white">
                      Información de Tokens:
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-white">
                        <span className="font-medium">Prompt:</span>{" "}
                        {response.tokenUsage.promptTokens}
                      </div>
                      <div className="text-white">
                        <span className="font-medium">Respuesta:</span>{" "}
                        {response.tokenUsage.completionTokens}
                      </div>
                      <div className="text-white">
                        <span className="font-medium">Total:</span>{" "}
                        {response.tokenUsage.totalTokens}
                      </div>
                    </div>
                    {response.finishReason && (
                      <div className="mt-2 text-white">
                        <span className="font-medium">Estado:</span>{" "}
                        {response.finishReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Traducción estructurada */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center">
              Traductor Inglés → Italiano
            </h2>

            <form onSubmit={handleTranslation} className="space-y-4">
              <textarea
                value={translationInput}
                onChange={(e) => setTranslationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!translationLoading && translationInput.trim()) {
                      handleTranslation(e);
                    }
                  }
                }}
                placeholder="Escribe texto en inglés para traducir... (Presiona Enter para traducir)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32"
                disabled={translationLoading}
              />
              <button
                type="submit"
                disabled={translationLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 font-medium"
              >
                {translationLoading ? "Traduciendo..." : "Traducir"}
              </button>
            </form>

            {translationResponse && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-black border border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-2 text-white">Traducción:</h3>
                  <p className="whitespace-pre-wrap text-white">
                    {translationResponse.content}
                  </p>
                </div>

                {translationResponse.tokenUsage && (
                  <div className="p-4 bg-black border border-gray-600 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2 text-white">
                      Información de Tokens:
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-white">
                        <span className="font-medium">Prompt:</span>{" "}
                        {translationResponse.tokenUsage.promptTokens}
                      </div>
                      <div className="text-white">
                        <span className="font-medium">Respuesta:</span>{" "}
                        {translationResponse.tokenUsage.completionTokens}
                      </div>
                      <div className="text-white">
                        <span className="font-medium">Total:</span>{" "}
                        {translationResponse.tokenUsage.totalTokens}
                      </div>
                    </div>
                    {translationResponse.finishReason && (
                      <div className="mt-2 text-white">
                        <span className="font-medium">Estado:</span>{" "}
                        {translationResponse.finishReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat con Streaming */}
        <div className="w-full mt-8">
          <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Chat con Streaming en Tiempo Real
          </h2>
          <StreamingChat systemPrompt="Eres un asistente amigable y útil que responde en español de manera clara y concisa." />
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 text-center text-sm text-gray-500 w-full py-4 bg-black border-t border-gray-200 z-10">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} Mauro. Todos los derechos
          reservados.
        </p>
        <p className="mb-2">
          Desarrollado por{" "}
          <a
            href="https://www.linkedin.com/in/mauro-moyano-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 underline transition-colors"
          >
            Mauro Moyano
          </a>
        </p>
      </footer>
    </div>
  );
}
