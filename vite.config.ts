import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { handleAssistantPayload } from "./server/ai-assistant.js";

function aiAssistantDevPlugin(apiKey) {
  return {
    name: "simba-ai-assistant-dev",
    configureServer(server) {
      server.middlewares.use("/api/ai-assistant", async (req, res, next) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
          }

          const rawBody = Buffer.concat(chunks).toString("utf8");
          const body = rawBody ? JSON.parse(rawBody) : {};
          const result = await handleAssistantPayload(body, apiKey);

          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Unexpected Groq assistant error",
            }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
      aiAssistantDevPlugin(env.GROQ_API_KEY),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return;
            }

            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }

            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }

            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }

            if (
              id.includes("@radix-ui") ||
              id.includes("lucide-react") ||
              id.includes("recharts")
            ) {
              return "vendor-ui";
            }

            return "vendor";
          },
        },
      },
    },
  };
});
