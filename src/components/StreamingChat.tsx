"use client";

import { useState, useRef, useEffect } from "react";

interface StreamingChatProps {
  systemPrompt?: string;
}

export default function StreamingChat({ systemPrompt }: StreamingChatProps) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setResponse("");
    setError("");

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controller para este request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
          systemPrompt,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No se pudo leer el stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              setResponse((prev) => prev + data.content);
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request cancelado");
      } else {
        setError(error instanceof Error ? error.message : "Error desconocido");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Limpiar controller al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mensaje:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 font-medium"
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </button>

          {isLoading && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:via-pink-700 hover:to-orange-700 transition-all duration-300 font-medium"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="p-4 bg-black border border-red-500 rounded-lg">
          <h3 className="font-semibold mb-2 text-red-400">Error:</h3>
          <div className="text-red-300">{error}</div>
        </div>
      )}

      {response && (
        <div className="p-4 bg-black border border-gray-600 rounded-lg">
          <h3 className="font-semibold mb-2 text-white">Respuesta:</h3>
          <div className="whitespace-pre-wrap text-white">
            {response}
            {isLoading && <span className="animate-pulse">▋</span>}
          </div>
        </div>
      )}
    </div>
  );
}
