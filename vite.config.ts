import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // Rotas do app são client-side: qualquer navegação cai no index.html
        // já em cache, então abrir offline não dá tela de erro do navegador.
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            // Dados da API: responde da rede quando dá, mas guarda a última
            // resposta boa para abrir offline com os últimos números conhecidos
            // em vez de tudo zerado.
            urlPattern: ({ url }) => /\/(dashboard|transactions|recurring-bills|credit-cards|household|auth)(\/|$)/.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "api",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: "Volta ao Controle",
        short_name: "Volta ao Controle",
        description: "Finanças do casal, sem perder o rumo.",
        theme_color: "#101E1C",
        background_color: "#0E1113",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        orientation: "portrait",
        categories: ["finance", "productivity"],
        lang: "pt-BR",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
