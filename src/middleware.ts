import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Store simple para rate limiting (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuración de rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests por minuto

function getClientIP(request: NextRequest): string {
  // Obtener IP real considerando proxies
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData) {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  // Reset si ya pasó la ventana de tiempo
  if (now > clientData.resetTime) {
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  // Incrementar contador
  clientData.count++;

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  // Solo aplicar a rutas de API
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const clientIP = getClientIP(request);

    // Rate limiting
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo en 1 minuto." },
        { status: 429 }
      );
    }

    // Headers de seguridad
    const response = NextResponse.next();

    // Prevenir clickjacking
    response.headers.set("X-Frame-Options", "DENY");

    // Prevenir MIME type sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");

    // Referrer policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy básico
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    );

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
