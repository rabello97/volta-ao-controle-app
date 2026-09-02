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
      // "prompt" em vez de "autoUpdate": o app pergunta antes de trocar de
      // versão. Com autoUpdate a troca acontecia em silêncio e num momento
      // imprevisível — às vezes só no segundo acesso —, o que fazia parecer
      // que a mudança não tinha subido.
      registerType: "prompt",
      includeAssets: ["favicon.svg"],
      workbox: {
        // Rotas do app são client-side: qualquer navegação cai no index.html
        // já em cache, então abrir offline não dá tela de erro do navegador.
        navigateFallback: "/index.html",
        // As respostas da API NÃO passam por cache do service worker. O cache do
        // Workbox é indexado só pela URL — ele ignora o Authorization —, então
        // uma resposta guardada continuava sendo servida depois de os dados
        // mudarem (e valeria até para outra conta no mesmo aparelho). Era isso
        // que fazia o PWA mostrar saldo zerado e "Vincular parceiro(a)"
        // enquanto o Safari, com cache limpo, trazia os números certos.
        // Sem rede, as telas mostram o estado de erro com "Tentar de novo".
        runtimeCaching: [
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
