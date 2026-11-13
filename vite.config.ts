import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/first-grade-practice/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "小老師就是妳😊",
        short_name: "小老師",
        description: "一年級國語與數學練習：國字、加減、形狀與時間，手機就能玩",
        theme_color: "#eef7ff",
        background_color: "#eef7ff",
        display: "standalone",
        orientation: "portrait",
        lang: "zh-Hant-TW",
        start_url: "./",
        scope: "./",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
