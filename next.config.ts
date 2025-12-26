import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Permitir que extensiones de navegador inyecten scripts
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension: moz-extension:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
