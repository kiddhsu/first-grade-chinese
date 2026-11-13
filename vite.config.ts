import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/first-grade-chinese/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "答錯也不會被老師罰寫",
        short_name: "寫國字",
        description: "一年級國字練習：塗鴉寫字、耳朵點名、部首揪團",
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
