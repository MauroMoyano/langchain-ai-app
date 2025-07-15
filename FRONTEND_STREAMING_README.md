# Streaming en el Frontend con Next.js

Este proyecto implementa streaming en tiempo real en el frontend usando Next.js API Routes y React.

## 🏗️ Arquitectura

### 1. **API Route** (`/api/stream`)

- **Ubicación**: `src/app/api/stream/route.ts`
- **Función**: Recibe mensajes y devuelve un stream de respuesta
- **Método**: POST
- **Formato**: Server-Sent Events (SSE)

### 2. **Componente React** (`StreamingChat`)

- **Ubicación**: `src/components/StreamingChat.tsx`
- **Función**: Interfaz de usuario para consumir el stream
- **Características**:
  - Streaming en tiempo real
  - Botón de cancelar
  - Manejo de errores
  - Indicador de carga

## 🚀 Cómo Funciona

### Flujo de Datos:

1. **Usuario** escribe mensaje en el frontend
2. **Frontend** envía POST a `/api/stream`
3. **API Route** procesa con Google Generative AI
4. **Stream** se envía chunk por chunk al frontend
5. **Frontend** muestra tokens en tiempo real

### Código Clave:

#### API Route:

```typescript
const stream = new ReadableStream({
  async start(controller) {
    const responseStream = await model.stream(messages);

    for await (const chunk of responseStream) {
      const content = processChunk(chunk.content);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
      );
    }

    controller.close();
  },
});
```

#### Frontend:

```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  // Procesar chunks y actualizar UI
}
```

## 🎯 Características Implementadas

### ✅ **Streaming en Tiempo Real**

- Los tokens aparecen uno por uno
- Experiencia similar a ChatGPT

### ✅ **Cancelación de Requests**

- Botón para cancelar requests en progreso
- Limpieza automática de recursos

### ✅ **Manejo de Errores**

- Try-catch en API y frontend
- Mensajes de error amigables

### ✅ **Prompts del Sistema**

- Soporte para prompts personalizados
- Conversaciones estructuradas

### ✅ **UI Responsiva**

- Diseño adaptativo
- Indicadores de estado
- Animaciones suaves

## 🔧 Uso

### 1. **Ejecutar el Proyecto**:

```bash
npm run dev
```

### 2. **Acceder al Chat**:

- Ve a `http://localhost:3000`
- Busca la sección "Chat con Streaming en Tiempo Real"

### 3. **Usar el Streaming**:

- Escribe tu mensaje
- Presiona "Enviar"
- Ve la respuesta aparecer token por token
- Usa "Cancelar" si quieres parar

## 📝 Personalización

### Cambiar el Prompt del Sistema:

```typescript
<StreamingChat systemPrompt="Eres un experto en programación que explica conceptos técnicos de manera simple." />
```

### Agregar Nuevas Funcionalidades:

1. **Historial de conversación**
2. **Múltiples modelos**
3. **Configuración de temperatura**
4. **Exportar conversaciones**

## 🐛 Troubleshooting

### Error: "No se pudo leer el stream"

- Verifica que la API key esté configurada
- Revisa la consola del navegador

### Error: "Request cancelado"

- Normal cuando presionas cancelar
- No es un error real

### Streaming lento:

- Verifica tu conexión a internet
- El modelo puede tardar en responder

## 🔮 Próximas Mejoras

- [ ] Historial de conversaciones
- [ ] Múltiples modelos de IA
- [ ] Configuración de parámetros
- [ ] Exportar conversaciones
- [ ] Modo oscuro/claro
- [ ] Soporte para archivos
