import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8030,
    open: true,
    strictPort: true,
  },
  preview: {
    port: 8031,
    host: "::",
    strictPort: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize for production
    minify: "terser",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": [
            "@radix-ui/react-slot",
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
          ],
          "router-vendor": ["react-router-dom"],
          "chart-vendor": ["recharts"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "date-vendor": ["date-fns", "react-day-picker"],
          "animation-vendor": [
            "tailwindcss-animate",
            "class-variance-authority",
          ],
        },
        // Optimize asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                ?.replace(".tsx", "")
                .replace(".ts", "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (
            /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || "")
          ) {
            return `images/[name]-[hash][extname]`;
          }
          if (/\.(css)$/i.test(assetInfo.name || "")) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Enable terser for maximum compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Enable compression in dev mode
  define: {
    __DEV__: mode === "development",
  },
}));
