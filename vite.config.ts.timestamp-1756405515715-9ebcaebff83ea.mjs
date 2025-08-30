// vite.config.ts
import { defineConfig } from "file:///home/runner/work/fitcoach-plus-platform/fitcoach-plus-platform/node_modules/vite/dist/node/index.js";
import react from "file:///home/runner/work/fitcoach-plus-platform/fitcoach-plus-platform/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/runner/work/fitcoach-plus-platform/fitcoach-plus-platform/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/home/runner/work/fitcoach-plus-platform/fitcoach-plus-platform";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8030,
    open: true,
    strictPort: true
  },
  preview: {
    port: 8031,
    host: "::",
    strictPort: true
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
            "@radix-ui/react-tabs"
          ],
          "router-vendor": ["react-router-dom"],
          "chart-vendor": ["recharts"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
          "date-vendor": ["date-fns", "react-day-picker"],
          "animation-vendor": [
            "tailwindcss-animate",
            "class-variance-authority"
          ]
        },
        // Optimize asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split("/").pop()?.replace(".tsx", "").replace(".ts", "") : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || "")) {
            return `images/[name]-[hash][extname]`;
          }
          if (/\.(css)$/i.test(assetInfo.name || "")) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Enable terser for maximum compression
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Enable compression in dev mode
  define: {
    __DEV__: mode === "development"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29yay9maXRjb2FjaC1wbHVzLXBsYXRmb3JtL2ZpdGNvYWNoLXBsdXMtcGxhdGZvcm1cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3J1bm5lci93b3JrL2ZpdGNvYWNoLXBsdXMtcGxhdGZvcm0vZml0Y29hY2gtcGx1cy1wbGF0Zm9ybS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9ydW5uZXIvd29yay9maXRjb2FjaC1wbHVzLXBsYXRmb3JtL2ZpdGNvYWNoLXBsdXMtcGxhdGZvcm0vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDMwLFxuICAgIG9wZW46IHRydWUsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDgwMzEsXG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihcbiAgICBCb29sZWFuXG4gICksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICAvLyBPcHRpbWl6ZSBmb3IgcHJvZHVjdGlvblxuICAgIG1pbmlmeTogXCJ0ZXJzZXJcIixcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgLy8gVmVuZG9yIGNodW5rcyBmb3IgYmV0dGVyIGNhY2hpbmdcbiAgICAgICAgICBcInJlYWN0LXZlbmRvclwiOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcbiAgICAgICAgICBcInVpLXZlbmRvclwiOiBbXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1zbG90XCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1kaWFsb2dcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRhYnNcIixcbiAgICAgICAgICBdLFxuICAgICAgICAgIFwicm91dGVyLXZlbmRvclwiOiBbXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgIFwiY2hhcnQtdmVuZG9yXCI6IFtcInJlY2hhcnRzXCJdLFxuICAgICAgICAgIFwiZm9ybS12ZW5kb3JcIjogW1wicmVhY3QtaG9vay1mb3JtXCIsIFwiQGhvb2tmb3JtL3Jlc29sdmVyc1wiLCBcInpvZFwiXSxcbiAgICAgICAgICBcImRhdGUtdmVuZG9yXCI6IFtcImRhdGUtZm5zXCIsIFwicmVhY3QtZGF5LXBpY2tlclwiXSxcbiAgICAgICAgICBcImFuaW1hdGlvbi12ZW5kb3JcIjogW1xuICAgICAgICAgICAgXCJ0YWlsd2luZGNzcy1hbmltYXRlXCIsXG4gICAgICAgICAgICBcImNsYXNzLXZhcmlhbmNlLWF1dGhvcml0eVwiLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIE9wdGltaXplIGFzc2V0IG5hbWluZ1xuICAgICAgICBjaHVua0ZpbGVOYW1lczogKGNodW5rSW5mbykgPT4ge1xuICAgICAgICAgIGNvbnN0IGZhY2FkZU1vZHVsZUlkID0gY2h1bmtJbmZvLmZhY2FkZU1vZHVsZUlkXG4gICAgICAgICAgICA/IGNodW5rSW5mby5mYWNhZGVNb2R1bGVJZFxuICAgICAgICAgICAgICAgIC5zcGxpdChcIi9cIilcbiAgICAgICAgICAgICAgICAucG9wKClcbiAgICAgICAgICAgICAgICA/LnJlcGxhY2UoXCIudHN4XCIsIFwiXCIpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoXCIudHNcIiwgXCJcIilcbiAgICAgICAgICAgIDogXCJjaHVua1wiO1xuICAgICAgICAgIHJldHVybiBganMvJHtmYWNhZGVNb2R1bGVJZH0tW2hhc2hdLmpzYDtcbiAgICAgICAgfSxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWU/LnNwbGl0KFwiLlwiKSB8fCBbXTtcbiAgICAgICAgICBjb25zdCBleHQgPSBpbmZvW2luZm8ubGVuZ3RoIC0gMV07XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgL1xcLihwbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28pJC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUgfHwgXCJcIilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBgaW1hZ2VzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoL1xcLihjc3MpJC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUgfHwgXCJcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBgY3NzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBFbmFibGUgdGVyc2VyIGZvciBtYXhpbXVtIGNvbXByZXNzaW9uXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICAvLyBFbmFibGUgY29tcHJlc3Npb24gaW4gZGV2IG1vZGVcbiAgZGVmaW5lOiB7XG4gICAgX19ERVZfXzogbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVyxTQUFTLG9CQUFvQjtBQUM1WSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsaUJBQWlCLGdCQUFnQixDQUFDLEVBQUU7QUFBQSxJQUM5RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLElBQ2QsV0FBVztBQUFBLElBQ1gsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUNyQyxhQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFVBQ0EsaUJBQWlCLENBQUMsa0JBQWtCO0FBQUEsVUFDcEMsZ0JBQWdCLENBQUMsVUFBVTtBQUFBLFVBQzNCLGVBQWUsQ0FBQyxtQkFBbUIsdUJBQXVCLEtBQUs7QUFBQSxVQUMvRCxlQUFlLENBQUMsWUFBWSxrQkFBa0I7QUFBQSxVQUM5QyxvQkFBb0I7QUFBQSxZQUNsQjtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBO0FBQUEsUUFFQSxnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGdCQUFNLGlCQUFpQixVQUFVLGlCQUM3QixVQUFVLGVBQ1AsTUFBTSxHQUFHLEVBQ1QsSUFBSSxHQUNILFFBQVEsUUFBUSxFQUFFLEVBQ25CLFFBQVEsT0FBTyxFQUFFLElBQ3BCO0FBQ0osaUJBQU8sTUFBTSxjQUFjO0FBQUEsUUFDN0I7QUFBQSxRQUNBLGdCQUFnQixDQUFDLGNBQWM7QUFDN0IsZ0JBQU0sT0FBTyxVQUFVLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQztBQUM1QyxnQkFBTSxNQUFNLEtBQUssS0FBSyxTQUFTLENBQUM7QUFDaEMsY0FDRSx1Q0FBdUMsS0FBSyxVQUFVLFFBQVEsRUFBRSxHQUNoRTtBQUNBLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksWUFBWSxLQUFLLFVBQVUsUUFBUSxFQUFFLEdBQUc7QUFDMUMsbUJBQU87QUFBQSxVQUNUO0FBQ0EsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsZUFBZTtBQUFBLE1BQ2pCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sU0FBUyxTQUFTO0FBQUEsRUFDcEI7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
