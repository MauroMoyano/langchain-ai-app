import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removido env para evitar exposición de API key al cliente
  // La API key solo debe estar disponible en el servidor
};

export default nextConfig;
